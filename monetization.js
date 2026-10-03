(function () {
  const BANNER_BOTTOM_PADDING_PX = 60;
  const SESSION_STARTED_AT_KEY = "nour_ads_session_started_at";
  const TRANSITION_COUNT_KEY = "nour_ads_guide_transition_count";
  const LAST_INTERSTITIAL_AT_KEY = "nour_ads_last_interstitial_at";
  const policy = window.NourAdPolicy;

  let adConfigPromise = null;
  let initializePromise = null;
  let consentPromise = null;
  let interstitialReady = false;
  let interstitialPreparePromise = null;
  let privacyOptionsRequired = false;
  let navigationInProgress = false;

  function isAndroidCapacitor() {
    return window.Capacitor?.getPlatform?.() === "android";
  }

  function getAdMobPlugin() {
    return window.Capacitor?.Plugins?.AdMob || null;
  }

  function readNumber(storage, key, fallback) {
    const value = Number(storage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  function getSessionStartedAt() {
    const existing = readNumber(sessionStorage, SESSION_STARTED_AT_KEY, 0);
    if (existing) return existing;
    const startedAt = Date.now();
    sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(startedAt));
    return startedAt;
  }

  function incrementQualifiedTransitionCount() {
    const next = readNumber(sessionStorage, TRANSITION_COUNT_KEY, 0) + 1;
    sessionStorage.setItem(TRANSITION_COUNT_KEY, String(next));
    return next;
  }

  async function getAdConfig() {
    if (!adConfigPromise) {
      adConfigPromise = (async () => {
        if (!isAndroidCapacitor()) return null;
        const configPlugin = window.Capacitor?.Plugins?.AndroidAdConfig;
        if (!configPlugin?.getConfig) return null;
        const config = await configPlugin.getConfig();
        if (!config?.bannerAdUnitId || !config?.interstitialAdUnitId) return null;
        return config;
      })().catch((error) => {
        console.error("Android ad configuration is unavailable:", error);
        return null;
      });
    }
    return adConfigPromise;
  }

  async function initializeAdMob() {
    if (!isAndroidCapacitor()) return null;
    const [admob, config] = [getAdMobPlugin(), await getAdConfig()];
    if (!admob || !config) return null;

    if (!initializePromise) {
      initializePromise = admob.initialize({
        initializeForTesting: Boolean(config.isTesting),
        maxAdContentRating: "General"
      });
    }
    await initializePromise;
    return { admob, config };
  }

  function updatePrivacyEntry() {
    document.querySelectorAll(".admob-privacy-entry").forEach((entry) => {
      entry.classList.toggle("is-required", privacyOptionsRequired);
    });
  }

  async function ensureConsent() {
    if (!consentPromise) {
      consentPromise = (async () => {
        const initialized = await initializeAdMob();
        if (!initialized) return { admob: null, config: null, canRequestAds: false };

        let consent = await initialized.admob.requestConsentInfo();
        if (!consent?.canRequestAds && consent?.isConsentFormAvailable) {
          consent = await initialized.admob.showConsentForm();
        }

        privacyOptionsRequired =
          consent?.privacyOptionsRequirementStatus === "REQUIRED";
        updatePrivacyEntry();

        return {
          ...initialized,
          canRequestAds: Boolean(consent?.canRequestAds)
        };
      })().catch((error) => {
        console.error("AdMob consent flow failed:", error);
        return { admob: null, config: null, canRequestAds: false };
      });
    }
    return consentPromise;
  }

  async function showAndroidBannerAd() {
    if (!policy?.isBannerAllowed(window.location.pathname)) return false;

    try {
      const { admob, config, canRequestAds } = await ensureConsent();
      if (!admob || !config || !canRequestAds) return false;

      await admob.showBanner({
        adId: config.bannerAdUnitId,
        adSize: "ADAPTIVE_BANNER",
        position: "BOTTOM_CENTER",
        margin: 0,
        isTesting: Boolean(config.isTesting)
      });

      document.body.classList.add("android-banner-active");
      document.documentElement.style.setProperty(
        "--android-banner-space",
        `${BANNER_BOTTOM_PADDING_PX}px`
      );
      return true;
    } catch (error) {
      document.body.classList.remove("android-banner-active");
      console.error("Failed to show Android AdMob banner:", error);
      return false;
    }
  }

  async function prepareInterstitialAd() {
    if (!policy?.isInterstitialSource(window.location.pathname)) return false;
    if (interstitialReady) return true;

    if (!interstitialPreparePromise) {
      interstitialPreparePromise = (async () => {
        const { admob, config, canRequestAds } = await ensureConsent();
        if (!admob || !config || !canRequestAds) return false;

        await admob.prepareInterstitial({
          adId: config.interstitialAdUnitId,
          isTesting: Boolean(config.isTesting)
        });
        interstitialReady = true;
        return true;
      })()
        .catch((error) => {
          interstitialReady = false;
          console.error("Failed to prepare Android AdMob interstitial:", error);
          return false;
        })
        .finally(() => {
          interstitialPreparePromise = null;
        });
    }
    return interstitialPreparePromise;
  }

  async function showInterstitialBeforeNavigation(targetUrl) {
    if (navigationInProgress || !interstitialReady) return false;

    const { admob, canRequestAds } = await ensureConsent();
    if (!admob || !canRequestAds) return false;

    navigationInProgress = true;
    interstitialReady = false;
    localStorage.setItem(LAST_INTERSTITIAL_AT_KEY, String(Date.now()));

    let dismissedHandle;
    let failedHandle;
    let timeoutId;

    const navigate = async () => {
      if (!navigationInProgress) return;
      navigationInProgress = false;
      clearTimeout(timeoutId);
      await Promise.allSettled([
        dismissedHandle?.remove?.(),
        failedHandle?.remove?.()
      ]);
      window.location.assign(targetUrl);
    };

    try {
      dismissedHandle = await admob.addListener("interstitialAdDismissed", navigate);
      failedHandle = await admob.addListener("interstitialAdFailedToShow", navigate);
      timeoutId = window.setTimeout(navigate, 15000);
      await admob.showInterstitial();
      return true;
    } catch (error) {
      console.error("Failed to show Android AdMob interstitial:", error);
      await navigate();
      return false;
    }
  }

  function bindNaturalInterstitialTransitions() {
    if (!policy?.isInterstitialSource(window.location.pathname)) return;

    document.addEventListener("click", async (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        !policy.isQualifiedGuideTransition(window.location.pathname, link.href)
      ) {
        return;
      }

      const transitionCount = incrementQualifiedTransitionCount();
      const eligible = policy.canShowInterstitial({
        now: Date.now(),
        sessionStartedAt: getSessionStartedAt(),
        lastShownAt: readNumber(localStorage, LAST_INTERSTITIAL_AT_KEY, 0),
        qualifiedTransitionCount: transitionCount
      });

      if (!eligible || !interstitialReady) return;

      event.preventDefault();
      await showInterstitialBeforeNavigation(link.href);
    });
  }

  async function showPrivacyOptions() {
    if (!isAndroidCapacitor()) return false;
    try {
      const { admob } = await ensureConsent();
      if (!admob || !privacyOptionsRequired) return false;
      await admob.showPrivacyOptionsForm();
      consentPromise = null;
      await ensureConsent();
      return true;
    } catch (error) {
      console.error("Unable to open AdMob privacy options:", error);
      return false;
    }
  }

  function bindPrivacyButtons() {
    document.querySelectorAll("[data-admob-privacy-options]").forEach((button) => {
      button.addEventListener("click", showPrivacyOptions);
    });
  }

  async function initAndroidAds() {
    if (!isAndroidCapacitor() || !policy) return;
    getSessionStartedAt();
    bindPrivacyButtons();
    bindNaturalInterstitialTransitions();
    await Promise.all([
      showAndroidBannerAd(),
      prepareInterstitialAd()
    ]);
  }

  window.NourAds = {
    showBannerAd: showAndroidBannerAd,
    prepareInterstitialAd,
    showPrivacyOptions
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAndroidAds, { once: true });
  } else {
    initAndroidAds();
  }
})();

(function () {
  const ANDROID_BANNER_AD_UNIT_ID = "{{ADMOB_BANNER_AD_UNIT_ID}}";
  const ANDROID_INTERSTITIAL_AD_UNIT_ID = "{{ADMOB_INTERSTITIAL_AD_UNIT_ID}}";
  const BANNER_BOTTOM_PADDING_PX = 56;

  let initializePromise = null;
  let consentPromise = null;
  let interstitialReady = false;
  let interstitialPreparePromise = null;
  let privacyOptionsRequired = false;

  function isAndroidCapacitor() {
    const capacitor = window.Capacitor;
    return Boolean(capacitor?.getPlatform && capacitor.getPlatform() === "android");
  }

  function isConfigured(adUnitId) {
    return Boolean(adUnitId && !adUnitId.includes("{{"));
  }

  function getAdMobPlugin() {
    return window.Capacitor?.Plugins?.AdMob || null;
  }

  async function initializeAdMob() {
    if (!isAndroidCapacitor()) return null;
    const admob = getAdMobPlugin();
    if (!admob) {
      console.warn("AdMob plugin is unavailable. Run Capacitor sync before the Android build.");
      return null;
    }

    if (!initializePromise) {
      initializePromise = admob.initialize({
        initializeForTesting: false,
        maxAdContentRating: "General",
      });
    }
    await initializePromise;
    return admob;
  }

  async function ensureConsent() {
    if (!consentPromise) {
      consentPromise = (async () => {
        const admob = await initializeAdMob();
        if (!admob) return { admob: null, canRequestAds: false };

        let consent = await admob.requestConsentInfo();
        if (!consent?.canRequestAds && consent?.isConsentFormAvailable) {
          consent = await admob.showConsentForm();
        }
        privacyOptionsRequired = consent?.privacyOptionsRequirementStatus === "REQUIRED";
        document.querySelectorAll(".admob-privacy-entry").forEach((entry) => {
          entry.classList.toggle("is-required", privacyOptionsRequired);
        });
        return { admob, canRequestAds: Boolean(consent?.canRequestAds) };
      })().catch((error) => {
        console.error("AdMob consent flow failed:", error);
        return { admob: null, canRequestAds: false };
      });
    }
    return consentPromise;
  }

  async function showAndroidBannerAd() {
    if (!isAndroidCapacitor() || !isConfigured(ANDROID_BANNER_AD_UNIT_ID)) return false;
    try {
      const { admob, canRequestAds } = await ensureConsent();
      if (!admob || !canRequestAds) return false;
      await admob.showBanner({
        adId: ANDROID_BANNER_AD_UNIT_ID,
        adSize: "ADAPTIVE_BANNER",
        position: "BOTTOM_CENTER",
        margin: 0,
        isTesting: false,
      });
      document.body.classList.add("android-banner-active");
      document.documentElement.style.setProperty("--android-banner-space", `${BANNER_BOTTOM_PADDING_PX}px`);
      return true;
    } catch (error) {
      console.error("Failed to show Android AdMob banner:", error);
      document.body.classList.remove("android-banner-active");
      return false;
    }
  }

  async function prepareInterstitialAd() {
    if (!isAndroidCapacitor() || !isConfigured(ANDROID_INTERSTITIAL_AD_UNIT_ID)) return false;
    if (!interstitialPreparePromise) {
      interstitialPreparePromise = (async () => {
        const { admob, canRequestAds } = await ensureConsent();
        if (!admob || !canRequestAds) return false;
        await admob.prepareInterstitial({
          adId: ANDROID_INTERSTITIAL_AD_UNIT_ID,
          isTesting: false,
        });
        interstitialReady = true;
        return true;
      })().catch((error) => {
        interstitialReady = false;
        console.error("Failed to prepare Android AdMob interstitial:", error);
        return false;
      }).finally(() => {
        interstitialPreparePromise = null;
      });
    }
    return interstitialPreparePromise;
  }

  // Only call this from a natural transition chosen by the user. Noor does not
  // auto-launch interstitials on page views, startup, prayer screens, or audio.
  async function showInterstitialAd() {
    if (!interstitialReady && !(await prepareInterstitialAd())) return false;
    try {
      const { admob, canRequestAds } = await ensureConsent();
      if (!admob || !canRequestAds) return false;
      await admob.showInterstitial();
      interstitialReady = false;
      return true;
    } catch (error) {
      interstitialReady = false;
      console.error("Failed to show Android AdMob interstitial:", error);
      return false;
    }
  }

  async function showPrivacyOptions() {
    if (!isAndroidCapacitor()) return false;
    try {
      const { admob } = await ensureConsent();
      if (!admob || !privacyOptionsRequired) return false;
      await admob.showPrivacyOptionsForm();
      consentPromise = null;
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
    bindPrivacyButtons();
    await showAndroidBannerAd();
  }

  window.NourAds = {
    showBannerAd: showAndroidBannerAd,
    prepareInterstitialAd,
    showInterstitialAd,
    showPrivacyOptions,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAndroidAds, { once: true });
  } else {
    initAndroidAds();
  }
})();

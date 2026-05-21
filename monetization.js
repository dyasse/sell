(function () {
  const ANDROID_BANNER_AD_UNIT_ID = '{{ADMOB_BANNER_AD_UNIT_ID}}';
  const ANDROID_INTERSTITIAL_AD_UNIT_ID = '{{ADMOB_INTERSTITIAL_AD_UNIT_ID}}';
  const TEST_BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';
  const TEST_INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-3940256099942544/1033173712';
  // Inject real ADMOB_* values from CI/local secrets before Android release.
  const BANNER_BOTTOM_PADDING_PX = 56;
  const INTERSTITIAL_PAGE_VIEW_INTERVAL = 4;
  const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;
  const INTERSTITIAL_LAST_SHOWN_KEY = 'nour_ads_interstitial_last_shown_at';
  const INTERSTITIAL_PAGE_VIEW_KEY = 'nour_ads_interstitial_page_views';

  let initializePromise = null;
  let interstitialReady = false;
  let interstitialPreparePromise = null;

  function isAndroidCapacitor() {
    const capacitor = window.Capacitor;
    return Boolean(capacitor && typeof capacitor.getPlatform === 'function' && capacitor.getPlatform() === 'android');
  }

  function isConfigured(adUnitId) {
    return Boolean(adUnitId && !adUnitId.includes('{{'));
  }

  function isReleaseBuild() {
    return Boolean(window.NOUR_ENV?.RELEASE_BUILD === 'true');
  }

  function resolveAdUnitId(configuredId, testId) {
    if (isConfigured(configuredId)) return configuredId;
    return isReleaseBuild() ? '' : testId;
  }

  function getAdMobPlugin() {
    return window.Capacitor?.Plugins?.AdMob || null;
  }

  async function initializeAdMob() {
    if (!isAndroidCapacitor()) return null;

    const admob = getAdMobPlugin();
    if (!admob) {
      console.warn('AdMob plugin is not available. Install @capacitor-community/admob and run Capacitor sync.');
      return null;
    }

    if (!initializePromise) {
      initializePromise = (async () => {
        try {
          await admob.requestConsentInfo?.();
          await admob.showConsentForm?.();
        } catch (error) {
          console.warn('AdMob consent flow unavailable or skipped:', error);
        }
        await admob.initialize({
          initializeForTesting: !isReleaseBuild(),
        });
      })();
    }

    await initializePromise;
    return admob;
  }

  async function showAndroidBannerAd() {
    if (!isAndroidCapacitor()) return;
    const adId = resolveAdUnitId(ANDROID_BANNER_AD_UNIT_ID, TEST_BANNER_AD_UNIT_ID);
    if (!adId) {
      console.warn('AdMob banner ID is a placeholder. Inject ADMOB_BANNER_AD_UNIT_ID before release.');
      return;
    }

    try {
      const admob = await initializeAdMob();
      if (!admob) return;

      await admob.showBanner({
        adId,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: !isReleaseBuild(),
      });

      document.body.classList.add('android-banner-active');
      document.documentElement.style.setProperty('--android-banner-space', `${BANNER_BOTTOM_PADDING_PX}px`);
    } catch (error) {
      console.error('Failed to show Android AdMob banner:', error);
    }
  }

  async function prepareInterstitialAd() {
    if (!isAndroidCapacitor()) return false;
    const adId = resolveAdUnitId(ANDROID_INTERSTITIAL_AD_UNIT_ID, TEST_INTERSTITIAL_AD_UNIT_ID);
    if (!adId) return false;

    if (!interstitialPreparePromise) {
      interstitialPreparePromise = (async () => {
        const admob = await initializeAdMob();
        if (!admob) return false;

        await admob.prepareInterstitial({
          adId,
          isTesting: !isReleaseBuild(),
        });
        interstitialReady = true;
        return true;
      })().catch((error) => {
        interstitialReady = false;
        console.error('Failed to prepare Android AdMob interstitial:', error);
        return false;
      }).finally(() => {
        interstitialPreparePromise = null;
      });
    }

    return interstitialPreparePromise;
  }

  async function showInterstitialAd({ force = false } = {}) {
    if (!isAndroidCapacitor()) return false;
    if (!resolveAdUnitId(ANDROID_INTERSTITIAL_AD_UNIT_ID, TEST_INTERSTITIAL_AD_UNIT_ID)) return false;

    const lastShownAt = Number(localStorage.getItem(INTERSTITIAL_LAST_SHOWN_KEY) || 0);
    if (!force && Date.now() - lastShownAt < INTERSTITIAL_COOLDOWN_MS) return false;

    try {
      const admob = await initializeAdMob();
      if (!admob) return false;

      if (!interstitialReady) {
        const prepared = await prepareInterstitialAd();
        if (!prepared) return false;
      }

      await admob.showInterstitial();
      localStorage.setItem(INTERSTITIAL_LAST_SHOWN_KEY, String(Date.now()));
      interstitialReady = false;
      prepareInterstitialAd();
      return true;
    } catch (error) {
      interstitialReady = false;
      console.error('Failed to show Android AdMob interstitial:', error);
      return false;
    }
  }

  function maybeShowInterstitialAfterPageViews() {
    if (!isAndroidCapacitor()) return;
    if (!resolveAdUnitId(ANDROID_INTERSTITIAL_AD_UNIT_ID, TEST_INTERSTITIAL_AD_UNIT_ID)) return;

    const nextPageViews = Number(localStorage.getItem(INTERSTITIAL_PAGE_VIEW_KEY) || 0) + 1;
    localStorage.setItem(INTERSTITIAL_PAGE_VIEW_KEY, String(nextPageViews));

    prepareInterstitialAd();

    if (nextPageViews % INTERSTITIAL_PAGE_VIEW_INTERVAL === 0) {
      showInterstitialAd();
    }
  }

  async function initAndroidAds() {
    await showAndroidBannerAd();
    maybeShowInterstitialAfterPageViews();
  }

  window.NourAds = {
    showBannerAd: showAndroidBannerAd,
    prepareInterstitialAd,
    showInterstitialAd,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAndroidAds, { once: true });
  } else {
    initAndroidAds();
  }
})();

(function () {
  const ANDROID_BANNER_AD_UNIT_ID = '{{ADMOB_BANNER_AD_UNIT_ID}}';
  // Inject ADMOB_BANNER_AD_UNIT_ID from CI/local secrets before Android release.
  const BANNER_BOTTOM_PADDING_PX = 56;

  function isAndroidCapacitor() {
    const capacitor = window.Capacitor;
    return Boolean(capacitor && typeof capacitor.getPlatform === 'function' && capacitor.getPlatform() === 'android');
  }

  async function showAndroidBannerAd() {
    if (!isAndroidCapacitor()) return;
    if (!ANDROID_BANNER_AD_UNIT_ID || ANDROID_BANNER_AD_UNIT_ID.includes("{{")) {
      console.warn('AdMob banner ID is a placeholder. Inject ADMOB_BANNER_AD_UNIT_ID before release.');
      return;
    }

    const admob = window.Capacitor?.Plugins?.AdMob;
    if (!admob) {
      console.warn('AdMob plugin is not available. Run Capacitor sync to install native plugin.');
      return;
    }

    try {
      await admob.initialize({
        initializeForTesting: false
      });

      await admob.showBanner({
        adId: ANDROID_BANNER_AD_UNIT_ID,
        adSize: 'BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: false
      });

      document.body.classList.add('android-banner-active');
      document.documentElement.style.setProperty('--android-banner-space', `${BANNER_BOTTOM_PADDING_PX}px`);
    } catch (error) {
      console.error('Failed to show Android AdMob banner:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAndroidBannerAd, { once: true });
  } else {
    showAndroidBannerAd();
  }
})();

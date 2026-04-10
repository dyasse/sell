(function () {
  const ANDROID_BANNER_AD_UNIT_ID = 'ca-app-pub-2350255696934759/8346363680';
  const BANNER_BOTTOM_PADDING_PX = 56;

  function isAndroidCapacitor() {
    const capacitor = window.Capacitor;
    return Boolean(capacitor && typeof capacitor.getPlatform === 'function' && capacitor.getPlatform() === 'android');
  }

  async function showAndroidBannerAd() {
    if (!isAndroidCapacitor()) return;

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

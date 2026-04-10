# Play Store / Branding Assets Checklist

Replace placeholders before publishing:

- App launcher icons (required):
  - `android/app/src/main/res/mipmap-*/ic_launcher.png`
  - `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
  - Adaptive icon layers:
    - `android/app/src/main/res/drawable/ic_launcher_foreground.xml`
    - `android/app/src/main/res/drawable/ic_launcher_background.xml`
- Splash icon / launch branding:
  - `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
  - `android/app/src/main/res/values/styles.xml` (`windowSplashScreenAnimatedIcon`)
- Play Console feature graphic (1024x500):
  - Store outside apk at `android/assets/play-feature-graphic-1024x500.png`

Tip: keep source artwork in `android/assets/source/` and export density assets from it.

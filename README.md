# Nour Quran (Web + Android via Capacitor)

Production web app: https://nour-quran.com  
Android package: `com.dyasse.nourquran`

## Project Structure

- Web source files live at repository root (`*.html`, `*.js`, `styles.css`, `assets/`, etc.)
- Production build output is generated to `dist/`
- Capacitor config: `capacitor.config.ts`
- Android project: `android/`

## Prerequisites

- Node.js 20+
- npm 10+
- Android Studio (latest stable)
- JDK 17

## Local Web Development

Serve the root directory with any static server (example):

```bash
npx serve .
```

## Build Web Assets (for Capacitor)

```bash
npm install
npm run build
```

This creates a clean `dist/` folder used by Capacitor (`webDir: dist`).

## Capacitor + Android Commands

```bash
npm run cap:sync      # build + sync all platforms
npm run android       # build + sync android only
npm run android:open  # open Android Studio project
```

> `npm run android` must be run before building in Android Studio so local web assets are copied into the native project.

## Android Configuration (Play Store Ready)

Already configured:

- `applicationId`: `com.dyasse.nourquran`
- App name: `Nour Quran`
- `minSdkVersion`: 23
- `targetSdkVersion`: 35
- `versionCode`: 1
- `versionName`: `1.0.0`
- Internet permission enabled
- Hardware acceleration enabled
- Release minification + resource shrinking enabled

Files:

- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/variables.gradle`

## App Icons, Splash, and Play Store Graphics

### Launcher / Adaptive Icons

Replace icon files before release:

- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
- `android/app/src/main/res/drawable/ic_launcher_foreground.xml`
- `android/app/src/main/res/drawable/ic_launcher_background.xml`

### Splash Screen

- Splash is controlled by:
  - `android/app/src/main/res/values/styles.xml`
  - `windowSplashScreenAnimatedIcon`

### Feature Graphic

- Create Play Store feature graphic (1024x500)
- Suggested location in repo: `android/assets/play-feature-graphic-1024x500.png`

## Versioning for Updates

Update in `android/app/build.gradle`:

```gradle
versionCode 2
versionName "1.0.1"
```

- Increment `versionCode` for every Play upload
- Update `versionName` as your human-readable release version

## Build Signed AAB (Release)

1. Run:
   ```bash
   npm run android
   npm run android:open
   ```
2. In Android Studio:
   - **Build > Generate Signed Bundle / APK**
   - Select **Android App Bundle (AAB)**
   - Choose release keystore
   - Build `release`

Output typically appears in:

- `android/app/release/` or
- `android/app/build/outputs/bundle/release/`

## Keystore Creation

Create a keystore once:

```bash
keytool -genkeypair -v \
  -keystore nour-quran-release.jks \
  -alias nourquran \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Keep the `.jks` file and passwords in a secure location (do not commit to git).

## Play Console Upload Checklist

- Build signed `.aab`
- Log in to Google Play Console
- Create app listing and privacy policy
- Upload `.aab` to production track
- Complete content rating, data safety, and store listing
- Submit for review

## Notes

- This setup uses **local bundled web assets** (`dist/`) in production Android builds.
- It does **not** rely on loading `https://nour-quran.com` at runtime.
- Existing Vercel deployment remains unaffected.

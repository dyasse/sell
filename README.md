# Nour Quran

Nour Quran is a production-oriented Islamic app project with:

- A **stable web app** deployed on Vercel.
- A **Capacitor-based Android project** prepared for Android Studio and Play Store release.

The repository is structured so web deployment and Android workflows are isolated and do not interfere with each other.

---

## Project Structure

- Web source files remain in the repository root (`index.html`, `styles.css`, JS/JSON/assets files).
- `scripts/build-web.mjs` builds a deployment-safe `dist/` directory for Vercel and Capacitor bundling.
- `capacitor.config.json` defines Capacitor app identity and local web asset source.
- `android/` contains the Android Studio project (Capacitor host app, package ID `com.dyasse.nourquran`).

---

## Local Web Development

You can run the site with any static server. Example:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

---

## Web Build (for Vercel + Capacitor)

```bash
npm install
npm run build:web
```

This creates `dist/` with only web deploy assets.

---

## Vercel Deployment

Vercel uses:

- `buildCommand`: `npm run build:web`
- `outputDirectory`: `dist`

No Android/Gradle/Capacitor sync command is executed in Vercel build.

---

## Capacitor Android Workflow

Install dependencies first:

```bash
npm install
```

Sync the web build into Android and refresh Capacitor native config:

```bash
npm run cap:sync
```

Open Android Studio project:

```bash
npm run android:open
```

Optional direct run command:

```bash
npm run android:run
```

---


## Capacitor + Android Studio Recovery Guide

If Android Studio shows errors like:

- `Configuring project 'capacitor-android' without an existing directory is not allowed`

run this exact recovery flow from the repository root:

```bash
npm install
npm run build:web
npx cap add android
npx cap sync android
```

Notes:

- `capacitor.config.json` is expected to use `webDir: "dist"`; always build web assets before syncing.
- `android/capacitor.settings.gradle` is committed and conditionally includes local `node_modules/@capacitor/android/capacitor` only when it exists.
- `android/app/build.gradle` includes a safe fallback to Maven artifact `com.capacitorjs:capacitor-android:7.4.3` when local node modules are unavailable, so Android Studio can still sync.

### Open Android project cleanly

1. Open Android Studio.
2. Choose **Open** and select the `android/` folder.
3. Wait for Gradle Sync to complete.
4. If prompted, run `npm run cap:sync` again after any web changes.

### Build signed AAB for Play Store

1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle**.
3. Select/create your release keystore (never commit keystores to git).
4. Choose `release` build variant.
5. Build and validate the generated `.aab` before uploading to Play Console.

## Android Release (Signed AAB)

1. Open `android/` in Android Studio.
2. Confirm app ID/version:
   - `applicationId`: `com.dyasse.nourquran`
   - `versionCode`: `1`
   - `versionName`: `1.0.0`
3. Create/choose release keystore (**do not commit keystore files**).
4. Use **Build > Generate Signed Bundle / APK > Android App Bundle (AAB)**.
5. Choose `release` variant and sign.
6. Validate bundle locally and upload to Google Play Console.

---

## Google Play Console Checklist

Before submission:

- App name and metadata finalized.
- Privacy policy URL ready.
- Screenshots and feature graphic prepared.
- Target SDK and Data Safety form completed.
- Internal testing track upload completed and verified.

---

## Notes

- Android uses local bundled assets from `dist/` in production (not remote website loading).
- Keep running `npm run cap:sync` after web changes to update Android assets.
- Do not add secrets, signing keys, or local properties files to git.

---


## Monetization

Monetization is intentionally separated by platform:

### Android (AdMob IDs configured in app)

- AdMob App ID is configured in Android manifest metadata:
  - `android/app/src/main/AndroidManifest.xml`
  - `com.google.android.gms.ads.APPLICATION_ID=ca-app-pub-2350255696934759~7026357823`
- Android banner loading is implemented in `monetization.js` and only executes inside Capacitor Android runtime.
- Android banner ad unit ID used by the app:
  - `ca-app-pub-2350255696934759/8346363680`

### Web (AdSense only)

- AdSense script and ad unit markup are added to the web home page in `index.html`.
- The inserted web AdSense values are:
  - Client: `ca-pub-2350255696934759`
  - Slot: `3365499747`
- No Android AdMob IDs are used in web HTML.

### App Ads Authorization

- `app-ads.txt` is present at the repository root and included in `dist/` by the web build pipeline.
- File content:
  - `google.com, pub-2350255696934759, DIRECT, f08c47fec0942fa0`

### Separation Guarantee

- Android app monetization uses **AdMob only**.
- Website monetization uses **AdSense only**.
- `app-ads.txt` is kept as a plain root-level authorization file.
- The implementation avoids mixing identifiers or SDK responsibilities across Android and web.


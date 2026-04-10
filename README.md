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

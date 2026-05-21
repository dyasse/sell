# Android Release

Date: May 21, 2026

## Versioning

Set version values with Gradle properties or environment variables:

- `VERSION_CODE`
- `VERSION_NAME`

## Create A Local Keystore

```bash
keytool -genkeypair -v -keystore nour-quran-release.jks -alias nour-quran -keyalg RSA -keysize 2048 -validity 10000
```

Do not commit keystores, passwords, or signing property files.

## GitHub Actions Secrets

Recommended secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ADMOB_APP_ID`
- `ADMOB_BANNER_AD_UNIT_ID`
- `ADMOB_INTERSTITIAL_AD_UNIT_ID`
- `AD_CLIENT_ID`
- `AD_SLOT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Build AAB

```bash
npm ci
npm run build:web
npx cap sync android
cd android
./gradlew bundleRelease
```

This repository currently may not include a Gradle wrapper. If `./gradlew` is unavailable, install Gradle locally or use the GitHub Actions workflow, which provisions Gradle.

## Test Release Build

- Install and smoke-test a debug APK first.
- Build a release AAB with signing secrets in CI.
- Upload to Play internal testing before closed or production testing.
- Verify privacy policy, terms, license, and deletion pages render in the Android WebView.

## Never Commit

- Keystores
- Keystore passwords
- Supabase service-role keys
- Production private secrets
- Play Console credentials

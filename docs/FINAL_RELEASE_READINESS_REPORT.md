# Final Release Readiness Report

Date: May 21, 2026

## Overall Status

**Not ready for production.** Nour Quran is closer to internal/closed technical testing, but public Play Store production release remains blocked by unverified Quran text, tafsir, and audio provider permissions.

## What Was Fixed

- Reduced Android permissions to `INTERNET`, `ACCESS_COARSE_LOCATION`, and `POST_NOTIFICATIONS`.
- Changed prayer/qibla location flow to user-triggered approximate location with prominent disclosure.
- Added account deletion page and in-app/settings/auth links.
- Replaced hardcoded Supabase public config with placeholders and graceful auth disablement.
- Added conservative privacy policy, terms, about/contact cleanup, and content sources/licenses page.
- Added release audit, Data Safety, permissions, ads, account deletion, Android release, and final readiness docs.
- Installed `@capacitor-community/admob`, synced Capacitor, and added release AdMob ID checks.
- Enabled Android release minification/resource shrinking with Capacitor/AdMob/notifications ProGuard rules.
- Updated service worker to avoid full audio caching, auth/session caching, and stale legal pages.
- Added tests for audio URL validation, XSS escaping, placeholder/auth safety, service worker audio caching, legal pages, and permission disclosure.
- Added Android release-readiness GitHub Actions workflow.

## Commands Run

- `git switch -c fix/playstore-legal-release-readiness`
- `npm install @capacitor-community/admob --save`
- `npm ci`
- `npm test`
- `npm run lint`
- `npm run build:web`
- `npx cap sync android`
- `./gradlew assembleDebug` from `android/` attempted but failed because this repo does not contain `android/gradlew`.
- `gradle assembleDebug` attempted but failed because Gradle is not installed locally.

## Test Results

- `npm ci`: passed.
- `npm test`: passed, 13 tests.
- `npm run lint`: passed.
- `npm run build:web`: passed.
- `npx cap sync android`: passed and found `@capacitor-community/admob@8.0.0` plus `@capacitor/local-notifications@7.0.6`.
- Android debug build: not run locally because neither Gradle wrapper nor local Gradle is available.

## Remaining Manual Steps

- Add a Gradle wrapper or build with a machine/CI that has Gradle installed.
- Configure Android signing in CI or local release environment; do not commit keystores.
- Provide production AdMob IDs and publish valid `app-ads.txt`.
- Verify Supabase auth settings and implement backend/admin deletion workflow.
- Smoke-test location, notifications, auth, ads consent, Quran reading, tafsir, and audio on an Android device.

## Release Blockers

- RELEASE_BLOCKER: Quran.com API license, attribution, commercial monetized use, and caching/redistribution permission are unverified.
- RELEASE_BLOCKER: alquran.cloud/ar.muyassar tafsir license and commercial use are unverified.
- RELEASE_BLOCKER: QuranicAudio and fallback audio streaming permissions are unverified.
- RELEASE_BLOCKER: Offline caching/redistribution of Quran audio is blocked until explicit permission exists.
- RELEASE_BLOCKER: Android debug build was not verified locally due missing Gradle tooling.

## Exact Legal/Source Evidence Status

- No official provider screenshots, archived terms, or written permissions are committed.
- Status per provider is documented in `LICENSE_NOTE.md` and `license.html` as `UNVERIFIED` / `RELEASE_BLOCKER`.
- The app must not be described as fully legal or production-ready until evidence is reviewed and retained.

## Play Store Checklist

- Privacy policy public HTML page: done.
- Terms page: done.
- Account deletion page: done.
- Data Safety mapping: done.
- Location prominent disclosure: done.
- Runtime location request only from feature: done.
- Notification request only from user action: done.
- AdMob plugin installed/synced: done.
- Production signing: manual.
- AAB build: manual/CI once Gradle/signing available.

## Recommended Data Safety Answers

- Location: approximate collected/shared for app functionality, optional.
- Personal info: email/user ID collected/shared if auth is enabled, optional.
- App activity/device IDs: collected/shared if ads/analytics enabled; used for ads, analytics, fraud prevention, and diagnostics.
- Financial info: not collected directly by app, but external support/payment providers may collect if user donates.
- Encryption in transit: yes.
- Deletion request available: yes.
- Data sold: no.

## Testing Track Recommendation

- Internal testing: allowed only after Android debug build passes in CI/local Gradle environment.
- Closed testing: possible after smoke tests and Play Data Safety review, while keeping legal blockers visible.
- Production: **blocked** until content licenses and Android release build/signing are verified.

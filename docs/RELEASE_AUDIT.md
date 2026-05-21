# Nour Quran Release Audit

Date: May 21, 2026

Final status: **NOT READY FOR PRODUCTION**. The app may proceed only to internal/closed technical testing after reviewers accept the documented legal blockers. Public production release is blocked until Quran.com, alquran.cloud, QuranicAudio, and audio fallback provider rights are verified.

## Current App Data Flows

- Quran list/detail pages fetch chapter metadata and Uthmani verses from Quran.com API over HTTPS at runtime.
- Tafsir modal fetches selected ayah tafsir from alquran.cloud at runtime.
- Audio player streams surah MP3 files from QuranicAudio, with fallback streaming sources in `app-shell.js`; full audio files are not intentionally cached.
- Prayer/qibla page requests location only after the user opens the feature and taps the location button. Coordinates are sent to Aladhan and BigDataCloud.
- Local preferences, bookmarks, resume positions, audio state, theme, and ad cooldown counters are stored locally.
- Supabase authentication is present but disabled unless `SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected.
- Google AdMob/AdSense and Google Analytics/Vercel Analytics run only when configured and available.

## Third-Party SDK/API List

- Capacitor Android
- Capacitor Local Notifications
- @capacitor-community/admob when installed and synced
- Supabase JS from CDN for auth
- Google AdMob / AdSense
- Google Analytics / Vercel Analytics when configured
- Quran.com API
- alquran.cloud
- QuranicAudio, mp3quran.net, EveryAyah, Islamic Network CDN
- Aladhan prayer/qibla API
- BigDataCloud reverse geocoding
- PayPal/support provider links if configured

## User Data Collected

- Approximate location for prayer times/qibla after user action.
- Email, user ID, auth sessions, and OAuth metadata if Supabase auth is configured.
- App activity/device identifiers through ads/analytics SDKs when enabled.
- Support email contents and donation/payment data when users use those external flows.

## Data Stored Locally

- `nour_theme_mode`
- `nour_audio_player_state`
- `lastRead`
- `nour_bookmark`
- Quran sync resume keys
- Prayer offset and UI preferences
- Support popup state
- Ad page-view and cooldown counters

## Data Sent To Third Parties

- Coordinates to Aladhan and BigDataCloud.
- Requested Quran chapters, verses, tafsir, and audio URLs to content providers.
- Auth/account data to Supabase when configured.
- Ad/device/activity data to Google AdMob/AdSense.
- Analytics events/device data to Google Analytics/Vercel Analytics when configured.
- Payment/support details to PayPal or support email providers if used.

## Permissions Used And Why

- `INTERNET`: required for APIs, streaming, ads, auth, and analytics.
- `ACCESS_COARSE_LOCATION`: approximate location for prayer times and qibla, requested only from the prayer/qibla feature.
- `POST_NOTIFICATIONS`: prayer notification scheduling through Capacitor Local Notifications, requested only when the user taps enable notifications.

Removed/minimized: fine location, wake lock, foreground service, and foreground media playback permission are not declared until native functionality requires them.

## Play Store Risks

- Data Safety must disclose location, email/user ID if auth enabled, app activity/device IDs for ads/analytics, diagnostics from SDKs, and optional payment/support provider data.
- Account deletion is required because signup UI exists when Supabase is configured.
- Ads require production AdMob IDs, consent handling, app-ads.txt, and test-only ads in debug/testing.
- Location permission requires prominent disclosure and user-triggered permission request; implemented.
- Content license status blocks production.

## Legal/Content License Risks

- Quran.com API licensing and commercial/monetized use are unverified.
- alquran.cloud tafsir licensing and redistribution/caching rights are unverified.
- QuranicAudio and fallback audio streaming permissions are unverified.
- Offline caching/bundling of Quran audio is blocked.

## Release Blockers

- RELEASE_BLOCKER: Verify Quran.com API terms, attribution, commercial use, and caching/redistribution rights.
- RELEASE_BLOCKER: Verify alquran.cloud/ar.muyassar tafsir terms and commercial use.
- RELEASE_BLOCKER: Verify QuranicAudio and fallback audio source streaming rights and attribution.
- RELEASE_BLOCKER: Install/sync AdMob dependency and provide production IDs before release.
- RELEASE_BLOCKER: Provide signed Play App Bundle with secure keystore handling.

## Final Status

**Not Ready for production.** Potentially ready for internal technical testing after Android debug build passes and reviewers accept that legal/content blockers remain unresolved.

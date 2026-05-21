# Ads / AdMob

Date: May 21, 2026

## Required Environment Variables

- `ADMOB_APP_ID`
- `ADMOB_BANNER_AD_UNIT_ID`
- `ADMOB_INTERSTITIAL_AD_UNIT_ID`
- `AD_CLIENT_ID`
- `AD_SLOT_ID`
- `ADS_PUBLISHER_ID` for `ads.txt` / `app-ads.txt`

Do not commit production ad unit IDs if the release owner considers them private. Supply them through CI secrets, Gradle properties, or local untracked `.env` files.

## Debug Vs Release Behavior

- Debug web/Android can use Google test ad unit IDs when production IDs are not injected.
- Release Gradle builds fail if `ADMOB_APP_ID`, `ADMOB_BANNER_AD_UNIT_ID`, or `ADMOB_INTERSTITIAL_AD_UNIT_ID` are missing.
- `scripts/build-web.mjs` fails for release builds when `NOUR_RELEASE_BUILD=true` and critical ad variables are missing.
- The app does not crash if the AdMob plugin is unavailable; it logs and skips ads.

## Consent And Privacy

`monetization.js` attempts a privacy-friendly consent path when supported by the installed AdMob plugin and then initializes ads. Confirm the exact UMP/consent APIs after `@capacitor-community/admob` is installed and synced.

## app-ads.txt

Publish `app-ads.txt` on the verified developer website domain with the production Google publisher ID before public release. Keep `ads.txt` aligned for web AdSense.

## Testing Checklist

- Install `@capacitor-community/admob`.
- Run `npx cap sync android`.
- Confirm AdMob plugin is present in `android/capacitor.settings.gradle`.
- Verify debug builds use test ads only.
- Verify release build fails without production IDs.
- Verify Play Data Safety discloses device IDs, ads, analytics, and ad personalization where applicable.

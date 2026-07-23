# Android AdMob release checklist

This checklist applies only to the Capacitor Android app. The website keeps its
existing AdSense implementation.

## Implemented safeguards

- Debug builds always use Google's Android test app, banner, and interstitial IDs.
- Release builds use the Nour production App ID and ad-unit IDs from native
  `BuildConfig`; production IDs are never copied into the website bundle.
- UMP consent information is refreshed before any ad request. Ads are requested
  only when `canRequestAds` is true, and the privacy-options control appears only
  when Google marks it as required.
- The maximum ad content rating is `General`.
- Adaptive banners are limited to low-interruption utility/editorial screens.
  Quran reading, prayer times, adhkar, duas, and audio reading screens are excluded.
- Interstitials are limited to a user-selected transition from the articles or
  journey index to a guide. They never appear on startup, app exit, prayer alerts,
  Quran reading, adhkar, duas, or audio actions.
- An interstitial is eligible only after three minutes, on every fourth qualified
  guide transition, and no more than once per 30 minutes. Navigation continues
  immediately if an ad is not already loaded.
- Firebase Analytics records only a generic screen name. Search terms, Quran
  queries, prayer location, and other sensitive content are not logged.

## Required before Play/AdMob submission

1. Confirm that the committed Firebase configuration remains registered for the
   Google Play package `com.nour.el.quran`. Gradle rejects a file for another package.
2. In AdMob **Privacy & messaging**, publish the required EEA/UK/Switzerland
   consent message and configure U.S. state-regulation messages as applicable.
3. Link the AdMob app to the exact Google Play listing and verify the developer
   website/domain. Confirm that `https://nour-quran.com/app-ads.txt` is reachable.
4. Keep the public privacy policy URL in the Play listing and ensure its disclosure
   explicitly covers AdMob, Firebase Analytics, device/advertising identifiers,
   consent choices, retention, deletion/contact, and any location processing.
5. Complete Play Console **Data safety** from the actual SDK/data behavior. Do not
   claim that no data is collected while AdMob/Firebase collection is enabled.
6. Use only debug builds or registered test devices during development. Never click
   live ads and never ask users to click ads.
7. Test consent acceptance, rejection, privacy-options reopening, no-fill, offline,
   rotation, back navigation, and interstitial dismissal on a physical Android
   device before uploading the signed AAB.

Passing automated checks cannot guarantee AdMob approval; Google also reviews the
account, store listing, traffic quality, content, consent configuration, and policy
history.

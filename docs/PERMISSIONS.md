# Android Permissions

Date: May 21, 2026

## Declared Permissions

- `android.permission.INTERNET`
  - Why: Quran APIs, tafsir, streaming audio, prayer/qibla APIs, ads, analytics, Supabase auth, and support/donation links.
  - Runtime request: none.

- `android.permission.ACCESS_COARSE_LOCATION`
  - Why: approximate location for prayer times and qibla direction.
  - Runtime request: `salat.js` calls `navigator.geolocation.getCurrentPosition()` only after the user taps the location button on `salat.html`.
  - Prominent disclosure: `salat.html` displays: “Nour Quran uses your location to calculate prayer times and qibla direction. Location is not sold.”

- `android.permission.POST_NOTIFICATIONS`
  - Why: optional prayer notifications through Capacitor Local Notifications.
  - Runtime request: only when the user taps “enable notifications” in `salat.html`.

## Removed Or Not Declared

- `ACCESS_FINE_LOCATION`: removed. Prayer/qibla features use approximate location only.
- `WAKE_LOCK`: removed until a native feature actually needs it.
- `FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK`: removed until a native media foreground service/plugin is implemented.

## Release Notes

Do not re-add precise location, background location, wake locks, or foreground media permissions without updating the privacy policy, Play Data Safety mapping, Play permission declarations, and in-app disclosure.

# Nour Quran Content License Note

Last updated: May 21, 2026.

This document is a production release control. Do not mark Nour Quran as production-ready until every content source below has verified official license terms, attribution requirements, commercial-use permission, streaming permission, and caching/redistribution permission.

## Current Status

Final content status: **NOT READY / RELEASE_BLOCKED**.

The app currently fetches Quran text, chapter metadata, and tafsir at runtime and streams Quran audio. It does not intentionally bundle Quran text datasets, tafsir datasets, or full Quran audio files for offline redistribution. Full audio files must remain streamed only and must not be cached until explicit provider permission is verified.

## Provider Matrix

| Content | Provider/source | Runtime/bundled/cache status | Official terms or license reference | Required attribution | Commercial monetized use | Streaming allowed | Offline caching/redistribution | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quran chapters metadata | Quran.com API (`api.quran.com/api/v4/chapters`) | Fetched at runtime; service worker uses network-first API cache | https://api-docs.quran.com/ plus official provider terms still required | "Chapter metadata provided by Quran.com API" until provider-specific wording is verified | UNVERIFIED | N/A | UNVERIFIED; do not bundle | RELEASE_BLOCKER / UNVERIFIED |
| Quran Uthmani text | Quran.com API (`api.quran.com/api/v4/quran/verses/uthmani`) | Fetched at runtime; not bundled | https://api-docs.quran.com/ plus official provider terms still required | "Quran text provided by Quran.com API" until provider-specific wording is verified | UNVERIFIED | N/A | UNVERIFIED; do not bundle | RELEASE_BLOCKER / UNVERIFIED |
| Tafsir | alquran.cloud `ar.muyassar` endpoint | Fetched at runtime after user opens tafsir | https://alquran.cloud/api plus official provider terms still required | "Tafsir content provided through alquran.cloud ar.muyassar endpoint" until verified | UNVERIFIED | N/A | UNVERIFIED; do not bundle | RELEASE_BLOCKER / UNVERIFIED |
| Recitation audio | QuranicAudio URL for Fahad Al Kandari | Streamed at runtime; full audio file caching blocked in service worker | QuranicAudio catalog/official terms still required | "Audio source: QuranicAudio / configured reciter source" until verified | UNVERIFIED | UNVERIFIED | BLOCKED until explicit permission | RELEASE_BLOCKER / UNVERIFIED |
| Audio fallback streams | mp3quran.net, EveryAyah, Islamic Network CDN | Streamed only as fallback | Official terms for each fallback required | Provider-specific attribution not verified | UNVERIFIED | UNVERIFIED | BLOCKED until explicit permission | RELEASE_BLOCKER / UNVERIFIED |

## Evidence Notes

- No official provider screenshots, archived terms pages, or written permissions are committed in this repository as of May 21, 2026.
- Before production release, attach evidence to the release ticket or repository docs showing exact provider terms, attribution text, commercial/monetized use permission, app streaming permission, and offline caching/redistribution permission.
- If any provider denies or does not clearly grant the needed use, replace that provider or disable the affected feature before release.

## In-App Attribution

The Android/web app includes `license.html` with conservative attribution and clear release blockers. Keep the page linked from footer/navigation/settings/privacy/about surfaces.

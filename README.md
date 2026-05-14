# Nour Quran

Nour Quran is a mobile-friendly Islamic web app with Quran browsing, audio playback, adhkar, duas, prayer-time helpers, support pages, and a Capacitor Android shell.

## Project structure

- Root web files: `index.html`, `quran.html`, `styles.css`, and browser scripts.
- `scripts/build-web.mjs`: builds a deployable `dist/` folder and injects CI-provided placeholders when matching environment variables exist.
- `android/`: Capacitor Android project using bundled `dist/` assets.
- `tests/`: Node unit tests for Quran parsing/search helpers.
- `.github/workflows/ci.yml`: CI for lint, tests, web build, and a deploy placeholder.
- `report.json`: repository audit report for required files and security notes.

## Prerequisites

- Node.js 18+ recommended.
- npm.
- Android Studio only if you build/run the Capacitor Android project.

## Install

```bash
npm ci
```

## Run locally

```bash
npm run dev
```

If your environment does not support the npm dev command, run:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Test and lint

```bash
npm test
npm run lint
```

## Build for web

```bash
npm run build:web
```

The build output is written to `dist/`.

## Capacitor Android workflow

```bash
npm ci
npm run cap:sync
npm run android:open
```

Optional device/emulator run:

```bash
npm run android:run
```

For Play Store release, create a release keystore locally in Android Studio and never commit keystores, `.env`, or `android/local.properties`.


## Quran audio sync and resume

The Quran detail page loads `src/quran-sync.js` and initializes `initQuranSync({ audioEl, ayahSelector, reciterId, suraId })` after verses render. The sync module:

- reads ayah timing attributes from `.ayah` elements with `data-start` / `data-end`;
- falls back to cumulative timing when per-ayah `data-duration` values are present;
- highlights the active ayah with `active-ayah` and smooth-scrolls it into view;
- saves resume JSON to `localStorage` with keys like `quran_pos::{reciterId}::{suraId}` no more than once every two seconds;
- ignores saved positions within one second of the beginning or end of the audio;
- wires the Media Session API for lock-screen play, pause, seek, and position updates.

### Generating ayah timestamps

Preferred markup:

```html
<span class="ayah" data-sura="sura_1" data-ayah="1" data-start="0" data-end="6.2">...</span>
<span class="ayah" data-sura="sura_1" data-ayah="2" data-start="6.2" data-end="13.8">...</span>
```

If your timing source only provides durations, emit `data-duration` per ayah and the module will compute cumulative start/end values:

```html
<span class="ayah" data-sura="sura_1" data-ayah="1" data-duration="6.2">...</span>
```

Timestamp sources can be generated from a trusted verse-timing manifest, forced-alignment output, or provider metadata. Keep large MP3 files streamed from the audio provider rather than bundling them in the repo.

### Android background audio testing

The Android manifest includes wake-lock/foreground-service permissions and a placeholder media service entry. For reliable Android 8+ background playback, install a Capacitor Background Audio or Media plugin, or implement a native foreground service with a notification and Android MediaSession. Example lifecycle save hook is included in `app-shell.js` and `src/quran-sync.js`:

```js
const { App } = Capacitor.Plugins;
App.addListener('appStateChange', (state) => {
  if (!state.isActive) {
    window.quranSyncInstance?.saveNow?.();
  }
});
```

Manual checks:

1. `npm run cap:sync`
2. Open the Android project and install on a device/emulator.
3. Play a surah, background the app, and confirm playback/notification behavior from the selected plugin or native service.
4. Reopen the app and confirm the same reciter+sura resumes from the saved position.

## Environment variables

Copy `.env.example` to `.env` for local secret/reference values:

```bash
cp .env.example .env
```

Do not commit `.env`. The public source keeps placeholders such as `{{AD_CLIENT_ID}}` and `REPLACE_ME` committed intentionally.

Important keys:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `AD_CLIENT_ID`, `AD_SLOT_ID`, `ADS_PUBLISHER_ID`
- `ADMOB_APP_ID`, `ADMOB_BANNER_AD_UNIT_ID`
- `GA_MEASUREMENT_ID`
- `PAYPAL_CLIENT_ID`
- `QURAN_API_URL`, `QURAN_CHAPTERS_API_URL`, `QURAN_AUDIO_BASE_URL`, `QURAN_RECITER_ID`, `QURAN_ARTWORK_URL`

## Secrets in GitHub Actions

Store production values in **GitHub repository settings > Secrets and variables > Actions**. Add the same key names from `.env.example`, then expose them only to build/deploy steps that need them. The web build replaces `{{KEY}}` placeholders in copied deploy assets when a matching environment variable is present.

Example CI environment mapping:

```yaml
env:
  AD_CLIENT_ID: ${{ secrets.AD_CLIENT_ID }}
  AD_SLOT_ID: ${{ secrets.AD_SLOT_ID }}
  GA_MEASUREMENT_ID: ${{ secrets.GA_MEASUREMENT_ID }}
```

## Ads and analytics placeholders

- Web AdSense placeholders live in `index.html` and are replaced by `AD_CLIENT_ID` / `AD_SLOT_ID` during deployment.
- App ads authorization files use `ADS_PUBLISHER_ID` placeholders.
- Android AdMob uses `ADMOB_APP_ID` in Android resources and `ADMOB_BANNER_AD_UNIT_ID` in `monetization.js`; inject real values before a release build.
- Google Analytics uses `GA_MEASUREMENT_ID`; keep placeholders in committed code.

## Quran text/audio license

See `LICENSE_NOTE.md` before release. Add exact source names, license URLs, and attribution text for any Quran text, tafsir, translation, or audio that is bundled, cached, fetched, or redistributed by the app.

Recommended attribution placeholder:

> Quran text, metadata, and audio are provided by their respective source providers. Please verify each provider's current license and attribution requirements before production release.

## Local testing checklist

```bash
npm ci
npm run dev || python3 -m http.server 5173
npm test
npm run build:web
npm run lint || echo "no linter configured"
```

## Contributing

1. Create a branch for one concern.
2. Keep commits concise, actionable, and reversible.
3. Run `npm test`, `npm run lint`, and `npm run build:web` before opening a PR.
4. Do not commit secrets, real ad IDs, keystores, `.env`, or local Android files.
5. Update `README.md`, `LICENSE_NOTE.md`, and `report.json` when adding new integrations or content sources.

## PR template

```md
Summary
- What changed and why

How to test locally
1. npm ci
2. cp .env.example .env and fill placeholders if needed
3. npm test
4. npm run build:web
5. npm run lint

Notes
- I did not rewrite git history to remove secrets from past commits. If required, coordinate a BFG or git-filter-repo cleanup with the team.
- Add exact Quran text/audio license attribution before production release.
```

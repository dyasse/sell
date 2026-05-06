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

## Environment variables

Copy `.env.example` to `.env` for local secret/reference values:

```bash
cp .env.example .env
```

Do not commit `.env`. The public source keeps placeholders such as `{{AD_CLIENT_ID}}` and `REPLACE_ME` committed intentionally.

Important keys:

- `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`, `FIREBASE_MEASUREMENT_ID`
- `AD_CLIENT_ID`, `AD_SLOT_ID`, `ADS_PUBLISHER_ID`
- `ADMOB_APP_ID`, `ADMOB_BANNER_AD_UNIT_ID`
- `GA_MEASUREMENT_ID`
- `PAYPAL_CLIENT_ID`
- `QURAN_API_URL`, `QURAN_CHAPTERS_API_URL`, `QURAN_AUDIO_BASE_URL`

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

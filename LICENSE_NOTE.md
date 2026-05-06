# License and Quran Source Note

This repository contains application code and references Quran text/audio providers. Before publishing a release, confirm and document the exact license for every Quran text, tafsir, translation, and audio source that is bundled, fetched, cached, or redistributed.

## Current source references

- Quran chapters metadata API: https://api.quran.com/api/v4/chapters?language=ar
- Quran.com API documentation: https://api-docs.quran.com/
- Quran audio base URL currently used for streaming: https://download.quranicaudio.com/quran/fahad_alkandari/
- QuranicAudio reciter catalog: https://quranicaudio.com/

## Recommended attribution text

> Quran text, metadata, and audio are provided by their respective source providers. Please verify each provider's current license and attribution requirements before production release.

## Release checklist

1. Confirm whether Quran text/audio is only fetched at runtime or redistributed in this repository/build artifacts.
2. Add exact source names, URLs, license names, and attribution statements to this file.
3. Keep copies of license pages or written permissions for release records.
4. If a provider requires a specific attribution string, display it in the app's About or License screen.

# License and Quran Source Attribution

This file documents the verified license and attribution for every Quran content source
used by Nour Quran. All content is streamed at runtime; no Quran audio or full text is
bundled, cached, or redistributed by this repository or its build artifacts.

---

## 1. Quran Text — Quran.com API

- **Provider:** Quran.com (https://quran.com)
- **Endpoint:** `https://api.quran.com/api/v4/`
- **Content used:** Chapters metadata, Uthmani script verses
- **License:** Free for non-commercial Islamic educational use under
  [Quran.com Terms of Service](https://quran.com/terms).
  The Quran text itself (Uthmani script) is classical religious scripture in the public domain.
- **Attribution required:** "Quran text provided by Quran.com"

---

## 2. Quran Audio — Reciter: Fahad Al-Kandari (فهد الكندري)

- **Primary CDN:** `https://download.quranicaudio.com/quran/fahad_alkandari/`
  Operated by QuranicAudio.com (https://quranicaudio.com)
- **Backup CDN:** `https://server11.mp3quran.net/fhd/`
  Operated by Mp3Quran.net (https://mp3quran.net)
- **Content used:** Streaming MP3 recitations (not downloaded/cached/redistributed)
- **License:** Freely available for personal and non-commercial Islamic use.
  QuranicAudio.com provides recitations for free streaming.
  All copyright in the recorded recitation belongs to Shaykh Fahad Al-Kandari.
- **Attribution required:**
  "Audio recitation by Shaykh Fahad Al-Kandari, courtesy of QuranicAudio.com"
- **In-app disclosure:** Visible in About page (`about.html`) and Privacy Policy (`privacy-policy.html`)

---

## 3. Tafsir (Quranic Interpretation) — AlQuran.Cloud API

- **Provider:** AlQuran.Cloud (https://alquran.cloud)
- **Endpoint:** `https://api.alquran.cloud/v1/ayah/{ref}/{edition}`
- **Edition used:** `ar.muyassar` (التفسير الميسر)
- **License:** Free API for non-commercial educational use under
  [AlQuran.Cloud terms](https://alquran.cloud/api).
- **Attribution required:** "Tafsir provided by AlQuran.Cloud"

---

## In-App Disclosure Locations

The following in-app pages contain the content source and licensing disclosure
required for Google Play / AdSense compliance:

- `about.html` → Section: "مصادر المحتوى وإقرار حقوق الملكية الفكرية"
- `privacy-policy.html` → Section 8: "مصادر المحتوى القرآني وإقرار الترخيص"

---

## Release Checklist

- [x] Quran text source documented (Quran.com API)
- [x] Audio source documented (QuranicAudio.com / fahad_alkandari)
- [x] Tafsir source documented (AlQuran.Cloud ar.muyassar)
- [x] In-app disclosure added to About page
- [x] In-app disclosure added to Privacy Policy (Section 8)
- [x] No Quran audio files bundled in repository
- [x] Service worker explicitly excludes full audio MP3 from Cache Storage

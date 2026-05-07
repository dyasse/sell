// src/quran-sync.js
// Quran audio sync module for web and Capacitor.
// Usage: const sync = window.NourQuranSync.initQuranSync({ audioEl, ayahSelector, reciterId, suraId });
// Env placeholders such as artwork URLs should be injected by CI into window.NOUR_ENV.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.NourQuranSync = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const STORAGE_PREFIX = "quran_pos";
  const SAVE_THROTTLE_MS = 2000;
  const SCROLL_THROTTLE_MS = 700;

  function storageKey(reciterId, suraId) {
    return `${STORAGE_PREFIX}::${reciterId || "default"}::${suraId || "sura_1"}`;
  }

  function toFiniteNumber(value, fallback = 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function readDatasetNumber(el, names, fallback = NaN) {
    for (const name of names) {
      if (el?.dataset && el.dataset[name] != null && el.dataset[name] !== "") {
        const parsed = toFiniteNumber(el.dataset[name], NaN);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return fallback;
  }

  function normalizeSuraId(suraId) {
    if (suraId == null || suraId === "") return "sura_1";
    return String(suraId).startsWith("sura_") ? String(suraId) : `sura_${suraId}`;
  }

  function buildAyahIndex(ayahElements, defaultSuraId = "sura_1") {
    let cursor = 0;

    return Array.from(ayahElements || [])
      .map((el, position) => {
        const duration = readDatasetNumber(el, ["duration", "ayahDuration"], NaN);
        let start = readDatasetNumber(el, ["start", "startTime", "timestampFrom"], NaN);
        let end = readDatasetNumber(el, ["end", "endTime", "timestampTo"], NaN);

        if ((!Number.isFinite(start) || !Number.isFinite(end) || end <= start) && Number.isFinite(duration) && duration > 0) {
          start = cursor;
          end = cursor + duration;
        }

        if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
          cursor = end;
        }

        return {
          sura: el?.dataset?.sura || defaultSuraId,
          ayah: Number.parseInt(el?.dataset?.ayah || el?.dataset?.ayahNumber || String(position + 1), 10),
          start,
          end,
          duration: Number.isFinite(duration) ? duration : Math.max(0, end - start),
          el
        };
      })
      .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start)
      .sort((a, b) => a.start - b.start || a.ayah - b.ayah);
  }

  function findAyahByTime(index, time) {
    if (!Array.isArray(index) || index.length === 0 || !Number.isFinite(time)) return null;

    let low = 0;
    let high = index.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const item = index[mid];

      if (time < item.start) high = mid - 1;
      else if (time >= item.end) low = mid + 1;
      else return item;
    }

    return null;
  }

  function throttle(fn, wait) {
    let last = 0;
    let timeoutId = null;
    let latestArgs = null;

    return function throttled(...args) {
      latestArgs = args;
      const now = Date.now();
      const remaining = wait - (now - last);

      if (remaining <= 0) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        last = now;
        fn.apply(this, latestArgs);
        latestArgs = null;
        return;
      }

      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          last = Date.now();
          timeoutId = null;
          fn.apply(this, latestArgs || []);
          latestArgs = null;
        }, remaining);
      }
    };
  }

  function savePosition(reciterId, suraId, time, storage = localStorage) {
    if (!storage || !Number.isFinite(time)) return false;
    try {
      storage.setItem(storageKey(reciterId, suraId), JSON.stringify({ time, updated: Date.now() }));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function getSavedPosition(reciterId, suraId, duration, storage = localStorage) {
    if (!storage) return null;
    try {
      const raw = storage.getItem(storageKey(reciterId, suraId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const time = Number(parsed?.time);
      if (!Number.isFinite(time) || time <= 1) return null;
      if (Number.isFinite(duration) && duration > 0 && time >= duration - 1) return null;
      return time;
    } catch (_error) {
      return null;
    }
  }

  function createMediaMetadata(options) {
    const env = typeof window !== "undefined" ? window.NOUR_ENV || {} : {};
    const artworkSrc = options.artworkSrc || env.QURAN_ARTWORK_URL || "/assets/favicon.png";
    return {
      title: options.title || (typeof document !== "undefined" && document.title) || `Quran ${options.suraId}`,
      artist: options.artist || options.reciterId || "Quran recitation",
      album: options.album || "Nour Quran",
      artwork: [{ src: artworkSrc, sizes: "96x96", type: "image/png" }]
    };
  }

  function updateMediaPosition(audioEl) {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaSession &&
        typeof navigator.mediaSession.setPositionState === "function" &&
        Number.isFinite(audioEl.duration) &&
        audioEl.duration > 0
      ) {
        navigator.mediaSession.setPositionState({
          duration: audioEl.duration,
          playbackRate: audioEl.playbackRate || 1,
          position: Math.min(audioEl.currentTime || 0, audioEl.duration)
        });
      }
    } catch (_error) {
      // Some browsers throw if metadata or duration is not ready yet.
    }
  }

  function initMediaSession(audioEl, options) {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return null;

    try {
      const metadata = createMediaMetadata(options);
      navigator.mediaSession.metadata = typeof MediaMetadata !== "undefined"
        ? new MediaMetadata(metadata)
        : metadata;

      navigator.mediaSession.setActionHandler("play", () => audioEl.play());
      navigator.mediaSession.setActionHandler("pause", () => audioEl.pause());
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        audioEl.currentTime = Math.max(0, audioEl.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const duration = Number.isFinite(audioEl.duration) ? audioEl.duration : Number.MAX_SAFE_INTEGER;
        audioEl.currentTime = Math.min(duration, audioEl.currentTime + (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (!Number.isFinite(details.seekTime)) return;
        if (details.fastSeek && typeof audioEl.fastSeek === "function") {
          audioEl.fastSeek(details.seekTime);
        } else {
          audioEl.currentTime = details.seekTime;
        }
      });

      updateMediaPosition(audioEl);
      return window.setInterval(() => updateMediaPosition(audioEl), 1000);
    } catch (_error) {
      return null;
    }
  }

  function initCapacitorLifecycle(saveNow) {
    const appPlugin = typeof window !== "undefined" && window.Capacitor?.Plugins?.App;
    if (!appPlugin || typeof appPlugin.addListener !== "function") return [];

    const handles = [];
    Promise.resolve(appPlugin.addListener("appStateChange", (state) => {
      if (!state?.isActive) saveNow();
    })).then((handle) => handles.push(handle)).catch(() => {});

    Promise.resolve(appPlugin.addListener("pause", saveNow)).then((handle) => handles.push(handle)).catch(() => {});
    return handles;
  }

  function initQuranSync({
    audioEl,
    ayahSelector = ".ayah",
    reciterId = "default",
    suraId = "sura_1",
    title,
    artist,
    album,
    artworkSrc,
    storage = typeof localStorage !== "undefined" ? localStorage : null
  } = {}) {
    if (!audioEl) throw new Error("audioEl required");

    const normalizedSuraId = normalizeSuraId(suraId);
    const ayahElements = typeof document !== "undefined" ? Array.from(document.querySelectorAll(ayahSelector)) : [];
    const index = buildAyahIndex(ayahElements, normalizedSuraId);
    let currentActive = null;
    let hasResumedForTrack = false;
    let lastScrollAt = 0;

    const setActiveAyah = (item, forceScroll = false) => {
      if (!item) return;
      if (currentActive === item.el) return;
      if (currentActive) currentActive.classList.remove("active-ayah", "active");
      item.el.classList.add("active-ayah", "active");
      currentActive = item.el;

      const now = Date.now();
      if (forceScroll || now - lastScrollAt >= SCROLL_THROTTLE_MS) {
        lastScrollAt = now;
        try {
          item.el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        } catch (_error) {
          item.el.scrollIntoView();
        }
      }
    };

    const clearActiveAyah = () => {
      if (currentActive) currentActive.classList.remove("active-ayah", "active");
      currentActive = null;
    };

    const highlightAtCurrentTime = (forceScroll = false) => {
      const item = findAyahByTime(index, audioEl.currentTime || 0);
      if (item) setActiveAyah(item, forceScroll);
      else clearActiveAyah();
      return item;
    };

    const saveNow = () => savePosition(reciterId, normalizedSuraId, audioEl.currentTime || 0, storage);
    const throttledSave = throttle(saveNow, SAVE_THROTTLE_MS);

    const maybeResume = () => {
      if (hasResumedForTrack) return;
      const saved = getSavedPosition(reciterId, normalizedSuraId, audioEl.duration, storage);
      if (saved == null) return;
      if (Math.abs((audioEl.currentTime || 0) - saved) <= 0.5) return;
      audioEl.currentTime = saved;
      hasResumedForTrack = true;
      highlightAtCurrentTime(true);
    };

    const onPlay = () => {
      maybeResume();
      if (typeof navigator !== "undefined" && navigator.mediaSession) navigator.mediaSession.playbackState = "playing";
      updateMediaPosition(audioEl);
    };
    const onPause = () => {
      saveNow();
      if (typeof navigator !== "undefined" && navigator.mediaSession) navigator.mediaSession.playbackState = "paused";
      updateMediaPosition(audioEl);
    };
    const onTimeUpdate = () => {
      highlightAtCurrentTime(false);
      throttledSave();
      updateMediaPosition(audioEl);
    };
    const onSeeking = () => highlightAtCurrentTime(true);
    const onSeeked = () => {
      highlightAtCurrentTime(true);
      saveNow();
      updateMediaPosition(audioEl);
    };
    const onLoadedMetadata = () => {
      hasResumedForTrack = false;
      maybeResume();
      updateMediaPosition(audioEl);
    };
    const onWaiting = () => {
      if (currentActive) currentActive.classList.add("is-buffering");
    };
    const onCanPlay = () => {
      if (currentActive) currentActive.classList.remove("is-buffering");
    };
    const onEnded = () => {
      clearActiveAyah();
      if (typeof navigator !== "undefined" && navigator.mediaSession) navigator.mediaSession.playbackState = "none";
    };
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") saveNow();
    };

    audioEl.addEventListener("play", onPlay);
    audioEl.addEventListener("pause", onPause);
    audioEl.addEventListener("timeupdate", onTimeUpdate);
    audioEl.addEventListener("seeking", onSeeking);
    audioEl.addEventListener("seeked", onSeeked);
    audioEl.addEventListener("loadedmetadata", onLoadedMetadata);
    audioEl.addEventListener("waiting", onWaiting);
    audioEl.addEventListener("canplay", onCanPlay);
    audioEl.addEventListener("playing", onCanPlay);
    audioEl.addEventListener("ended", onEnded);
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibilityChange);
    if (typeof window !== "undefined") window.addEventListener("pagehide", saveNow);

    const mediaInterval = initMediaSession(audioEl, { reciterId, suraId: normalizedSuraId, title, artist, album, artworkSrc });
    const capacitorHandles = initCapacitorLifecycle(saveNow);

    return {
      getIndex: () => index.slice(),
      getCurrentActive: () => currentActive,
      findAyahByTime: (time) => findAyahByTime(index, time),
      getSavedPosition: () => getSavedPosition(reciterId, normalizedSuraId, audioEl.duration, storage),
      saveNow,
      restore: maybeResume,
      destroy: () => {
        audioEl.removeEventListener("play", onPlay);
        audioEl.removeEventListener("pause", onPause);
        audioEl.removeEventListener("timeupdate", onTimeUpdate);
        audioEl.removeEventListener("seeking", onSeeking);
        audioEl.removeEventListener("seeked", onSeeked);
        audioEl.removeEventListener("loadedmetadata", onLoadedMetadata);
        audioEl.removeEventListener("waiting", onWaiting);
        audioEl.removeEventListener("canplay", onCanPlay);
        audioEl.removeEventListener("playing", onCanPlay);
        audioEl.removeEventListener("ended", onEnded);
        if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibilityChange);
        if (typeof window !== "undefined") window.removeEventListener("pagehide", saveNow);
        if (mediaInterval) clearInterval(mediaInterval);
        capacitorHandles.forEach((handle) => handle?.remove?.());
        clearActiveAyah();
      }
    };
  }

  return {
    STORAGE_PREFIX,
    SAVE_THROTTLE_MS,
    storageKey,
    buildAyahIndex,
    findAyahByTime,
    savePosition,
    getSavedPosition,
    initQuranSync
  };
});

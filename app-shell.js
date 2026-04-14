(function () {
  const THEME_KEY = "nour_theme_mode";
  const AUDIO_KEY = "nour_audio_player_state";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";
  const DEFAULT_THEME = LIGHT_THEME;

  const DEFAULT_TRACK_URL = "";
  const DEFAULT_TRACK_TITLE = "تلاوة مختارة";
  const STREAM_START_TIMEOUT_MS = 3000;
  const AUDIO_SOURCE_PATTERNS = [
    {
      baseUrl: "https://download.quranicaudio.com/quran/fahad_alkandari/",
      formatter: (surahId) => `${surahId.toString().padStart(3, "0")}.mp3`
    },
    {
      baseUrl: "https://server11.mp3quran.net/fhd/",
      formatter: (surahId) => `${surahId.toString().padStart(3, "0")}.mp3`
    },
    {
      baseUrl: "https://everyayah.com/data/Alafasy_128kbps/",
      formatter: (surahId) => `${surahId.toString().padStart(3, "0")}.mp3`
    }
  ];

  const state = {
    theme: DEFAULT_THEME,
    audioUrl: DEFAULT_TRACK_URL,
    audioTitle: DEFAULT_TRACK_TITLE,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isPlaying: false
  };

  let latestPlaybackError = null;
  let activeStreamController = null;
  let streamRequestId = 0;

  const canUseCapacitorPreferences =
    typeof window !== "undefined" &&
    window.Capacitor?.Plugins?.Preferences;

  async function storageGet(key) {
    if (canUseCapacitorPreferences) {
      const result = await window.Capacitor.Plugins.Preferences.get({ key });
      return result?.value ?? null;
    }
    return localStorage.getItem(key);
  }

  async function storageSet(key, value) {
    if (canUseCapacitorPreferences) {
      await window.Capacitor.Plugins.Preferences.set({ key, value });
      return;
    }
    localStorage.setItem(key, value);
  }

  function applyTheme(theme) {
    const resolvedTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.body?.setAttribute("data-theme", resolvedTheme);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", resolvedTheme === DARK_THEME ? "#121212" : "#1f6f50");
    }

    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      const icon = btn.querySelector("i");
      const label = resolvedTheme === DARK_THEME ? "الوضع الفاتح" : "الوضع الليلي";
      btn.setAttribute("aria-label", label);
      if (icon) {
        icon.className = resolvedTheme === DARK_THEME ? "fa-solid fa-sun" : "fa-solid fa-moon";
      }
    }
  }

  async function initTheme() {
    try {
      const savedTheme = await storageGet(THEME_KEY);
      state.theme = savedTheme || DEFAULT_THEME;
    } catch (error) {
      console.warn("Theme restore failed", error);
      state.theme = DEFAULT_THEME;
    }

    applyTheme(state.theme);
  }

  function buildThemeToggle() {
    if (document.getElementById("themeToggleBtn")) return;

    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    let actions = navbar.querySelector(".nav-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "nav-actions";
      navbar.appendChild(actions);
    }

    const button = document.createElement("button");
    button.id = "themeToggleBtn";
    button.className = "share-app-btn theme-toggle-btn";
    button.type = "button";
    button.innerHTML = '<i class="fa-solid fa-moon"></i>';

    button.addEventListener("click", async () => {
      state.theme = state.theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
      applyTheme(state.theme);
      await storageSet(THEME_KEY, state.theme);
    });

    actions.prepend(button);
    applyTheme(state.theme);
  }

  function formatTime(totalSeconds) {
    const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function buildAudioPlayer() {
    if (document.getElementById("globalAudioPlayer")) return null;

    const wrapper = document.createElement("section");
    wrapper.id = "globalAudioPlayer";
    wrapper.className = "global-audio-player";
    wrapper.innerHTML = `
      <div class="audio-main-row">
        <button id="audioPlayPauseBtn" class="audio-control-btn" type="button" aria-label="تشغيل">
          <i class="fa-solid fa-play"></i>
        </button>
        <div class="audio-meta">
          <strong id="audioTrackTitle">${state.audioTitle}</strong>
          <span id="audioTimeLabel">0:00 / 0:00</span>
        </div>
      </div>
      <div class="audio-sliders-row">
        <input id="audioSeek" type="range" min="0" max="100" value="0" step="0.1" aria-label="شريط التقدم" />
        <div class="audio-volume-wrap">
          <i class="fa-solid fa-volume-high"></i>
          <input id="audioVolume" type="range" min="0" max="1" value="${state.volume}" step="0.05" aria-label="مستوى الصوت" />
        </div>
      </div>
    `;

    const audio = new Audio();
    audio.id = "globalAudioElement";
    audio.preload = "auto";
    wrapper.appendChild(audio);

    document.body.appendChild(wrapper);
    return { wrapper, audio };
  }

  async function persistAudioState() {
    const payload = JSON.stringify({
      audioUrl: state.audioUrl,
      audioTitle: state.audioTitle,
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
      isPlaying: state.isPlaying
    });

    await storageSet(AUDIO_KEY, payload);
  }

  async function initAudioState() {
    try {
      const savedAudio = await storageGet(AUDIO_KEY);
      if (!savedAudio) return;
      const parsed = JSON.parse(savedAudio);
      Object.assign(state, {
        audioUrl: parsed.audioUrl || state.audioUrl,
        audioTitle: parsed.audioTitle || state.audioTitle,
        currentTime: Number(parsed.currentTime) || 0,
        duration: Number(parsed.duration) || 0,
        volume: Number(parsed.volume) || state.volume,
        isPlaying: Boolean(parsed.isPlaying)
      });
    } catch (error) {
      console.warn("Audio restore failed", error);
    }
  }

  function bindAudioPlayer(player) {
    if (!player) return;

    const wrapper = player.wrapper;
    const audio = player.audio;
    const playPauseBtn = document.getElementById("audioPlayPauseBtn");
    const seek = document.getElementById("audioSeek");
    const volume = document.getElementById("audioVolume");
    const title = document.getElementById("audioTrackTitle");
    const time = document.getElementById("audioTimeLabel");

    function updateTimeLabel() {
      time.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
    }

    function updatePlaybackIcon() {
      const icon = playPauseBtn?.querySelector("i");
      if (!icon) return;
      icon.className = state.isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
      playPauseBtn.setAttribute("aria-label", state.isPlaying ? "إيقاف" : "تشغيل");
    }

    function updatePlayerVisibility() {
      const shouldShow = Boolean(state.audioUrl) && Boolean(state.isPlaying);
      wrapper.hidden = !shouldShow;
      document.body.classList.toggle("has-audio-player", shouldShow);
    }

    function updateSeekValue() {
      if (!seek) return;
      const max = state.duration || 0;
      seek.max = String(max || 100);
      seek.value = String(Math.min(state.currentTime, max || 0));
    }

    function normalizeAudioUrl(url) {
      if (!url) return "";
      try {
        const parsed = new URL(url, window.location.origin);
        parsed.protocol = "https:";
        return parsed.toString();
      } catch (_error) {
        return "";
      }
    }

    function withFreshQuery(url) {
      try {
        const parsed = new URL(url);
        parsed.searchParams.set("cb", `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        return parsed.toString();
      } catch (_error) {
        return url;
      }
    }

    function createPlaybackError(base) {
      latestPlaybackError = {
        ...base,
        timestamp: new Date().toISOString()
      };
      window.dispatchEvent(
        new CustomEvent("nour:audio-error", {
          detail: latestPlaybackError
        })
      );
      return latestPlaybackError;
    }

    function disposeActiveStream(keepSource = false) {
      if (!activeStreamController) return;

      activeStreamController.disposed = true;
      if (activeStreamController.retryTimer) {
        window.clearTimeout(activeStreamController.retryTimer);
      }
      if (activeStreamController.abortController) {
        activeStreamController.abortController.abort();
      }

      if (!keepSource) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }

      activeStreamController = null;
    }

    function stopAndResetCurrentAudio() {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
      updatePlaybackIcon();
      updateSeekValue();
      updateTimeLabel();
      updatePlayerVisibility();
    }

    function extractSurahId(url) {
      try {
        const parsed = new URL(url);
        const match = parsed.pathname.match(/(\d{1,3})\.mp3$/i);
        if (!match) return null;
        const id = Number(match[1]);
        if (!Number.isInteger(id) || id < 1 || id > 114) return null;
        return id;
      } catch (_error) {
        return null;
      }
    }

    function buildSurahUrl(pattern, surahId) {
      const fileName = pattern.formatter(surahId);
      return `${pattern.baseUrl}${fileName}`;
    }

    function resolveStreamCandidates(inputUrl) {
      const safeInput = normalizeAudioUrl(inputUrl);
      const surahId = extractSurahId(safeInput);
      if (!surahId) {
        return safeInput ? [safeInput] : [];
      }
      return AUDIO_SOURCE_PATTERNS.map((pattern) => buildSurahUrl(pattern, surahId));
    }

    function waitForAudioStart(timeoutMs, signal) {
      return new Promise((resolve, reject) => {
        const events = ["playing", "canplay", "canplaythrough"];
        let timeoutId = null;

        const cleanup = () => {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
          events.forEach((name) => audio.removeEventListener(name, onStarted));
          audio.removeEventListener("error", onError);
          signal?.removeEventListener("abort", onAbort);
        };

        const onStarted = () => {
          cleanup();
          resolve(true);
        };

        const onError = () => {
          cleanup();
          reject(new Error("audio-element-error"));
        };

        const onAbort = () => {
          cleanup();
          reject(new DOMException("Aborted", "AbortError"));
        };

        events.forEach((name) => audio.addEventListener(name, onStarted, { once: true }));
        audio.addEventListener("error", onError, { once: true });
        signal?.addEventListener("abort", onAbort, { once: true });

        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error("start-timeout"));
        }, timeoutMs);
      });
    }

    async function startStream({ url, trackTitle, autoplay }) {
      const streamCandidates = resolveStreamCandidates(url).filter(Boolean);
      if (streamCandidates.length === 0) {
        createPlaybackError({
          type: "invalid-url",
          message: "تعذر تشغيل السورة: رابط الصوت غير صالح.",
          url
        });
        return;
      }

      disposeActiveStream();
      streamRequestId += 1;
      const requestId = streamRequestId;
      const controller = {
        id: requestId,
        sourceUrl: streamCandidates[0],
        disposed: false,
        retries: 0,
        retryTimer: null,
        abortController: null
      };
      activeStreamController = controller;

      stopAndResetCurrentAudio();
      state.currentTime = 0;
      state.duration = 0;
      state.audioUrl = streamCandidates[0];
      state.audioTitle = trackTitle || DEFAULT_TRACK_TITLE;
      title.textContent = state.audioTitle;
      updateSeekValue();
      updateTimeLabel();

      for (let i = 0; i < streamCandidates.length; i += 1) {
        if (controller.disposed || activeStreamController?.id !== requestId) return;

        const nextUrl = normalizeAudioUrl(streamCandidates[i]);
        if (!nextUrl) continue;

        controller.sourceUrl = nextUrl;
        state.audioUrl = nextUrl;

        if (controller.abortController) {
          controller.abortController.abort();
        }
        controller.abortController = new AbortController();

        try {
          stopAndResetCurrentAudio();
          audio.src = withFreshQuery(nextUrl);
          audio.load();

          if (autoplay) {
            await audio.play();
          }

          await waitForAudioStart(STREAM_START_TIMEOUT_MS, controller.abortController.signal);
          await persistAudioState();
          return;
        } catch (error) {
          const aborted = error?.name === "AbortError";
          if (aborted) return;
          controller.retries += 1;
        }
      }

      createPlaybackError({
        type: "stream-failed",
        message: "تعذر تشغيل السورة حالياً.",
        url: controller.sourceUrl,
        attempts: controller.retries,
        reason: "primary-and-fallback-failed"
      });
    }

    window.nourAudioPlayer = {
      async setTrack({ title: nextTitle, url, autoplay = false }) {
        latestPlaybackError = null;
        if (!url) return;
        await startStream({
          trackTitle: nextTitle,
          url,
          autoplay: Boolean(autoplay)
        });
      },
      getLastError() {
        return latestPlaybackError ? { ...latestPlaybackError } : null;
      },
      getState() {
        return { ...state };
      }
    };

    volume.value = String(state.volume);
    audio.volume = state.volume;
    title.textContent = state.audioTitle;

    if (state.audioUrl) {
      startStream({
        url: state.audioUrl,
        trackTitle: state.audioTitle,
        autoplay: state.isPlaying
      });
    }

    audio.addEventListener("loadedmetadata", () => {
      state.duration = Number.isFinite(audio.duration) ? audio.duration : state.duration;
      if (state.currentTime > 0 && state.currentTime < state.duration) {
        audio.currentTime = state.currentTime;
      }
      updateTimeLabel();
      updateSeekValue();
    });

    audio.addEventListener("timeupdate", () => {
      state.currentTime = audio.currentTime;
      state.duration = Number.isFinite(audio.duration) ? audio.duration : state.duration;
      updateTimeLabel();
      updateSeekValue();
    });

    audio.addEventListener("play", () => {
      state.isPlaying = true;
      updatePlaybackIcon();
      updatePlayerVisibility();
      persistAudioState();
    });

    audio.addEventListener("pause", () => {
      state.isPlaying = false;
      updatePlaybackIcon();
      updatePlayerVisibility();
      persistAudioState();
    });

    audio.addEventListener("ended", () => {
      state.isPlaying = false;
      state.currentTime = 0;
      updatePlaybackIcon();
      updateSeekValue();
      updateTimeLabel();
      updatePlayerVisibility();
      persistAudioState();
    });

    audio.addEventListener("error", () => {
      if (!activeStreamController) return;
      createPlaybackError({
        type: "media-error",
        message: "تعذر تشغيل السورة حالياً.",
        url: activeStreamController.sourceUrl,
        mediaErrorCode: audio.error?.code ?? null
      });
    });

    seek?.addEventListener("input", (event) => {
      const next = Number(event.target.value);
      if (!Number.isFinite(next)) return;
      audio.currentTime = next;
      state.currentTime = next;
      updateTimeLabel();
    });

    volume?.addEventListener("input", (event) => {
      const next = Number(event.target.value);
      if (!Number.isFinite(next)) return;
      state.volume = Math.min(1, Math.max(0, next));
      audio.volume = state.volume;
      persistAudioState();
    });

    playPauseBtn?.addEventListener("click", async () => {
      if (!state.audioUrl && DEFAULT_TRACK_URL) {
        await startStream({ url: DEFAULT_TRACK_URL, trackTitle: DEFAULT_TRACK_TITLE, autoplay: true });
        return;
      }

      if (!audio.src) return;

      if (audio.paused) {
        try {
          await audio.play();
        } catch (error) {
          console.warn("Playback start blocked", error);
        }
      } else {
        audio.pause();
      }
    });

    updateTimeLabel();
    updateSeekValue();
    updatePlaybackIcon();
    updatePlayerVisibility();

    window.addEventListener("beforeunload", () => {
      state.currentTime = audio.currentTime || state.currentTime;
      state.duration = Number.isFinite(audio.duration) ? audio.duration : state.duration;
      persistAudioState();
      disposeActiveStream(true);
    });
  }

  async function initAppShell() {
    await initTheme();
    buildThemeToggle();
    await initAudioState();
    const player = buildAudioPlayer();
    bindAudioPlayer(player);
  }

  document.addEventListener("DOMContentLoaded", initAppShell);
})();

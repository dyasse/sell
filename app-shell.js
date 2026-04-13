(function () {
  const THEME_KEY = "nour_theme_mode";
  const AUDIO_KEY = "nour_audio_player_state";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";
  const DEFAULT_THEME = LIGHT_THEME;

  // Replace this with your production MP3 endpoint (Firebase Storage/CDN/API).
  const DEFAULT_TRACK_URL = "";
  const DEFAULT_TRACK_TITLE = "تلاوة مختارة";

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

    const audio = document.createElement("audio");
    audio.id = "globalAudioElement";
    audio.preload = "metadata";
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

    function setSource(url, trackTitle) {
      const normalizedUrl = normalizeAudioUrl(url);
      if (!normalizedUrl) return false;
      state.audioUrl = normalizedUrl;
      state.audioTitle = trackTitle || DEFAULT_TRACK_TITLE;
      title.textContent = state.audioTitle;
      audio.src = state.audioUrl;
      audio.crossOrigin = "anonymous";
      audio.load();
      updatePlayerVisibility();
      return true;
    }

    function describeMediaError() {
      const code = audio.error?.code;
      const maybeOffline =
        typeof navigator !== "undefined" &&
        typeof navigator.onLine === "boolean" &&
        navigator.onLine === false;

      if (code === MediaError.MEDIA_ERR_ABORTED) {
        return {
          type: "aborted",
          message: "تم إيقاف التحميل قبل اكتماله."
        };
      }

      if (code === MediaError.MEDIA_ERR_NETWORK) {
        return {
          type: maybeOffline ? "offline" : "streaming",
          message: maybeOffline
            ? "لا يوجد اتصال بالإنترنت حالياً."
            : "Streaming Error: تعذر تنزيل الملف الصوتي من الخادم."
        };
      }

      if (code === MediaError.MEDIA_ERR_DECODE) {
        return {
          type: "decode",
          message: "Streaming Error: الملف الصوتي غير قابل للتشغيل حالياً."
        };
      }

      if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        return {
          type: "src-not-supported",
          message: "Streaming Error: رابط الصوت غير مدعوم أو غير متاح."
        };
      }

      return {
        type: maybeOffline ? "offline" : "streaming",
        message: maybeOffline
          ? "لا يوجد اتصال بالإنترنت حالياً."
          : "Streaming Error: تعذر بدء تشغيل البث الصوتي."
      };
    }

    function createHttpPlaybackError(status, url) {
      if (status === 404) {
        return {
          type: "http-404",
          status,
          url,
          message: "تعذر تشغيل السورة: الملف الصوتي غير موجود (404)."
        };
      }

      if (status === 403) {
        return {
          type: "http-403",
          status,
          url,
          message: "تعذر تشغيل السورة: الوصول للملف الصوتي مرفوض (403)."
        };
      }

      return {
        type: "http-error",
        status,
        url,
        message: `تعذر تشغيل السورة: خطأ في الخادم (${status}).`
      };
    }

    async function probeAudioStream(url) {
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
          Range: "bytes=0-1",
          "X-Client": "NourQuranWeb/1.0"
        }
      });

      if (!response.ok) {
        throw createHttpPlaybackError(response.status, url);
      }
    }

    // External API for Surah/details pages:
    // window.nourAudioPlayer.setTrack({
    //   title: "سورة يس - القارئ فلان",
    //   url: "https://firebasestorage.googleapis.com/v0/b/<bucket>/o/yaseen.mp3?alt=media",
    //   autoplay: true
    // });
    window.nourAudioPlayer = {
      async setTrack({ title: nextTitle, url, autoplay = false }) {
        if (!url) return;
        latestPlaybackError = null;
        const safeUrl = normalizeAudioUrl(url);
        if (!safeUrl) {
          latestPlaybackError = {
            type: "invalid-url",
            url,
            message: "تعذر تشغيل السورة: رابط الصوت غير صالح."
          };
          window.dispatchEvent(
            new CustomEvent("nour:audio-error", {
              detail: latestPlaybackError
            })
          );
          return;
        }

        try {
          await probeAudioStream(safeUrl);
        } catch (error) {
          latestPlaybackError = error?.message
            ? { ...error }
            : {
                type: "stream-unreachable",
                url: safeUrl,
                message: "تعذر التحقق من ملف الصوت قبل التشغيل."
              };

          console.error("Audio stream probe failed", latestPlaybackError);
          window.dispatchEvent(
            new CustomEvent("nour:audio-error", {
              detail: latestPlaybackError
            })
          );
          return;
        }

        state.currentTime = 0;
        state.duration = 0;
        const didSet = setSource(safeUrl, nextTitle);
        if (!didSet) return;
        updateTimeLabel();
        updateSeekValue();
        persistAudioState();
        if (autoplay) {
          audio.play().catch(() => {
            state.isPlaying = false;
            updatePlaybackIcon();
          });
        }
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
      setSource(state.audioUrl, state.audioTitle);
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
      latestPlaybackError = {
        ...describeMediaError(),
        mediaErrorCode: audio.error?.code ?? null,
        networkState: audio.networkState,
        readyState: audio.readyState,
        currentSrc: audio.currentSrc || state.audioUrl
      };
      console.error("Native audio element error", latestPlaybackError);
      window.dispatchEvent(
        new CustomEvent("nour:audio-error", {
          detail: latestPlaybackError
        })
      );
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
        setSource(DEFAULT_TRACK_URL, DEFAULT_TRACK_TITLE);
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

    if (state.isPlaying && audio.src) {
      audio.play().catch(() => {
        state.isPlaying = false;
        updatePlaybackIcon();
        updatePlayerVisibility();
      });
    }

    window.addEventListener("beforeunload", () => {
      state.currentTime = audio.currentTime || state.currentTime;
      state.duration = Number.isFinite(audio.duration) ? audio.duration : state.duration;
      persistAudioState();
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

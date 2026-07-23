(function (root, factory) {
  const policy = factory();
  if (typeof module === "object" && module.exports) module.exports = policy;
  if (root) root.NourAdPolicy = policy;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const MIN_SESSION_AGE_MS = 3 * 60 * 1000;
  const INTERSTITIAL_COOLDOWN_MS = 30 * 60 * 1000;
  const QUALIFIED_TRANSITIONS_PER_AD = 4;

  const bannerPages = new Set([
    "index.html",
    "articles.html",
    "journey.html",
    "favorites.html",
    "settings.html",
    "support.html",
    "about.html",
    "contact.html",
    "privacy-policy.html",
    "terms.html",
    "editorial-policy.html"
  ]);

  const interstitialSourcePages = new Set(["articles.html", "journey.html"]);

  function pageName(pathname) {
    const cleanPath = String(pathname || "").split(/[?#]/, 1)[0];
    const name = cleanPath.slice(cleanPath.lastIndexOf("/") + 1);
    return name || "index.html";
  }

  function isBannerAllowed(pathname) {
    return bannerPages.has(pageName(pathname));
  }

  function isInterstitialSource(pathname) {
    return interstitialSourcePages.has(pageName(pathname));
  }

  function isQualifiedGuideTransition(fromPathname, targetHref) {
    if (!isInterstitialSource(fromPathname)) return false;
    try {
      const targetUrl = new URL(targetHref, "https://nour-quran.local/");
      return /^guide-[a-z0-9-]+\.html$/i.test(pageName(targetUrl.pathname));
    } catch (_) {
      return false;
    }
  }

  function canShowInterstitial({
    now,
    sessionStartedAt,
    lastShownAt,
    qualifiedTransitionCount
  }) {
    const currentTime = Number(now) || Date.now();
    const sessionStart = Number(sessionStartedAt) || currentTime;
    const previousAd = Number(lastShownAt) || 0;
    const count = Number(qualifiedTransitionCount) || 0;

    return (
      currentTime - sessionStart >= MIN_SESSION_AGE_MS &&
      count > 0 &&
      count % QUALIFIED_TRANSITIONS_PER_AD === 0 &&
      currentTime - previousAd >= INTERSTITIAL_COOLDOWN_MS
    );
  }

  return {
    MIN_SESSION_AGE_MS,
    INTERSTITIAL_COOLDOWN_MS,
    QUALIFIED_TRANSITIONS_PER_AD,
    pageName,
    isBannerAllowed,
    isInterstitialSource,
    isQualifiedGuideTransition,
    canShowInterstitial
  };
});

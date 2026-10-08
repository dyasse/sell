const test = require("node:test");
const assert = require("node:assert/strict");
const policy = require("../ad-policy.js");

test("banner placement excludes worship and Quran reading screens", () => {
  assert.equal(policy.isBannerAllowed("/index.html"), true);
  assert.equal(policy.isBannerAllowed("/articles.html"), true);
  assert.equal(policy.isBannerAllowed("/quran.html"), false);
  assert.equal(policy.isBannerAllowed("/details.html?id=1"), false);
  assert.equal(policy.isBannerAllowed("/salat.html"), false);
  assert.equal(policy.isBannerAllowed("/adhkar.html"), false);
  assert.equal(policy.isBannerAllowed("/duas.html"), false);
});

test("interstitial transitions are limited to editorial guide navigation", () => {
  assert.equal(
    policy.isQualifiedGuideTransition("/articles.html", "guide-prayer-times.html"),
    true
  );
  assert.equal(
    policy.isQualifiedGuideTransition("/journey.html", "/guide-privacy-offline.html"),
    true
  );
  assert.equal(
    policy.isQualifiedGuideTransition("/quran.html", "guide-prayer-times.html"),
    false
  );
  assert.equal(
    policy.isQualifiedGuideTransition("/articles.html", "details.html?id=2"),
    false
  );
});

test("interstitial requires session age, fourth transition, and cooldown", () => {
  const now = 2_000_000_000;
  const eligible = {
    now,
    sessionStartedAt: now - policy.MIN_SESSION_AGE_MS,
    lastShownAt: now - policy.INTERSTITIAL_COOLDOWN_MS,
    qualifiedTransitionCount: 4
  };

  assert.equal(policy.canShowInterstitial(eligible), true);
  assert.equal(
    policy.canShowInterstitial({ ...eligible, qualifiedTransitionCount: 3 }),
    false
  );
  assert.equal(
    policy.canShowInterstitial({
      ...eligible,
      sessionStartedAt: now - policy.MIN_SESSION_AGE_MS + 1
    }),
    false
  );
  assert.equal(
    policy.canShowInterstitial({
      ...eligible,
      lastShownAt: now - policy.INTERSTITIAL_COOLDOWN_MS + 1
    }),
    false
  );
});

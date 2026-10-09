const test = require("node:test");
const assert = require("node:assert/strict");
const { readFile, stat } = require("node:fs/promises");
const { join } = require("node:path");

const root = join(__dirname, "..");
const read = (path) => readFile(join(root, path), "utf8");

test("Android release keeps the published Play identity and Firebase client", async () => {
  const [gradle, capacitor, strings, firebase] = await Promise.all([
    read("android/app/build.gradle"),
    read("capacitor.config.json"),
    read("android/app/src/main/res/values/strings.xml"),
    read("android/app/google-services.json")
  ]);

  assert.match(gradle, /applicationId androidApplicationId/);
  assert.match(gradle, /def androidApplicationId = 'com\.nour\.el\.quran'/);
  assert.match(gradle, /namespace 'com\.nour\.el\.quran'/);
  assert.match(gradle, /versionCode 552/);
  assert.match(gradle, /versionName '5\.5\.2'/);
  assert.equal(JSON.parse(capacitor).appId, "com.nour.el.quran");
  assert.match(strings, /com\.nour\.el\.quran/);

  const clients = JSON.parse(firebase).client || [];
  assert.ok(clients.some((client) =>
    client.client_info?.android_client_info?.package_name === "com.nour.el.quran"
  ));
});

test("debug ads are test-only and release ads use the accepted Nour units", async () => {
  const [appGradle, rootGradle, policy, monetization] = await Promise.all([
    read("android/app/build.gradle"),
    read("android/build.gradle"),
    read("ad-policy.js"),
    read("monetization.js")
  ]);

  assert.match(appGradle, /ca-app-pub-3940256099942544~3347511713/);
  assert.match(appGradle, /ca-app-pub-3940256099942544\/6300978111/);
  assert.match(appGradle, /ca-app-pub-3940256099942544\/1033173712/);
  assert.match(appGradle, /ca-app-pub-2350255696934759~9159110229/);
  assert.match(appGradle, /ca-app-pub-2350255696934759\/2768258392/);
  assert.match(appGradle, /ca-app-pub-2350255696934759\/1798671511/);
  assert.match(rootGradle, /playServicesAdsVersion = '25\.4\.0'/);
  assert.match(rootGradle, /userMessagingPlatformVersion = '4\.0\.0'/);
  assert.match(monetization, /requestConsentInfo/);
  assert.match(monetization, /canRequestAds/);
  assert.match(policy, /INTERSTITIAL_COOLDOWN_MS = 30 \* 60 \* 1000/);
  assert.match(policy, /QUALIFIED_TRANSITIONS_PER_AD = 4/);
});

test("obsolete package tree is absent and native plugins use the Play package", async () => {
  await assert.rejects(
    stat(join(root, "android/app/src/main/java/com/dyasse/nourquran/MainActivity.java"))
  );

  for (const file of [
    "MainActivity.java",
    "AndroidAdConfigPlugin.java",
    "NourAnalyticsPlugin.java",
    "PrayerAlarmPlugin.java",
    "PrayerAlarmReceiver.java",
    "PrayerAlarmRestoreReceiver.java",
    "PrayerAlarmScheduler.java"
  ]) {
    const source = await read(`android/app/src/main/java/com/nour/el/quran/${file}`);
    assert.match(source, /^package com\.nour\.el\.quran;/);
  }
});

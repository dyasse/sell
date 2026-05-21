# Capacitor bridge/plugin reflection.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# Google Mobile Ads / AdMob.
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.ump.** { *; }

# Local Notifications plugin classes are referenced through the Capacitor bridge.
-keep class com.capacitorjs.plugins.localnotifications.** { *; }

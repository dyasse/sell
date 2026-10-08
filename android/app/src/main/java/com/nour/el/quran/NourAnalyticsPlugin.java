package com.nour.el.quran;

import android.os.Bundle;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.FirebaseApp;
import com.google.firebase.analytics.FirebaseAnalytics;

@CapacitorPlugin(name = "NourAnalytics")
public class NourAnalyticsPlugin extends Plugin {
    private FirebaseAnalytics analytics;

    @Override
    public void load() {
        try {
            FirebaseApp app = FirebaseApp.initializeApp(getContext());
            if (app != null) analytics = FirebaseAnalytics.getInstance(getContext());
        } catch (IllegalStateException ignored) {
            analytics = null;
        }
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        call.resolve(new JSObject().put("enabled", analytics != null));
    }

    @PluginMethod
    public void logScreen(PluginCall call) {
        if (analytics == null) {
            call.resolve(new JSObject().put("logged", false));
            return;
        }

        String screenName = call.getString("screenName", "unknown");
        if (screenName.length() > 80) screenName = screenName.substring(0, 80);

        Bundle parameters = new Bundle();
        parameters.putString(FirebaseAnalytics.Param.SCREEN_NAME, screenName);
        parameters.putString(FirebaseAnalytics.Param.SCREEN_CLASS, "NourWebView");
        analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW, parameters);
        call.resolve(new JSObject().put("logged", true));
    }
}

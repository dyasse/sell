package com.nour.el.quran;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(PrayerAlarmPlugin.class);
        registerPlugin(AndroidAdConfigPlugin.class);
        registerPlugin(NourAnalyticsPlugin.class);
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(webView, (View view, WindowInsetsCompat windowInsets) -> {
                Insets bars = windowInsets.getInsets(
                    WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.navigationBars()
                );
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return windowInsets;
            });
            ViewCompat.requestApplyInsets(webView);
        }
    }

    @Override
    public void onBackPressed() {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

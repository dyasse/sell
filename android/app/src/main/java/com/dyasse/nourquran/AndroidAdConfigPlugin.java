package com.dyasse.nourquran;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidAdConfig")
public class AndroidAdConfigPlugin extends Plugin {
    @PluginMethod
    public void getConfig(PluginCall call) {
        JSObject config = new JSObject();
        config.put("bannerAdUnitId", BuildConfig.ADMOB_BANNER_AD_UNIT_ID);
        config.put("interstitialAdUnitId", BuildConfig.ADMOB_INTERSTITIAL_AD_UNIT_ID);
        config.put("isTesting", BuildConfig.ADMOB_IS_TESTING);
        call.resolve(config);
    }
}

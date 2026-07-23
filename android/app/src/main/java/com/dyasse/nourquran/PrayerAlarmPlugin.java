package com.dyasse.nourquran;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "PrayerAlarm")
public class PrayerAlarmPlugin extends Plugin {
    @PluginMethod
    public void checkExactAlarmAccess(PluginCall call) {
        call.resolve(new JSObject().put(
            "granted",
            PrayerAlarmScheduler.canScheduleExactAlarms(getContext())
        ));
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            call.resolve(new JSObject().put("opened", false));
            return;
        }

        Intent intent = new Intent(
            Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
            Uri.parse("package:" + getContext().getPackageName())
        );
        getActivity().startActivity(intent);
        call.resolve(new JSObject().put("opened", true));
    }

    @PluginMethod
    public void scheduleBatch(PluginCall call) {
        if (!PrayerAlarmScheduler.canScheduleExactAlarms(getContext())) {
            call.reject("exact_alarm_permission_required");
            return;
        }

        JSArray alarms = call.getArray("alarms");
        if (alarms == null) {
            call.reject("alarms must be an array");
            return;
        }

        PrayerAlarmScheduler.cancelAll(getContext());
        int scheduled = 0;
        long now = System.currentTimeMillis();

        try {
            for (int index = 0; index < alarms.length(); index += 1) {
                JSONObject alarm = alarms.getJSONObject(index);
                int id = alarm.optInt("id", -1);
                long at = alarm.optLong("at", -1L);
                String title = alarm.optString("title", "حان وقت الصلاة");
                String body = alarm.optString("body", "تطبيق نور يذكرك بموعد الصلاة.");

                if (id < 0 || at <= now + 5_000L) continue;
                PrayerAlarmScheduler.schedule(getContext(), id, at, title, body);
                scheduled += 1;
            }
        } catch (JSONException | SecurityException | IllegalStateException error) {
            PrayerAlarmScheduler.cancelAll(getContext());
            call.reject("Unable to schedule prayer alarms", error);
            return;
        }

        call.resolve(new JSObject().put("scheduled", scheduled));
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        PrayerAlarmScheduler.cancelAll(getContext());
        call.resolve();
    }
}

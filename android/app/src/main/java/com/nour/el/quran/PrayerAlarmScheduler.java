package com.nour.el.quran;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

final class PrayerAlarmScheduler {
    static final String ACTION_PRAYER_ALARM = "com.nour.el.quran.PRAYER_ALARM";
    static final String EXTRA_ID = "prayer_alarm_id";
    static final String EXTRA_AT = "prayer_alarm_at";
    static final String EXTRA_TITLE = "prayer_alarm_title";
    static final String EXTRA_BODY = "prayer_alarm_body";

    private static final String PREFS_NAME = "nour_prayer_alarm_store";
    private static final String KEY_IDS = "scheduled_ids";
    private static final String KEY_PREFIX = "alarm_";

    private PrayerAlarmScheduler() {}

    static boolean canScheduleExactAlarms(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return alarmManager != null && alarmManager.canScheduleExactAlarms();
        }
        return alarmManager != null;
    }

    static void schedule(Context context, int id, long at, String title, String body) {
        scheduleInternal(context, id, at, title, body, true);
    }

    private static void scheduleInternal(
        Context context,
        int id,
        long at,
        String title,
        String body,
        boolean persist
    ) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            throw new IllegalStateException("AlarmManager is unavailable");
        }

        Intent intent = buildIntent(context, id, at, title, body);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingIntent);
        if (persist) persist(context, id, at, title, body);
    }

    static void cancelAll(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences prefs = preferences(context);
        Set<String> ids = new HashSet<>(prefs.getStringSet(KEY_IDS, new HashSet<>()));
        SharedPreferences.Editor editor = prefs.edit();

        for (String rawId : ids) {
            try {
                int id = Integer.parseInt(rawId);
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    id,
                    buildIntent(context, id, 0L, "", ""),
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
                );
                if (alarmManager != null && pendingIntent != null) {
                    alarmManager.cancel(pendingIntent);
                    pendingIntent.cancel();
                }
            } catch (NumberFormatException ignored) {
                // Ignore malformed legacy identifiers and remove them below.
            }
            editor.remove(KEY_PREFIX + rawId);
        }

        editor.remove(KEY_IDS).apply();
    }

    static void remove(Context context, int id) {
        SharedPreferences prefs = preferences(context);
        Set<String> ids = new HashSet<>(prefs.getStringSet(KEY_IDS, new HashSet<>()));
        ids.remove(String.valueOf(id));
        prefs.edit().putStringSet(KEY_IDS, ids).remove(KEY_PREFIX + id).apply();
    }

    static void rescheduleAll(Context context) {
        if (!canScheduleExactAlarms(context)) return;

        SharedPreferences prefs = preferences(context);
        Set<String> ids = new HashSet<>(prefs.getStringSet(KEY_IDS, new HashSet<>()));
        long now = System.currentTimeMillis();

        for (String rawId : ids) {
            try {
                int id = Integer.parseInt(rawId);
                String stored = prefs.getString(KEY_PREFIX + rawId, null);
                if (stored == null) {
                    remove(context, id);
                    continue;
                }

                JSONObject record = new JSONObject(stored);
                long at = record.optLong("at", 0L);
                if (at <= now) {
                    remove(context, id);
                    continue;
                }

                scheduleInternal(
                    context,
                    id,
                    at,
                    record.optString("title", "حان وقت الصلاة"),
                    record.optString("body", "تطبيق نور يذكرك بموعد الصلاة."),
                    false
                );
            } catch (NumberFormatException | JSONException ignored) {
                try {
                    remove(context, Integer.parseInt(rawId));
                } catch (NumberFormatException ignoredAgain) {
                    // A malformed id cannot be addressed as a PendingIntent.
                }
            }
        }
    }

    private static Intent buildIntent(Context context, int id, long at, String title, String body) {
        return new Intent(context, PrayerAlarmReceiver.class)
            .setAction(ACTION_PRAYER_ALARM)
            .putExtra(EXTRA_ID, id)
            .putExtra(EXTRA_AT, at)
            .putExtra(EXTRA_TITLE, title)
            .putExtra(EXTRA_BODY, body);
    }

    private static void persist(Context context, int id, long at, String title, String body) {
        SharedPreferences prefs = preferences(context);
        Set<String> ids = new HashSet<>(prefs.getStringSet(KEY_IDS, new HashSet<>()));
        ids.add(String.valueOf(id));

        JSONObject record = new JSONObject();
        try {
            record.put("at", at);
            record.put("title", title);
            record.put("body", body);
        } catch (JSONException error) {
            throw new IllegalStateException("Unable to persist prayer alarm", error);
        }

        prefs.edit()
            .putStringSet(KEY_IDS, ids)
            .putString(KEY_PREFIX + id, record.toString())
            .apply();
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}

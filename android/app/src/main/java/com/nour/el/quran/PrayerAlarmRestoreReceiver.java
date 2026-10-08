package com.nour.el.quran;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PrayerAlarmRestoreReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        if (Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {
            // Old wall-clock prayer times are unsafe after travel/timezone changes.
            // The next app open fetches the new location/calendar and schedules again.
            PrayerAlarmScheduler.cancelAll(context);
        } else if (
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action)
        ) {
            PrayerAlarmScheduler.rescheduleAll(context);
        }
    }
}

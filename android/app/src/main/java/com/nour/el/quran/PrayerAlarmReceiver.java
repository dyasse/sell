package com.nour.el.quran;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;
import android.net.Uri;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class PrayerAlarmReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "prayer-adhan-v2";
    private static final long MAX_LATE_DELIVERY_MS = 90_000L;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !PrayerAlarmScheduler.ACTION_PRAYER_ALARM.equals(intent.getAction())) return;

        int id = intent.getIntExtra(PrayerAlarmScheduler.EXTRA_ID, -1);
        long scheduledAt = intent.getLongExtra(PrayerAlarmScheduler.EXTRA_AT, 0L);
        String title = intent.getStringExtra(PrayerAlarmScheduler.EXTRA_TITLE);
        String body = intent.getStringExtra(PrayerAlarmScheduler.EXTRA_BODY);
        long now = System.currentTimeMillis();

        if (id < 0 || scheduledAt <= 0L) return;

        if (now + 5_000L < scheduledAt) {
            PrayerAlarmScheduler.schedule(context, id, scheduledAt, safeTitle(title), safeBody(body));
            return;
        }

        PrayerAlarmScheduler.remove(context, id);
        if (now - scheduledAt > MAX_LATE_DELIVERY_MS) return;

        createChannel(context);
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return;

        Intent openApp = new Intent(context, MainActivity.class)
            .setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            id,
            openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(safeTitle(title))
            .setContentText(safeBody(body))
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setWhen(scheduledAt)
            .setShowWhen(true)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setAutoCancel(true)
            .setContentIntent(contentIntent);

        try {
            NotificationManagerCompat.from(context).notify(id, notification.build());
        } catch (SecurityException ignored) {
            // Android 13+ notification permission can be revoked at any time.
        }
    }

    private static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "تنبيهات أوقات الصلاة",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("تنبيه دقيق عند دخول وقت الصلاة");
        channel.enableVibration(true);
        Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
            .build();
        channel.setSound(sound, audioAttributes);

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    private static String safeTitle(String value) {
        return value == null || value.trim().isEmpty() ? "حان وقت الصلاة" : value;
    }

    private static String safeBody(String value) {
        return value == null || value.trim().isEmpty()
            ? "تطبيق نور يذكرك بموعد الصلاة."
            : value;
    }
}

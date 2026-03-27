package io.ionic.starter;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.app.Notification;
import android.os.Bundle;

public class NotificationService extends NotificationListenerService {
    private static final String TAG = "NotificationService";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        Notification notification = sbn.getNotification();
        Bundle extras = notification.extras;
        
        String title = extras.getString(Notification.EXTRA_TITLE);
        CharSequence text = extras.getCharSequence(Notification.EXTRA_TEXT);
        
        if (title == null) title = "Unknown Title";
        if (text == null) text = "No Content";

        Log.d(TAG, "Notification from: " + packageName);
        Log.d(TAG, "Title: " + title);
        Log.d(TAG, "Text: " + text);
        
        // ব্রডকাস্ট পাঠানো
        android.content.Intent intent = new android.content.Intent("io.ionic.starter.NOTIFICATION_RECEIVED");
        intent.putExtra("package", packageName);
        intent.putExtra("title", title.toString());
        intent.putExtra("text", text.toString());
        sendBroadcast(intent);
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        Log.d(TAG, "Notification Removed");
    }
}

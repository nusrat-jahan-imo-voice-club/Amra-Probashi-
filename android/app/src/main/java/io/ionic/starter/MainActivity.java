package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;

public class MainActivity extends BridgeActivity {
    private BroadcastReceiver notificationReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String packageName = intent.getStringExtra("package");
            String title = intent.getStringExtra("title");
            String text = intent.getStringExtra("text");

            // জাভাস্ক্রিপ্ট ইভেন্ট ট্রিগার করা
            String jsCode = "window.dispatchEvent(new CustomEvent('notificationReceived', { detail: { package: '" + packageName + "', title: '" + title + "', text: '" + text + "' } }));";
            bridge.getWebView().evaluateJavascript(jsCode, null);
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(AccessibilityPlugin.class);

        // ব্রডকাস্ট রিসিভার রেজিস্টার করা
        IntentFilter filter = new IntentFilter("io.ionic.starter.NOTIFICATION_RECEIVED");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(notificationReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            registerReceiver(notificationReceiver, filter);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        unregisterReceiver(notificationReceiver);
    }
}

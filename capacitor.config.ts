import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medicalrecord.app',
  appName: 'medical-record',
  webDir: 'dist',
  bundledWebRuntime: false,
  "server": {
    "url": "http://192.168.1.3:8080",
    "cleartext": true
  },
};

export default config;

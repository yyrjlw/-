import { CapacitorConfig } from '@capacitor/cli';

let config: CapacitorConfig

const baseConfig: CapacitorConfig = {
  appId: 'com.medicalrecord.app',
  appName: 'medical-record',
  webDir: 'dist'
};

switch (process.env.NODE_ENV) {
  case 'pro':
    config = {
      ...baseConfig,
      android: {
        flavor: 'pro',
      }
    };
    break;
  default:
    config = {
      ...baseConfig,
      android: {
        flavor: 'dev',
      },
      bundledWebRuntime: false,
      "server": {
        "url": "http://192.168.1.20:8080",
        "cleartext": true
      }
    };
    break;
}

export default config;

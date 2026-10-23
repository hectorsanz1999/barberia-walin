import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barberiawalin.app',
  appName: 'Barbería Walin',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

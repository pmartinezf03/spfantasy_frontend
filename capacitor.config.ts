import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pmartinezf.fantasy',
  appName: 'Fantasy',
  webDir: 'dist/sp_fantasy/browser',
  server: {
    cleartext: true, // 👈 Permite HTTP
    androidScheme: 'http'

  }
};

export default config;

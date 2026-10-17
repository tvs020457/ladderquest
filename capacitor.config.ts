import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ladderquest.app',
  appName: 'LadderQuest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

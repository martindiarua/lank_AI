import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lankai.app',
  appName: 'LANK AI',
  webDir: 'public',
  server: {
    url: 'https://lank-ai.vercel.app', // Replace with your actual URL
    cleartext: false,
  },
};

export default config;
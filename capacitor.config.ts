import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vertexblueprinttech.alara',
  appName: 'Alara',
  webDir: 'public', // still required but not used when server.url is set
  server: {
    url: 'https://alara.school', // 🔥 replace with your live site
    cleartext: true
  }
};

export default config;
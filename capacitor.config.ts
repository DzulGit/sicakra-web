import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sicakra.app',
  appName: ' sicakra',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
<<<<<<< Updated upstream
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
    },
  }
=======
    cleartext: true,
  },
>>>>>>> Stashed changes
};

export default config;

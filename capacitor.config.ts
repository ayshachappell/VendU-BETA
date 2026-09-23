import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell config for VendU — BETA build.
 *
 * The beta web app (public/beta) is BUNDLED inside the native binary, so the
 * app is a real installed app, not a website wrapper. Only API/data calls go
 * to the live server (https://venduapp.com) — see the IS_NATIVE/API_BASE
 * handling at the top of public/beta/index.html.
 *
 * CapacitorHttp is enabled so all fetch() calls run through the native HTTP
 * stack (no CORS issues, cookies handled natively).
 */
const config: CapacitorConfig = {
  appId: "app.vendu.beta",
  appName: "VendU Beta",
  webDir: "public/beta",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#331174",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#331174",
    },
    Keyboard: {
      resize: "body",
    },
  },
  ios: {
    contentInset: "never",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

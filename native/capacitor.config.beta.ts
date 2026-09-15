import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell config for VendU — BETA build (separate store listing).
 * Use this in a second checkout/branch so Main and Beta stay separate apps.
 */
const config: CapacitorConfig = {
  appId: "app.vendu.beta",
  appName: "VendU Beta",
  webDir: "native/shell",
  server: {
    url: "https://venduapp.com/beta/index.html",
    hostname: "venduapp.com",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: ["venduapp.com", "www.venduapp.com"],
  },
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

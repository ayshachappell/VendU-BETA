import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell config for VendU — MAIN build.
 * Copy this to the project root as `capacitor.config.ts` when you set up Capacitor
 * locally (see native/CAPACITOR.md).
 */
const config: CapacitorConfig = {
  appId: "app.vendu.mobile",
  appName: "VendU",
  webDir: "native/shell",
  server: {
    url: "https://venduapp.com/main/index.html",
    hostname: "venduapp.com",
    androidScheme: "https",
    cleartext: false,
    // Keep verification links and legal pages inside the app shell.
    allowNavigation: ["venduapp.com", "www.venduapp.com"],
  },
  ios: {
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

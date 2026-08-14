import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell config for VendU.
 * Copy this to the project root as `capacitor.config.ts` when you set up Capacitor
 * locally (see native/CAPACITOR.md). Swap `server.url` for your own domain.
 */
const config: CapacitorConfig = {
  appId: "app.vendu.mobile",
  appName: "VendU",
  webDir: "native/shell",
  server: {
    url: "https://project--44fff3c9-759e-4b87-b2e5-ffe930a93c9d.lovable.app/main/index.html",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

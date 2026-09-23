# Shipping VendU Beta to the App Store and Google Play

## How it works

The beta web app (`public/beta/`) is **bundled inside the native binary** — it is a
real installed app, not a website wrapper. Only data calls go to the live server.

- `capacitor.config.ts` (repo root) — app ID `app.vendu.beta`, name "VendU Beta",
  `webDir: "public/beta"`.
- `public/beta/index.html` — first script detects the native shell
  (`window.Capacitor.isNativePlatform()`) and sets:
  - `window.VendU.IS_NATIVE` — true inside the native app
  - `window.VendU.API_BASE` — `https://venduapp.com` in native, `""` on web
  - `window.VendU.BUILD` — always `"beta"` in native
  - Asset base `B` — `""` in native (webview root), `"/beta/"` on web
  - Android hardware back button → in-app history, else exit app
- All API calls (`vendu-api.js`, `vendu-safety.js`, campus lookup in `index.html`)
  are prefixed with `API_BASE`, so they hit `https://venduapp.com/api/...`
  from inside the app.
- `CapacitorHttp` plugin is enabled, so every `fetch()` runs through the native
  HTTP stack — no CORS problems, no server changes needed.
- Sessions live in `localStorage`, which persists per-app on both platforms.

## Plugins included

`@capacitor/app` (back button), `@capacitor/status-bar`, `@capacitor/splash-screen`,
`@capacitor/keyboard`, `@capacitor/haptics`. App icon + splash generated from
`assets/icon.png` via `npx capacitor-assets generate`.

## Everyday workflow

```bash
# after changing anything under public/beta/
npx cap sync          # copies web assets + plugin updates into ios/ and android/

npx cap open ios      # Xcode (needs a Mac)
npx cap open android  # Android Studio
```

To regenerate icons/splash after replacing `assets/icon.png`:

```bash
npx capacitor-assets generate --iconBackgroundColor '#331174' --splashBackgroundColor '#331174'
```

## Building the Android app (no Mac needed)

With the Android SDK installed:

```bash
cd android
./gradlew assembleDebug        # → android/app/build/outputs/apk/debug/app-debug.apk
```

For the Play Store release build, see `native/SIGNING.md` (signed `.aab`).

## Building the iOS app (Mac + Xcode required)

`npx cap add ios` already generated `ios/`. On a Mac: `npx cap open ios`, set the
signing team, then Product → Archive → Distribute App → App Store Connect.

## Store requirements checklist

- Apple requires an in-app account-deletion path — the beta has "Delete my account"
  in settings (wired to `/api/public/account/delete`).
- Privacy policy: https://venduapp.com/legal/privacy.html
- Terms: https://venduapp.com/legal/terms.html
- Support: https://venduapp.com/legal/support.html
- Demo account for reviewers: any `@venduapp.com` address signs in with the email
  alone (company/tester addresses skip the password AND the email code).
- Screenshots: 6.7" and 5.5" iPhone + Android phone/tablet shots, plus a
  1024×500 feature graphic for Google Play.

## When the main (non-beta) build ships

Duplicate this setup with a second config: app ID `app.vendu.mobile`, name "VendU",
`webDir: "public/main"`, and change the native `API_BASE`/`BUILD` values in
`public/main/index.html` the same way (currently only the beta is wired for native).

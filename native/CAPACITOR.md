# Shipping VendU to the App Store and Google Play

The web app is the product; Capacitor wraps it in a native shell. Nothing here runs
inside Lovable — do it locally after you push the project to GitHub.

## 1. Get the code

```bash
git clone <your-github-repo> vendu && cd vendu
npm install
```

## 2. Add Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "VendU" "app.vendu.mobile" --web-dir=native/shell
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

## 3. Point the shell at your live site

Copy `native/capacitor.config.ts` (in this repo) over the generated
`capacitor.config.ts`. It loads the published VendU site inside the native shell, so
every Lovable publish updates the app without a new store release. Change
`server.url` to your own domain once you connect one.

For the **beta** app, use `native/capacitor.config.beta.ts` instead (already set to
`app.vendu.beta` / `VendU Beta` / `/beta/index.html`) in a separate checkout. That
gives you two separate store listings from the same repo.

Signing steps live in `native/SIGNING.md`.

## 4. Build and submit

```bash
npm run build
npx cap sync
npx cap open ios      # Xcode: signing team, then Archive → App Store Connect
npx cap open android  # Android Studio: Build → Generate Signed Bundle (.aab) → Play Console
```

App icons live in `public/icons/icon-512.png`; use that file when Xcode or Android
Studio asks for the app icon source.

## 5. Store requirements checklist

- Apple requires an account-deletion path for apps with sign-in — students can email
  support to remove their record, or add an in-app "Delete my account" action.
- Both stores need a privacy policy URL and a support URL before review.
- Because students sign in with an email code, provide Apple a demo `.edu` address
  and note that a one-time code is emailed to it.

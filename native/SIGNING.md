# Signing the VendU native apps

Signing cannot happen inside Lovable: it needs your Apple and Google accounts,
your private certificates, and a Mac with Xcode. Everything below is done on your
own computer, once. The configs and checklists are already prepared in this folder.

Two apps, kept separate:

| App        | Bundle / package ID | Loads                                |
| ---------- | ------------------- | ------------------------------------ |
| VendU      | `app.vendu.mobile`  | https://venduapp.com/main/index.html |
| VendU Beta | `app.vendu.beta`    | https://venduapp.com/beta/index.html |

## What you must buy / create

1. Apple Developer Program — $99/year — https://developer.apple.com/programs/
2. Google Play Console — $25 one time — https://play.google.com/console/signup
3. A Mac with Xcode (iOS builds only run on macOS).

## iOS signing

1. In Xcode: Settings → Accounts → add your Apple ID (the developer account).
2. `npx cap open ios`, select the App target → Signing & Capabilities.
3. Check "Automatically manage signing", pick your Team. Xcode creates the
   certificate and provisioning profile for you.
4. Bundle Identifier must equal `app.vendu.mobile` (or `app.vendu.beta`).
5. Product → Archive → Distribute App → App Store Connect → Upload.

## Android signing

Create the upload key once and never lose it:

```bash
keytool -genkey -v -keystore vendu-upload.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias vendu
```

Then in `android/key.properties` (never commit this file):

```
storePassword=...
keyPassword=...
keyAlias=vendu
storeFile=/absolute/path/to/vendu-upload.jks
```

Android Studio → Build → Generate Signed Bundle → Android App Bundle → upload the
`.aab` to the Play Console. Turn on Play App Signing when prompted.

## Store review checklist (both stores)

- Privacy policy URL: https://venduapp.com/legal/privacy.html
- Terms URL: https://venduapp.com/legal/terms.html
- Support URL / email: support@venduapp.com
- Account deletion: in-app Settings → Delete my account (Apple requires this).
- Demo account for reviewers: `test@venduapp.com` — tester mode opens without an
  email code, so reviewers can see every screen.
- Screenshots: capture the phone-width app at 6.7" and 5.5" for Apple, plus a
  1024×500 feature graphic for Google Play.
- App icon source: `public/icons/icon-512.png`.

Because the shell loads the live site, publishing from Lovable updates both apps
instantly. You only resubmit to the stores when the icon, name, or shell config
changes.

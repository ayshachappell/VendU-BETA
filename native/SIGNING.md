# Signing & submitting VendU Beta

The beta is app ID **`app.vendu.beta`** ("VendU Beta"). The web app is bundled
inside the binary; signing packages that bundle for the stores.

## What you must buy / create

1. Apple Developer Program — $99/year — https://developer.apple.com/programs/
2. Google Play Console — $25 one time — https://play.google.com/console/signup
3. A Mac with Xcode (iOS builds only run on macOS — e.g. your uncle's Mac).

## iOS signing (on the Mac)

1. On the Mac: `git clone` this repo, `npm install`, `npx cap sync`.
2. `npx cap open ios` → select the **App** target → Signing & Capabilities.
3. Check "Automatically manage signing", pick your Team (your Apple Developer
   account). Xcode creates the certificate + provisioning profile for you.
4. Bundle Identifier must be `app.vendu.beta`.
5. Product → Archive → Distribute App → App Store Connect → Upload.
6. In App Store Connect: add the listing info, screenshots, privacy policy URL,
   and the demo account below, then submit for review. For a beta, distribute
   via **TestFlight** first.

## Android signing

Create the upload key **once** and never lose it (back it up somewhere safe):

```bash
keytool -genkey -v -keystore vendu-beta-upload.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias vendu-beta
```

In `android/key.properties` (**never commit this file**):

```
storePassword=...
keyPassword=...
keyAlias=vendu-beta
storeFile=/absolute/path/to/vendu-beta-upload.jks
```

Android Studio → Build → Generate Signed Bundle → Android App Bundle → upload the
`.aab` to the Play Console. Turn on **Play App Signing** when prompted.
(Or from the terminal: `cd android && ./gradlew bundleRelease`.)

For quick testing on your own phone before release:
`cd android && ./gradlew assembleDebug` → install `app-debug.apk`.

## Store review checklist

- Privacy policy URL: https://venduapp.com/legal/privacy.html
- Terms URL: https://venduapp.com/legal/terms.html
- Support URL: https://venduapp.com/legal/support.html
- Account deletion: in-app Settings → "Delete my account" (Apple requires this —
  it exists in the beta).
- Demo account for reviewers: any `@venduapp.com` address (e.g.
  `test@venduapp.com`) — company/tester addresses sign in with the email alone,
  no password and no email code, so reviewers can reach every screen.
- Content rating questionnaires: the app has user-generated listings and chat —
  answer honestly about user-generated content and messaging.
- Screenshots: 6.7" + 5.5" iPhone, Android phone + 7" tablet, 1024×500 feature
  graphic for Google Play.

## After approval

Web updates: the beta site (venduapp.com) can change freely — but the **native
app only updates its bundled copy when you resubmit**. For beta purposes,
resubmit to TestFlight / Play internal testing whenever `public/beta/` changes
meaningfully. (A future version can load the live site for instant updates.)

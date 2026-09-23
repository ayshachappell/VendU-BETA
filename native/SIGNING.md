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
- Demo account for reviewers: `test@venduapp.com`. Company/tester addresses
  sign in with the email alone, then confirm the 6-digit code emailed to that
  address (no password). **During review, monitor that inbox live** (or set up
  `test@venduapp.com` to forward to your phone) so you can relay a fresh code
  the moment a reviewer asks. In App Store Connect → App Review Information →
  Demo Account, enter `test@venduapp.com` and add this note: "Enter the email
  address on the login screen — a 6-digit sign-in code will be emailed to it.
  Contact us at [your phone/email] and we will provide a fresh code
  immediately." Same note goes in the Play Console review instructions. Start
  with TestFlight (Apple) and Play internal testing (Google) before any public
  release.
- Content rating questionnaires: the app has user-generated listings and chat —
  answer honestly about user-generated content and messaging.
- Screenshots: 6.7" + 5.5" iPhone, Android phone + 7" tablet, 1024×500 feature
  graphic for Google Play.

## After approval

Web updates: the beta site (venduapp.com) can change freely — but the **native
app only updates its bundled copy when you resubmit**. For beta purposes,
resubmit to TestFlight / Play internal testing whenever `public/beta/` changes
meaningfully. (A future version can load the live site for instant updates.)

## Developer accounts — what to have ready

**Apple Developer Program ($99/year).** Enroll as an *Individual* (fastest —
just your Apple ID) unless you want the company name on the listing, which
needs a D-U-N-S number and takes days. Enroll at
https://developer.apple.com/programs/enroll/ — you'll need two-factor auth on
your Apple ID. Approval usually takes 24–48 hours.

**Google Play Console ($25 one-time).** Sign up at
https://play.google.com/console/signup with a Google account. Google verifies
your identity (government ID + a short video selfie is common now) — allow a
few days. You must also complete the **Data safety** form (declare: email
address, app activity, approximate location if the campus-nearest feature uses
it) and the **content rating questionnaire** (disclose user-generated listings,
user-to-user chat, and that there are no real-money in-app purchases).

## Uncle's Mac — exact steps for the iOS build

You need: the Mac, Xcode installed (free from the Mac App Store), your Apple
Developer login, and this repo.

```bash
# 1. Get the code and install dependencies
git clone https://github.com/ayshachappell/VendU-BETA.git
cd VendU-BETA
npm install

# 2. Sync the latest beta web build into the iOS project
npx cap sync ios

# 3. Open in Xcode
npx cap open ios
```

Then in Xcode:
1. Select the **App** target → **Signing & Capabilities** → check
   *Automatically manage signing* → choose your Team (sign in with your Apple
   ID if asked). Bundle ID must read `app.vendu.beta`.
2. Menu: **Product → Archive**. When it finishes, click **Distribute App** →
   **App Store Connect** → **Upload**. (First upload: Xcode may ask for an
   app-specific password — generate one at appleid.apple.com.)
3. Go to https://appstoreconnect.apple.com → **My Apps → + → New App**:
   - Platform: iOS, Name: "VendU Beta", Bundle ID: `app.vendu.beta`, SKU:
     anything (e.g. `vendu-beta-1`).
   - Fill in the listing: description, keywords, support URL
     (`https://venduapp.com/legal/support.html`), privacy policy URL
     (`https://venduapp.com/legal/privacy.html`).
   - **Screenshots** (required sizes): 6.7" iPhone (1290×2796) and 5.5" iPhone
     (1242×2208). Take them on your iPhone from the TestFlight build — the
     Simulator works too (your uncle's Mac can run it).
   - **App Review Information → Demo Account**: user `test@venduapp.com`,
     notes as described in the checklist above.
   - Content rights / age rating questionnaire: disclose UGC + messaging.
4. In **TestFlight**, add the build, then add yourself (and any testers) by
   email. Install via the TestFlight app on your iPhone/iPad and tap through
   everything before submitting for review.

## Android — from first build to Play upload (any computer)

```bash
git clone https://github.com/ayshachappell/VendU-BETA.git
cd VendU-BETA
npm install
npx cap sync android
```

Open the `android/` folder in **Android Studio** (free). Let it finish syncing,
then **Build → Generate Signed Bundle / APK**:

- **First, make the upload key** (once, back it up somewhere safe —
  losing it means you can never update the app):
  `keytool -genkey -v -keystore vendu-beta-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias vendu-beta`
- Create `android/key.properties` (**never commit this**):
  ```
  storePassword=YOUR_STORE_PASSWORD
  keyPassword=YOUR_KEY_PASSWORD
  keyAlias=vendu-beta
  storeFile=/absolute/path/to/vendu-beta-upload.jks
  ```
- Build → Generate Signed Bundle → **Android App Bundle** → pick the key →
  `release`. Upload the `.aab` to Play Console → **Testing → Internal testing**
  → create a release. Turn on **Play App Signing** when prompted.
- For a quick install on your own phone first: Build → Build Bundle(s)/APK(s)
  → Build APK(s) → install the debug APK directly.

**Play listing assets**: phone screenshots, a 7" tablet screenshot set, and a
1024×500 feature graphic. Data safety form + content rating questionnaire as
noted above.

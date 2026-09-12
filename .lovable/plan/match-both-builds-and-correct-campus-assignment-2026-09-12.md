# Match Both Builds and Correct Campus Assignment

## Goal
Bring Main and Beta into the supplied mobile visual direction while preserving each build’s working features, then correct onboarding and internal-account behavior at the source.

## Changes
- Rework the shared mobile presentation to match the reference: warm ivory canvas, compact serif wordmark, clean search field, segmented Feed/Browse/Events control, rounded filters, prominent campus content, and fixed icon-led bottom navigation.
- Keep build-specific functionality intact. Beta alone keeps a subtle `BETA` label; Main keeps its Main-only destinations without crowding the core navigation.
- Make every visible label, control, and card fit at phone widths with safe-area spacing and 44px touch targets.
- Restore the onboarding subtitle in both builds to “Sell your stuff, book a service, get paid.”
- Prevent graduation-cap overlap in both Welcome and “How will you use” headings by giving headline wordmarks their own protected line/space and using collision-safe cap positioning.
- Change campus resolution so only recognized school records or valid `.edu` domains can create campuses. Arbitrary non-school domains will be rejected instead of converted into public campuses.
- Map verified internal/CEO accounts to the seeded Fort Valley State University campus for app data defaults, while hiding the campus pill, campus watermark, founder-spots banner, and founder calculations from those public-facing internal views.
- Store Fort Valley State University as the internal accounts’ backend campus value and correct existing internal-account records so the bad domain does not return.
- Preserve the existing long-lived session refresh and manual-only logout behavior in both builds.
- Audit Main, Beta, tutorials, tester/internal views, manifests, service-worker behavior, and core mobile interactions; fix confirmed release-blocking defects found during that audit.

## Validation
- Test Welcome, role selection, normal home, tester mode, and an internal-account simulation in both builds at 393px and a narrow phone width.
- Confirm no cap/text overlap, clipped labels, horizontal overflow, or hidden touch controls.
- Confirm internal accounts never display `Integroservicegroup` or a founder-spots banner and that the backend resolves them to Fort Valley State University.
- Confirm unknown non-`.edu` domains cannot create campuses, while valid unlisted `.edu` schools still can.
- Confirm install metadata, icons, app launch paths, persistent session storage, manual logout, and browser console behavior.

## Release Notes
- The share link remains `https://venduapp.com`.
- Web installation can be validated here; App Store and Google Play submission still requires signed native builds through the existing Capacitor wrapper and the owner’s Apple/Google developer accounts.

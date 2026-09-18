# Match Image 1 and Condense Settings

## Exact visual result before implementation
- Image 1 is the source of truth; image 2 is only the current-state comparison.
- The purple banner will be a rectangular top band ending just below the logo/photo row. It will not have image 2’s rounded purple bottom panel.
- The wide frosted search field will overlap the banner’s lower edge, with the pale translucent fill, soft blur, rounded capsule shape, and shadow seen in image 1.
- A circular uploaded profile photo will sit at the upper right. Its red unread badge will attach to the photo’s upper-right rim and show the actual unread total. Only users without a photo will see a circular notification bell fallback.
- The school selector remains a compact frosted purple capsule immediately left of the photo, with its yellow status dot and truncated school name.
- “The VendU App” becomes the larger serif lockup from image 1, with the cap centered over the U and the Beta badge retained only in Beta.
- The tab rail begins below the floating search field. Chips become taller and roomier, the featured heading and cards widen, and content spacing matches image 1’s denser full-phone composition.
- Featured cards will use image 1’s larger near-square proportions and rounded corners; no sample screenshot will be embedded.
- The bottom navigation will match image 1’s taller proportions, larger icons/labels, and raised central purple plus button.
- Apply this consistently to Home, Market, and Profile, while keeping the purple area limited to each screen’s header instead of bleeding through Profile content.

## Condensed Settings result
The first Settings screen will show five rows instead of ten:
- Tutorial — Replay Tutorial
- Help & Feedback — Send Feedback; Help & Support
- Privacy — Privacy & Terms; Privacy Choices
- Sign-in & School — Set or Change Password; Change School Email
- Account — Log Out; Log Out of All Devices; Delete My Account

Each grouped row opens a clean subpage with a Back control. Destructive account actions remain clearly separated and every current option remains available.

## Main, Beta, demo, and tutorials
- Apply the exact same structure to Main and Beta; only Beta keeps its Beta mark.
- Demo/tester mode uses the same layout. If no tester photo exists, it deliberately shows the bell fallback.
- Update tutorial targets for the photo-or-bell inbox, school selector, floating search, tabs, chips, featured cards, plus button, and grouped Settings.
- Place each tutorial card in the largest free area above or below its target; it must never cover or intercept the highlighted control.

## Audit and validation
- Check notification counts against actual unread messages and event updates, including focus/visibility refresh.
- Audit the touched screens for broken actions, overflow, profile-header bleed, stale tutorial selectors, and mobile safe-area/touch-target issues.
- Validate Main and Beta at a 393px phone viewport and a wider mobile viewport, including demo/tester mode, Settings groups, profile fallback, and uploaded-photo states.
- Confirm publish readiness after these checks. Signed App Store and Google Play submission remains dependent on the Apple/Google developer signing credentials.

## Share links after publishing
- Beta/default public entry: `https://venduapp.com`
- Direct Beta path: `https://venduapp.com/beta/index.html`
- Main build: `https://venduapp.com/main/index.html`

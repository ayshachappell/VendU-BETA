# Match Image 1 and Condense Settings

## Confirmed visual target
- Use image 1 as the exact mobile reference; image 2 is only the current-state comparison.
- The purple banner starts at the top edge and stops on a straight horizontal line behind the floating search field, rather than wrapping the whole header in a rounded purple panel.
- Keep the search field overlapping the banner edge with the larger frosted light surface, softer border, and stronger shadow shown in image 1.
- Replace the outlined bell circle with the student's circular uploaded profile photo. Keep the real unread count as the small red badge attached to the photo's upper-right edge. Show a neutral circular fallback only when no photo exists.
- Match image 1's larger serif “The VendU App” lockup, compact school pill, spacing, chip sizes, content width, featured cards, and bottom navigation proportions.
- Apply the same header treatment consistently to Home, Market, and Profile without letting the purple background bleed into Profile content.

## Settings organization
- Replace the long list with shorter top-level groups while preserving every action:
  - Tutorial
  - Feedback & Help
  - Privacy: Privacy & Terms; Privacy Choices
  - Sign-in & School: Password; School Email
  - Account: Log Out; Log Out of All Devices; Delete Account
- Each group opens a simple subpage with Back navigation and the original actions.

## Main, Beta, demo, and tutorials
- Apply the visual and Settings changes to both Main and Beta.
- Keep Beta identification where appropriate without changing account behavior.
- Update tester/demo views and tutorial targets/text so highlights point to the photo inbox, school selector, floating search, tabs, filters, and navigation in their new positions.
- Ensure tutorial cards do not cover or block the control being described.

## Audit and validation
- Check notification counts against actual unread messages and event updates, including focus/visibility refresh.
- Audit the touched screens for broken actions, overflow, profile-header bleed, stale tutorial selectors, and mobile safe-area/touch-target issues.
- Validate Main and Beta at a 393px phone viewport and a wider mobile viewport, including demo/tester mode, Settings groups, profile fallback, and uploaded-photo states.
- Confirm publish readiness after these checks. Signed App Store and Google Play submission remains dependent on the Apple/Google developer signing credentials.

## Share links after publishing
- Beta/default public entry: `https://venduapp.com`
- Direct Beta path: `https://venduapp.com/beta/index.html`
- Main build: `https://venduapp.com/main/index.html`

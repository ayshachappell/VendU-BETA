# Message design, refresh scope, and release readiness

## Both Main and Beta

- Restrict pull-to-refresh to Feed, Browse, Events, Buy & Trade, and Requests only.
- Rebuild the open DM to match the supplied reference: profile/storefront-colored header, avatar and name, themed sent-message bubbles, compact safety note, and a bottom composer.
- Place a `+` immediately left of the camera. Its menu will contain Photos, Voice, GIF/Stickers, File, Location, and Contact; the camera remains a direct action.
- Keep the message field and Send control clear and usable on small phones, while retaining the existing persistent messages, attachments, and transaction safety flow.
- Preserve the full bottom navigation on the Messages list and hide it only inside a conversation.

## Demo, tutorial, and tester views

- Update sample conversations to demonstrate the revised profile-colored DM and attachment menu.
- Add tutorial guidance for the five refresh-enabled areas and the new DM `+` menu without adding unnecessary steps.
- Keep Main and Beta content separated and preserve Beta’s intentional feature differences.

## Install and publishing audit

- Correct manifest theme metadata, offline-cache versions, mobile safe-area behavior, and native wrapper settings where needed.
- Fix only reproducible bugs found while testing the requested flows.
- Validate both builds at 393×852: all five refresh areas, excluded screens, Messages list navigation, DM appearance, every attachment action, demo/tutorial behavior, and install metadata.
- Confirm the user-facing Main and Beta links and identify any store-signing step that still requires Apple or Google developer access.

## Technical notes

- The supplied image is a visual reference only; it will not be embedded.
- Profile/storefront colors will use each conversation’s existing identity color and safe semantic fallbacks.
- Web installation can be made ready here. Signed App Store and Play Store packages still require the owner’s developer accounts and Apple’s local signing tools.

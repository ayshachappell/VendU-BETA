# Persistent messaging, transaction meet-ups, and mobile polish

Main and Beta will receive the same capabilities while remaining fully separated by build.

## 1. Message and navigation behavior

- Keep the full Home / Market / + / Profile bar on the Messages list.
- Hide the entire bottom navigation only while an individual conversation is open.
- Let the Inbox control return to the list without changing the selected app tab.
- Recalculate the conversation height and bottom safe area so the message composer sits naturally at the bottom after the navigation disappears.
- Keep message rows opening the conversation; only the avatar opens the person’s profile or storefront.

## 2. Real, persistent conversations

- Replace device-only inbox state with shared conversations, participants, messages, unread state, and attachments in Lovable Cloud.
- Load and send messages through authenticated endpoints so both participants see the same history across devices.
- Keep Main and Beta isolated with a required build value on conversations, messages, transactions, notifications, and attachments.
- Poll while the inbox or a conversation is visible, refresh on focus, and mark only the current user’s messages as read.
- Preserve the existing sample conversations for demo mode, clearly separate from live messages.

## 3. Purchases, trades, requests, and bookings in DMs

- Create a transaction record whenever a user starts a purchase, trade, request, or confirmed booking.
- Automatically create or reuse the DM between the two participants and insert a compact transaction card naming the item/service, roles, appointment time when applicable, and current status.
- Make the same transaction visible to both people, with buyer/customer and seller/vendor roles determined on the server rather than inferred from display names.
- Keep each transaction’s safety and payment state independent when a conversation contains multiple purchases or bookings.

## 4. Appointment-time safety flow

- Show a booking card immediately after confirmation, but keep its meet-up confirmation locked until 15 minutes before the appointment.
- At that time, add an unread in-app notification and a system message in the DM asking each participant to confirm the meet-up.
- Show **I’m with the seller** to the buyer/customer and **I’m with the buyer** to the seller/vendor.
- Advance only the side that taps first; preserve the other person’s pending confirmation until they respond.
- Keep buyer payment and seller receipt confirmation separate: buyer sees **Buyer: I paid ✓**; seller sees **Seller: I got paid ✓**, **Not yet**, and **Report this deal**.
- Reveal private payment handles only inside that transaction conversation after the buyer/customer confirms they are physically with the seller/vendor.
- For unscheduled Market buys, trades, and requests, show the meet-up card immediately; scheduled bookings use the 15-minute window.

## 5. Full message composer tools

Match the supplied messaging reference with compact icon controls and accessible labels:

- Camera: take a new photo on supported phones.
- Photos: choose and send images from the device.
- Voice: record, preview, cancel, send, and play voice messages.
- GIFs and stickers: open a lightweight searchable/preset picker and send the selected result.
- Plus menu: send a file, current/shared location, or a contact card.
- Show upload progress, attachment previews, unsupported-file messages, and retry/remove controls without covering typed text.
- Store uploaded media privately and return short-lived links only to conversation participants.

## 6. Seamless mobile purple header

- Use one dark-purple mobile browser/status-bar color across the page metadata, runtime updates, app header, installed app theme, and both native wrappers.
- Remove the lighter strip and any one-pixel seam at the top by extending the same header color through the safe area.
- Preserve the user-selected profile/storefront colors below the global app header.

## 7. Validation

- Verify Main and Beta independently on a 393×852 mobile viewport.
- Test inbox navigation visibility, active-DM navigation removal, keyboard/composer spacing, all attachment controls, message persistence between two users, unread counts, avatar-only profile navigation, and multiple transactions in one DM.
- Test booking cards before and after the 15-minute threshold, both confirmation orders, payment progression, reporting, and private-handle visibility.
- Confirm the mobile header is seamless in browser and installed-app metadata, then version both offline caches.

## Technical notes

- Add authenticated conversation, participant, message, attachment, transaction, and reminder data with explicit grants and row-level access restricted to participants.
- Extend bookings with the scheduled timestamp and vendor ownership needed to address both participants safely.
- Use a server-owned reminder process so the 15-minute state does not depend on a user keeping the conversation open; the notification center remains the durable record.
- Device push while the app is fully closed requires the Firebase Messaging app connection and registered device tokens. The in-app notification and unread DM work without it; push delivery will be enabled when that connection is authorized.
- Validate attachment type and size on both client and server, and never expose private payment handles or media through public feed responses.

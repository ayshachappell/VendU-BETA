# Separate Student and Vendor names

## What will change

- Keep two independent names on the same account:
  - **Student Name** for Student View, student profiles, Market posts, requests, events, comments, communities, and messages.
  - **Vendor Name** for Vendor View, storefronts, vendor service/promo posts, bookings, and vendor-facing identity.
- Preserve existing accounts safely: the current profile name becomes the initial Student Name, while the current storefront name becomes the initial Vendor Name.
- Add a clear Save button beside each name field. Both Save buttons will use the same size, shape, color, wording, loading state, and success/error feedback.
- Make saving explicit: typing changes a draft only; pressing Save persists that identity and updates the visible profile immediately.
- Keep Main and Beta data separate through their existing storefront/build separation.

## Name behavior

- Student View always renders and submits the Student Name.
- Vendor View always renders and submits the Vendor Name.
- The server will choose the correct saved name instead of trusting a name supplied by the browser:
  - ordinary student activity uses Student Name;
  - storefront-linked vendor activity uses Vendor Name.
- Existing posts and comments keep the name captured when they were created; new activity uses the newly saved name.

## Verification mark and layout

- Render display names as wrapping words with the verification mark attached to the final word in a non-breaking group.
- Apply this to editable profiles, viewed student profiles, storefront identity, cards, and feed names so the check never falls onto a line by itself.
- Test long two-line names at phone widths in Main and Beta.

## Technical details

- Use the existing profile `display_name` as the persisted Student Name and each build’s existing storefront `shop_name` as its Vendor Name; no duplicate identity column is needed.
- Split the shared browser state into student and vendor name values, then update profile/storefront loading, saving, publishing, and local optimistic rows.
- Harden feed, comment, and event writes so the backend derives the author name from the saved profile or linked storefront where applicable.
- Keep both builds synchronized, update offline-cache versions, and record the completed work in the roadmap.

## Verification

- Test Student Name and Vendor Name saving independently and confirm switching views never overwrites either one.
- Create student and vendor activity and confirm each surface shows the correct identity.
- Confirm both Save buttons match and respond from their full center area.
- Check long names and verification marks at 393×852 and 546×580 in Main and Beta, with no overflow or page errors.

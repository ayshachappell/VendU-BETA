# Make VendU real: accounts, vendors, referrals, storefronts, campus data

Today sign-in, bookings, reviews, referrals and event interest are already saved on the
server. But the people and shops themselves are not: vendor profiles, services, photos,
prices, feed posts, likes and comments live only in the phone's own storage and in a
built-in demo list. So two students never see the same VendU.

This plan makes the app's content real and shared.

## 1. Real accounts and profiles

- Every verified student gets a saved profile: display name, photo, bio, campus,
  socials, payment handles (Cash App / Venmo / Zelle), phone, notification settings.
- The profile loads from the server on any device after sign-in, so nothing is lost
  when a phone is replaced or storage is cleared.
- A single account can act as buyer and seller (unchanged behaviour), with a
  "vendor mode" flag that turns the storefront on.

## 2. Live vendor sign-ups and storefronts

- Saving a storefront publishes it: shop name, tagline, awning colour, layout choice,
  work photos, services with prices, promo badges, availability, payment options.
- Browse, Featured on campus, search and the storefront page all read published
  vendors for the selected campus, so a new vendor appears for everyone right away.
- Demo vendors stay visible only for testers and during the tutorial.
- Existing booking, review, rating and presence (green dot) logic points at the saved
  vendor record instead of the local list.

## 3. Real feed

- Feed posts (sell/trade item, request, event, auto-generated service and promo posts)
  save to the server with author, campus, photos, timestamps.
- Likes and comments save too, so counts are the same for everyone; the 2-comment
  collapse and 10-day feed hiding rules stay as they are.
- Pull-to-refresh fetches new posts; the user's scroll position is still preserved.

## 4. Referral tracking that actually counts

- Each account gets one permanent referral code stored on the server, not generated
  on the phone, so the code survives reinstalls.
- Opening a link with `?ref=CODE` records the invite when that person verifies their
  school email; a referral only counts once and only for a real, different student.
- "Qualified" referral = the invited person verifies and publishes a storefront.
- Founder spots, badges, leaderboard, rank and remaining-count all read from those
  server-side numbers (10 spots per school, 3 qualified vendors to earn one).
- Walk the whole flow end to end in the browser: copy link, open as a second student,
  verify, publish a storefront, confirm the referrer's count, banner and leaderboard
  all move.

## 5. Live schools, events and campus calendars

- Seed the campus table with real U.S. `.edu` schools from the bundled dataset so
  campus pages, themes and names are consistent instead of invented per device.
- Register public calendar feeds for the launch schools and confirm the scheduled
  fetch fills the events tab.
- Test the events tab end to end: official calendar events plus student-posted events,
  Interested counts, creator notifications, Add to calendar and Directions.

## 6. Audit and verify

- Run both builds at phone width: sign in, publish a vendor, post, like, comment,
  refer, browse events. Check for errors, overflow and blocked tutorial steps.
- Confirm access rules: a student can only edit their own profile, storefront, posts
  and comments; everyone can read published content for their campus.

## Technical notes

- New tables (all with grants + row-level security): `profiles`, `vendors`,
  `vendor_services`, `vendor_photos`, `posts`, `post_likes`, `post_comments`,
  `referral_codes`; `referrals` gains a qualified flag.
- Photos go to a Supabase storage bucket (`vendu-media`) with per-user folders,
  replacing base64 images kept in local storage.
- New endpoints under `src/routes/api/public/` following the existing pattern:
  `profile`, `vendor`, `feed`, `referral`, all writes authenticated through the
  existing `requireStudent` session check.
- Both `public/main` and `public/beta` read the same endpoints, separated by the
  existing `build` field; Beta keeps its no-communities behaviour.
- Campus seeding runs as a migration from the existing `us-schools` dataset;
  calendar feeds are rows in `campus_event_feeds`.

## Not covered here

App Store / Google Play publication still needs signed native builds and Apple and
Google developer accounts. The shareable web link stays https://venduapp.com

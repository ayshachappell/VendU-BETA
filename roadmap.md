# Roadmap
- [x] Match both welcome screens exactly to Image 1: thin serif lockup and compact spacing
- [x] Stay signed in until manual log out (session keep-alive in both builds)
- [x] Expanded terms/privacy: copying code, logos, likeness = liable in court; AI disclaimers; indemnity
- [x] AI product auto-fill from a photo (title, category, description, price)
- [x] Mobile-first shell: 393px frame, bottom nav with iOS safe area, 44px touch targets,
      no pull-to-refresh, momentum scrolling, bottom-sheet modals
- [x] Verified both builds at 393px with no console errors
- [x] Match the supplied mobile reference across Main and Beta
- [x] Prevent internal and arbitrary non-.edu domains from becoming campuses
- [x] Hide campus and founder banners for internal/CEO accounts
- [x] Restore onboarding tagline and remove headline cap collisions
- [x] Complete mobile, tester, session, and installability verification
- [x] Align the profile "View my VendU" lockup and cap across Main, Beta, demos, and tutorials

- [ ] Make events live in both builds: persist manual events and interest counts, notify event creators, and merge configured school calendars
- [x] Align event actions, header branding/order, profile cap, storefront photos, and pasted account links in both builds

- [x] Live accounts, storefronts, feed and referrals wired into Main + Beta (vendu-live.js)
- [x] US school list integrated (2,348 schools, src/data/us-schools.json)
- [x] Seeded official campus calendar feeds: automated discovery across all 2,348 schools verified and saved 181 live calendars (others can be added later)
- [x] Native wrapper configs for Main + Beta plus signing guide (native/)
- [ ] Signed store builds (needs your Apple + Google developer accounts and a Mac)
- [x] Removed install-app option and its how-to-install instructions from both builds
- [x] Posts, storefronts and events always publish to the student's home campus (.edu), while browsing other campuses stays open
- [x] Students can change their verified .edu email (transfer/re-enroll) via a link sent to the new address
- [x] Use supportive safety-tip wording and start the tutorial immediately after home-campus selection

## Accounts, posting and events (done)
- Password sign-in: verify school email once, set a password, then log in with email + password on any device. Settings → "Set or change my password".
- "Log out of all devices" in Settings signs the account out everywhere.
- Home school syncs from the account profile on every device.
- Posts, requests, market items and events publish to whichever campus is selected in the location pill.
- Events disappear automatically once they are over (end time, or 3 hours after the start when no end time was given).

## Purple header (done)
- Purple banner header on Home, Market, Profile (both builds)
- Semi-transparent search bar inside header
- Bell replaced by student profile photo; exact unread count, refresh every 15s + on focus/visibility
- Tutorial step added for the profile-photo inbox button

## Image 1 mobile refinement (done)
- [x] Straight purple top band with overlapping frosted search in Main and Beta
- [x] Circular profile-photo inbox with bell-only fallback and live unread badge
- [x] Image 1 feed spacing, featured-card proportions, and bottom navigation sizing
- [x] Condensed Settings into Tutorial, Help, Privacy, Sign-in & School, and Account groups
- [x] Updated demo/tester and tutorial guidance for the refined controls

## Image 4 scale and presence refinement (done)
- [x] Shorter straight purple band, thinner overlapping search, and overlapping circular inbox photo
- [x] Feed and Events use screen-specific search labels
- [x] Phone layouts fill each device width while preserving safe-area spacing
- [x] Online dots use recent authenticated activity across feeds, profiles, chats, and storefronts
- [x] Profile and storefront photos enlarge on tap with a compact close control
- [x] Main/Beta offline caches versioned and network requests bypass browser cache to prevent old published screens from persisting

## Compact header alignment refinement (done)
- [x] Raised and aligned the inbox photo/bell with the wordmark and campus pill
- [x] Shortened the purple band and repositioned the thinner frosted search
- [x] Matched search-icon and placeholder colors
- [x] Overlapped the editable Profile photo with the band and removed its self-presence dot
- [x] Kept live presence on other students' profiles, feeds, chats, and storefronts

## Profile identity refresh (done)
- [x] Matched the vendor Profile identity area to the supplied purple reference treatment
- [x] Added the live green dot to the editable Profile picture
- [x] Applied profile color changes to the avatar, identity background, border, and membership card
- [x] Bumped both offline caches so published devices receive the refreshed Profile screen
- [x] Replaced the editable Profile camera badge with a bottom-right green online dot in both builds
- [x] Unified Student, Vendor, viewed-profile, and storefront identity headers with the seamless profile gradient
- [x] Matched Student/Vendor view switch controls and kept the active dot at the avatar's bottom-right
- [x] Rearranged Student Profile to the supplied reference with the full storefront-live message and 48px+ touch controls
- [x] Matched Student and Vendor profile action buttons and corrected the storefront-live sentence
- [x] Moved “View My VendU” below the profile banner and restored the graduation-hat VendU lockup without the silhouette icon
- [x] Replaced the viewed-profile text back link with the compact purple pill from the storefront reference
- [x] Matched the student-profile action spacing and button proportions to the supplied reference in Main and Beta
- [x] Matched “Become a vendor” to the white Vendor View control and moved viewed-profile Back into the banner top-left

- [x] v30: viewed-profile banner wordmark restored to full "The VendU App" lockup (WMFULL) with BETA badge in Beta; CSS `.viewed-profile-brand` max-width 220px, The/App in white at 850pacity; SW caches v30. Playwright verified 393px both builds.
- [x] v31: improved banner legibility with crisp white identity text and translucent dark-glass badges across Main and Beta.
- [x] v32: standardized every “Welcome to my VendU” banner lockup, including typography, color, dimensions, placement, and animated graduation hat across Main and Beta.
- [x] v33: made the full “Welcome to my VendU” sentence one consistent font, size, weight, color, position, and height while preserving the animated graduation hat across Main and Beta.
- [x] v34: kept every “Welcome to my VendU” title clear of Back pills, matched “Your VendU” typography to profile names, and compacted all four profile action buttons to accessible 48px tonal pills across Main and Beta.
- [x] v35: separated Student Name and Vendor Name across Main and Beta, added matching explicit Save controls, used the active identity across profiles and activity, and kept verification marks attached to the final name word.
- [x] v36: let students save social handles, show their first @handle in place of the repeated Verified label, and restore the camera control on the owner's avatar while retaining presence dots for other people.
- [x] v37: anchored Browse online dots to avatar corners and matched header/posting app-title typography to “Featured on campus” without changing the Beta badge.
- [x] v38: matched header and storefront welcome typography, improved banner contrast, prioritized Instagram handles, and placed all profile badges below handles.
- [x] v39: kept social handles profile-only and shared across account modes, added avatar enlargement, themed the camera control, rounded notification bells, removed onboarding dots, and pinned storefront/profile presence dots to avatar corners.
- [x] v40: restored the signature purple VendU “U” with a contrast edge so it stays visible on every header and storefront banner.
- [x] v41: applied the purple “U” treatment to all styled VendU names, moved onboarding Back controls to the top-left, added Back to school verification, reduced crowded header titles, and removed storefront welcome outlines.
- [x] v42: removed the darker interactive layer behind every storefront welcome title and made both uploaded photos and letter avatars enlarge on tap.
- [x] v43: lifted the storefront welcome grad cap fully above the “U” (matching the other lockups) and turned profile @ handles white for legibility on the purple identity surfaces; service-worker caches bumped to v43.
- [x] v44: raised the graduation cap above the “U” in student-profile banners to `top: -12px` across Main and Beta; service-worker caches bumped to v44.
- [x] v45: matched student-profile “The VendU App” lockups to the animated header design in Main and Beta while preserving the `top: -12px` cap position.
- [x] v46: matched the student-profile graduation cap height to the standard “The VendU App” header cap at `top: -9px` across Main and Beta.
- [x] v47: restored the visible chat composer above mobile navigation, made message rows open conversations while avatars alone open profiles, and matched the mobile status area to the darker purple header in Main and Beta.
- [x] v48: removed DM pull-to-refresh and the purple add control, added role-specific buyer/seller meet-up and payment steps, and strengthened dated legal acknowledgment language across Main and Beta.

## Persistent messaging and meet-ups (in progress)
- [x] Shared Main/Beta-isolated conversations, transaction cards, attachments, and unread state
- [x] Appointment cards unlock and notify both people 15 minutes before start
- [x] Hide all bottom navigation inside a DM while keeping it on the Messages list
- [x] Camera, photos, voice, GIF/sticker, file, location, and contact composer tools
- [x] Seamless dark-purple mobile status/header area in web and native wrappers
- [x] v50: restored the purple post button on the Messages list and combined all DM controls into one compact message bar in Main and Beta

- [x] v51: limited pull-to-refresh to Feed, Browse, Events, Buy & Trade, and Requests; rebuilt profile-colored DMs with a + attachment menu; updated demos/tutorials; corrected Main routing, legal links, manifest chrome, and stale installed-app caches in both builds.
- [x] v52: removed the misplaced DM safety line, kept every composer control on one row, closed attachment tools when typing resumes, and added searchable online GIFs in Main and Beta.
- [x] v53: restored the reference safety reminder above a bottom-anchored message bar, matched conversation spacing, and enlarged touch areas across Main, Beta, demos, and tutorials.
- [x] v54: removed the hidden navigation's reserved space so the DM safety reminder and message bar reach the true bottom on every viewport in Main and Beta.
- [x] v55: aligned message-list avatars with names and added a private, confirmed thread-removal control in Main and Beta.
- [x] v56: aligned request-card avatars precisely with the first line of student names in Main and Beta.

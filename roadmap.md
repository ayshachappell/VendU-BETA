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

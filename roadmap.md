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

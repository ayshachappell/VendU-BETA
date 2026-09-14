# Live campus events and interest tracking

## Goal
Make the Events tab in both VendU builds combine official school-calendar events with student-posted events, while making “Interested” persistent, countable, and visible to the event creator.

## What will change
- Add secure live records for student-posted events, event interest, and in-app notifications.
- Allow signed-in users to create and manage only their own manual events; allow campus users to read events for the selected school.
- Make “Interested” a toggle that updates immediately, persists across devices, and displays the public count on each manual event.
- Notify the original poster when a new person marks their event as interested, without exposing attendee email addresses publicly.
- Load the creator’s unread event notifications into the existing bell/count experience.
- Merge manual events and the selected school’s official calendar events in chronological order in both Main and Beta.
- Preserve the existing “Add to calendar” and Directions actions.
- Configure verified public calendar feeds for the currently seeded schools where an official compatible feed is available; schools without a usable public feed will still show manual events and a clear empty state.

## Technical details
- Create `campus_events`, `event_interests`, and `notifications` tables with explicit grants, row-level access rules, indexes, and duplicate-interest protection.
- Add authenticated event API actions for list/create/delete/toggle-interest/notifications, using the signed session as identity.
- Keep official calendar ingestion read-only and cached; deduplicate official and manual events before display.
- Update the shared Main/Beta browser API and matching event interfaces together.
- Update generated database types after the schema migration.

## Validation
- Verify both builds at a 393px phone viewport.
- Confirm a manual event appears in both builds for the same campus.
- Confirm interest toggling persists, updates the public count, and creates one creator notification.
- Confirm switching campuses changes both official and manual events.
- Confirm school-calendar failure never breaks the Events tab.
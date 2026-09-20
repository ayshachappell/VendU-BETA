# Align message identities and add thread deletion

## Changes
- Align each conversation avatar and identity block so the avatar sits level with the user’s name in Main and Beta.
- Add the small gray “×” shown in the reference to the left of every conversation avatar, with a larger invisible touch area.
- Ask for confirmation before removing a conversation from the list.
- Treat deletion as private to the current user: hide the thread from their inbox without deleting the other participant’s messages or transaction history.
- Keep Main and Beta data separate and refresh both app versions after the change.

## Validation
- Check both message lists on phone and compact desktop sizes.
- Confirm avatar/name alignment, thread opening, avatar profile opening, and delete-control behavior.
- Confirm a removed thread stays hidden after refresh and can reappear if a new message arrives.

## Technical notes
- Store a per-user hidden timestamp for each conversation and filter only messages at or before that timestamp.
- Preserve the existing conversation and all records for the other participant.

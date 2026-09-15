# Vendor view, messages profiles, and safer Market meet-ups

All four changes ship in both Main and Beta, matching the screens you sent.

## 1. "Become a vendor" becomes "Switch to Vendor View"

- Before a storefront exists: the purple **Become a vendor** button stays exactly as it is
  and opens the storefront set-up.
- Once a storefront has been saved: that button is replaced by **Switch to Vendor View**,
  styled to mirror the existing "Switch to Student View" control on the vendor side.
- Tapping it flips to the vendor profile with all storefront options (edit storefront,
  services, photos, booking, payments), and "Switch to Student View" flips back.

## 2. Open a person from Messages

- The coloured letter circle in the inbox list, and the one in the chat header, become
  tappable.
- Tapping it opens that person's storefront if they are a vendor, or their student
  profile if they are not, with a Back control returning to the same conversation.

## 3. Payment methods on Market posts

- The Post to VendU flow for Market (buy / trade) items gains the same
  "How do you get paid?" picker used in storefront set-up: Cash App, Venmo, Zelle,
  PayPal, cash in person, plus handle.
- Saved handles are pre-filled so a seller does not retype them, and they are stored with
  the post — but the handles are **not** shown publicly on the post. The post shows only
  the accepted-payment labels (e.g. "Accepts Cash App · Venmo"), so a scammer cannot copy
  a handle off a listing.

## 4. Safer meet-ups (the flow you described — I think it is a good idea)

Inside a DM started from a Market item, both sides get a small, plain safety strip:

1. Buyer taps **I'm with the seller** when they meet in person.
2. Only then does VendU post the seller's actual payment handles into that one
   conversation, visible to those two people, with a short reminder to pay in person and
   never before meeting.
3. The seller then gets **Did you get paid?** with Yes / Not yet.
4. When the seller taps Yes, both sides see a "Payment confirmed" line with the time, so
   each person has a record.
5. If the seller taps Not yet, the buyer sees it and either side can report the deal from
   the same strip (using the existing reporting tool).

Two guardrails worth adding: the confirm button only appears for the buyer, and the
handle release happens once per deal so it cannot be spammed. VendU still never touches
the money — it only times the handoff and keeps a record both people can see.

## Technical notes

- Client state and rendering live in `public/main/index.html` and `public/beta/index.html`,
  with shared styling in the two `vendu-shared.css` files.
- Storefront existence is already tracked server-side (`vendors` rows, `vendor_mode` on
  the profile), so the Vendor View button keys off that rather than a local flag.
- Market post payment types extend the existing post payload; handles are stored but
  returned only to the post owner and to a buyer in a confirmed meet-up.
- The meet-up handshake adds a small deal record (buyer, seller, post, met-at,
  paid-confirmed-at) and system messages in the thread, so both devices see the same
  state.

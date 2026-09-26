import { createFileRoute } from "@tanstack/react-router";
import {
  emailFromVerificationLookupToken,
  isVerifiedStudent,
  json,
  normalizeAccessEmail,
  recentlyRequestedVerification,
} from "@/lib/edu-verification.server";

/** Polled by the waiting device: has this address finished verifying anywhere? */
export const Route = createFileRoute("/api/public/verify/lookup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, verified: false }, 400);
        }
        const payload = body as { lookupToken?: unknown; email?: unknown };
        let email = await emailFromVerificationLookupToken(payload?.lookupToken);
        if (!email) {
          /* Reopened tab / fresh device: the per-tab token is gone. Allow the
             email-based poll only when this address was sent a verification
             email within the last 30 minutes — never for arbitrary emails. */
          const candidate = normalizeAccessEmail(payload?.email);
          if (candidate && (await recentlyRequestedVerification(candidate))) {
            email = candidate;
          }
        }
        if (!email) return json({ ok: false, verified: false }, 401);
        return json({ ok: true, verified: await isVerifiedStudent(email) });
      },
    },
  },
});

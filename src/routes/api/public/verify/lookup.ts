import { createFileRoute } from "@tanstack/react-router";
import {
  emailFromVerificationLookupToken,
  isVerifiedStudent,
  json,
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
        const email = await emailFromVerificationLookupToken(
          (body as { lookupToken?: unknown })?.lookupToken,
        );
        if (!email) return json({ ok: false, verified: false }, 401);
        return json({ ok: true, verified: await isVerifiedStudent(email) });
      },
    },
  },
});

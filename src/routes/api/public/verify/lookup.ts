import { createFileRoute } from "@tanstack/react-router";
import { isVerifiedStudent, json, normalizeAccessEmail } from "@/lib/edu-verification.server";

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
        const email = normalizeAccessEmail((body as { email?: unknown })?.email);
        if (!email) return json({ ok: false, verified: false }, 400);
        return json({ ok: true, verified: await isVerifiedStudent(email), email });
      },
    },
  },
});

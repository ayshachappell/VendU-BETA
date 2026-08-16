import { createFileRoute } from "@tanstack/react-router";
import {
  emailFromLinkParams,
  json,
  normalizeAccessEmail,
  normalizeBuild,
  recordStudent,
} from "@/lib/edu-verification.server";

/** Resolves an emailed sign-in link that came back as `token_hash` or `code`
 *  instead of a URL hash with an access token. */
export const Route = createFileRoute("/api/public/verify/link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Invalid request." }, 400);
        }
        const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : undefined);
        const raw = await emailFromLinkParams({
          tokenHash: str("token_hash"),
          type: str("type"),
          code: str("code"),
        });
        const email = raw ? normalizeAccessEmail(raw) : null;
        if (!email) return json({ ok: false, message: "That link is no longer valid." }, 401);
        await recordStudent(email, normalizeBuild(body["build"]), null);
        return json({ ok: true, email });
      },
    },
  },
});

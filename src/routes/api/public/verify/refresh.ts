import { createFileRoute } from "@tanstack/react-router";
import { json, refreshSession } from "@/lib/edu-verification.server";

/** Keeps a verified device signed in without re-emailing a code. */
export const Route = createFileRoute("/api/public/verify/refresh")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false }, 400);
        }
        const token = typeof body["refresh_token"] === "string" ? body["refresh_token"] : "";
        if (!token) return json({ ok: false }, 400);
        const session = await refreshSession(token);
        if (!session) return json({ ok: false, needsAuth: true }, 401);
        return json({ ok: true, session });
      },
    },
  },
});

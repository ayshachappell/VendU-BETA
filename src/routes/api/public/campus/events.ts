import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/edu-verification.server";
import { normalizeDomain } from "@/lib/campus.server";
import { campusEvents } from "@/lib/campus-events.server";

/** Official campus events for a domain. Campuses without a feed get []. */
export const Route = createFileRoute("/api/public/campus/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          /* empty body is fine */
        }
        const domain = normalizeDomain(body["domain"] ?? body["email"]);
        if (!domain) return json({ ok: true, events: [] });
        try {
          return json({ ok: true, events: await campusEvents(domain) });
        } catch {
          return json({ ok: true, events: [] });
        }
      },
    },
  },
});

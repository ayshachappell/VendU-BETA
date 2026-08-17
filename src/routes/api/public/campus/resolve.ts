import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/edu-verification.server";
import { ensureCampus, normalizeDomain, updateCampus } from "@/lib/campus.server";

/** Resolve (and auto-create) the campus for a school email domain.
 *  Also accepts an optional patch so a student can confirm/fix the name once. */
export const Route = createFileRoute("/api/public/campus/resolve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Invalid request." }, 400);
        }
        const domain = normalizeDomain(body["domain"] ?? body["email"]);
        if (!domain) return json({ ok: false, message: "Need a school email domain." }, 400);

        let campus = await ensureCampus(domain);

        const name = typeof body["display_name"] === "string" ? body["display_name"] : undefined;
        const mascot = typeof body["mascot"] === "string" ? body["mascot"] : undefined;
        const accent = typeof body["accent_color"] === "string" ? body["accent_color"] : undefined;
        if (name || mascot !== undefined || accent) {
          const updated = await updateCampus(domain, {
            ...(name ? { display_name: name } : {}),
            ...(mascot !== undefined ? { mascot } : {}),
            ...(accent ? { accent_color: accent } : {}),
          });
          if (updated) campus = updated;
        }

        return json({ ok: true, campus });
      },
    },
  },
});

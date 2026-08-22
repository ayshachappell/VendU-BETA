import { createFileRoute } from "@tanstack/react-router";
import { json, sessionEmail, schoolDomain } from "@/lib/edu-verification.server";
import { canonicalDomain, ensureCampus, normalizeDomain, updateCampus } from "@/lib/campus.server";

/** Resolve (and auto-create) the campus for a school email domain.
 *  Reading is public. Editing the shared name/mascot/color requires a signed-in
 *  student whose own verified school email belongs to that same campus. */
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
          const email = await sessionEmail(request);
          const callerDomain = email ? canonicalDomain(schoolDomain(email)) : "";
          if (!email || callerDomain !== canonicalDomain(domain)) {
            return json(
              {
                ok: true,
                campus,
                patched: false,
                message: "Only verified students at this school can edit its campus details.",
              },
              200,
            );
          }

          const safeName = name ? name.trim().slice(0, 80) : undefined;
          const safeMascot = mascot !== undefined ? mascot.trim().slice(0, 60) : undefined;
          const safeAccent =
            accent && /^#[0-9a-fA-F]{6}$/.test(accent.trim()) ? accent.trim() : undefined;

          const updated = await updateCampus(domain, {
            ...(safeName ? { display_name: safeName } : {}),
            ...(safeMascot !== undefined ? { mascot: safeMascot } : {}),
            ...(safeAccent ? { accent_color: safeAccent } : {}),
          });
          if (updated) campus = updated;
        }

        return json({ ok: true, campus });
      },
    },
  },
});

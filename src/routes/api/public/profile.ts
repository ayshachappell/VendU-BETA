import { createFileRoute } from "@tanstack/react-router";
import { json, requireStudent } from "@/lib/edu-verification.server";
import {
  cleanUrl,
  domainForEmail,
  ensureProfile,
  publicProfile,
  referralCodeFor,
  safeDomain,
  str,
} from "@/lib/vendu-core.server";

type Body = Record<string, unknown>;

/** Student profiles: saved on the server so they follow the person to any device. */
export const Route = createFileRoute("/api/public/profile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }
        const action = str(raw["action"], 24);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        /* Public: look up one profile (safe fields only). */
        if (action === "get") {
          const email = str(raw["email"], 254).toLowerCase();
          if (!email) return json({ ok: false, message: "Missing person." }, 400);
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", email)
            .maybeSingle();
          return json({ ok: true, profile: publicProfile(data) });
        }

        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;

        if (action === "me") {
          const row = await ensureProfile(email);
          const code = await referralCodeFor(email);
          return json({
            ok: true,
            profile: { ...publicProfile(row), phone: row?.["phone"] ?? "", notify: row?.["notify"] ?? {} },
            refCode: code,
          });
        }

        if (action === "save") {
          await ensureProfile(email);
          const patch: Record<string, unknown> = { last_seen_at: new Date().toISOString() };
          if (raw["displayName"] !== undefined) patch["display_name"] = str(raw["displayName"], 60);
          if (raw["bio"] !== undefined) patch["bio"] = str(raw["bio"], 600);
          if (raw["avatarUrl"] !== undefined) patch["avatar_url"] = cleanUrl(raw["avatarUrl"], 800000);
          if (raw["phone"] !== undefined) patch["phone"] = str(raw["phone"], 24);
          if (raw["vendorMode"] !== undefined) patch["vendor_mode"] = !!raw["vendorMode"];
          /* Home campus may be corrected exactly once, at first setup. After
             that it only changes through the verified school-email change. */
          let campusLocked = false;
          if (raw["campusDomain"] !== undefined) {
            const d = safeDomain(raw["campusDomain"]);
            if (d) {
              const emailDomain = domainForEmail(email);
              const { data: cur } = await supabaseAdmin
                .from("profiles")
                .select("campus_domain")
                .eq("email", email)
                .maybeSingle();
              const current = safeDomain(cur?.["campus_domain"]);
              const alreadyMoved = !!current && !!emailDomain && current !== emailDomain;
              if (!alreadyMoved) patch["campus_domain"] = d;
              else if (current !== d) campusLocked = true;
            }
          }
          /* If the school is locked, keep its saved name too, so the app never
             shows a school name that does not match where posts go. */
          if (raw["campusName"] !== undefined && !campusLocked)
            patch["campus_name"] = str(raw["campusName"], 90);
          if (raw["socials"] && typeof raw["socials"] === "object") {
            const src = raw["socials"] as Record<string, unknown>;
            const out: Record<string, string> = {};
            for (const k of ["instagram", "tiktok", "snapchat", "x", "website"]) {
              if (src[k] !== undefined) out[k] = str(src[k], 200);
            }
            patch["socials"] = out;
          }
          if (raw["payments"] && typeof raw["payments"] === "object") {
            const src = raw["payments"] as Record<string, unknown>;
            const out: Record<string, string> = {};
            for (const k of ["cashapp", "venmo", "zelle", "paypal", "cash", "payUrl"]) {
              if (src[k] !== undefined) out[k] = str(src[k], 300);
            }
            patch["payments"] = out;
          }
          if (raw["notify"] && typeof raw["notify"] === "object") patch["notify"] = raw["notify"];

          const { data, error } = await supabaseAdmin
            .from("profiles")
            .update(patch as never)
            .eq("email", email)
            .select("*")
            .maybeSingle();
          if (error) return json({ ok: false, message: "Could not save your profile." }, 500);
          return json({ ok: true, profile: publicProfile(data), campusLocked });
        }

        /* Keeps the green "using the app now" dot honest. */
        if (action === "ping") {
          await ensureProfile(email);
          await supabaseAdmin
            .from("profiles")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("email", email);
          return json({ ok: true });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

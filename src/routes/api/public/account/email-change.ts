import { createFileRoute } from "@tanstack/react-router";
import {
  json,
  logAttempt,
  normalizeEduEmail,
  requestEmailCode,
  requireStudent,
  schoolDomain,
  str as _str,
} from "@/lib/edu-verification.server";
import { domainForEmail } from "@/lib/vendu-core.server";

type Body = Record<string, unknown>;

const PENDING = "change-email:";

/**
 * Lets a student move their account to a different verified .edu address
 * (transfer, re-enrolment, new school email). The move only completes after
 * the student opens the sign-in link sent to the new address.
 */
export const Route = createFileRoute("/api/public/account/email-change")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }
        const action = String(raw["action"] ?? "");
        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "start") {
          const next = normalizeEduEmail(raw["email"]);
          if (!next) {
            return json(
              { ok: false, message: "Enter your new school email — it has to end in .edu" },
              400,
            );
          }
          if (next === email) {
            return json({ ok: false, message: "That's already your school email." }, 400);
          }
          const { data: taken } = await supabaseAdmin
            .from("students")
            .select("email")
            .eq("email", next)
            .maybeSingle();
          if (taken) {
            return json(
              { ok: false, message: "That school email already has a VendU account." },
              409,
            );
          }
          await logAttempt(next, `${PENDING}${email}`);
          const origin = new URL(request.url).origin;
          const sent = await requestEmailCode(next, `${origin}/`);
          if (!sent.ok) return json({ ok: false, message: sent.message }, 502);
          return json({ ok: true, email: next });
        }

        /* Called once the student is signed in on the new address. */
        if (action === "complete") {
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: pending } = await supabaseAdmin
            .from("verification_attempts")
            .select("kind,created_at")
            .eq("email", email)
            .like("kind", `${PENDING}%`)
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const previous = pending?.kind ? String(pending.kind).slice(PENDING.length) : "";
          if (!previous || previous === email) return json({ ok: true, moved: false });

          const { data: old } = await supabaseAdmin
            .from("students")
            .select("*")
            .eq("email", previous)
            .maybeSingle();
          if (!old) return json({ ok: true, moved: false });

          const domain = domainForEmail(email) || schoolDomain(email);

          /* Clear the empty rows the fresh sign-in just created. */
          await supabaseAdmin.from("students").delete().eq("email", email);
          await supabaseAdmin.from("profiles").delete().eq("email", email);
          await supabaseAdmin.from("referral_codes").delete().eq("email", email);

          await supabaseAdmin
            .from("students")
            .update({ email, school_domain: domain, last_active_at: new Date().toISOString() })
            .eq("email", previous);
          await supabaseAdmin
            .from("profiles")
            .update({ email, campus_domain: domain })
            .eq("email", previous);
          await supabaseAdmin
            .from("vendors")
            .update({ owner_email: email, campus_domain: domain })
            .eq("owner_email", previous);
          await supabaseAdmin
            .from("posts")
            .update({ author_email: email, campus_domain: domain })
            .eq("author_email", previous);
          await Promise.all([
            supabaseAdmin.from("referral_codes").update({ email }).eq("email", previous),
            supabaseAdmin.from("post_likes").update({ student_email: email }).eq("student_email", previous),
            supabaseAdmin.from("post_comments").update({ student_email: email }).eq("student_email", previous),
            supabaseAdmin.from("bookings").update({ student_email: email }).eq("student_email", previous),
            supabaseAdmin.from("reviews").update({ student_email: email }).eq("student_email", previous),
            supabaseAdmin.from("referrals").update({ referred_email: email }).eq("referred_email", previous),
            supabaseAdmin
              .from("campus_events")
              .update({ creator_email: email, domain })
              .eq("creator_email", previous),
            supabaseAdmin.from("event_interests").update({ student_email: email }).eq("student_email", previous),
            supabaseAdmin
              .from("event_notifications")
              .update({ recipient_email: email })
              .eq("recipient_email", previous),
          ]);

          await supabaseAdmin
            .from("verification_attempts")
            .delete()
            .eq("email", email)
            .like("kind", `${PENDING}%`);

          return json({ ok: true, moved: true, from: previous, email, domain });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

void _str;

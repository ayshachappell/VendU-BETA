import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";
import {
  domainForEmail,
  emailForReferralCode,
  referralCodeFor,
  str,
} from "@/lib/vendu-core.server";

type Body = Record<string, unknown>;

const CAP = 10;
const GOAL = 3;
const SHARE_BASE = "https://venduapp.com";

/** Permanent invite codes and honest referral counting. */
export const Route = createFileRoute("/api/public/referral")({
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
        const build = normalizeBuild(raw["build"]);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;
        const code = await referralCodeFor(email);
        const link = `${SHARE_BASE}/?ref=${code}`;

        /* Credit the person whose link brought this student in — once, ever. */
        if (action === "credit") {
          const from = str(raw["code"], 32).toUpperCase();
          if (!from || from === code) return json({ ok: true, credited: false, code, link });
          const owner = await emailForReferralCode(from);
          if (!owner || owner === email) return json({ ok: true, credited: false, code, link });
          const { error } = await supabaseAdmin.from("referrals").insert({
            ref_code: from,
            referred_email: email,
            campus: domainForEmail(email) || null,
            build,
          });
          return json({ ok: true, credited: !error, code, link });
        }

        if (action === "me" || action === "stats") {
          const domain = domainForEmail(email);
          const { data } = await supabaseAdmin
            .from("referrals")
            .select("ref_code,referred_email,qualified,qualified_at,created_at")
            .eq("campus", domain)
            .order("created_at", { ascending: true });

          const rows = (data ?? []) as Record<string, unknown>[];
          const counts = new Map<string, number>();
          const reachedAt = new Map<string, string>();
          for (const r of rows) {
            if (!r["qualified"]) continue;
            const c = String(r["ref_code"] ?? "");
            if (!c) continue;
            const n = (counts.get(c) ?? 0) + 1;
            counts.set(c, n);
            if (n === GOAL && !reachedAt.has(c))
              reachedAt.set(c, String(r["qualified_at"] ?? r["created_at"] ?? ""));
          }

          const seated = [...reachedAt.entries()]
            .sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
            .map(([c]) => c)
            .slice(0, CAP);

          const codes = [...counts.keys()];
          let names = new Map<string, string>();
          if (codes.length) {
            const { data: owners } = await supabaseAdmin
              .from("referral_codes")
              .select("code,email")
              .in("code", codes);
            const emails = ((owners ?? []) as Record<string, unknown>[]).map(
              (o) => o["email"] as string,
            );
            const { data: profiles } = emails.length
              ? await supabaseAdmin.from("profiles").select("email,display_name").in("email", emails)
              : { data: [] };
            const byEmail = new Map(
              ((profiles ?? []) as Record<string, unknown>[]).map((p) => [
                p["email"] as string,
                String(p["display_name"] ?? ""),
              ]),
            );
            names = new Map(
              ((owners ?? []) as Record<string, unknown>[]).map((o) => [
                o["code"] as string,
                byEmail.get(o["email"] as string) || "A student",
              ]),
            );
          }

          const ranked = [...counts.entries()]
            .map(([c, referrals]) => ({ code: c, referrals }))
            .sort((a, b) => b.referrals - a.referrals || a.code.localeCompare(b.code));

          const mySeat = seated.indexOf(code);
          return json({
            ok: true,
            code,
            link,
            domain,
            cap: CAP,
            goal: GOAL,
            claimed: seated.length,
            left: Math.max(0, CAP - seated.length),
            myReferrals: counts.get(code) ?? 0,
            myRank: ranked.findIndex((r) => r.code === code) + 1 || null,
            founderNumber: mySeat >= 0 ? mySeat + 1 : null,
            isFounder: mySeat >= 0,
            leaderboard: ranked.slice(0, 20).map((r, i) => ({
              rank: i + 1,
              name: names.get(r.code) ?? "A student",
              referrals: r.referrals,
              founder: seated.includes(r.code),
              me: r.code === code,
            })),
          });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

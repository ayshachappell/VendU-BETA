import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";

type Body = {
  action?: unknown;
  email?: unknown;
  build?: unknown;
  vendorId?: unknown;
  service?: unknown;
  stars?: unknown;
  body?: unknown;
  refCode?: unknown;
  campus?: unknown;
  vendorIds?: unknown;
  domain?: unknown;
};

function str(v: unknown, max = 400): string {
  return String(v ?? "").trim().slice(0, max);
}

/**
 * Shared, cross-device storage for bookings, reviews and referrals.
 * Reviews are only accepted from students who actually booked that vendor.
 */
export const Route = createFileRoute("/api/public/community/activity")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }

        const action = str(raw.action, 32);
        const build = normalizeBuild(raw.build);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "stats") {
          const ids = Array.isArray(raw.vendorIds)
            ? (raw.vendorIds as unknown[]).map((v) => str(v, 64)).filter(Boolean).slice(0, 100)
            : [];
          if (!ids.length) return json({ ok: true, stats: {} });
          const [bk, rv] = await Promise.all([
            supabaseAdmin.from("bookings").select("vendor_id").eq("build", build).in("vendor_id", ids),
            supabaseAdmin
              .from("reviews")
              .select("vendor_id,stars,body,created_at")
              .eq("build", build)
              .in("vendor_id", ids),
          ]);
          const stats: Record<string, { jobs: number; reviews: number; avg: number | null }> = {};
          for (const id of ids) stats[id] = { jobs: 0, reviews: 0, avg: null };
          for (const row of bk.data ?? []) {
            const s = stats[row.vendor_id as string];
            if (s) s.jobs += 1;
          }
          const sums: Record<string, number> = {};
          for (const row of rv.data ?? []) {
            const id = row.vendor_id as string;
            const s = stats[id];
            if (!s) continue;
            s.reviews += 1;
            sums[id] = (sums[id] ?? 0) + (row.stars as number);
          }
          for (const id of Object.keys(stats)) {
            const s = stats[id]!;
            if (s.reviews) s.avg = Number((sums[id]! / s.reviews).toFixed(1));
          }
          return json({ ok: true, stats });
        }

        /* Founder math for one school (.edu domain), computed live.
           A founder = someone whose invite link brought in FOUNDER_GOAL (3)
           vendors from that same school. Spots are capped at 10 per school. */
        if (action === "founders") {
          const CAP = 10;
          const GOAL = 3;
          const { canonicalDomain } = await import("@/lib/campus.server");
          const rawDomain =
            str(raw.domain, 120).toLowerCase().replace(/^.*@/, "") ||
            str(raw.email, 254).toLowerCase().split("@")[1] ||
            "";
          const domain = rawDomain ? canonicalDomain(rawDomain) : "";
          if (!domain) return json({ ok: false, message: "Missing school." }, 400);
          const myCode = str(raw.refCode, 64);

          const { data } = await supabaseAdmin
            .from("referrals")
            .select("ref_code,referred_email,created_at")
            .ilike("referred_email", `%${domain}`)
            .order("created_at", { ascending: true });

          const counts = new Map<string, number>();
          const firstAt = new Map<string, string>();
          for (const row of data ?? []) {
            const code = String(row.ref_code ?? "");
            if (!code) continue;
            counts.set(code, (counts.get(code) ?? 0) + 1);
            if ((counts.get(code) ?? 0) === GOAL && !firstAt.has(code))
              firstAt.set(code, String(row.created_at ?? ""));
          }

          const ranked = [...counts.entries()]
            .map(([code, referrals]) => ({ code, referrals }))
            .sort((a, b) => b.referrals - a.referrals || a.code.localeCompare(b.code));

          // Founder seats go to the first accounts to reach the goal.
          const qualified = [...firstAt.entries()]
            .sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
            .map(([code]) => code);
          const seated = qualified.slice(0, CAP);
          const claimed = seated.length;

          const myReferrals = myCode ? (counts.get(myCode) ?? 0) : 0;
          const mySeat = myCode ? seated.indexOf(myCode) : -1;
          const myRank = myCode ? ranked.findIndex((r) => r.code === myCode) + 1 : 0;

          return json({
            ok: true,
            domain,
            cap: CAP,
            goal: GOAL,
            claimed,
            left: Math.max(0, CAP - claimed),
            total: ranked.length,
            myReferrals,
            myRank: myRank || null,
            founderNumber: mySeat >= 0 ? mySeat + 1 : null,
            isFounder: mySeat >= 0,
            leaderboard: ranked.slice(0, 20).map((r, i) => ({
              rank: i + 1,
              code: r.code,
              referrals: r.referrals,
              founder: seated.includes(r.code),
              me: !!myCode && r.code === myCode,
            })),
          });
        }


        /* Everything below writes on behalf of a student, so the identity must
           come from the signed session issued at verification — a client-sent
           "email" field is not proof of anything and is ignored. */
        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;

        if (action === "book") {
          const vendorId = str(raw.vendorId, 64);
          if (!vendorId) return json({ ok: false, message: "Missing vendor." }, 400);
          await supabaseAdmin.from("bookings").insert({
            student_email: email,
            vendor_id: vendorId,
            build,
            service: str(raw.service, 120) || null,
          });
          const { count } = await supabaseAdmin
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("build", build)
            .eq("vendor_id", vendorId);
          return json({ ok: true, jobs: count ?? 0 });
        }

        if (action === "review") {
          const vendorId = str(raw.vendorId, 64);
          const stars = Math.max(1, Math.min(5, Math.round(Number(raw.stars) || 0)));
          if (!vendorId || !stars) return json({ ok: false, message: "Missing review." }, 400);
          const { count: booked } = await supabaseAdmin
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("build", build)
            .eq("vendor_id", vendorId)
            .eq("student_email", email);
          if (!booked)
            return json(
              { ok: false, message: "You can review a vendor after you book with them." },
              403,
            );
          await supabaseAdmin
            .from("reviews")
            .upsert(
              {
                student_email: email,
                vendor_id: vendorId,
                build,
                stars,
                body: str(raw.body, 800) || null,
              },
              { onConflict: "student_email,vendor_id,build" },
            );
          const { data } = await supabaseAdmin
            .from("reviews")
            .select("stars")
            .eq("build", build)
            .eq("vendor_id", vendorId);
          const rows = data ?? [];
          const avg = rows.length
            ? Number((rows.reduce((a, r) => a + (r.stars as number), 0) / rows.length).toFixed(1))
            : null;
          return json({ ok: true, reviews: rows.length, avg });
        }

        if (action === "referral") {
          const refCode = str(raw.refCode, 64);
          if (!refCode) return json({ ok: false, message: "Missing invite code." }, 400);
          await supabaseAdmin
            .from("referrals")
            .upsert(
              { ref_code: refCode, referred_email: email, campus: str(raw.campus, 80) || null, build },
              { onConflict: "referred_email" },
            );
          return json({ ok: true });
        }

        if (action === "referralCount") {
          const refCode = str(raw.refCode, 64);
          const { count } = await supabaseAdmin
            .from("referrals")
            .select("id", { count: "exact", head: true })
            .eq("ref_code", refCode);
          return json({ ok: true, referrals: count ?? 0 });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

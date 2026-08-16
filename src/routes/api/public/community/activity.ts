import { createFileRoute } from "@tanstack/react-router";
import {
  isVerifiedStudent,
  json,
  normalizeAccessEmail,
  normalizeBuild,
} from "@/lib/edu-verification.server";

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

        const email = normalizeAccessEmail(raw.email);
        if (!email) return json({ ok: false, message: "Verify your school email first." }, 401);
        if (!(await isVerifiedStudent(email)))
          return json({ ok: false, message: "Verify your school email first." }, 401);

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

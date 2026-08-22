import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";

type Body = {
  vendorId?: unknown;
  when?: unknown;
  phone?: unknown;
  build?: unknown;
};

/** Strips anything that could turn a confirmation into attacker-authored text. */
function safeText(v: unknown, max = 80): string {
  return String(v ?? "")
    .replace(/[^\p{L}\p{N} :\-/.,'&+#]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function digits(v: unknown): string {
  const d = String(v ?? "").replace(/[^\d+]/g, "");
  if (!d) return "";
  return d.startsWith("+") ? d : d.length === 10 ? `+1${d}` : `+${d}`;
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_FROM_NUMBER"];
  if (!sid || !token || !from || !to) return false;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Max confirmation texts one student can trigger per day. */
const DAILY_SMS_CAP = 10;

/**
 * Appointment confirmations. Only a signed-in student can trigger one, only
 * for a booking that actually belongs to them, and the wording is built
 * server-side from the stored booking (never from the request body).
 */
export const Route = createFileRoute("/api/public/notify/appointment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;

        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }

        const build = normalizeBuild(raw.build);
        const vendorId = safeText(raw.vendorId, 64);
        const phone = digits(raw.phone);
        if (!vendorId) return json({ ok: false, message: "Missing booking." }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // The booking must exist and belong to the caller.
        const { data: booking } = await supabaseAdmin
          .from("bookings")
          .select("vendor_id,service,created_at")
          .eq("student_email", email)
          .eq("build", build)
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!booking) {
          return json({ ok: false, message: "No matching booking for your account." }, 403);
        }

        // Per-student daily cap so the number can't be used as a relay.
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabaseAdmin
          .from("verification_attempts")
          .select("id", { count: "exact", head: true })
          .eq("email", email)
          .eq("kind", "sms")
          .gte("created_at", since);
        if ((count ?? 0) >= DAILY_SMS_CAP) {
          return json({ ok: false, message: "Too many texts today. Try again tomorrow." }, 429);
        }
        await supabaseAdmin.from("verification_attempts").insert({ email, kind: "sms" });

        const vendor = safeText(booking.vendor_id, 60) || "your vendor";
        const service = safeText(booking.service, 60) || "your appointment";
        const when = safeText(raw.when, 40);

        const sms = await sendSms(
          phone,
          `VendU: you're booked with ${vendor} — ${service}${when ? ` on ${when}` : ""}. Reply STOP to opt out.`,
        );

        return json({ ok: true, sms });
      },
    },
  },
});

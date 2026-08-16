import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/edu-verification.server";

type Body = {
  email?: unknown;
  vendor?: unknown;
  vendorId?: unknown;
  service?: unknown;
  when?: unknown;
  phone?: unknown;
  build?: unknown;
};

function str(v: unknown, max = 200): string {
  return String(v ?? "").trim().slice(0, max);
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

/**
 * Appointment confirmations. Sends a real text when a text provider is
 * connected; otherwise the app still shows the in-app confirmation.
 */
export const Route = createFileRoute("/api/public/notify/appointment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }

        const vendor = str(raw.vendor, 80) || "your vendor";
        const service = str(raw.service, 80) || "your appointment";
        const when = str(raw.when, 80);
        const phone = digits(raw.phone);

        const sms = await sendSms(
          phone,
          `VendU ✓ You're booked with ${vendor} — ${service} on ${when}. We'll remind you 1 hour before. Reply STOP to opt out.`,
        );

        return json({ ok: true, sms });
      },
    },
  },
});

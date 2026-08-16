import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeAccessEmail } from "@/lib/edu-verification.server";

/**
 * Permanent account deletion (required by the App Store / Play Store).
 * Removes the student record plus everything tied to that email.
 */
export const Route = createFileRoute("/api/public/account/delete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: { email?: unknown };
        try {
          raw = (await request.json()) as { email?: unknown };
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }

        const email = normalizeAccessEmail(raw.email);
        if (!email) return json({ ok: false, message: "Enter a valid email address." }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await Promise.all([
          supabaseAdmin.from("bookings").delete().eq("student_email", email),
          supabaseAdmin.from("reviews").delete().eq("student_email", email),
          supabaseAdmin.from("referrals").delete().eq("referred_email", email),
          supabaseAdmin.from("verification_attempts").delete().eq("email", email),
        ]);
        await supabaseAdmin.from("students").delete().eq("email", email);

        return json({ ok: true });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { json, requireStudent } from "@/lib/edu-verification.server";

/**
 * Permanent account deletion (required by the App Store / Play Store).
 * Deletes only the signed-in student's own data: identity comes from the
 * session token issued at verification, never from the request body.
 */
export const Route = createFileRoute("/api/public/account/delete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: ownedEvents } = await supabaseAdmin
          .from("campus_events")
          .select("id")
          .eq("creator_email", email);
        const ownedEventIds = (ownedEvents ?? []).map((event) => event.id);
        await Promise.all([
          supabaseAdmin.from("bookings").delete().eq("student_email", email),
          supabaseAdmin.from("reviews").delete().eq("student_email", email),
          supabaseAdmin.from("referrals").delete().eq("referred_email", email),
          supabaseAdmin.from("verification_attempts").delete().eq("email", email),
          supabaseAdmin.from("event_interests").delete().eq("student_email", email),
          supabaseAdmin.from("event_notifications").delete().eq("recipient_email", email),
          supabaseAdmin.from("event_notifications").delete().eq("actor_email", email),
        ]);
        if (ownedEventIds.length) {
          await supabaseAdmin.from("campus_events").delete().in("id", ownedEventIds);
        }
        await supabaseAdmin.from("students").delete().eq("email", email);

        return json({ ok: true });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { canonicalDomain } from "@/lib/campus.server";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";
import { domainForEmail } from "@/lib/vendu-core.server";

type Body = {
  action?: unknown;
  build?: unknown;
  domain?: unknown;
  eventId?: unknown;
  title?: unknown;
  creatorName?: unknown;
  actorName?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  location?: unknown;
  description?: unknown;
  imageUrl?: unknown;
};

function str(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function safeDomain(value: unknown): string {
  const domain = canonicalDomain(str(value, 160).toLowerCase().replace(/^.*@/, ""));
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain) ? domain : "";
}

function safeDate(value: unknown): string | null {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const Route = createFileRoute("/api/public/events/activity")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;

        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }

        const action = str(raw.action, 32);
        const build = normalizeBuild(raw.build);
        const email = auth.email;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "list") {
          const domain = safeDomain(raw.domain);
          if (!domain) return json({ ok: false, message: "Choose a school first." }, 400);
          const horizon = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
          const { data: rows, error } = await supabaseAdmin
            .from("campus_events")
            .select("id,creator_email,creator_name,title,starts_at,ends_at,location,description,image_url,build")
            .eq("domain", domain)
            .eq("active", true)
            .gte("starts_at", horizon)
            .order("starts_at", { ascending: true })
            .limit(100);
          if (error) return json({ ok: false, message: "Events are unavailable right now." }, 500);
          const ids = (rows ?? []).map((row) => row.id);
          const interests = ids.length
            ? await supabaseAdmin.from("event_interests").select("event_id,student_email").in("event_id", ids)
            : { data: [] as Array<{ event_id: string; student_email: string }> };
          const counts = new Map<string, number>();
          const mine = new Set<string>();
          for (const interest of interests.data ?? []) {
            counts.set(interest.event_id, (counts.get(interest.event_id) ?? 0) + 1);
            if (interest.student_email === email) mine.add(interest.event_id);
          }
          return json({
            ok: true,
            events: (rows ?? []).map((row) => ({
              id: row.id,
              creator_name: row.creator_name,
              title: row.title,
              starts_at: row.starts_at,
              ends_at: row.ends_at,
              location: row.location,
              description: row.description,
              image_url: row.image_url,
              build: row.build,
              mine: row.creator_email === email,
              interest_count: counts.get(row.id) ?? 0,
              interested: mine.has(row.id),
            })),
          });
        }

        if (action === "create") {
          /* Events post to the student's own school only. */
          const domain = domainForEmail(email) || safeDomain(raw.domain);
          const title = str(raw.title, 180);
          const startsAt = safeDate(raw.startsAt);
          const endsAt = raw.endsAt ? safeDate(raw.endsAt) : null;
          const creatorName = str(raw.creatorName, 100) || email.split("@")[0] || "Student";
          const imageUrl = str(raw.imageUrl, 1_500_000);
          if (!domain || !title || !startsAt)
            return json({ ok: false, message: "Add an event name, school, and valid date." }, 400);
          if (Date.parse(startsAt) < Date.now() - 3 * 60 * 60 * 1000)
            return json({ ok: false, message: "Choose an upcoming date." }, 400);
          if (raw.imageUrl && !imageUrl.startsWith("data:image/"))
            return json({ ok: false, message: "Event uploads must be images." }, 400);
          const { data, error } = await supabaseAdmin
            .from("campus_events")
            .insert({
              domain,
              creator_email: email,
              creator_name: creatorName,
              title,
              starts_at: startsAt,
              ends_at: endsAt,
              location: str(raw.location, 180) || null,
              description: str(raw.description, 1000) || null,
              image_url: imageUrl || null,
              build,
            })
            .select("id")
            .single();
          if (error || !data) return json({ ok: false, message: "We couldn't post that event." }, 500);
          return json({ ok: true, id: data.id });
        }

        if (action === "notifications") {
          const { data } = await supabaseAdmin
            .from("event_notifications")
            .select("id,event_id,message,read_at,created_at")
            .eq("recipient_email", email)
            .order("created_at", { ascending: false })
            .limit(50);
          return json({ ok: true, notifications: data ?? [] });
        }

        if (action === "markNotificationsRead") {
          await supabaseAdmin
            .from("event_notifications")
            .update({ read_at: new Date().toISOString() })
            .eq("recipient_email", email)
            .is("read_at", null);
          return json({ ok: true });
        }

        const eventId = str(raw.eventId, 64);
        if (!/^[0-9a-f-]{36}$/i.test(eventId))
          return json({ ok: false, message: "Invalid event." }, 400);

        const { data: event } = await supabaseAdmin
          .from("campus_events")
          .select("id,creator_email,title,active")
          .eq("id", eventId)
          .maybeSingle();
        if (!event?.active) return json({ ok: false, message: "That event is no longer available." }, 404);

        if (action === "delete") {
          if (event.creator_email !== email) return json({ ok: false, message: "You can only delete your own event." }, 403);
          await supabaseAdmin.from("campus_events").update({ active: false }).eq("id", eventId);
          return json({ ok: true });
        }

        if (action === "toggleInterest") {
          const { data: existing } = await supabaseAdmin
            .from("event_interests")
            .select("id")
            .eq("event_id", eventId)
            .eq("student_email", email)
            .maybeSingle();
          let interested = false;
          if (existing) {
            await supabaseAdmin.from("event_interests").delete().eq("id", existing.id);
          } else {
            await supabaseAdmin.from("event_interests").insert({ event_id: eventId, student_email: email });
            interested = true;
          }
          const { count } = await supabaseAdmin
            .from("event_interests")
            .select("id", { count: "exact", head: true })
            .eq("event_id", eventId);
          const total = count ?? 0;

          // One rolling notification per event for the poster: the count updates in place.
          if (event.creator_email !== email) {
            await supabaseAdmin
              .from("event_notifications")
              .delete()
              .eq("recipient_email", event.creator_email)
              .eq("event_id", eventId)
              .eq("kind", "event_interest");
            if (total > 0) {
              await supabaseAdmin.from("event_notifications").insert({
                recipient_email: event.creator_email,
                event_id: eventId,
                actor_email: null,
                kind: "event_interest",
                message:
                  total === 1
                    ? `1 person is interested in “${event.title}”.`
                    : `${total} people are interested in “${event.title}”.`,
                build,
                read_at: null,
              });
            }
          }
          return json({ ok: true, interested, count: total });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});
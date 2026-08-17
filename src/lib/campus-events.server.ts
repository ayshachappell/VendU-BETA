/** Server-only: fetch + parse optional official campus event feeds. */

export type CampusEvent = {
  external_id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  link: string | null;
};

function unfold(ics: string): string[] {
  return ics.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function unescapeIcs(v: string): string {
  return v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function icsDate(value: string): string | null {
  const v = value.trim();
  let m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(v);
  if (m) {
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ? "Z" : "Z"}`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  m = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (m) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function parseIcs(text: string): CampusEvent[] {
  const out: CampusEvent[] = [];
  let cur: Record<string, string> | null = null;
  for (const line of unfold(text)) {
    if (line.startsWith("BEGIN:VEVENT")) cur = {};
    else if (line.startsWith("END:VEVENT")) {
      if (cur) {
        const start = cur["DTSTART"] ? icsDate(cur["DTSTART"]) : null;
        if (cur["SUMMARY"] && start) {
          out.push({
            external_id: cur["UID"] || `${cur["SUMMARY"]}|${start}`,
            title: unescapeIcs(cur["SUMMARY"]).slice(0, 180),
            starts_at: start,
            ends_at: cur["DTEND"] ? icsDate(cur["DTEND"]) : null,
            location: cur["LOCATION"] ? unescapeIcs(cur["LOCATION"]).slice(0, 180) : null,
            description: cur["DESCRIPTION"] ? unescapeIcs(cur["DESCRIPTION"]).slice(0, 600) : null,
            link: cur["URL"] || null,
          });
        }
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).split(";")[0]!.toUpperCase();
        cur[key] = line.slice(idx + 1);
      }
    }
  }
  return out;
}

type LocalistPayload = {
  events?: Array<{
    event?: {
      id?: number | string;
      title?: string;
      localist_url?: string;
      description_text?: string;
      description?: string;
      location_name?: string;
      location?: string;
      event_instances?: Array<{ event_instance?: { start?: string; end?: string } }>;
    };
  }>;
};

export function parseLocalist(payload: unknown): CampusEvent[] {
  const data = payload as LocalistPayload;
  const out: CampusEvent[] = [];
  for (const wrap of data.events ?? []) {
    const e = wrap.event;
    if (!e?.title) continue;
    const inst = e.event_instances?.[0]?.event_instance;
    if (!inst?.start) continue;
    const start = new Date(inst.start);
    if (isNaN(start.getTime())) continue;
    const end = inst.end ? new Date(inst.end) : null;
    out.push({
      external_id: String(e.id ?? `${e.title}|${inst.start}`),
      title: String(e.title).slice(0, 180),
      starts_at: start.toISOString(),
      ends_at: end && !isNaN(end.getTime()) ? end.toISOString() : null,
      location: (e.location_name ?? e.location ?? null)?.slice(0, 180) ?? null,
      description: (e.description_text ?? e.description ?? null)?.slice(0, 600) ?? null,
      link: e.localist_url ?? null,
    });
  }
  return out;
}

const REFRESH_MS = 6 * 60 * 60 * 1000; // a few times a day

/** Returns cached official events for a campus, refreshing from the feed when stale.
 *  A campus with no feed simply returns an empty list — never an error. */
export async function campusEvents(domain: string): Promise<CampusEvent[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const horizon = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  const { data: feeds } = await supabaseAdmin
    .from("campus_event_feeds")
    .select("feed_url, feed_type")
    .eq("domain", domain)
    .eq("active", true);

  if (!feeds || !feeds.length) return [];

  const { data: cached } = await supabaseAdmin
    .from("events_cache")
    .select("external_id, title, starts_at, ends_at, location, description, link, fetched_at")
    .eq("domain", domain)
    .gte("starts_at", horizon)
    .order("starts_at", { ascending: true })
    .limit(50);

  const freshest = cached?.[0]?.fetched_at ? Date.parse(cached[0].fetched_at) : 0;
  if (cached?.length && Date.now() - freshest < REFRESH_MS) {
    return cached.map(({ fetched_at: _f, ...e }) => e as CampusEvent);
  }

  const found: CampusEvent[] = [];
  for (const feed of feeds) {
    try {
      const res = await fetch(feed.feed_url, { headers: { Accept: "text/calendar, application/json" } });
      if (!res.ok) continue;
      if (feed.feed_type === "localist") found.push(...parseLocalist(await res.json()));
      else found.push(...parseIcs(await res.text()));
    } catch {
      /* a broken feed must never break the Events tab */
    }
  }

  const upcoming = found
    .filter((e) => e.starts_at >= horizon)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 50);

  if (upcoming.length) {
    await supabaseAdmin.from("events_cache").upsert(
      upcoming.map((e) => ({ ...e, domain, fetched_at: new Date().toISOString() })),
      { onConflict: "domain,external_id" },
    );
    return upcoming;
  }

  return (cached ?? []).map(({ fetched_at: _f, ...e }) => e as CampusEvent);
}

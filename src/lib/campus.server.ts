/** Server-only campus directory + campus records.
 *  Dataset: Hipo/university-domains-list, filtered to U.S. schools and bundled
 *  in the repo so lookups never depend on an external http-only API. */
import RAW from "@/data/us-schools.json";

export type School = { n: string; d: string[]; s: string | null };

const SCHOOLS = RAW as School[];

/** Built once per worker instance and reused (the dataset is static). */
let DOMAIN_INDEX: Map<string, School> | null = null;
function domainIndex(): Map<string, School> {
  if (DOMAIN_INDEX) return DOMAIN_INDEX;
  const m = new Map<string, School>();
  for (const s of SCHOOLS) for (const d of s.d) if (!m.has(d)) m.set(d, s);
  DOMAIN_INDEX = m;
  return m;
}

/** jane@mail.mercer.edu -> mercer.edu when the parent domain is known. */
export function normalizeDomain(raw: unknown): string | null {
  const v = String(raw ?? "").trim().toLowerCase().replace(/^.*@/, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) return null;
  return v;
}

export function lookupSchool(domain: string): School | null {
  const idx = domainIndex();
  const exact = idx.get(domain);
  if (exact) return exact;
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    const hit = idx.get(parent);
    if (hit) return hit;
  }
  return null;
}

/** mercer.edu -> "Mercer" when the dataset has no entry. */
export function prettyFromDomain(domain: string): string {
  const core = domain.replace(/\.(edu|com|org|net)(\.[a-z]{2})?$/, "").split(".").pop() ?? domain;
  return core
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .trim() || domain;
}

export function searchSchools(query: string, limit = 12) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const starts: School[] = [];
  const contains: School[] = [];
  for (const s of SCHOOLS) {
    const n = s.n.toLowerCase();
    if (n.startsWith(q)) starts.push(s);
    else if (n.includes(q)) contains.push(s);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit).map((s) => ({
    name: s.n,
    domain: s.d[0] ?? "",
    state: s.s ?? "",
  }));
}

/** Small palette so every campus gets a stable, sensible accent. */
const PALETTE = [
  "#9E2B7E", "#0F766E", "#B91C1C", "#1D4ED8", "#B45309",
  "#7C2D12", "#065F46", "#9D174D", "#4338CA", "#0369A1",
];

export function accentForDomain(domain: string): string {
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

export type Campus = {
  domain: string;
  display_name: string;
  accent_color: string;
  mascot: string | null;
  known: boolean;
};

/** Join the campus for this domain, creating it the first time anyone from
 *  that school verifies. Guarantees every valid .edu works. */
export async function ensureCampus(domain: string): Promise<Campus> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing } = await supabaseAdmin
    .from("campuses")
    .select("domain, display_name, accent_color, mascot")
    .eq("domain", domain)
    .maybeSingle();

  const school = lookupSchool(domain);
  if (existing) return { ...existing, known: !!school };

  const row = {
    domain,
    display_name: school?.n ?? prettyFromDomain(domain),
    accent_color: accentForDomain(domain),
    mascot: null as string | null,
  };
  await supabaseAdmin.from("campuses").upsert(row, { onConflict: "domain" });
  return { ...row, known: !!school };
}

/** Let a student correct their school name / mascot once. */
export async function updateCampus(
  domain: string,
  patch: { display_name?: string; mascot?: string; accent_color?: string },
): Promise<Campus | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const clean: { display_name?: string; mascot?: string; accent_color?: string } = {};
  if (patch.display_name) clean.display_name = patch.display_name.slice(0, 90);
  if (patch.mascot !== undefined) clean.mascot = String(patch.mascot).slice(0, 24);
  if (patch.accent_color && /^#[0-9a-f]{6}$/i.test(patch.accent_color)) {
    clean.accent_color = patch.accent_color;
  }
  if (!Object.keys(clean).length) return null;
  const { data } = await supabaseAdmin
    .from("campuses")
    .update(clean)
    .eq("domain", domain)
    .select("domain, display_name, accent_color, mascot")
    .maybeSingle();
  return data ? { ...data, known: !!lookupSchool(domain) } : null;
}

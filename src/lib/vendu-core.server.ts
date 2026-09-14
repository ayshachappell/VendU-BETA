/** Shared helpers for the real VendU data model: profiles, storefronts,
 *  feed posts and referral codes. Server-only. */
import { canonicalDomain, campusDomainForAccount } from "@/lib/campus.server";

export function str(v: unknown, max = 400): string {
  return String(v ?? "").trim().slice(0, max);
}

export function cleanUrl(v: unknown, max = 2000): string | null {
  const s = str(v, max);
  if (!s) return null;
  if (/^https?:\/\//i.test(s) || s.startsWith("data:image/")) return s;
  return null;
}

/** The campus a student belongs to, from their email domain. */
export function domainForEmail(email: string): string {
  const raw = String(email || "").toLowerCase().split("@")[1] ?? "";
  if (!raw) return "";
  try {
    return campusDomainForAccount(raw);
  } catch {
    return "";
  }
}

export function safeDomain(raw: unknown): string {
  const d = String(raw ?? "").trim().toLowerCase().replace(/^.*@/, "");
  if (!d) return "";
  const c = canonicalDomain(d);
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(c) ? c : "";
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 7): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

/** One permanent invite code per account, created on first use. */
export async function referralCodeFor(email: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("referral_codes")
    .select("code")
    .eq("email", email)
    .maybeSingle();
  if (data?.code) return data.code as string;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabaseAdmin.from("referral_codes").insert({ email, code });
    if (!error) return code;
    const { data: again } = await supabaseAdmin
      .from("referral_codes")
      .select("code")
      .eq("email", email)
      .maybeSingle();
    if (again?.code) return again.code as string;
  }
  throw new Error("Could not create an invite code");
}

export async function emailForReferralCode(code: string): Promise<string | null> {
  if (!code) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("referral_codes")
    .select("email")
    .eq("code", code)
    .maybeSingle();
  return (data?.email as string) ?? null;
}

/** An invite only counts once the invited student publishes a storefront. */
export async function qualifyReferralFor(email: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("referrals")
    .update({ qualified: true, qualified_at: new Date().toISOString() })
    .eq("referred_email", email)
    .eq("qualified", false);
}

/** Keep the public profile row in step with the signed-in student. */
export async function ensureProfile(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (data) return data;
  const domain = domainForEmail(email);
  const { data: created } = await supabaseAdmin
    .from("profiles")
    .upsert({ email, campus_domain: domain || null }, { onConflict: "email" })
    .select("*")
    .maybeSingle();
  return created;
}

/** What everyone else is allowed to see about a student. */
export function publicProfile(row: Record<string, unknown> | null | undefined) {
  if (!row) return null;
  const lastSeen = Date.parse(String(row["last_seen_at"] ?? "")) || 0;
  return {
    email: row["email"],
    displayName: row["display_name"] ?? "",
    avatarUrl: row["avatar_url"] ?? "",
    bio: row["bio"] ?? "",
    campusDomain: row["campus_domain"] ?? "",
    campusName: row["campus_name"] ?? "",
    socials: row["socials"] ?? {},
    payments: row["payments"] ?? {},
    vendorMode: !!row["vendor_mode"],
    live: lastSeen > Date.now() - 2 * 60 * 1000,
  };
}

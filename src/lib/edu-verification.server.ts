/** Server-only helpers for VendU's students-only .edu verification. */

export type Build = "main" | "beta";

const BLOCKED_PREFIX = /^(admin|postmaster|abuse|root|noreply|no-reply)@/i;

/** Accepts any college address: user@school.edu, user@dept.school.edu, user@school.edu.au style is rejected. */
export function normalizeEduEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return null;
  if (!email.endsWith(".edu")) return null;
  if (BLOCKED_PREFIX.test(email)) return null;
  return email;
}

/**
 * Creator/tester allow-list. Set FOUNDER_EMAILS to a comma-separated list of
 * addresses (any domain) that may verify without a .edu address — used by the
 * app owner and invited testers.
 */
export function isFounderEmail(email: string): boolean {
  const raw = process.env["FOUNDER_EMAILS"] ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);
}

/** Any well-formed address, used before deciding whether .edu is required. */
function normalizeAnyEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return null;
  if (BLOCKED_PREFIX.test(email)) return null;
  return email;
}

/** A .edu student address, or an allow-listed creator/tester address. */
export function normalizeAccessEmail(raw: unknown): string | null {
  const edu = normalizeEduEmail(raw);
  if (edu) return edu;
  const any = normalizeAnyEmail(raw);
  return any && isFounderEmail(any) ? any : null;
}

export function schoolDomain(email: string): string {
  return email.split("@")[1] ?? "";
}

export function normalizeBuild(raw: unknown): Build {
  return raw === "beta" ? "beta" : "main";
}

export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.replace(/\D/g, "");
  return code.length === 6 ? code : null;
}

function authBase(): { url: string; key: string } {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend auth is not configured");
  return { url: url.replace(/\/$/, ""), key };
}

/** Ask the auth service to email a one-time login code to this address. */
export async function requestEmailCode(email: string, redirectTo?: string) {
  const { url, key } = authBase();
  const res = await fetch(
    `${url}/auth/v1/otp${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({
        email,
        create_user: true,
      }),
    },
  );
  if (res.ok) return { ok: true as const };
  const body = (await res.json().catch(() => ({}))) as { msg?: string; error_description?: string };
  return {
    ok: false as const,
    status: res.status,
    message: body.msg ?? body.error_description ?? "Could not send the code right now.",
  };
}

/** Exchange the 6-digit code for a session. */
export async function verifyEmailCode(email: string, token: string) {
  const { url, key } = authBase();
  const res = await fetch(`${url}/auth/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify({ type: "email", email, token }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    msg?: string;
    error_description?: string;
  };
  if (res.ok && body.access_token) {
    return {
      ok: true as const,
      session: {
        access_token: body.access_token,
        refresh_token: body.refresh_token ?? "",
        expires_at: body.expires_at ?? 0,
      },
    };
  }
  return {
    ok: false as const,
    message: body.msg ?? body.error_description ?? "That code didn't work. Try again.",
  };
}

/** Simple abuse guard: max 5 code requests per address per hour. */
export async function tooManyRequests(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("verification_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  return (count ?? 0) >= 5;
}

export async function logAttempt(email: string, kind: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("verification_attempts").insert({ email, kind });
}

export async function recordStudent(email: string, build: Build, gradYear: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("students").upsert(
    {
      email,
      school_domain: schoolDomain(email),
      grad_year: gradYear,
      build,
      verified_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

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

/** Company domain whose addresses keep permanent access to both builds. */
export const CEO_DOMAIN = "integroservicegroup.com";

/** Explicit CEO addresses — permanent access, always labeled CEO. */
export const CEO_EMAILS = [
  "ayshac@integroservicegroup.com",
  "info@integroservicegroup.com",
];

/**
 * CEO access. Every address ending in @integroservicegroup.com has permanent
 * access forever and is never purged. The optional CEO_EMAILS /
 * FOUNDER_EMAILS(_ADDITIONAL) env lists stay supported for invited testers on
 * other domains. Student (.edu) accounts never get permanent access.
 */
export function isCeoEmail(email: string): boolean {
  if (CEO_EMAILS.includes(email)) return true;
  if (email.endsWith(`@${CEO_DOMAIN}`)) return true;

  const raw = [
    process.env["CEO_EMAILS"] ?? "",
    process.env["FOUNDER_EMAILS"] ?? "",
    process.env["FOUNDER_EMAILS_ADDITIONAL"] ?? "",
  ].join(",");
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

/** Tester domain: demo-only access, never an admin and never a real student. */
export const TESTER_DOMAIN = "venduapp.com";
export function isTesterEmail(email: string): boolean {
  return email.endsWith(`@${TESTER_DOMAIN}`);
}

/** A .edu student address, or a CEO / tester / invited-tester address. */
export function normalizeAccessEmail(raw: unknown): string | null {
  const edu = normalizeEduEmail(raw);
  if (edu) return edu;
  const any = normalizeAnyEmail(raw);
  if (!any) return null;
  return isCeoEmail(any) || isTesterEmail(any) ? any : null;
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
  const { INTERNAL_DEFAULT_CAMPUS_DOMAIN } = await import("@/lib/campus.server");
  const now = new Date().toISOString();
  await supabaseAdmin.from("students").upsert(
    {
      email,
      school_domain:
        isCeoEmail(email) || isTesterEmail(email)
          ? INTERNAL_DEFAULT_CAMPUS_DOMAIN
          : schoolDomain(email),
      grad_year: gradYear,
      build,
      verified_at: now,
      last_active_at: now,
      // Permanent-access flag (legacy column name). CEO addresses
      // (@integroservicegroup.com) are never purged. This is NOT Founder
      // status: Founder is earned in-app by referring 3 vendors, .edu only.
      is_founder: isCeoEmail(email),
    },
    { onConflict: "email" },
  );
}

/** Keeps an account alive: inactive students are purged after a year. */
export async function touchStudent(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("students")
    .update({ last_active_at: new Date().toISOString() })
    .eq("email", email);
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Confirm an access token with the auth service and return the verified email. */
export async function emailFromAccessToken(token: string): Promise<string | null> {
  const { url, key } = authBase();
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const body = (await res.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  return email || null;
}

/** Has this address completed verification on this device-independent backend? */
export async function isVerifiedStudent(email: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("students")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (!data) return false;
  await touchStudent(email);
  return true;
}

/** Exchange the parameters carried by an emailed sign-in link for a session.
 *  Covers both link shapes GoTrue can produce: `token_hash` (implicit/verify
 *  redirects) and `code` (PKCE redirects). */
export async function emailFromLinkParams(params: {
  tokenHash?: string | undefined;
  type?: string | undefined;
  code?: string | undefined;
}): Promise<string | null> {
  const { url, key } = authBase();
  let accessToken: string | null = null;

  if (params.tokenHash) {
    const res = await fetch(`${url}/auth/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({
        type: params.type && /^[a-z_]+$/.test(params.type) ? params.type : "magiclink",
        token_hash: params.tokenHash,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { access_token?: string };
    accessToken = body.access_token ?? null;
  }

  if (!accessToken && params.code) {
    const res = await fetch(`${url}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ auth_code: params.code }),
    });
    const body = (await res.json().catch(() => ({}))) as { access_token?: string };
    accessToken = body.access_token ?? null;
  }

  if (!accessToken) return null;
  return emailFromAccessToken(accessToken);
}

/* ------------------------------------------------------------------ *
 * Session-bound identity.
 *
 * A student's identity is the signed session issued at verification —
 * never an email typed into a JSON body. Every endpoint that writes or
 * deletes on behalf of a student must go through requireStudent().
 * ------------------------------------------------------------------ */

/** Pull the verified email out of the request's `Authorization: Bearer` token. */
export async function sessionEmail(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const token = (match[1] ?? "").trim();
  if (!token || token.length > 4096) return null;
  const raw = await emailFromAccessToken(token);
  return raw ? normalizeAccessEmail(raw) : null;
}

/** Either the signed-in student's email, or a ready-to-return 401 Response. */
export async function requireStudent(
  request: Request,
): Promise<{ email: string } | { response: Response }> {
  const email = await sessionEmail(request);
  if (!email) {
    return {
      response: json(
        { ok: false, needsAuth: true, message: "Sign in with your school email to continue." },
        401,
      ),
    };
  }
  if (!(await isVerifiedStudent(email))) {
    return {
      response: json(
        { ok: false, needsAuth: true, message: "Verify your school email first." },
        401,
      ),
    };
  }
  return { email };
}

/** Swap a refresh token for a fresh session so long-lived devices stay signed in. */
export async function refreshSession(refreshToken: string) {
  const { url, key } = authBase();
  const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
  if (!res.ok || !body.access_token) return null;
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token ?? refreshToken,
    expires_at: body.expires_at ?? 0,
  };
}

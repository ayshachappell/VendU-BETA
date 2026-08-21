/** Signed admin sessions for the VendU moderation console (server-only). */

function secret(): string {
  const s = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_URL"];
  if (!s) throw new Error("Admin sessions are not configured");
  return s;
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

/** 12-hour signed token: "<email>|<expiry>.<hmac>" */
export async function issueAdminToken(email: string): Promise<string> {
  const payload = `${email}|${Date.now() + 12 * 60 * 60 * 1000}`;
  return `${b64url(new TextEncoder().encode(payload))}.${await sign(payload)}`;
}

export async function adminEmailFromToken(token: unknown): Promise<string | null> {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [head, sig] = token.split(".");
  if (!head || !sig) return null;
  let payload: string;
  try {
    payload = atob(head.replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return null;
  }
  if ((await sign(payload)) !== sig) return null;
  const [email, expRaw] = payload.split("|");
  if (!email || !expRaw) return null;
  if (Number(expRaw) < Date.now()) return null;
  return email;
}

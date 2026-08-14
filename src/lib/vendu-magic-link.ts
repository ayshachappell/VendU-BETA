/** Handles the emailed verification link when it lands on the site root.
 *  Works on desktop browsers and mobile in-app email browsers alike. */

const RETURN_BUILD_KEY = "vendu_return_build";
const STUDENT_KEY = { main: "vendu_student_v1", beta: "vendu_beta_student_v1" } as const;

type Build = keyof typeof STUDENT_KEY;

function emailFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { email?: string };
    return payload.email ?? null;
  } catch {
    return null;
  }
}

function targetBuild(params: URLSearchParams): Build {
  const fromUrl = params.get("build");
  if (fromUrl === "beta" || fromUrl === "main") return fromUrl;
  try {
    const stored = localStorage.getItem(RETURN_BUILD_KEY);
    if (stored === "beta" || stored === "main") return stored;
  } catch {
    /* storage blocked */
  }
  return "main";
}

/** Returns true when the URL was a verification return and navigation started. */
export function handleMagicLinkReturn(): boolean {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const token = hash.get("access_token");
  const error = hash.get("error") ?? hash.get("error_code") ?? query.get("error");
  if (!token && !error) return false;

  const build = targetBuild(query.has("build") ? query : hash);
  const base = `/${build}/index.html`;

  if (token) {
    const email = emailFromJwt(token);
    if (email) {
      try {
        localStorage.setItem(
          STUDENT_KEY[build],
          JSON.stringify({ email, at: Date.now(), build }),
        );
      } catch {
        /* storage blocked */
      }
      window.location.replace(`${base}#verified`);
      return true;
    }
  }

  window.location.replace(`${base}?verify=expired`);
  return true;
}

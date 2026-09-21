import { createFileRoute } from "@tanstack/react-router";
import {
  isVerifiedStudent,
  json,
  logAttempt,
  normalizeAccessEmail,
  normalizePassword,
  passwordLogin,
  requireStudent,
  setPasswordWithToken,
  signOutEverywhere,
  touchStudent,
} from "@/lib/edu-verification.server";

function bearer(request: Request): string {
  const m = /^Bearer\s+(.+)$/i.exec((request.headers.get("authorization") ?? "").trim());
  return (m?.[1] ?? "").trim();
}

/** Password sign-in for students who already verified their school email. */
export const Route = createFileRoute("/api/public/auth/password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }
        const action = String(body["action"] ?? "").slice(0, 24);

        /* Log in with email + password — no school-email screen needed.
           Company addresses (CEO, admin, @venduapp.com testers) sign in
           with the email alone. */
        if (action === "login") {
          const email = normalizeAccessEmail(body["email"]);
          if (!email) return json({ ok: false, message: "Enter your email." }, 400);

          if (isInternalEmail(email)) {
            await logAttempt(email, "login");
            const internal = await internalLogin(email);
            if (!internal.ok) return json({ ok: false, message: internal.message }, 401);
            await recordStudent(email, normalizeBuild(body["build"]), null);
            await touchStudent(email);
            return json({ ok: true, email, internal: true, session: internal.session });
          }

          const password = normalizePassword(body["password"]);
          if (!password)
            return json({ ok: false, message: "Enter your email and password." }, 400);
          await logAttempt(email, "login");
          if (!(await isVerifiedStudent(email)))
            return json(
              {
                ok: false,
                message: "Verify your school email first, then set a password.",
              },
              401,
            );
          const result = await passwordLogin(email, password);
          if (!result.ok) return json({ ok: false, message: result.message }, 401);
          await touchStudent(email);
          return json({ ok: true, email, session: result.session });
        }


        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const token = bearer(request);

        /* Create or change the password on the signed-in account. */
        if (action === "set") {
          const password = normalizePassword(body["password"]);
          const confirm = normalizePassword(body["confirm"]);
          if (!password)
            return json({ ok: false, message: "Use at least 8 characters." }, 400);
          if (password !== confirm)
            return json({ ok: false, message: "Both passwords have to match." }, 400);
          const result = await setPasswordWithToken(token, password);
          if (!result.ok) return json({ ok: false, message: result.message }, 400);
          return json({ ok: true });
        }

        /* Signed out everywhere — for a lost or replaced phone. */
        if (action === "logoutAll") {
          const ok = await signOutEverywhere(token);
          if (!ok)
            return json({ ok: false, message: "Could not sign out the other devices." }, 502);
          return json({ ok: true });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

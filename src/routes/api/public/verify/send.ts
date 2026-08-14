import { createFileRoute } from "@tanstack/react-router";
import {
  json,
  logAttempt,
  normalizeEduEmail,
  requestEmailCode,
  tooManyRequests,
} from "@/lib/edu-verification.server";

export const Route = createFileRoute("/api/public/verify/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, message: "Invalid request." }, 400);
        }
        const email = normalizeEduEmail((body as { email?: unknown })?.email);
        if (!email) {
          return json(
            { ok: false, message: "Use your college email — it has to end in .edu" },
            400,
          );
        }
        if (await tooManyRequests(email)) {
          return json(
            { ok: false, message: "Too many codes requested. Try again in an hour." },
            429,
          );
        }
        await logAttempt(email, "send");
        const origin = new URL(request.url).origin;
        const allowed = ["/main/index.html", "/beta/index.html"];
        const path = (body as { path?: unknown })?.path;
        const returnPath = typeof path === "string" && allowed.includes(path) ? path : "/";
        const result = await requestEmailCode(email, origin + returnPath);
        if (!result.ok) {
          return json({ ok: false, message: result.message }, 502);
        }
        return json({ ok: true });
      },
    },
  },
});

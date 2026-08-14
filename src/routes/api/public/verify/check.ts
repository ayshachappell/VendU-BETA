import { createFileRoute } from "@tanstack/react-router";
import {
  json,
  logAttempt,
  normalizeBuild,
  normalizeCode,
  normalizeEduEmail,
  recordStudent,
  verifyEmailCode,
} from "@/lib/edu-verification.server";

export const Route = createFileRoute("/api/public/verify/check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Invalid request." }, 400);
        }
        const email = normalizeEduEmail(body["email"]);
        const code = normalizeCode(body["code"]);
        if (!email) return json({ ok: false, message: "Enter your .edu email again." }, 400);
        if (!code) return json({ ok: false, message: "Enter the 6-digit code." }, 400);

        await logAttempt(email, "check");
        const result = await verifyEmailCode(email, code);
        if (!result.ok) return json({ ok: false, message: result.message }, 401);

        const gradYearRaw = body["gradYear"];
        const gradYear = typeof gradYearRaw === "string" && /^\d{4}$/.test(gradYearRaw)
          ? gradYearRaw
          : null;
        await recordStudent(email, normalizeBuild(body["build"]), gradYear);

        return json({ ok: true, email, session: result.session });
      },
    },
  },
});

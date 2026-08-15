import { createFileRoute } from "@tanstack/react-router";
import {
  emailFromAccessToken,
  json,
  normalizeAccessEmail,
  normalizeBuild,
  recordStudent,
} from "@/lib/edu-verification.server";

/** Called when a student opens the emailed sign-in link. Records the verification
 *  server-side so the original device/tab can unlock even if the link opened
 *  inside a mail app's in-app browser. */
export const Route = createFileRoute("/api/public/verify/confirm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Invalid request." }, 400);
        }
        const token = typeof body["token"] === "string" ? body["token"] : "";
        if (!token) return json({ ok: false, message: "Missing token." }, 400);

        const rawEmail = await emailFromAccessToken(token);
        const email = rawEmail ? normalizeAccessEmail(rawEmail) : null;
        if (!email) return json({ ok: false, message: "That link is no longer valid." }, 401);

        const gradYearRaw = body["gradYear"];
        const gradYear =
          typeof gradYearRaw === "string" && /^\d{4}$/.test(gradYearRaw) ? gradYearRaw : null;
        await recordStudent(email, normalizeBuild(body["build"]), gradYear);
        return json({ ok: true, email });
      },
    },
  },
});

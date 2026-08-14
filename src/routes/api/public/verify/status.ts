import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/edu-verification.server";

/** Health check: confirms the backend is reachable and whether tester access is set up.
 *  Returns booleans only — never any address or key. */
export const Route = createFileRoute("/api/public/verify/status")({
  server: {
    handlers: {
      GET: async () => {
        const founderCount = (process.env["FOUNDER_EMAILS"] ?? "")
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean).length;
        return json({
          ok: true,
          authConfigured: Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_PUBLISHABLE_KEY"]),
          testerAccessConfigured: founderCount > 0,
          testerCount: founderCount,
        });
      },
    },
  },
});

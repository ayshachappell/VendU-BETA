import { createFileRoute } from "@tanstack/react-router";
import {
  isVerifiedStudent,
  json,
  normalizeAccessEmail,
  normalizeBuild,
} from "@/lib/edu-verification.server";

function str(v: unknown, max = 600): string {
  return String(v ?? "").trim().slice(0, max);
}

const KINDS = ["profile", "listing", "post", "message", "storefront"];

/**
 * Trust & safety: students flag a profile or listing. Reports land in the
 * moderation console and are emailed-through by support at
 * support@venduapp.com. GET returns the public block list so hidden or
 * removed content disappears from every device.
 */
export const Route = createFileRoute("/api/public/report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const build = normalizeBuild(new URL(request.url).searchParams.get("build"));
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("moderation_blocks")
          .select("kind,target_id,action")
          .eq("build", build)
          .limit(2000);
        return json({ ok: true, blocks: data ?? [] });
      },
      POST: async ({ request }) => {
        let raw: Record<string, unknown>;
        try {
          raw = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }

        const email = normalizeAccessEmail(raw["email"]);
        if (!email) return json({ ok: false, message: "Sign in to report content." }, 401);
        if (!(await isVerifiedStudent(email))) {
          return json({ ok: false, message: "Verify your .edu email first." }, 401);
        }

        const kind = str(raw["kind"], 20).toLowerCase();
        const targetId = str(raw["targetId"], 120);
        const reason = str(raw["reason"], 80);
        if (!KINDS.includes(kind) || !targetId || !reason) {
          return json({ ok: false, message: "Pick what's wrong and try again." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("content_reports").insert({
          kind,
          target_id: targetId,
          target_name: str(raw["targetName"], 120) || null,
          build: normalizeBuild(raw["build"]),
          campus: str(raw["campus"], 120) || null,
          reporter_email: email,
          reason,
          details: str(raw["details"], 1000) || null,
        });
        if (error) return json({ ok: false, message: "Could not send that report." }, 500);
        return json({ ok: true });
      },
    },
  },
});

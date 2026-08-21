import { createFileRoute } from "@tanstack/react-router";
import {
  isCeoEmail,
  json,
  normalizeBuild,
  requestEmailCode,
  verifyEmailCode,
} from "@/lib/edu-verification.server";
import { adminEmailFromToken, issueAdminToken } from "@/lib/admin-session.server";

function str(v: unknown, max = 400): string {
  return String(v ?? "").trim().slice(0, max);
}

/**
 * Moderation console API. Access is limited to CEO / admin addresses, proven
 * with a one-time code emailed to that address; the console then holds a
 * signed 12-hour token.
 */
export const Route = createFileRoute("/api/public/admin/moderate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: Record<string, unknown>;
        try {
          raw = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }
        const action = str(raw["action"], 32);

        // --- sign in -------------------------------------------------------
        if (action === "login") {
          const email = str(raw["email"], 254).toLowerCase();
          if (!email || !isCeoEmail(email)) {
            return json({ ok: false, message: "That address is not an admin." }, 403);
          }
          const res = await requestEmailCode(email);
          if (!res.ok) return json({ ok: false, message: res.message }, 429);
          return json({ ok: true });
        }

        if (action === "loginVerify") {
          const email = str(raw["email"], 254).toLowerCase();
          const code = str(raw["code"], 10).replace(/\D/g, "");
          if (!email || !isCeoEmail(email)) {
            return json({ ok: false, message: "That address is not an admin." }, 403);
          }
          const res = await verifyEmailCode(email, code);
          if (!res.ok) return json({ ok: false, message: res.message }, 401);
          return json({ ok: true, token: await issueAdminToken(email), email });
        }

        // --- everything below requires a valid admin token -----------------
        const adminEmail = await adminEmailFromToken(raw["token"]);
        if (!adminEmail || !isCeoEmail(adminEmail)) {
          return json({ ok: false, message: "Admin sign-in required." }, 401);
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "list") {
          const status = str(raw["status"], 16) || "open";
          const [reports, blocks] = await Promise.all([
            supabaseAdmin
              .from("content_reports")
              .select("*")
              .eq("status", status)
              .order("created_at", { ascending: false })
              .limit(200),
            supabaseAdmin
              .from("moderation_blocks")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(200),
          ]);
          return json({ ok: true, reports: reports.data ?? [], blocks: blocks.data ?? [] });
        }

        if (action === "act") {
          // decision: hide | remove | dismiss | restore
          const decision = str(raw["decision"], 16);
          const id = str(raw["reportId"], 60);
          const kind = str(raw["kind"], 20);
          const targetId = str(raw["targetId"], 120);
          const build = normalizeBuild(raw["build"]);

          if (decision === "hide" || decision === "remove") {
            if (!kind || !targetId) return json({ ok: false, message: "Missing target." }, 400);
            await supabaseAdmin.from("moderation_blocks").upsert(
              {
                kind,
                target_id: targetId,
                build,
                action: decision === "remove" ? "deleted" : "hidden",
                reason: str(raw["note"], 300) || null,
              },
              { onConflict: "kind,target_id,build" },
            );
          } else if (decision === "restore") {
            await supabaseAdmin
              .from("moderation_blocks")
              .delete()
              .eq("kind", kind)
              .eq("target_id", targetId)
              .eq("build", build);
          }

          if (id) {
            await supabaseAdmin
              .from("content_reports")
              .update({
                status: decision === "dismiss" ? "dismissed" : "actioned",
                admin_note: str(raw["note"], 300) || null,
                resolved_at: new Date().toISOString(),
              })
              .eq("id", id);
          }
          return json({ ok: true });
        }

        if (action === "deleteAccount") {
          const email = str(raw["email"], 254).toLowerCase();
          if (!email) return json({ ok: false, message: "Missing email." }, 400);
          await Promise.all([
            supabaseAdmin.from("bookings").delete().eq("student_email", email),
            supabaseAdmin.from("reviews").delete().eq("student_email", email),
            supabaseAdmin.from("referrals").delete().eq("referred_email", email),
            supabaseAdmin.from("verification_attempts").delete().eq("email", email),
          ]);
          await supabaseAdmin.from("students").delete().eq("email", email);
          return json({ ok: true });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

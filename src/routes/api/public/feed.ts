import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";
import { cleanUrl, homeDomainFor, ensureProfile, safeDomain, str } from "@/lib/vendu-core.server";

type Body = Record<string, unknown>;

const KINDS = ["item", "request", "event", "service", "promo"];

/** The shared campus feed: posts, likes and comments everyone can see. */
export const Route = createFileRoute("/api/public/feed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: Body;
        try {
          raw = (await request.json()) as Body;
        } catch {
          return json({ ok: false, message: "Bad request." }, 400);
        }
        const action = str(raw["action"], 24);
        const build = normalizeBuild(raw["build"]);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "list") {
          const domain = safeDomain(raw["domain"]);
          if (!domain) return json({ ok: true, posts: [] });
          /* Posts drop off the feed after 10 days; sellers keep them on their profile. */
          const since = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
          const { data } = await supabaseAdmin
            .from("posts")
            .select("*")
            .eq("build", build)
            .eq("campus_domain", domain)
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(120);
          const rows = (data ?? []) as Record<string, unknown>[];
          const ids = rows.map((r) => r["id"] as string);
          const authors = [...new Set(rows.map((r) => String(r["author_email"] ?? "").toLowerCase()).filter(Boolean))];
          let likes: Record<string, unknown>[] = [];
          let comments: Record<string, unknown>[] = [];
          let profiles: Record<string, unknown>[] = [];
          if (ids.length || authors.length) {
            const [l, c, p] = await Promise.all([
              supabaseAdmin.from("post_likes").select("post_id,student_email").in("post_id", ids),
              supabaseAdmin
                .from("post_comments")
                .select("*")
                .in("post_id", ids)
                .order("created_at", { ascending: true }),
              authors.length
                ? supabaseAdmin.from("profiles").select("email,avatar_url,last_seen_at").in("email", authors)
                : Promise.resolve({ data: [] }),
            ]);
            likes = (l.data ?? []) as Record<string, unknown>[];
            comments = (c.data ?? []) as Record<string, unknown>[];
            profiles = (p.data ?? []) as Record<string, unknown>[];
          }
          const profileByEmail = new Map(profiles.map((p) => [String(p["email"] ?? "").toLowerCase(), p]));
          const me = str(raw["me"], 254).toLowerCase();
          return json({
            ok: true,
            posts: rows.map((p) => {
              const pid = p["id"];
              const author = profileByEmail.get(String(p["author_email"] ?? "").toLowerCase());
              const mine = likes.filter((l) => l["post_id"] === pid);
              return {
                id: pid,
                authorEmail: p["author_email"],
                authorName: p["author_name"] ?? "",
                authorAvatar: author?.["avatar_url"] ?? "",
                authorLive: (Date.parse(String(author?.["last_seen_at"] ?? "")) || 0) > Date.now() - 2 * 60 * 1000,
                kind: p["kind"],
                title: p["title"],
                body: p["body"] ?? "",
                priceLabel: p["price_label"] ?? "",
                imageUrl: p["image_url"] ?? "",
                badges: p["badges"] ?? [],
                vendorId: p["vendor_id"],
                eventId: p["event_id"],
                sold: !!p["sold"],
                auto: !!p["auto"],
                createdAt: p["created_at"],
                likes: mine.length,
                likedByMe: !!me && mine.some((l) => l["student_email"] === me),
                comments: comments
                  .filter((c) => c["post_id"] === pid)
                  .map((c) => ({
                    id: c["id"],
                    email: c["student_email"],
                    name: c["author_name"] ?? "",
                    body: c["body"],
                    createdAt: c["created_at"],
                  })),
              };
            }),
          });
        }

        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;
        const profile = await ensureProfile(email);
        const studentName = str(profile?.["display_name"], 60) || email.split("@")[0] || "Student";
        const wantsVendorName = str(raw["identityMode"], 16) === "vendor";

        async function savedAuthorName(vendorId?: string | null) {
          if (!wantsVendorName && !vendorId) return studentName;
          let query = supabaseAdmin
            .from("vendors")
            .select("shop_name")
            .eq("owner_email", email)
            .eq("build", build);
          if (vendorId) query = query.eq("id", vendorId);
          const { data: vendor } = await query.maybeSingle();
          return str(vendor?.shop_name, 60) || studentName;
        }

        if (action === "post") {
          const kind = KINDS.includes(str(raw["kind"], 16)) ? str(raw["kind"], 16) : "item";
          const title = str(raw["title"], 120);
          if (!title) return json({ ok: false, message: "Add a title." }, 400);
          /* Students may post to whichever campus they are viewing; when the
             app sends no campus, it falls back to their own school. */
          const domain = safeDomain(raw["domain"]) || (await homeDomainFor(email));
          if (!domain) return json({ ok: false, message: "Pick your campus first." }, 400);
          const vendorId = str(raw["vendorId"], 64) || null;
          const authorName = await savedAuthorName(vendorId);
          const row = {
            author_email: email,
            author_name: authorName || null,
            build,
            campus_domain: domain,
            kind,
            title,
            body: str(raw["body"], 1200) || null,
            price_label: str(raw["priceLabel"], 40) || null,
            image_url: cleanUrl(raw["imageUrl"], 800000),
            badges: Array.isArray(raw["badges"])
              ? (raw["badges"] as unknown[]).slice(0, 2).map((b) => str(b, 40))
              : [],
            vendor_id: vendorId,
            event_id: str(raw["eventId"], 64) || null,
            auto: !!raw["auto"],
          };
          const { data, error } = await supabaseAdmin
            .from("posts")
            .insert(row as never)
            .select("id,created_at")
            .maybeSingle();
          if (error) return json({ ok: false, message: "Could not post that." }, 500);
          return json({ ok: true, id: data?.["id"], createdAt: data?.["created_at"] });
        }

        if (action === "like") {
          const postId = str(raw["postId"], 64);
          if (!postId) return json({ ok: false, message: "Missing post." }, 400);
          const { data: existing } = await supabaseAdmin
            .from("post_likes")
            .select("id")
            .eq("post_id", postId)
            .eq("student_email", email)
            .maybeSingle();
          if (existing) {
            await supabaseAdmin.from("post_likes").delete().eq("id", existing["id"] as string);
          } else {
            await supabaseAdmin.from("post_likes").insert({ post_id: postId, student_email: email });
          }
          const { count } = await supabaseAdmin
            .from("post_likes")
            .select("id", { count: "exact", head: true })
            .eq("post_id", postId);
          return json({ ok: true, liked: !existing, likes: count ?? 0 });
        }

        if (action === "comment") {
          const postId = str(raw["postId"], 64);
          const body = str(raw["body"], 600);
          if (!postId || !body) return json({ ok: false, message: "Write a comment first." }, 400);
          const { data } = await supabaseAdmin
            .from("post_comments")
            .insert({
              post_id: postId,
              student_email: email,
              author_name: (await savedAuthorName()) || null,
              body,
            })
            .select("id,created_at")
            .maybeSingle();
          return json({ ok: true, id: data?.["id"], createdAt: data?.["created_at"] });
        }

        if (action === "delete") {
          const postId = str(raw["postId"], 64);
          if (!postId) return json({ ok: false, message: "Missing post." }, 400);
          const { data } = await supabaseAdmin
            .from("posts")
            .delete()
            .eq("id", postId)
            .eq("author_email", email)
            .select("id");
          if (!data?.length) return json({ ok: false, message: "That isn't your post." }, 403);
          return json({ ok: true });
        }

        if (action === "sold") {
          const postId = str(raw["postId"], 64);
          if (!postId) return json({ ok: false, message: "Missing post." }, 400);
          await supabaseAdmin
            .from("posts")
            .update({ sold: raw["sold"] === false ? false : true })
            .eq("id", postId)
            .eq("author_email", email);
          return json({ ok: true });
        }

        if (action === "mine") {
          const { data } = await supabaseAdmin
            .from("posts")
            .select("*")
            .eq("build", build)
            .eq("author_email", email)
            .order("created_at", { ascending: false })
            .limit(100);
          return json({ ok: true, posts: data ?? [] });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

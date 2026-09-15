import { createFileRoute } from "@tanstack/react-router";
import { json, normalizeBuild, requireStudent } from "@/lib/edu-verification.server";
import {
  cleanUrl,
  domainForEmail,
  homeDomainFor,
  ensureProfile,
  qualifyReferralFor,
  safeDomain,
  str,
} from "@/lib/vendu-core.server";

type Body = Record<string, unknown>;

type ServiceIn = {
  id?: unknown;
  title?: unknown;
  price?: unknown;
  priceLabel?: unknown;
  description?: unknown;
  promo?: unknown;
  promoEndsAt?: unknown;
};

function shapeVendor(
  v: Record<string, unknown>,
  services: Record<string, unknown>[],
  photos: Record<string, unknown>[],
) {
  return {
    id: v["id"],
    ownerEmail: v["owner_email"],
    campusDomain: v["campus_domain"],
    shopName: v["shop_name"],
    tagline: v["tagline"] ?? "",
    category: v["category"] ?? "",
    accentColor: v["accent_color"] ?? "",
    layout: v["layout"] ?? "window",
    avatarUrl: v["avatar_url"] ?? "",
    badges: v["badges"] ?? [],
    availability: v["availability"] ?? "",
    payments: v["payments"] ?? {},
    boosted: !!v["boosted"],
    createdAt: v["created_at"],
    services: services
      .filter((s) => s["vendor_id"] === v["id"])
      .map((s) => ({
        id: s["id"],
        title: s["title"],
        priceCents: s["price_cents"],
        priceLabel: s["price_label"] ?? "",
        description: s["description"] ?? "",
        promo: s["promo"] ?? "",
        promoEndsAt: s["promo_ends_at"],
      })),
    photos: photos
      .filter((p) => p["vendor_id"] === v["id"])
      .map((p) => ({
        id: p["id"],
        url: p["url"],
        caption: p["caption"] ?? "",
        serviceId: p["service_id"],
      })),
  };
}

/** Real storefronts: published once, visible to everyone on that campus. */
export const Route = createFileRoute("/api/public/vendor")({
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

        async function loadVendors(filter: { domain?: string; id?: string; owner?: string }) {
          let q = supabaseAdmin
            .from("vendors")
            .select("*")
            .eq("build", build)
            .order("boosted", { ascending: false })
            .order("updated_at", { ascending: false })
            .limit(200);
          if (filter.domain) q = q.eq("campus_domain", filter.domain);
          if (filter.id) q = q.eq("id", filter.id);
          if (filter.owner) q = q.eq("owner_email", filter.owner);
          if (!filter.owner) q = q.eq("published", true);
          const { data: vendors } = await q;
          const rows = (vendors ?? []) as Record<string, unknown>[];
          if (!rows.length) return [];
          const ids = rows.map((r) => r["id"] as string);
          const [{ data: services }, { data: photos }] = await Promise.all([
            supabaseAdmin
              .from("vendor_services")
              .select("*")
              .in("vendor_id", ids)
              .order("sort_order", { ascending: true }),
            supabaseAdmin
              .from("vendor_photos")
              .select("*")
              .in("vendor_id", ids)
              .order("sort_order", { ascending: true }),
          ]);
          return rows.map((r) =>
            shapeVendor(
              r,
              (services ?? []) as Record<string, unknown>[],
              (photos ?? []) as Record<string, unknown>[],
            ),
          );
        }

        if (action === "list") {
          const domain = safeDomain(raw["domain"]);
          if (!domain) return json({ ok: true, vendors: [] });
          return json({ ok: true, vendors: await loadVendors({ domain }) });
        }

        if (action === "get") {
          const id = str(raw["id"], 64);
          if (!id) return json({ ok: false, message: "Missing storefront." }, 400);
          const list = await loadVendors({ id });
          return json({ ok: true, vendor: list[0] ?? null });
        }

        const auth = await requireStudent(request);
        if ("response" in auth) return auth.response;
        const email = auth.email;

        if (action === "mine") {
          const list = await loadVendors({ owner: email });
          return json({ ok: true, vendor: list[0] ?? null });
        }

        if (action === "publish") {
          const shopName = str(raw["shopName"], 60);
          if (!shopName) return json({ ok: false, message: "Give your storefront a name." }, 400);
          /* A storefront lives on the owner's own campus, not the one being viewed. */
          const domain = (await homeDomainFor(email)) || safeDomain(raw["campusDomain"]);
          if (!domain) return json({ ok: false, message: "Pick your campus first." }, 400);

          const badges = Array.isArray(raw["badges"])
            ? (raw["badges"] as unknown[]).slice(0, 2).map((b) => str(b, 40))
            : [];
          const payments =
            raw["payments"] && typeof raw["payments"] === "object"
              ? (raw["payments"] as Record<string, unknown>)
              : {};

          const row = {
            owner_email: email,
            build,
            campus_domain: domain,
            shop_name: shopName,
            tagline: str(raw["tagline"], 140) || null,
            category: str(raw["category"], 40) || null,
            accent_color: /^#[0-9a-f]{6}$/i.test(str(raw["accentColor"], 7))
              ? str(raw["accentColor"], 7)
              : null,
            layout: str(raw["layout"], 20) || "window",
            avatar_url: cleanUrl(raw["avatarUrl"], 800000),
            badges,
            availability: str(raw["availability"], 160) || null,
            payments,
            published: raw["published"] === undefined ? true : !!raw["published"],
          };

          const { data: saved, error } = await supabaseAdmin
            .from("vendors")
            .upsert(row as never, { onConflict: "owner_email,build" })
            .select("*")
            .maybeSingle();
          if (error || !saved)
            return json({ ok: false, message: "Could not publish your storefront." }, 500);
          const vendorId = saved["id"] as string;

          if (Array.isArray(raw["services"])) {
            const services = (raw["services"] as ServiceIn[]).slice(0, 30);
            await supabaseAdmin.from("vendor_services").delete().eq("vendor_id", vendorId);
            const rows = services
              .map((s, i) => ({
                vendor_id: vendorId,
                title: str(s.title, 80),
                price_cents: Number.isFinite(Number(s.price))
                  ? Math.max(0, Math.round(Number(s.price) * 100))
                  : null,
                price_label: str(s.priceLabel, 40) || null,
                description: str(s.description, 400) || null,
                promo: str(s.promo, 40) || null,
                promo_ends_at: s.promoEndsAt ? new Date(String(s.promoEndsAt)).toISOString() : null,
                sort_order: i,
              }))
              .filter((s) => s.title);
            if (rows.length) await supabaseAdmin.from("vendor_services").insert(rows);
          }

          if (Array.isArray(raw["photos"])) {
            await supabaseAdmin.from("vendor_photos").delete().eq("vendor_id", vendorId);
            const rows = (raw["photos"] as unknown[])
              .slice(0, 12)
              .map((p, i) => {
                const obj = (p && typeof p === "object" ? p : { url: p }) as Record<string, unknown>;
                return {
                  vendor_id: vendorId,
                  url: cleanUrl(obj["url"], 800000) ?? "",
                  caption: str(obj["caption"], 120) || null,
                  sort_order: i,
                };
              })
              .filter((p) => p.url);
            if (rows.length) await supabaseAdmin.from("vendor_photos").insert(rows);
          }

          await ensureProfile(email);
          await supabaseAdmin
            .from("profiles")
            .update({ vendor_mode: true, last_seen_at: new Date().toISOString() })
            .eq("email", email);
          /* Publishing a storefront is what makes an invite count. */
          await qualifyReferralFor(email);

          const list = await loadVendors({ owner: email });
          return json({ ok: true, vendor: list[0] ?? null });
        }

        if (action === "unpublish") {
          await supabaseAdmin
            .from("vendors")
            .update({ published: false })
            .eq("owner_email", email)
            .eq("build", build);
          return json({ ok: true });
        }

        return json({ ok: false, message: "Unknown action." }, 400);
      },
    },
  },
});

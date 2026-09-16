import { createFileRoute } from "@tanstack/react-router";
import GEO from "@/data/school-geo.json";
import { lookupSchool, prettyFromDomain, canonicalDomain } from "@/lib/campus.server";

type Geo = [string, number, number, string];
const ROWS = GEO as Geo[];

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function miles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function nearest(lat: number, lng: number, limit: number) {
  const scored = ROWS.map((r) => ({
    domain: canonicalDomain(r[0]),
    name: lookupSchool(r[0])?.n ?? r[3] ?? prettyFromDomain(r[0]),
    distance: Math.round(miles(lat, lng, r[1], r[2]) * 10) / 10,
  }));
  scored.sort((a, b) => a.distance - b.distance);
  const seen = new Set<string>();
  const out: typeof scored = [];
  for (const s of scored) {
    if (seen.has(s.domain)) continue;
    seen.add(s.domain);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

async function handle(lat: number, lng: number, limit: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ ok: false, message: "Invalid location" }, { status: 400, headers: NO_STORE_HEADERS });
  }
  const results = nearest(lat, lng, Math.min(Math.max(limit || 5, 1), 15));
  return Response.json({ ok: true, results, nearest: results[0] ?? null }, { headers: NO_STORE_HEADERS });
}

/** Closest real campuses to a set of coordinates (bundled IPEDS locations). */
export const Route = createFileRoute("/api/public/campus/nearest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams;
        return handle(Number(p.get("lat")), Number(p.get("lng")), Number(p.get("limit")));
      },
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          /* empty body is fine */
        }
        return handle(Number(body["lat"]), Number(body["lng"]), Number(body["limit"]));
      },
    },
  },
});

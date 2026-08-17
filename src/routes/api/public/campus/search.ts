import { createFileRoute } from "@tanstack/react-router";
import { searchSchools } from "@/lib/campus.server";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/** Autocomplete school names from the bundled U.S. dataset. */
export const Route = createFileRoute("/api/public/campus/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          /* empty body is fine */
        }
        const q = typeof body["q"] === "string" ? body["q"] : "";
        return Response.json(
          { ok: true, results: searchSchools(q) },
          { headers: NO_STORE_HEADERS },
        );
      },
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get("q") ?? "";
        return Response.json(
          { ok: true, results: searchSchools(q) },
          { headers: NO_STORE_HEADERS },
        );
      },
    },
  },
});

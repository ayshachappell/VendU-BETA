import { createFileRoute } from "@tanstack/react-router";
import { requireStudent } from "@/lib/edu-verification.server";

/** Per-student daily cap so the paid AI gateway can't be drained. */
const DAILY_AUTOFILL_CAP = 40;

/** AI product auto-fill: a seller's photo becomes a title, category, description and price. */
const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Shoes",
  "Books",
  "Dorm & home",
  "Beauty",
  "Sports & outdoors",
  "Food",
  "Other",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/ai/autofill")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Send a photo to analyze." }, 400);
        }

        const image = typeof body["image"] === "string" ? body["image"] : "";
        if (!image.startsWith("data:image/") && !/^https:\/\//.test(image)) {
          return json({ ok: false, message: "Add a photo of the item first." }, 400);
        }
        if (image.length > 8_000_000) {
          return json({ ok: false, message: "That photo is too large. Try a smaller one." }, 400);
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return json({ ok: false, message: "AI auto-fill isn't configured yet." }, 500);
        }

        const prompt =
          "You are helping a college student list a second-hand item on a campus marketplace. " +
          "Look at the photo and reply with ONLY a JSON object, no markdown, with these keys: " +
          `title (short listing title, max 45 chars), category (exactly one of: ${CATEGORIES.join(", ")}), ` +
          "description (2-3 friendly sentences covering what it is, condition visible in the photo, and who it suits), " +
          "price (a fair used campus resale price in US dollars as a string like \"$25\"), " +
          "confidence (\"high\", \"medium\" or \"low\"). " +
          "If the photo does not clearly show a sellable item, set confidence to \"low\" and keep fields generic.";

        let res: Response;
        try {
          res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "google/gemini-3.8-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: image } },
                  ],
                },
              ],
            }),
          });
        } catch {
          return json({ ok: false, message: "Couldn't reach the AI service. Try again." }, 502);
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let message = "AI auto-fill is unavailable right now. Fill the details in yourself.";
          if (res.status === 429) message = "AI auto-fill is busy. Wait a moment and try again.";
          if (res.status === 402) message = "AI auto-fill is out of credits. Add credits to keep using it.";
          return json({ ok: false, message, detail: text.slice(0, 300) }, res.status);
        }

        const data = (await res.json().catch(() => null)) as
          | { choices?: Array<{ message?: { content?: string } }> }
          | null;
        const raw = data?.choices?.[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          return json({ ok: false, message: "Couldn't read that photo. Try a clearer one." }, 200);
        }

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(match[0]) as Record<string, unknown>;
        } catch {
          return json({ ok: false, message: "Couldn't read that photo. Try a clearer one." }, 200);
        }

        const str = (v: unknown, max: number) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";
        const category = str(parsed["category"], 40);
        const price = str(parsed["price"], 12);

        return json({
          ok: true,
          title: str(parsed["title"], 60),
          category: CATEGORIES.includes(category) ? category : "Other",
          description: str(parsed["description"], 600),
          price: price ? (price.startsWith("$") ? price : "$" + price.replace(/[^0-9.]/g, "")) : "",
          confidence: str(parsed["confidence"], 10) || "medium",
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { handleMagicLinkReturn } from "@/lib/vendu-magic-link";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VendU Beta — Campus Marketplace" },
      {
        name: "description",
        content:
          "Open the VendU beta and join the campus marketplace for students at every college and trade school.",
      },
      { property: "og:title", content: "VendU Beta — Campus Marketplace" },
      {
        property: "og:description",
        content:
          "Sell your stuff, book a service, get paid — try the VendU beta now.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BetaRedirect,
});

function BetaRedirect() {
  useEffect(() => {
    // A verification link lands here first — consume the token before leaving.
    if (handleMagicLinkReturn()) return;
    window.location.replace("/beta/index.html");
  }, []);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Opening VendU Beta…</p>
        <a href="/beta/index.html" className="mt-3 inline-block text-sm font-semibold underline">
          Tap here if nothing happens
        </a>
      </div>
    </main>
  );
}


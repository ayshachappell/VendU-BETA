import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

/** Convenience URL: /beta -> the beta build. */
export const Route = createFileRoute("/beta")({
  head: () => ({
    meta: [
      { title: "The VendU App Beta — Test the Marketplace" },
      {
        name: "description",
        content:
          "Open the VendU beta build, verify your .edu email and send feedback straight from the app.",
      },
      { property: "og:title", content: "The VendU App Beta — Test the Marketplace" },
      {
        property: "og:description",
        content: "Open the VendU beta build and help test the students-only campus marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BetaRedirect,
});

function BetaRedirect() {
  useEffect(() => {
    window.location.replace("/beta/index.html");
  }, []);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Opening the VendU beta…</p>
        <a href="/beta/index.html" className="mt-3 inline-block text-sm font-semibold underline">
          Tap here if nothing happens
        </a>
      </div>
    </main>
  );
}

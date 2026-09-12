import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

/** Convenience URL: /app -> the main build. */
export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Open The VendU App — Campus Marketplace" },
      {
        name: "description",
        content:
          "Launch the VendU app: book student vendors, buy and trade goods, and run your campus life.",
      },
      { property: "og:title", content: "Open The VendU App — Campus Marketplace" },
      {
        property: "og:description",
        content: "Launch the VendU campus marketplace app in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppRedirect,
});

function AppRedirect() {
  useEffect(() => {
    window.location.replace("/main/index.html");
  }, []);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Opening VendU…</p>
        <a href="/main/index.html" className="mt-3 inline-block text-sm font-semibold underline">
          Tap here if nothing happens
        </a>
      </div>
    </main>
  );
}

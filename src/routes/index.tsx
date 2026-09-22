import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { handleMagicLinkReturn } from "@/lib/vendu-magic-link";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The VendU App Beta — Campus Marketplace for Students" },
      {
        name: "description",
        content:
          "Join The VendU App beta: sell your stuff, book a service and get paid on your campus marketplace.",
      },
      { property: "og:title", content: "The VendU App Beta — Campus Marketplace for Students" },
      {
        property: "og:description",
        content:
          "Sell your stuff, book a service, get paid — on your campus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MainRedirect,
});

function MainRedirect() {
  useEffect(() => {
    // A verification link lands here first — consume the token before leaving.
    if (handleMagicLinkReturn()) return;
    window.location.replace("/beta/index.html");
  }, []);
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#331174", color: "#ffffff" }}
    >
      <div>
        <p className="text-sm opacity-80">Opening The VendU App…</p>
        <a
          href="/beta/index.html"
          className="mt-3 inline-block text-sm font-semibold underline"
          style={{ color: "#ffffff" }}
        >
          Tap here if nothing happens
        </a>
      </div>
    </main>
  );
}


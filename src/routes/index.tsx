import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { handleMagicLinkReturn } from "@/lib/vendu-magic-link";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VendU — Sell Your Stuff, Book a Service, Get Paid" },
      {
        name: "description",
        content:
          "VendU is the campus marketplace made for students at every college and trade school. Sell your stuff, book a classmate's service, and get paid. Free with your school email.",
      },
      { property: "og:title", content: "VendU — sell your stuff, book a service, get paid." },
      {
        property: "og:description",
        content:
          "The campus marketplace for students. Sell your stuff, book a service, get paid — free to join with your .edu email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "manifest", href: "/manifest.webmanifest" }],
  }),

  component: Landing,
});

const features = [
  {
    emoji: "🔎",
    title: "Find & book",
    text: "Braids, fades, tutoring, prints, meal preps — book real student vendors on your campus.",
  },
  {
    emoji: "🛍️",
    title: "Buy, sell & trade",
    text: "Textbooks, dorm gear, sneakers. Post in seconds, trade with people you actually see.",
  },
  {
    emoji: "🎓",
    title: "VendUniversity",
    text: "Communities, groups, class planner, campus routes and guides for starting a business.",
  },
];

function Landing() {
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    setReturning(handleMagicLinkReturn());
  }, []);

  if (returning) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Verifying your email — opening VendU…</p>
      </main>
    );
  }

  return (

    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-14 text-center">
        <img
          src="/icons/icon-192.png"
          alt="VendU app icon"
          width={72}
          height={72}
          className="rounded-2xl shadow-lg"
        />
        <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Where campus hustles get seen
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          VendU is the students-only marketplace for your school. Verify with any{" "}
          <strong className="text-foreground">.edu</strong> email and you&rsquo;re in — free,
          forever.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/main/index.html"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open VendU
          </a>
          <a
            href="/beta/index.html"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Open the Beta build
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Works in any browser. On your phone, tap Share &rarr; Add to Home Screen to install it
          like an app.
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {features.map((f) => (
          <article key={f.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="text-3xl">{f.emoji}</div>
            <h2 className="mt-3 text-lg font-bold">{f.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

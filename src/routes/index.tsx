import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VendU — Where Campus Hustles Get Seen" },
      {
        name: "description",
        content:
          "VendU is the students-only campus marketplace: find and book student services, buy, sell and trade, and run your school life. Free, .edu verified.",
      },
      { property: "og:title", content: "VendU — Where Campus Hustles Get Seen" },
      {
        property: "og:description",
        content:
          "The students-only campus marketplace. Book student vendors, buy and trade goods, join campus communities. Verified with your .edu email.",
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

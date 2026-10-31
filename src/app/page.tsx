import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

export default async function HomePage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);
  const first = sections[0];

  return (
    <SiteShell
      sections={sections}
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <section style={{ maxWidth: "38rem", paddingTop: "12vh" }}>
        <h1
          className="brand"
          style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", margin: 0 }}
        >
          {site.title}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "1rem", fontSize: "1.1rem" }}>
          {site.description}
        </p>
        {first ? (
          <p style={{ marginTop: "2rem" }}>
            <Link
              href={`/${first.slug}`}
              className="buy-button"
              style={{ textDecoration: "underline", textUnderlineOffset: "0.2em" }}
            >
              Enter gallery ▷
            </Link>
          </p>
        ) : null}
      </section>
    </SiteShell>
  );
}

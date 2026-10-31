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
      <section style={{ maxWidth: "40rem", paddingTop: "10vh" }}>
        <h1 className="page-heading" style={{ marginBottom: "1rem" }}>
          {site.title}
        </h1>
        <p className="lede" style={{ margin: 0 }}>
          {site.description}
        </p>
        {first ? (
          <p style={{ marginTop: "2.25rem" }}>
            <Link className="buy-button" href={`/${first.slug}`}>
              Enter gallery ▷
            </Link>
          </p>
        ) : null}
      </section>
    </SiteShell>
  );
}

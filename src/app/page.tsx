import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import {
  getLatestWorks,
  getNavSections,
  getSiteMeta,
} from "@/lib/content/store";

export default async function HomePage() {
  const [sections, site, latest] = await Promise.all([
    getNavSections(),
    getSiteMeta(),
    getLatestWorks(8),
  ]);

  return (
    <SiteShell
      sections={sections}
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <p className="home-latest-label">Latest</p>
      {latest.length === 0 ? (
        <p className="lede">No works yet.</p>
      ) : (
        <div className="latest-masonry">
          {latest.map((work) => {
            const cover = [...work.images].sort(
              (a, b) => a.sortOrder - b.sortOrder,
            )[0];
            const href = `/${work.sectionSlug}/${work.slug}`;
            return (
              <Link key={work.id} href={href} className="latest-item">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover.url}
                    alt={work.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="latest-placeholder" />
                )}
                <div className="latest-meta">
                  <h2 className="work-title">{work.title}</h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}

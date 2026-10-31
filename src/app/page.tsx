import { SiteShell } from "@/components/SiteShell";
import { WorkBlock } from "@/components/WorkBlock";
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
        latest.map((work) => (
          <WorkBlock
            key={work.id}
            work={work}
            sectionSlug={work.sectionSlug}
          />
        ))
      )}
    </SiteShell>
  );
}

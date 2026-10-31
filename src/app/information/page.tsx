import { SiteShell } from "@/components/SiteShell";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

export default async function InformationPage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);

  return (
    <SiteShell
      sections={sections}
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <article style={{ maxWidth: "40rem" }}>
        <h1 className="work-title" style={{ marginBottom: "1.5rem" }}>
          Information
        </h1>
        <div className="work-meta">{site.description}</div>
      </article>
    </SiteShell>
  );
}

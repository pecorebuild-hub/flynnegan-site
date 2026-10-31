import { SiteShell } from "@/components/SiteShell";
import { InformationContent } from "@/content/information";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

export default async function InformationPage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);

  return (
    <SiteShell
      sections={sections}
      activeSection="information"
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <InformationContent />
    </SiteShell>
  );
}

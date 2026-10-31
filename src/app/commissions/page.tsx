import { SiteShell } from "@/components/SiteShell";
import { CommissionsContent } from "@/content/commissions";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

export default async function CommissionsPage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);

  return (
    <SiteShell
      sections={sections}
      activeSection="commissions"
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <CommissionsContent />
    </SiteShell>
  );
}

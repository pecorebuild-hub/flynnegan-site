import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { CommissionsContent } from "@/content/commissions";
import { getNavSections, getSiteMeta } from "@/lib/content/store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Private Commissions",
  description:
    "Private custom digital artwork by Flynn Egan — graphic sketches, full digital paintings, and VIP museum-print packages.",
  path: "/commissions",
});

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

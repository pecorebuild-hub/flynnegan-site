import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { InformationContent } from "@/content/information";
import { getNavSections, getSiteMeta } from "@/lib/content/store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Information",
  description:
    "Manifesto, series in progress, confidentiality, print standards, and contacts for Flynn Egan male erotic fine art.",
  path: "/information",
});

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

import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ContactContent } from "@/content/contact";
import { getNavSections, getSiteMeta } from "@/lib/content/store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact me",
  description:
    "Contact Flynn Egan for acquisitions and private commissions via Bluesky, FetLife, or email.",
  path: "/contact",
});

export default async function ContactPage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);

  return (
    <SiteShell
      sections={sections}
      activeSection="contact"
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <ContactContent />
    </SiteShell>
  );
}

import { SiteShell } from "@/components/SiteShell";
import { ContactContent } from "@/content/contact";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

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

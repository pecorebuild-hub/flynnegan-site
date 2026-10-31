import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { WorkBlock } from "@/components/WorkBlock";
import {
  getNavSections,
  getSectionBySlug,
  getSiteMeta,
  getWorksBySectionSlug,
} from "@/lib/content/store";

type Props = {
  params: Promise<{ section: string }>;
};

export default async function SectionPage({ params }: Props) {
  const { section: sectionSlug } = await params;
  const reserved = new Set([
    "admin",
    "api",
    "commissions",
    "information",
    "contact",
    "preview",
    "work",
  ]);
  if (reserved.has(sectionSlug)) notFound();

  const section = await getSectionBySlug(sectionSlug);
  if (!section) notFound();

  const [sections, works, site] = await Promise.all([
    getNavSections(),
    getWorksBySectionSlug(sectionSlug),
    getSiteMeta(),
  ]);

  return (
    <SiteShell
      sections={sections}
      activeSection={section.slug}
      brandTitle={site.title}
      tagline={site.tagline}
    >
      {works.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No works in this section yet.</p>
      ) : (
        works.map((work) => (
          <WorkBlock key={work.id} work={work} sectionSlug={section.slug} />
        ))
      )}
    </SiteShell>
  );
}

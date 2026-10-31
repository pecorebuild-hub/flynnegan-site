import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { WorkBlock } from "@/components/WorkBlock";
import {
  getNavSections,
  getSectionBySlug,
  getSiteMeta,
  getWorkBySlug,
} from "@/lib/content/store";

type Props = {
  params: Promise<{ section: string; work: string }>;
};

export default async function WorkPage({ params }: Props) {
  const { section: sectionSlug, work: workSlug } = await params;
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

  const work = await getWorkBySlug(workSlug);
  if (!work || work.sectionSlug !== section.slug) notFound();

  const [sections, site] = await Promise.all([
    getNavSections(),
    getSiteMeta(),
  ]);

  return (
    <SiteShell
      sections={sections}
      activeSection={section.slug}
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <WorkBlock work={work} sectionSlug={section.slug} />
    </SiteShell>
  );
}

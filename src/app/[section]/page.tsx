import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { WorkCard } from "@/components/WorkCard";
import {
  getNavSections,
  getSectionBySlug,
  getSiteMeta,
  getWorksBySectionSlug,
} from "@/lib/content/store";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ section: string }>;
};

const reserved = new Set([
  "admin",
  "api",
  "commissions",
  "information",
  "contact",
  "preview",
  "work",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  if (reserved.has(sectionSlug)) return {};
  const section = await getSectionBySlug(sectionSlug);
  if (!section) return {};
  return buildPageMetadata({
    title: section.title,
    description: `${section.title} by Flynn Egan — male erotic fine art available as limited editions.`,
    path: `/${section.slug}`,
  });
}

export default async function SectionPage({ params }: Props) {
  const { section: sectionSlug } = await params;
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
        works.map((work) => <WorkCard key={work.id} work={work} />)
      )}
    </SiteShell>
  );
}

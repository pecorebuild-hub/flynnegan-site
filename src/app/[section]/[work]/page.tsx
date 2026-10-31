import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { WorkBlock } from "@/components/WorkBlock";
import {
  getNavSections,
  getSectionBySlug,
  getSiteMeta,
  getWorkBySlug,
} from "@/lib/content/store";
import { buildPageMetadata, workJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ section: string; work: string }>;
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
  const { section: sectionSlug, work: workSlug } = await params;
  if (reserved.has(sectionSlug)) return {};
  const work = await getWorkBySlug(workSlug);
  if (!work || work.sectionSlug !== sectionSlug) return {};
  const cover = [...work.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  return buildPageMetadata({
    title: work.title,
    description:
      work.description ||
      `${work.title}${work.series ? ` — ${work.series}` : ""} by Flynn Egan.`,
    path: `/${work.sectionSlug}/${work.slug}`,
    images: cover ? [cover.url] : undefined,
  });
}

export default async function WorkPage({ params }: Props) {
  const { section: sectionSlug, work: workSlug } = await params;
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
      <JsonLd data={workJsonLd(work)} />
      <WorkBlock work={work} sectionSlug={section.slug} />
    </SiteShell>
  );
}

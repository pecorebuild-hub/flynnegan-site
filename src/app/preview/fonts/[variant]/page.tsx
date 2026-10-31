import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAttr } from "@/components/FontAttr";
import { SiteShell } from "@/components/SiteShell";
import { WorkBlock } from "@/components/WorkBlock";
import {
  FONT_VARIANTS,
  isFontVariantId,
} from "@/lib/fonts";
import {
  getNavSections,
  getSiteMeta,
  getWorksBySectionSlug,
} from "@/lib/content/store";

type Props = {
  params: Promise<{ variant: string }>;
};

export default async function FontPreviewPage({ params }: Props) {
  const { variant } = await params;
  if (!isFontVariantId(variant)) notFound();

  const [sections, site, works] = await Promise.all([
    getNavSections(),
    getSiteMeta(),
    getWorksBySectionSlug("prints"),
  ]);

  const variants = Object.values(FONT_VARIANTS);

  return (
    <>
      <FontAttr variant={variant} />
      <div className="font-preview-bar">
        <strong>Font preview:</strong>
        {variants.map((item) => (
          <Link
            key={item.id}
            href={`/preview/fonts/${item.id}`}
            className={item.id === variant ? "active" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <span style={{ color: "var(--muted)" }}>
          Active: {FONT_VARIANTS[variant].label}
        </span>
      </div>
      <SiteShell
        sections={sections}
        activeSection="prints"
        brandTitle={site.title}
        tagline={site.tagline}
      >
        {works.slice(0, 1).map((work) => (
          <WorkBlock key={work.id} work={work} sectionSlug="prints" />
        ))}
      </SiteShell>
    </>
  );
}

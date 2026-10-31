import Link from "next/link";
import { Gallery } from "./Gallery";
import type { SiteWork } from "@/lib/types";

type Props = {
  work: SiteWork;
  sectionSlug: string;
};

export function WorkBlock({ work, sectionSlug }: Props) {
  const priceLabel = work.price
    ? work.price.startsWith("$")
      ? work.price
      : `$${work.price}`
    : null;

  return (
    <article id={work.slug} className="work-block">
      <div className="work-header">
        <h2 className="work-title">{work.title}</h2>
        <h2 className="work-index">
          <Link href={`/${sectionSlug}#`}>Index</Link>
        </h2>
      </div>

      <div className="work-meta">
        {work.series ? (
          <>
            <span className="work-series-label">Series</span>
            <em className="work-series-name">{work.series}</em>
            {"\n\n"}
          </>
        ) : null}
        {work.description}
        {"\n\n"}
        {work.buyUrl && priceLabel ? (
          <a
            className="buy-button"
            href={work.buyUrl}
            target="_blank"
            rel="noreferrer"
          >
            {priceLabel} Buy ▷
          </a>
        ) : null}
      </div>

      <Gallery images={work.images} />
    </article>
  );
}

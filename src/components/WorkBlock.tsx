import { BackLink } from "./BackLink";
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
        <h1 className="work-title work-title-page">{work.title}</h1>
        <h2 className="work-index">
          <BackLink href={`/${sectionSlug}`} />
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
        {work.edition ? `\n\n${work.edition}` : null}
        {work.longDescription ? `\n\n${work.longDescription}` : null}
        {work.buyUrl && priceLabel ? (
          <>
            {"\n\n"}
            <a
              className="buy-button"
              href={work.buyUrl}
              target="_blank"
              rel="noreferrer"
            >
              {priceLabel} Buy ▷
            </a>
          </>
        ) : null}
      </div>

      <Gallery images={work.images} />
    </article>
  );
}

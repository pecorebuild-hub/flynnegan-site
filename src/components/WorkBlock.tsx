import { BackLink } from "./BackLink";
import { Gallery } from "./Gallery";
import { TextBlocks } from "./TextBlocks";
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
          <p>
            <span className="work-series-label">Series</span>
            <em className="work-series-name">{work.series}</em>
          </p>
        ) : null}
        <TextBlocks text={work.description} />
        {work.year ? <p>{work.year}</p> : null}
        {work.edition ? <p>{work.edition}</p> : null}
        <TextBlocks text={work.longDescription} />
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

import { BackLink } from "./BackLink";
import { Gallery } from "./Gallery";
import { TextBlocks } from "./TextBlocks";
import type { SiteWork } from "@/lib/types";
import { workHasAltFormat } from "@/lib/types";

type Props = {
  work: SiteWork;
  sectionSlug: string;
};

function priceLabel(price: string | null) {
  if (!price) return null;
  return price.startsWith("$") ? price : `$${price}`;
}

export function WorkBlock({ work, sectionSlug }: Props) {
  const primaryPrice = priceLabel(work.price);
  const altPrice = priceLabel(work.altPrice);
  const showAlt = workHasAltFormat(work);

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
        {work.year ? <p className="work-meta-dim">{work.year}</p> : null}
        {work.edition ? <p className="work-meta-dim">{work.edition}</p> : null}
        <TextBlocks text={work.longDescription} />
        {work.buyUrl && primaryPrice ? (
          <a
            className="buy-button"
            href={work.buyUrl}
            target="_blank"
            rel="noreferrer"
          >
            {primaryPrice} Buy ▷
          </a>
        ) : null}
      </div>

      <Gallery images={work.images} />

      {showAlt ? (
        <section className="work-alt">
          <hr className="rule" />
          {work.altLabel ? (
            <h2 className="work-alt-label">{work.altLabel}</h2>
          ) : null}
          <div className="work-meta">
            <TextBlocks text={work.altDescription} />
            {work.altEdition ? <p>{work.altEdition}</p> : null}
            <TextBlocks text={work.altLongDescription} />
            {work.altBuyUrl && altPrice ? (
              <a
                className="buy-button"
                href={work.altBuyUrl}
                target="_blank"
                rel="noreferrer"
              >
                {altPrice} Buy ▷
              </a>
            ) : null}
          </div>
          {work.altImages?.length ? (
            <Gallery images={work.altImages} />
          ) : null}
        </section>
      ) : null}
    </article>
  );
}

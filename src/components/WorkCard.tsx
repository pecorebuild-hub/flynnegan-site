import Link from "next/link";
import { BackLink } from "./BackLink";
import { TextBlocks } from "./TextBlocks";
import type { SiteWork } from "@/lib/types";
import { workHasAltFormat } from "@/lib/types";

type Props = {
  work: SiteWork;
};

function priceLabel(price: string | null) {
  if (!price) return null;
  return price.startsWith("$") ? price : `$${price}`;
}

export function WorkCard({ work }: Props) {
  const cover = [...work.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const href = `/${work.sectionSlug}/${work.slug}`;
  const primaryPrice = priceLabel(work.price);
  const altPrice = priceLabel(work.altPrice);
  const showAlt = workHasAltFormat(work);

  return (
    <article className="work-card">
      <div className="work-header">
        <h2 className="work-title">
          <Link href={href}>{work.title}</Link>
        </h2>
        <h2 className="work-index">
          <BackLink href="/" />
        </h2>
      </div>

      <div className="work-meta">
        <TextBlocks text={work.description} />
        {work.year ? <p>{work.year}</p> : null}
        {work.edition ? <p>{work.edition}</p> : null}
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
        {showAlt ? (
          <>
            {work.altLabel ? (
              <p className="work-alt-inline-label">{work.altLabel}</p>
            ) : null}
            <TextBlocks text={work.altDescription} />
            {work.altEdition ? <p>{work.altEdition}</p> : null}
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
          </>
        ) : null}
      </div>

      {cover ? (
        <Link href={href} className="work-card-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.url} alt={cover.caption || work.title} loading="lazy" />
        </Link>
      ) : null}
    </article>
  );
}

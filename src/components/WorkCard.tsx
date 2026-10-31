import Link from "next/link";
import { BackLink } from "./BackLink";
import { TextBlocks } from "./TextBlocks";
import type { SiteWork } from "@/lib/types";

type Props = {
  work: SiteWork;
};

export function WorkCard({ work }: Props) {
  const cover = [...work.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const href = `/${work.sectionSlug}/${work.slug}`;
  const priceLabel = work.price
    ? work.price.startsWith("$")
      ? work.price
      : `$${work.price}`
    : null;

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
        {work.edition ? <p>{work.edition}</p> : null}
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

      {cover ? (
        <Link href={href} className="work-card-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.url} alt={cover.caption || work.title} loading="lazy" />
        </Link>
      ) : null}
    </article>
  );
}

import type { Metadata } from "next";
import type { SiteWork } from "./types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://gayart.studio";

export const SITE_NAME = "Flynn Egan. Male Erotic Art";
export const SITE_TAGLINE =
  "Gay BDSM Erotic Art | Prints & Private Commissions";
export const SITE_DESCRIPTION =
  "Erotic Male Fine Art by Flynn Egan — Japanese Gothic prints, aluminium plaques, and private commissions exploring male desire, power, and dark romanticism.";

export const SITE_KEYWORDS = [
  "Flynn Egan",
  "male erotic art",
  "gay art prints",
  "BDSM art",
  "queer fine art",
  "Japanese Gothic",
  "gay erotic prints",
  "Hahnemühle fine art",
  "aluminium art plaques",
  "private art commissions",
  "dark romanticism",
  "male nude art",
];

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  images,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const pageTitle = title || SITE_NAME;
  const desc = description || SITE_DESCRIPTION;
  const url = absoluteUrl(path);
  const ogImages = (images?.length ? images : []).map((src) => ({
    url: absoluteUrl(src),
  }));

  return {
    title: title
      ? pageTitle
      : {
          absolute: SITE_NAME,
        },
    description: desc,
    keywords: SITE_KEYWORDS,
    authors: [{ name: "Flynn Egan", url: SITE_URL }],
    creator: "Flynn Egan",
    publisher: "Flynn Egan",
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: pageTitle,
      description: desc,
      ...(ogImages.length ? { images: ogImages } : {}),
    },
    twitter: {
      card: ogImages.length ? "summary_large_image" : "summary",
      title: pageTitle,
      description: desc,
      ...(ogImages.length ? { images: ogImages.map((i) => i.url) } : {}),
    },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Flynn Egan",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    jobTitle: "Fine Artist",
    knowsAbout: [
      "Male erotic art",
      "Japanese Gothic",
      "Fine art prints",
      "Private commissions",
      "Queer aesthetics",
    ],
    sameAs: [
      "https://bsky.app/profile/flynnflynnegan.bsky.social",
      "https://fetlife.com/Maitre_Flynn",
      "https://throne.com/flynnegan/",
      "https://www.artmajeur.com/flynn-egan-9092466",
      "https://objkt.com/users/tz1YbjHhB9sdjpAKPmb5hphGAR4LHW3Todtm",
    ],
    email: "mailto:flynnflynn.egan@gmail.com",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Person",
      name: "Flynn Egan",
    },
    inLanguage: "en",
  };
}

export function workJsonLd(work: SiteWork) {
  const cover = [...work.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const pageUrl = absoluteUrl(`/${work.sectionSlug}/${work.slug}`);
  const images = [
    ...work.images.map((img) => img.url),
    ...(work.altImages || []).map((img) => img.url),
  ];

  const offers = [];
  if (work.buyUrl && work.price) {
    offers.push({
      "@type": "Offer",
      url: work.buyUrl,
      price: work.price.replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      name: work.altLabel ? "Print edition" : work.title,
    });
  }
  if (work.altBuyUrl && work.altPrice) {
    offers.push({
      "@type": "Offer",
      url: work.altBuyUrl,
      price: work.altPrice.replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      name: work.altLabel || "Alternate edition",
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: work.title,
    url: pageUrl,
    description:
      work.longDescription ||
      work.description ||
      `${work.title} by Flynn Egan`,
    creator: {
      "@type": "Person",
      name: "Flynn Egan",
      url: SITE_URL,
    },
    ...(work.year ? { dateCreated: work.year } : {}),
    ...(work.series ? { artform: work.series } : {}),
    ...(work.description ? { artMedium: work.description } : {}),
    ...(cover ? { image: cover.url } : {}),
    ...(images.length ? { contentUrl: images } : {}),
    ...(offers.length ? { offers } : {}),
  };
}

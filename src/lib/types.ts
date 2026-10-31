export type SiteSection = {
  id: number;
  slug: string;
  title: string;
  sortOrder: number;
  showInNav: boolean;
};

export type SiteWorkImage = {
  id: number;
  workId: number;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type SiteWork = {
  id: number;
  sectionId: number;
  sectionSlug: string;
  sectionTitle: string;
  slug: string;
  title: string;
  series: string | null;
  /** Short copy shown on section listings (size, medium, etc.) */
  description: string | null;
  /** Longer copy shown only on the work page */
  longDescription: string | null;
  /** e.g. Ed. 10/10 */
  edition: string | null;
  /** e.g. 2026 */
  year: string | null;
  price: string | null;
  buyUrl: string | null;
  prodigiSku: string | null;
  sortOrder: number;
  published: boolean;
  images: SiteWorkImage[];
};

export type SiteContent = {
  sections: SiteSection[];
  works: SiteWork[];
  site: {
    title: string;
    tagline: string;
    description: string;
  };
};

export function splitBrandTitle(title: string): { line1: string; line2: string } {
  const dot = title.indexOf(".");
  if (dot === -1) return { line1: title, line2: "" };
  return {
    line1: title.slice(0, dot + 1).trim(),
    line2: title.slice(dot + 1).trim(),
  };
}

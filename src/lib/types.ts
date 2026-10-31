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
  description: string | null;
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

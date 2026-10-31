import { promises as fs } from "fs";
import path from "path";
import type { SiteContent, SiteSection, SiteWork, SiteWorkImage } from "../types";
import { slugify } from "../slug";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_PATH = path.join(DATA_DIR, "content.json");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

type SeedFile = {
  sections: Array<{
    slug: string;
    title: string;
    sortOrder: number;
    showInNav: boolean;
  }>;
  works: Array<{
    sectionSlug: string;
    slug: string;
    title: string;
    series: string | null;
    description: string | null;
    longDescription?: string | null;
    edition?: string | null;
    year?: string | null;
    price: string | null;
    buyUrl: string | null;
    prodigiSku?: string | null;
    altLabel?: string | null;
    altDescription?: string | null;
    altLongDescription?: string | null;
    altEdition?: string | null;
    altPrice?: string | null;
    altBuyUrl?: string | null;
    altProdigiSku?: string | null;
    sortOrder: number;
    images: Array<{
      url: string;
      caption: string;
      sortOrder: number;
    }>;
    altImages?: Array<{
      url: string;
      caption: string;
      sortOrder: number;
    }>;
  }>;
  site: SiteContent["site"];
};

function mapImages(
  list: Array<{ url: string; caption?: string | null; sortOrder?: number }> | undefined,
  workId: number,
  startId: number,
): { images: SiteWorkImage[]; nextId: number } {
  let imageId = startId;
  const images: SiteWorkImage[] = (list || []).map((img, idx) => ({
    id: imageId++,
    workId,
    url: img.url,
    caption: img.caption || null,
    sortOrder: img.sortOrder ?? idx,
  }));
  return { images, nextId: imageId };
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function seedToContent(seed: SeedFile): SiteContent {
  const sections: SiteSection[] = seed.sections.map((s, i) => ({
    id: i + 1,
    slug: s.slug,
    title: s.title,
    sortOrder: s.sortOrder,
    showInNav: s.showInNav,
  }));

  const sectionBySlug = new Map(sections.map((s) => [s.slug, s]));
  let workId = 1;
  let imageId = 1;

  const works: SiteWork[] = seed.works.map((w) => {
    const section = sectionBySlug.get(w.sectionSlug);
    if (!section) {
      throw new Error(`Unknown section slug: ${w.sectionSlug}`);
    }
    const id = workId++;
    const primary = mapImages(w.images, id, imageId);
    imageId = primary.nextId;
    const alt = mapImages(w.altImages, id, imageId);
    imageId = alt.nextId;
    return {
      id,
      sectionId: section.id,
      sectionSlug: section.slug,
      sectionTitle: section.title,
      slug: w.slug,
      title: w.title,
      series: w.series,
      description: w.description,
      longDescription: w.longDescription ?? null,
      edition: w.edition ?? null,
      year: w.year ?? null,
      price: w.price,
      buyUrl: w.buyUrl,
      prodigiSku: w.prodigiSku ?? null,
      altLabel: w.altLabel ?? null,
      altDescription: w.altDescription ?? null,
      altLongDescription: w.altLongDescription ?? null,
      altEdition: w.altEdition ?? null,
      altPrice: w.altPrice ?? null,
      altBuyUrl: w.altBuyUrl ?? null,
      altProdigiSku: w.altProdigiSku ?? null,
      sortOrder: w.sortOrder,
      published: true,
      images: primary.images,
      altImages: alt.images,
    };
  });

  return { sections, works, site: seed.site };
}

function normalizeContent(content: SiteContent): SiteContent {
  return {
    ...content,
    works: content.works.map((work) => ({
      ...work,
      longDescription: work.longDescription ?? null,
      edition: work.edition ?? null,
      year: work.year ?? null,
      altLabel: work.altLabel ?? null,
      altDescription: work.altDescription ?? null,
      altLongDescription: work.altLongDescription ?? null,
      altEdition: work.altEdition ?? null,
      altPrice: work.altPrice ?? null,
      altBuyUrl: work.altBuyUrl ?? null,
      altProdigiSku: work.altProdigiSku ?? null,
      altImages: work.altImages || [],
    })),
  };
}

const BLOB_CONTENT_PATH = "content/site.json";

async function readBlobContent(): Promise<SiteContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { list } = await import("@vercel/blob");
    const result = await list({
      prefix: BLOB_CONTENT_PATH,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const blob = result.blobs.find((item) => item.pathname === BLOB_CONTENT_PATH);
    if (!blob) return null;
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as SiteContent;
  } catch {
    return null;
  }
}

async function writeBlobContent(content: SiteContent): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  const { put } = await import("@vercel/blob");
  await put(BLOB_CONTENT_PATH, JSON.stringify(content, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return true;
}

async function loadSeedContent(): Promise<SiteContent> {
  const seed = await readJson<SeedFile>(SEED_PATH);
  return seedToContent(seed);
}

export async function ensureContent(): Promise<SiteContent> {
  const fromBlob = await readBlobContent();
  if (fromBlob) return normalizeContent(fromBlob);

  try {
    await fs.access(CONTENT_PATH);
    return normalizeContent(await readJson<SiteContent>(CONTENT_PATH));
  } catch {
    const content = await loadSeedContent();
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
    } catch {
      // read-only FS (e.g. Vercel) — return seed in-memory
    }
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await writeBlobContent(content);
    }
    return content;
  }
}

export async function readContent(): Promise<SiteContent> {
  return ensureContent();
}

export async function writeContent(content: SiteContent): Promise<void> {
  const wroteBlob = await writeBlobContent(content);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
  } catch {
    if (!wroteBlob) {
      throw new Error(
        "Cannot persist content: set BLOB_READ_WRITE_TOKEN for Vercel or use a writable filesystem locally.",
      );
    }
  }
}

export async function getNavSections() {
  const content = await readContent();
  return content.sections
    .filter((s) => s.showInNav)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSectionBySlug(slug: string) {
  const content = await readContent();
  return content.sections.find((s) => s.slug === slug) ?? null;
}

export async function getWorksBySectionSlug(slug: string) {
  const content = await readContent();
  return content.works
    .filter((w) => w.sectionSlug === slug && w.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getWorkBySlug(slug: string) {
  const content = await readContent();
  return content.works.find((w) => w.slug === slug && w.published) ?? null;
}

export async function getAllWorks() {
  const content = await readContent();
  return content.works.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Newest first by id (auto-increment on create). */
export async function getLatestWorks(limit = 6) {
  const content = await readContent();
  return content.works
    .filter((w) => w.published)
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

export async function getSiteMeta() {
  const content = await readContent();
  return content.site;
}

function nextId(items: { id: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export async function createSection(input: {
  title: string;
  slug?: string;
  showInNav?: boolean;
}) {
  const content = await readContent();
  const slug = input.slug || slugify(input.title);
  if (content.sections.some((s) => s.slug === slug)) {
    throw new Error("Section slug already exists");
  }
  const section: SiteSection = {
    id: nextId(content.sections),
    slug,
    title: input.title,
    sortOrder: content.sections.length + 1,
    showInNav: input.showInNav ?? true,
  };
  content.sections.push(section);
  await writeContent(content);
  return section;
}

export async function updateSection(
  id: number,
  patch: Partial<Pick<SiteSection, "title" | "slug" | "sortOrder" | "showInNav">>,
) {
  const content = await readContent();
  const section = content.sections.find((s) => s.id === id);
  if (!section) throw new Error("Section not found");
  Object.assign(section, patch);
  for (const work of content.works) {
    if (work.sectionId === id) {
      work.sectionSlug = section.slug;
      work.sectionTitle = section.title;
    }
  }
  await writeContent(content);
  return section;
}

export async function deleteSection(id: number) {
  const content = await readContent();
  content.sections = content.sections.filter((s) => s.id !== id);
  content.works = content.works.filter((w) => w.sectionId !== id);
  await writeContent(content);
}

export type WorkInput = {
  sectionId: number;
  title: string;
  slug?: string;
  series?: string | null;
  description?: string | null;
  longDescription?: string | null;
  edition?: string | null;
  year?: string | null;
  price?: string | null;
  buyUrl?: string | null;
  prodigiSku?: string | null;
  altLabel?: string | null;
  altDescription?: string | null;
  altLongDescription?: string | null;
  altEdition?: string | null;
  altPrice?: string | null;
  altBuyUrl?: string | null;
  altProdigiSku?: string | null;
  published?: boolean;
  images?: Array<{ url: string; caption?: string | null; sortOrder?: number }>;
  altImages?: Array<{ url: string; caption?: string | null; sortOrder?: number }>;
};

export async function createWork(input: WorkInput) {
  const content = await readContent();
  const section = content.sections.find((s) => s.id === input.sectionId);
  if (!section) throw new Error("Section not found");

  let slug = input.slug || slugify(input.title);
  const existing = new Set(content.works.map((w) => w.slug));
  if (existing.has(slug)) {
    let i = 2;
    while (existing.has(`${slug}-${i}`)) i += 1;
    slug = `${slug}-${i}`;
  }

  const id = nextId(content.works);
  const imageBase = nextId(
    content.works.flatMap((w) => [...w.images, ...(w.altImages || [])]),
  );
  const primary = mapImages(input.images, id, imageBase);
  const alt = mapImages(input.altImages, id, primary.nextId);

  const work: SiteWork = {
    id,
    sectionId: section.id,
    sectionSlug: section.slug,
    sectionTitle: section.title,
    slug,
    title: input.title,
    series: input.series ?? null,
    description: input.description ?? null,
    longDescription: input.longDescription ?? null,
    edition: input.edition ?? null,
    year: input.year ?? null,
    price: input.price ?? null,
    buyUrl: input.buyUrl ?? null,
    prodigiSku: input.prodigiSku ?? null,
    altLabel: input.altLabel ?? null,
    altDescription: input.altDescription ?? null,
    altLongDescription: input.altLongDescription ?? null,
    altEdition: input.altEdition ?? null,
    altPrice: input.altPrice ?? null,
    altBuyUrl: input.altBuyUrl ?? null,
    altProdigiSku: input.altProdigiSku ?? null,
    sortOrder:
      content.works.filter((w) => w.sectionId === section.id).length + 1,
    published: input.published ?? true,
    images: primary.images,
    altImages: alt.images,
  };
  content.works.push(work);
  await writeContent(content);
  return work;
}

export async function updateWork(
  id: number,
  patch: Partial<
    Omit<SiteWork, "id" | "images" | "altImages" | "sectionSlug" | "sectionTitle">
  > & {
    images?: SiteWorkImage[];
    altImages?: SiteWorkImage[];
  },
) {
  const content = await readContent();
  const work = content.works.find((w) => w.id === id);
  if (!work) throw new Error("Work not found");

  if (patch.sectionId && patch.sectionId !== work.sectionId) {
    const section = content.sections.find((s) => s.id === patch.sectionId);
    if (!section) throw new Error("Section not found");
    work.sectionId = section.id;
    work.sectionSlug = section.slug;
    work.sectionTitle = section.title;
  }

  const { images, altImages, sectionId: _s, ...rest } = patch;
  Object.assign(work, rest);
  if (images) work.images = images;
  if (altImages) work.altImages = altImages;
  await writeContent(content);
  return work;
}

export async function deleteWork(id: number) {
  const content = await readContent();
  content.works = content.works.filter((w) => w.id !== id);
  await writeContent(content);
}

export async function resetFromSeed() {
  const content = await loadSeedContent();
  await writeContent(content);
  return content;
}

export async function createWorksBatch(input: {
  sectionId: number;
  series?: string | null;
  description?: string | null;
  longDescription?: string | null;
  edition?: string | null;
  year?: string | null;
  prodigiSku?: string | null;
  sharedImages?: Array<{ url: string; caption?: string | null }>;
  rows: Array<{
    title: string;
    price?: string | null;
    buyUrl?: string | null;
    description?: string | null;
    edition?: string | null;
    year?: string | null;
  }>;
}) {
  const content = await readContent();
  const section = content.sections.find((s) => s.id === Number(input.sectionId));
  if (!section) throw new Error("Section not found");

  const rows = input.rows.filter((row) => row.title?.trim());
  if (!rows.length) {
    throw new Error("Add at least one row with a title");
  }

  const created: SiteWork[] = [];
  const existingSlugs = new Set(content.works.map((w) => w.slug));
  let nextWorkId = nextId(content.works);
  let nextImageId = nextId(
    content.works.flatMap((w) => [...w.images, ...(w.altImages || [])]),
  );

  for (const row of rows) {
    const title = row.title.trim();
    let slug = slugify(title);
    if (existingSlugs.has(slug)) {
      let i = 2;
      while (existingSlugs.has(`${slug}-${i}`)) i += 1;
      slug = `${slug}-${i}`;
    }
    existingSlugs.add(slug);

    const id = nextWorkId++;
    const primary = mapImages(input.sharedImages, id, nextImageId);
    nextImageId = primary.nextId;

    const work: SiteWork = {
      id,
      sectionId: section.id,
      sectionSlug: section.slug,
      sectionTitle: section.title,
      slug,
      title,
      series: input.series ?? null,
      description: row.description ?? input.description ?? null,
      longDescription: input.longDescription ?? null,
      edition: row.edition ?? input.edition ?? null,
      year: row.year ?? input.year ?? null,
      price: row.price || null,
      buyUrl: row.buyUrl || null,
      prodigiSku: input.prodigiSku ?? null,
      altLabel: null,
      altDescription: null,
      altLongDescription: null,
      altEdition: null,
      altPrice: null,
      altBuyUrl: null,
      altProdigiSku: null,
      sortOrder:
        content.works.filter((w) => w.sectionId === section.id).length +
        created.length +
        1,
      published: true,
      images: primary.images,
      altImages: [],
    };
    content.works.push(work);
    created.push(work);
  }

  await writeContent(content);
  return created;
}

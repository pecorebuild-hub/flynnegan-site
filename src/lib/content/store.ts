import { promises as fs } from "fs";
import path from "path";
import { hasDatabase } from "@/lib/db";
import {
  readDbDocument,
  writeDbDocument,
} from "@/lib/content/db-document";
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
const BLOB_CONTENT_BACKUP_PREFIX = "content/backups/site-";
/** Keep a few timestamped backups so a bad write/seed wipe is recoverable. */
const BLOB_BACKUP_LIMIT = 10;
const BLOB_PUBLIC_URL =
  process.env.BLOB_CONTENT_URL ||
  "https://yuqb8oa3slz8tt3a.public.blob.vercel-storage.com/content/site.json";

type BlobReadResult =
  | { status: "ok"; content: SiteContent }
  | { status: "missing" }
  | { status: "error"; message: string };

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function isNextDynamicBailout(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; digests?: string; digest?: string };
  return (
    err.digest === "DYNAMIC_SERVER_USAGE" ||
    (typeof err.message === "string" &&
      err.message.includes("Dynamic server usage"))
  );
}

async function readBlobContent(): Promise<BlobReadResult> {
  // Prefer direct public URL — avoids list() flakiness and works at runtime.
  try {
    const response = await fetch(BLOB_PUBLIC_URL, {
      cache: "no-store",
      // Next may still mark the route dynamic; callers must allow that.
    });
    if (response.status === 404) {
      // Fall through to token list in case the public URL/env is wrong.
    } else if (response.ok) {
      return {
        status: "ok",
        content: (await response.json()) as SiteContent,
      };
    }
  } catch (error) {
    // Never swallow Next's dynamic-render bailout as a "blob miss".
    if (isNextDynamicBailout(error)) throw error;
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Blob read failed",
      };
    }
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) return { status: "missing" };

  try {
    const { list } = await import("@vercel/blob");
    const result = await list({
      prefix: BLOB_CONTENT_PATH,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const blob = result.blobs.find(
      (item) => item.pathname === BLOB_CONTENT_PATH,
    );
    if (!blob) return { status: "missing" };
    const response = await fetch(blob.url, { cache: "no-store" });
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) {
      return {
        status: "error",
        message: `Blob fetch failed (${response.status})`,
      };
    }
    return {
      status: "ok",
      content: (await response.json()) as SiteContent,
    };
  } catch (error) {
    if (isNextDynamicBailout(error)) throw error;
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Blob read failed",
    };
  }
}

async function pruneBlobBackups(token: string) {
  try {
    const { list, del } = await import("@vercel/blob");
    const result = await list({
      prefix: BLOB_CONTENT_BACKUP_PREFIX,
      token,
    });
    const sorted = [...result.blobs].sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
    const stale = sorted.slice(BLOB_BACKUP_LIMIT);
    if (stale.length) {
      await del(
        stale.map((item) => item.url),
        { token },
      );
    }
  } catch {
    // Backup pruning is best-effort.
  }
}

async function writeBlobContent(
  content: SiteContent,
  options?: { allowSeedOverwrite?: boolean },
): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  // Builds must never mutate live content.
  if (isBuildPhase()) return false;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const { put } = await import("@vercel/blob");
  const body = JSON.stringify(content, null, 2);

  // Snapshot + guard against accidental seed wipe of a fuller catalogue.
  try {
    const current = await readBlobContent();
    if (current.status === "ok") {
      const currentCount = current.content.works?.length ?? 0;
      const nextCount = content.works?.length ?? 0;
      if (
        !options?.allowSeedOverwrite &&
        currentCount > nextCount &&
        nextCount <= 4
      ) {
        const seed = await loadSeedContent();
        const looksLikeSeed =
          nextCount === seed.works.length &&
          content.works.every((work, i) => work.slug === seed.works[i]?.slug);
        if (looksLikeSeed) {
          throw new Error(
            `Refusing to overwrite ${currentCount} works with seed (${nextCount}). Use Reset from seed.json explicitly.`,
          );
        }
      }

      await put(
        `${BLOB_CONTENT_BACKUP_PREFIX}${Date.now()}.json`,
        JSON.stringify(current.content, null, 2),
        {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
          token,
        },
      );
      await pruneBlobBackups(token);
    }
  } catch (error) {
    if (isNextDynamicBailout(error)) throw error;
    if (
      error instanceof Error &&
      error.message.startsWith("Refusing to overwrite")
    ) {
      throw error;
    }
    // Continue with the primary write even if backup fails.
  }

  await put(BLOB_CONTENT_PATH, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token,
  });
  return true;
}

async function loadSeedContent(): Promise<SiteContent> {
  const seed = await readJson<SeedFile>(SEED_PATH);
  return seedToContent(seed);
}

/**
 * Read live content.
 * Source of truth: Postgres (Neon) when DATABASE_URL is set.
 * Blob/local are backup/dev fallbacks — never auto-write seed into DB/Blob.
 */
export async function ensureContent(): Promise<SiteContent> {
  if (hasDatabase()) {
    try {
      const fromDb = await readDbDocument();
      if (fromDb) return normalizeContent(fromDb);

      // First boot: prefer existing Blob catalogue over seed.
      const fromBlob = await readBlobContent();
      if (fromBlob.status === "ok") {
        const migrated = normalizeContent(fromBlob.content);
        if (!isBuildPhase()) {
          await writeDbDocument(migrated);
        }
        return migrated;
      }

      try {
        await fs.access(CONTENT_PATH);
        const local = normalizeContent(await readJson<SiteContent>(CONTENT_PATH));
        if (!isBuildPhase()) {
          await writeDbDocument(local);
        }
        return local;
      } catch {
        const seed = await loadSeedContent();
        // Only persist seed when DB is truly empty (first install).
        if (!isBuildPhase()) {
          await writeDbDocument(seed);
        }
        return seed;
      }
    } catch (error) {
      if (isNextDynamicBailout(error)) throw error;
      if (isBuildPhase()) {
        return loadSeedContent();
      }
      throw error;
    }
  }

  const fromBlob = await readBlobContent();
  if (fromBlob.status === "ok") return normalizeContent(fromBlob.content);
  if (fromBlob.status === "error") {
    try {
      await fs.access(CONTENT_PATH);
      return normalizeContent(await readJson<SiteContent>(CONTENT_PATH));
    } catch {
      if (isBuildPhase()) {
        return loadSeedContent();
      }
      throw new Error(
        `Cannot read site content from Blob (${fromBlob.message}). Set DATABASE_URL.`,
      );
    }
  }

  try {
    await fs.access(CONTENT_PATH);
    return normalizeContent(await readJson<SiteContent>(CONTENT_PATH));
  } catch {
    const content = await loadSeedContent();
    if (!isBuildPhase()) {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(
          CONTENT_PATH,
          JSON.stringify(content, null, 2),
          "utf8",
        );
      } catch {
        // read-only FS
      }
    }
    return content;
  }
}

export async function readContent(): Promise<SiteContent> {
  return ensureContent();
}

export async function writeContent(
  content: SiteContent,
  options?: { allowSeedOverwrite?: boolean },
): Promise<void> {
  if (isBuildPhase()) return;

  if (hasDatabase()) {
    const current = await readDbDocument();
    if (current && !options?.allowSeedOverwrite) {
      const currentCount = current.works?.length ?? 0;
      const nextCount = content.works?.length ?? 0;
      if (currentCount > nextCount && nextCount <= 4) {
        const seed = await loadSeedContent();
        const looksLikeSeed =
          nextCount === seed.works.length &&
          content.works.every((work, i) => work.slug === seed.works[i]?.slug);
        if (looksLikeSeed) {
          throw new Error(
            `Refusing to overwrite ${currentCount} works with seed (${nextCount}). Use Reset from seed.json explicitly.`,
          );
        }
      }
    }
    await writeDbDocument(content);
    // Best-effort Blob mirror for offline recovery — never the source of truth.
    try {
      await writeBlobContent(content, { allowSeedOverwrite: true });
    } catch {
      // DB write already succeeded.
    }
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
    } catch {
      // optional local mirror
    }
    return;
  }

  const wroteBlob = await writeBlobContent(content, options);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
  } catch {
    if (!wroteBlob) {
      throw new Error(
        "Cannot persist content: set DATABASE_URL (Neon) or BLOB_READ_WRITE_TOKEN.",
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
    .sort((a, b) => b.id - a.id);
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
  void _s;
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
  await writeContent(content, { allowSeedOverwrite: true });
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

import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { desc, count, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "./index";
import { subscribers, siteDocuments, type Subscriber } from "./schema";
import { SITE_DOCUMENT_ID } from "@/lib/content/db-document";
import type { SiteContent } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

let tableEnsured = false;

export async function ensureSubscribersTable(): Promise<void> {
  if (tableEnsured || !hasDatabase()) return;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL DEFAULT 'site',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure subscribers table in Neon:", err);
  }
}

async function readLocalSubscribers(): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(SUBSCRIBERS_FILE, "utf8");
    return JSON.parse(raw) as Subscriber[];
  } catch {
    return [];
  }
}

async function syncLocalMirrors(list: Subscriber[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // 1. Mirror to data/subscribers.json
    await fs.writeFile(
      SUBSCRIBERS_FILE,
      JSON.stringify(list, null, 2),
      "utf8",
    );

    // 2. Also mirror to data/content.json for total visibility
    try {
      const raw = await fs.readFile(CONTENT_FILE, "utf8");
      const content = JSON.parse(raw) as SiteContent;
      content.subscribers = list.map((s) => ({
        id: s.id,
        email: s.email,
        source: s.source,
        createdAt: new Date(s.createdAt).toISOString(),
      }));
      await fs.writeFile(
        CONTENT_FILE,
        JSON.stringify(content, null, 2),
        "utf8",
      );
    } catch {
      // Content file might not exist or be locked
    }
  } catch (err) {
    console.error("Failed to write local subscribers mirror:", err);
  }
}

async function mirrorToSiteDocuments(list: Subscriber[]): Promise<void> {
  if (!hasDatabase()) return;
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(siteDocuments)
      .where(eq(siteDocuments.id, SITE_DOCUMENT_ID))
      .limit(1);

    if (rows[0]?.content) {
      const content = rows[0].content as SiteContent;
      content.subscribers = list.map((s) => ({
        id: s.id,
        email: s.email,
        source: s.source,
        createdAt: new Date(s.createdAt).toISOString(),
      }));

      await db
        .update(siteDocuments)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(siteDocuments.id, SITE_DOCUMENT_ID));
    }
  } catch (err) {
    console.error("Failed to mirror subscribers to site_documents:", err);
  }
}

export async function addSubscriber(
  email: string,
  source: string = "site",
): Promise<{ success: boolean; alreadySubscribed: boolean; subscriber: Subscriber | null }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Invalid email address");
  }

  let savedSubscriber: Subscriber | null = null;
  let wasAlreadySubscribed = false;

  if (hasDatabase()) {
    try {
      await ensureSubscribersTable();
      const db = getDb();

      // Check if already subscribed
      const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, normalizedEmail))
        .limit(1);

      if (existing.length > 0) {
        wasAlreadySubscribed = true;
        // Update source and timestamp so test/re-entry is recorded
        const updated = await db
          .update(subscribers)
          .set({
            source: source || existing[0].source,
            createdAt: new Date(),
          })
          .where(eq(subscribers.email, normalizedEmail))
          .returning();
        savedSubscriber = updated[0] || existing[0];
      } else {
        const rows = await db
          .insert(subscribers)
          .values({
            email: normalizedEmail,
            source: source || "site",
            createdAt: new Date(),
          })
          .returning();
        savedSubscriber = rows[0] || null;
      }
    } catch (err) {
      console.error("Database insert failed, falling back to local storage:", err);
    }
  }

  // If DB was not available or failed, generate subscriber object locally
  if (!savedSubscriber) {
    const localList = await readLocalSubscribers();
    const existingIndex = localList.findIndex((s) => s.email === normalizedEmail);
    if (existingIndex >= 0) {
      wasAlreadySubscribed = true;
      localList[existingIndex] = {
        ...localList[existingIndex],
        source: source || localList[existingIndex].source,
        createdAt: new Date(),
      };
      savedSubscriber = localList[existingIndex];
    } else {
      savedSubscriber = {
        id: localList.length > 0 ? Math.max(...localList.map((s) => s.id)) + 1 : 1,
        email: normalizedEmail,
        source: source || "site",
        createdAt: new Date(),
      };
      localList.unshift(savedSubscriber);
    }
    await syncLocalMirrors(localList);
    return {
      success: true,
      alreadySubscribed: wasAlreadySubscribed,
      subscriber: savedSubscriber,
    };
  }

  // Sync to local files and site_documents mirror
  const allSubscribers = await getSubscribers();
  await syncLocalMirrors(allSubscribers);
  void mirrorToSiteDocuments(allSubscribers);

  return {
    success: true,
    alreadySubscribed: wasAlreadySubscribed,
    subscriber: savedSubscriber,
  };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  if (hasDatabase()) {
    try {
      await ensureSubscribersTable();
      const db = getDb();
      const rows = await db
        .select()
        .from(subscribers)
        .orderBy(desc(subscribers.createdAt));
      // Keep local mirror updated
      void syncLocalMirrors(rows);
      return rows;
    } catch (err) {
      console.error("Failed to fetch subscribers from DB:", err);
    }
  }
  return readLocalSubscribers();
}

export async function getSubscribersCount(): Promise<number> {
  if (hasDatabase()) {
    try {
      await ensureSubscribersTable();
      const db = getDb();
      const result = await db.select({ value: count() }).from(subscribers);
      return Number(result[0]?.value ?? 0);
    } catch {
      // Fallback
    }
  }
  const local = await readLocalSubscribers();
  return local.length;
}

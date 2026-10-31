import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db";
import { siteDocuments } from "@/lib/db/schema";
import type { SiteContent } from "@/lib/types";

export const SITE_DOCUMENT_ID = "main";

export async function readDbDocument(): Promise<SiteContent | null> {
  if (!hasDatabase()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(siteDocuments)
    .where(eq(siteDocuments.id, SITE_DOCUMENT_ID))
    .limit(1);
  return rows[0]?.content ?? null;
}

export async function writeDbDocument(content: SiteContent): Promise<void> {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not set");
  }
  const db = getDb();
  await db
    .insert(siteDocuments)
    .values({
      id: SITE_DOCUMENT_ID,
      content,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteDocuments.id,
      set: {
        content,
        updatedAt: new Date(),
      },
    });
}

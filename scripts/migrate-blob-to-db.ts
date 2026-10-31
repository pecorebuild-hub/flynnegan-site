import { config } from "dotenv";
config({ path: ".env.local" });

import { readDbDocument, writeDbDocument } from "../src/lib/content/db-document";
import type { SiteContent } from "../src/lib/types";

async function main() {
  const url =
    process.env.BLOB_CONTENT_URL ||
    "https://yuqb8oa3slz8tt3a.public.blob.vercel-storage.com/content/site.json";
  const res = await fetch(`${url}?t=${Date.now()}`);
  if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);
  const content = (await res.json()) as SiteContent;
  const existing = await readDbDocument();
  console.log(
    "db before",
    existing?.works?.length ?? null,
    "blob works",
    content.works?.length,
  );
  if (!existing) {
    await writeDbDocument(content);
    console.log("migrated blob -> db");
  } else {
    console.log("db already has content, skipped");
  }
  const after = await readDbDocument();
  console.log(
    "db after works",
    after?.works?.length,
    after?.works?.map((w) => w.title),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

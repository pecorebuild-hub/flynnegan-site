# Agent notes

- Public gallery layout mirrors Cargo: left nav, dark `#191919`, work blocks with series/buy/gallery lightbox.
- Content CRUD goes through `src/lib/content/store.ts`. Source of truth is Neon Postgres (`site_documents` JSON) via `DATABASE_URL`; Blob/local JSON are mirrors only.
- Admin password is `ADMIN_PASSWORD`; session cookie via jose in `src/lib/auth.ts`.
- Prodigi is SKU carrier lookup only, not an artwork catalogue.

# Agent notes

- Public gallery layout mirrors Cargo: left nav, dark `#191919`, work blocks with series/buy/gallery lightbox.
- Content CRUD goes through `src/lib/content/store.ts` (seed → local JSON or Vercel Blob).
- Admin password is `ADMIN_PASSWORD`; session cookie via jose in `src/lib/auth.ts`.
- Prodigi is SKU carrier lookup only, not an artwork catalogue.

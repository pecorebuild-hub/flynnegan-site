# Flynn Egan — portfolio

Next.js portfolio reconstructed from the Cargo.site layout, with a simple password-protected admin.

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (password from `ADMIN_PASSWORD`)
- Font previews: [http://localhost:3000/preview/fonts](http://localhost:3000/preview/fonts)

## Stack

- Next.js App Router + Tailwind
- Content: `data/seed.json` → local `data/content.json`, or Vercel Blob `content/site.json` when `BLOB_READ_WRITE_TOKEN` is set
- Uploads: local `public/uploads` or Vercel Blob
- Optional Prodigi SKU lookup via `PRODIGI_API_KEY` (print carrier details only)
- Drizzle schema ready for Postgres (`DATABASE_URL`) — wire when you add Neon/Vercel Postgres

## Deploy

GitHub: [pecorebuild-hub/flynnegan-site](https://github.com/pecorebuild-hub/flynnegan-site)

In the Vercel project, connect the Blob store so `BLOB_READ_WRITE_TOKEN` is injected, then set `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`.

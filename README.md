# Freela STORE

Global directory of **free online tools** (brand: Freela, domain: [freela.store](https://freela.store)). Tools run in the browser whenever the format allows it. Pages are generated from a validated tool registry — unpublished or unreviewed locales are not added to the sitemap.

## Requirements

- Node.js 22+
- npm

## Setup

```bash
npm install
cp .env.example .env.local
```

Development-only admin default (login is refused in production if this value is still set):

- Email: `admin@freela.store`
- Password: `changeme-freela`

Passwords are stored as bcrypt hashes in SQLite (`data/freela.db`).

## Develop

```bash
npm run dev
```

App: [http://127.0.0.1:43173/en](http://127.0.0.1:43173/en)

Admin: [http://127.0.0.1:43173/admin](http://127.0.0.1:43173/admin)

Health: [http://127.0.0.1:43173/api/health](http://127.0.0.1:43173/api/health)

## Test, validate, build

```bash
npm run typecheck
npm test
npm run validate
npm run qa
npm run lint
npm audit --audit-level=high
npm run e2e
npm run build
```

Or `npm run release` (typecheck, unit, validate, qa, lint, audit, e2e). Production `npm run build` also runs registry validation and SEO QA.

## What is in this ship

- 77 published tools; all `LOCAL_ONLY` (no file bytes leave the device)
- Locales: English is the only **indexable** locale. Routed UI exists for `de uk pl fr es it pt nl tr` plus live RTL chrome for `ar` and `he`, all `noindex` until native-quality QA. Remaining prepared locales stay unrouted.
- Search (registry-backed; search URLs `noindex`)
- Sitemap, robots.txt, canonical, hreflang + x-default (indexable locales only), WebApplication + FAQ + breadcrumb JSON-LD
- Admin dashboard: usage, success/error rates, languages, SEO, translation completeness, processing modes, retention, audit log, CSV export
- First-party analytics (no file contents; origin + rate limit)
- Compact cookie consent for analytics
- Legal: privacy, terms, contact, about, affiliate, acceptable use, abuse, deletion, vendors, file processing, copyright, data inventory
- Original Freela brand assets in `public/brand/` (hero, OG, social, teaser video), favicon/manifest

## Production deploy (freela.store)

1. Use Node 22 on a host that can run `next start` (or a Node platform such as a VPS, Fly, or similar). HTTPS must terminate in front of the app.
2. Set environment variables (never commit secrets):

   - `NEXT_PUBLIC_SITE_URL=https://freela.store` (apex; `www.` is redirected with 308)
   - `ADMIN_EMAIL=` a real operator address
   - `ADMIN_PASSWORD=` a long random secret (**not** `changeme-freela`)
   - `DATABASE_PATH=` a persistent volume path (for example `/var/lib/freela/freela.db`)
3. `npm ci && npm run build && npm start -- --hostname 0.0.0.0 --port 43173` (or your process manager). Put nginx/Caddy in front with TLS.
4. Confirm `https://freela.store/robots.txt` points at `https://freela.store/sitemap.xml`.
5. Back up the SQLite file. Schema is created on first boot (`src/lib/db.ts`).
6. After DNS + TLS: Search Console domain property, submit sitemap, inspect `/en` and a few tool URLs. **Indexing is not guaranteed.**

Do not put API secrets in client bundles. This release has no third-party AI keys.

## Adding a tool

1. Add an English definition under `src/data/tools/english*.ts`
2. Add translations in `src/data/tools/locale-packs.ts` (or leave locale `noindex`)
3. Implement or reuse a `runtime.kind` in `src/components/tool-runner.tsx`
4. Run `npm run validate` and add unit tests for pure logic

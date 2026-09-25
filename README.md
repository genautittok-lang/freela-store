# Freela STORE

Global directory of **free online tools** (brand: Freela, domain: [freela.store](https://freela.store)). Tools run in the browser whenever the format allows it. The 12 routed locales (`en`, `de`, `uk`, `pl`, `fr`, `es`, `it`, `pt`, `nl`, `tr`, `ar`, `he`) are included in the sitemap once tool copy, UI chrome, and CTAs exist for each.

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
- **12 indexable locales:** `en`, `de`, `uk`, `pl`, `fr`, `es`, `it`, `pt`, `nl`, `tr`, `ar`, `he` (sitemap + hreflang + x-default). Remaining prepared locales stay unrouted.
- Search (registry-backed; search URLs `noindex`)
- Sitemap, robots.txt, canonical, hreflang + x-default, WebApplication + FAQ + HowTo + Breadcrumb JSON-LD, OG/Twitter image `/brand/og.png`
- Admin dashboard: usage, success/error rates, languages, SEO, translation completeness, processing modes, retention, audit log, CSV export
- First-party analytics (no file contents; origin + rate limit)
- Compact cookie consent for analytics
- Legal: privacy, terms, contact, about, affiliate, acceptable use, abuse, deletion, vendors, file processing, copyright, data inventory
- Original Freela brand assets in `public/brand/` (hero, OG, social, teaser video), favicon/manifest

## Free continuous hosting (Vercel) + custom domain

This repo is a Next.js app. `vercel.json` sets `framework: nextjs` and `npm run build`.

**This environment has no Vercel login and no `VERCEL_TOKEN`.** A non-interactive deploy cannot run here. Use the **Publish** control in the project chat (already enabled) or deploy from your own Vercel account.

### Deploy on Vercel

1. Import the Git repository in [Vercel](https://vercel.com) (or click **Publish**).
2. Framework preset: Next.js. Build: `npm run build`. Output: default Next.js (do not set a static `outputDirectory`).
3. Environment variables:
   - `NEXT_PUBLIC_SITE_URL=https://freela.store` (or `https://your-project.vercel.app` until DNS is live)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — production secrets, not the development defaults
   - `DATABASE_PATH` — SQLite via `better-sqlite3`. Vercel serverless filesystems are **ephemeral**, so admin/analytics DB will not persist on the free hobby plan. The public tool pages are `LOCAL_ONLY` and do not need the database. For durable admin stats, attach a persistent host later or accept empty analytics on serverless.
4. Deploy production. Confirm `https://<project>.vercel.app/en` returns 200 and `/sitemap.xml` lists the 12 locales.

### Custom domain (freela.store)

1. Vercel project → **Settings → Domains** → add `freela.store` and `www.freela.store`.
2. At your DNS host, create the records Vercel shows (usually A/`10.0.1.2` for apex, CNAME for `www`, or ALIAS).
3. Set `NEXT_PUBLIC_SITE_URL=https://freela.store` and redeploy so canonical, hreflang, robots, and OG URLs use the apex.
4. Redirect `www` → apex in the Vercel domain UI (or keep the app’s host header behavior).
5. After TLS is green: Google Search Console domain property, submit `https://freela.store/sitemap.xml`. **Indexing is not guaranteed.**

Cloudflare Pages is an alternative (Next.js via `@cloudflare/next-on-pages` or a Node adapter). Vercel is the path wired by `vercel.json`.

Temporary public preview (this agent VM only): a Cloudflare quick tunnel may be running; it is not production and the hostname changes when the tunnel restarts.

## Production deploy (self-hosted Node)

1. Use Node 22 on a host that can run `next start` (or a Node platform such as a VPS). HTTPS must terminate in front of the app.
2. Set environment variables (never commit secrets):

   - `NEXT_PUBLIC_SITE_URL=https://freela.store`
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

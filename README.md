# Freela STORE

Global directory of **free online tools** (brand: Freela, domain: freela.store). Tools run in the browser whenever the format allows it. Pages are generated from a validated tool registry — unpublished or unreviewed locales are not added to the sitemap.

## Requirements

- Node.js 22+
- npm

## Setup

```bash
npm install
cp .env.example .env.local
```

Default admin (change before any public deploy):

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
npm test
npm run validate
npm run build
npm start -- --port 43173
```

Production build fails if the registry schema is invalid.

## What is in the first ship

- 56 working tools (PDF, images, text, developer, SEO helpers, calculators, converters, color, generators, date/time)
- Locales: English (indexable) plus German, Ukrainian, Polish, French, Spanish, Italian, Portuguese, Dutch, Turkish (switcher works; non-English tool copy is in translation review / `noindex` until QA)
- Search (registry-backed, typo-tolerant, search URLs `noindex`)
- Sitemap, robots.txt, canonical, hreflang, WebApplication + FAQ + breadcrumb JSON-LD on tool pages
- Admin dashboard: usage, top tools, languages, errors, translation QA, SEO checklist, CSV export
- First-party analytics events (no file contents)
- Cookie consent for analytics
- Privacy, terms, contact, about, affiliate disclosure

## Deploy

Any Node host that can run `next start` (or Docker). Set `NEXT_PUBLIC_SITE_URL` to the public origin, `DATABASE_PATH` to a persistent volume, and a strong `ADMIN_PASSWORD`. Back up `data/freela.db`. SQLite schema is created on first boot (`src/lib/db.ts`); SQL mirror: `drizzle/0001_init.sql`.

Do not put API secrets in client bundles. This release has no third-party AI keys.

## Adding a tool

1. Add an English definition under `src/data/tools/english*.ts`
2. Add translations in `src/data/tools/locale-packs.ts` (or leave locale `noindex`)
3. Implement or reuse a `runtime.kind` in `src/components/tool-runner.tsx`
4. Run `npm run validate` and add unit tests for pure logic

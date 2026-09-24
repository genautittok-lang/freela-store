import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localeRegistry, type Locale } from "@/data/locales";
import { categories } from "@/data/categories";
import { featuredTools, newestTools, visibleTools } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { AdSlot } from "@/components/site-chrome";
import { PageTracker } from "@/components/page-tracker";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ui = t(locale);
  return pageMetadata({
    locale,
    title: `${ui.brand} — ${ui.tagline}`,
    description: ui.tagline,
    pathWithoutLocale: "",
  });
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const loc = localeRegistry[locale as Locale];
  const featured = featuredTools(locale).slice(0, 8);
  const newest = newestTools(locale).slice(0, 8);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTracker locale={locale} />
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">freela.store</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{ui.tagline}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Merge PDFs, compress images, format JSON and run calculators without uploading private files.
          </p>
        </div>
        <SearchBox locale={locale} />
      </section>
      {!loc.indexable ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{ui.noIndexNote}</p>
      ) : null}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{ui.categories}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/${locale}/tools/${cat.copy[locale].slug}`}
                className="block rounded-2xl border p-4 hover:border-foreground"
              >
                <p className="font-medium">{cat.copy[locale].name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{cat.copy[locale].description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ToolGrid locale={locale} title={ui.popular} tools={featured} />
      <div className="mt-10">
        <AdSlot position="home-mid" />
      </div>
      <ToolGrid locale={locale} title={ui.newest} tools={newest} />
      <p className="mt-8 text-sm text-muted-foreground">{visibleTools(locale).length} {ui.allTools.toLowerCase()}</p>
    </div>
  );
}

function ToolGrid({
  locale,
  title,
  tools,
}: {
  locale: Locale;
  title: string;
  tools: ReturnType<typeof featuredTools>;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link
              href={`/${locale}/tools/${tool.copy[locale].slug}`}
              className="block h-full rounded-2xl border p-4 hover:border-foreground"
            >
              <p className="font-medium">{tool.copy[locale].name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tool.copy[locale].description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

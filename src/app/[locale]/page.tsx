import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localeRegistry, type Locale } from "@/data/locales";
import { categories } from "@/data/categories";
import { featuredTools, newestTools, toolsInCategory, visibleTools } from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { AdSlot, CategoryIcon } from "@/components/site-chrome";
import { PageTracker } from "@/components/page-tracker";
import { formatNumber } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ui = t(locale);
  return pageMetadata({
    locale,
    title: `${ui.brand} — ${ui.tagline}`,
    description: ui.heroLead,
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
  const count = visibleTools(locale).length;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTracker locale={locale} />
      <section className="rounded-3xl border bg-card px-5 py-10 shadow-sm sm:px-10">
        <p className="text-sm font-medium text-primary">freela.store</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">{ui.tagline}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{ui.heroLead}</p>
        <div className="mt-6 max-w-xl">
          <SearchBox locale={locale} />
        </div>
      </section>
      {!loc.indexable ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{ui.noIndexNote}</p>
      ) : null}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{ui.categories}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/${locale}/tools/${cat.copy[locale].slug}`}
                className="freela-card block h-full p-4 transition-colors hover:border-primary"
              >
                <CategoryIcon id={cat.id} />
                <p className="mt-2 font-medium">{cat.copy[locale].name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{cat.copy[locale].description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ToolGrid locale={locale} title={ui.popular} tools={featured} />
      <section className="mt-10 rounded-2xl border bg-emerald-50/60 px-5 py-6">
        <h2 className="text-lg font-semibold">{ui.trustTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{ui.trustBody}</p>
      </section>
      <div className="mt-10">
        <AdSlot position="home-mid" />
      </div>
      <ToolGrid locale={locale} title={ui.newest} tools={newest} />
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{ui.popularByCategory}</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {categories.slice(0, 6).map((cat) => {
            const tools = toolsInCategory(locale, cat.id).slice(0, 4);
            return (
              <div key={cat.id} className="freela-card p-4">
                <Link href={`/${locale}/tools/${cat.copy[locale].slug}`} className="flex items-center gap-2 font-medium">
                  <CategoryIcon id={cat.id} />
                  {cat.copy[locale].name}
                </Link>
                <ul className="mt-3 grid gap-1 text-sm">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/tools/${tool.copy[locale].slug}`}>
                        {tool.copy[locale].name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
      <p className="mt-8 text-sm text-muted-foreground">
        {formatNumber(locale as Locale, count)} {ui.allTools.toLowerCase()}
      </p>
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
              className="freela-card block h-full p-4 transition-colors hover:border-primary"
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

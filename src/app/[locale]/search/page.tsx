import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/data/locales";
import { searchRegistry } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { PageTracker } from "@/components/page-tracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ui = t(locale);
  return {
    ...pageMetadata({
      locale,
      title: ui.searchTitle,
      description: ui.searchEmpty,
      pathWithoutLocale: "/search",
      index: false,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  if (!isLocale(locale)) notFound();
  const ui = t(locale);
  const hits = q ? searchRegistry(locale, q) : [];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageTracker locale={locale} />
      <h1 className="text-2xl font-semibold">{ui.searchTitle}</h1>
      <div className="mt-4">
        <SearchBox locale={locale} initial={q} />
      </div>
      {!q ? <p className="mt-6 text-muted-foreground">{ui.searchEmpty}</p> : null}
      {q && hits.length === 0 ? <p className="mt-6 text-muted-foreground">{ui.searchNoResults}</p> : null}
      <ul className="mt-6 grid gap-3">
        {hits.map((hit) => {
          if (hit.kind === "tool") {
            const copy = hit.tool.copy[locale];
            return (
              <li key={hit.tool.id}>
                <Link href={`/${locale}/tools/${copy.slug}`} className="block rounded-xl border p-4 hover:border-foreground">
                  <p className="font-medium">{copy.name}</p>
                  <p className="text-sm text-muted-foreground">{copy.description}</p>
                </Link>
              </li>
            );
          }
          const cat = hit.category;
          return (
            <li key={cat.id}>
              <Link href={`/${locale}/tools/${cat.copy[locale].slug}`} className="block rounded-xl border p-4">
                {cat.copy[locale].name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { createElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isRoutedLocale } from "@/data/locales";
import { searchRegistry } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { PageTracker } from "@/components/page-tracker";
import { iconForTool } from "@/lib/tool-icons";
import { categories } from "@/data/categories";
import { copyForCategory, copyForTool } from "@/lib/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isRoutedLocale(locale)) return {};
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
  if (!isRoutedLocale(locale)) notFound();
  const ui = t(locale);
  const hits = q ? searchRegistry(locale, q) : [];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <PageTracker locale={locale} />
      <h1 className="text-3xl font-semibold tracking-tight">{ui.searchTitle}</h1>
      <div className="mt-4">
        <SearchBox locale={locale} initial={q} />
      </div>
      {!q ? <p className="mt-6 text-muted-foreground">{ui.searchEmpty}</p> : null}
      {q && hits.length === 0 ? <p className="mt-6 text-muted-foreground">{ui.searchNoResults}</p> : null}
      <ul className="mt-6 grid gap-3">
        {hits.map((hit) => {
          if (hit.kind === "tool") {
            const copy = copyForTool(hit.tool, locale);
            const cat = categories.find((c) => c.id === hit.tool.category);
            return (
              <li key={hit.tool.id}>
                <Link href={`/${locale}/tools/${copy.slug}`} className="freela-card flex gap-3 p-4">
                  {createElement(iconForTool(hit.tool.id, hit.tool.category), {
                    className: "mt-0.5 h-5 w-5 shrink-0 text-primary",
                    "aria-hidden": true,
                  })}
                  <span>
                    <span className="font-medium">{copy.name}</span>
                    {cat ? (
                      <span className="ms-2 text-xs text-muted-foreground">{copyForCategory(cat, locale).name}</span>
                    ) : null}
                    <span className="mt-1 block text-sm text-muted-foreground">{copy.description}</span>
                  </span>
                </Link>
              </li>
            );
          }
          const cat = hit.category;
          return (
            <li key={cat.id}>
              <Link href={`/${locale}/tools/${copyForCategory(cat, locale).slug}`} className="freela-card block p-4">
                {copyForCategory(cat, locale).name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

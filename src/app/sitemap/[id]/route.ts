import type { Locale } from "@/data/locales";
import { indexableLocales, renderSitemapUrlsetXml, sitemapEntriesForLocale } from "@/lib/seo";

type RouteParams = { id: string };

function localeFromParam(id: string): Locale | null {
  const locale = id.endsWith(".xml") ? id.slice(0, -4) : id;
  const allowed = indexableLocales();
  return (allowed as string[]).includes(locale) ? (locale as Locale) : null;
}

export function generateStaticParams(): RouteParams[] {
  return indexableLocales().map((locale) => ({ id: `${locale}.xml` }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<RouteParams> },
) {
  const { id } = await context.params;
  const locale = localeFromParam(id);
  if (!locale) {
    return new Response("Not Found", { status: 404 });
  }
  const xml = renderSitemapUrlsetXml(sitemapEntriesForLocale(locale));
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

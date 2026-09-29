import { renderSitemapIndexXml } from "@/lib/seo";

/** Sitemap index listing every per-locale child at `/sitemap/{locale}.xml`. */
export function GET() {
  const xml = renderSitemapIndexXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

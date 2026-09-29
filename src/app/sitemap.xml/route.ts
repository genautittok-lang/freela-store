import { renderSitemapIndexXml } from "@/lib/seo";

/** Sitemap index listing five chunked children at `/sitemap/1.xml` … `/sitemap/5.xml`. */
export function GET() {
  const xml = renderSitemapIndexXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

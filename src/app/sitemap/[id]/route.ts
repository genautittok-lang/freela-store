import { absoluteUrl } from "@/lib/site";
import {
  SITEMAP_CHUNK_COUNT,
  indexableLocales,
  renderSitemapUrlsetXml,
  sitemapChunkIds,
  sitemapEntriesForChunk,
} from "@/lib/seo";

type RouteParams = { id: string };

function chunkIdFromParam(id: string): number | null {
  const raw = id.endsWith(".xml") ? id.slice(0, -4) : id;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > SITEMAP_CHUNK_COUNT) return null;
  return n;
}

/** Old per-locale child path (`en.xml`, `zh-CN.xml`, …) → redirect to index. */
function isLegacyLocaleSitemapParam(id: string): boolean {
  const locale = id.endsWith(".xml") ? id.slice(0, -4) : id;
  return (indexableLocales() as string[]).includes(locale);
}

export function generateStaticParams(): RouteParams[] {
  return sitemapChunkIds().map((n) => ({ id: `${n}.xml` }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<RouteParams> },
) {
  const { id } = await context.params;

  if (isLegacyLocaleSitemapParam(id)) {
    return Response.redirect(absoluteUrl("/sitemap.xml"), 301);
  }

  const chunkId = chunkIdFromParam(id);
  if (!chunkId) {
    return new Response("Not Found", { status: 404 });
  }

  const xml = renderSitemapUrlsetXml(sitemapEntriesForChunk(chunkId));
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

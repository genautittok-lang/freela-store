import { NextRequest, NextResponse } from "next/server";
import { isRoutedLocale } from "@/data/locales";
import { searchRegistry } from "@/lib/search";
import { copyForCategory, copyForTool } from "@/lib/registry";
import { clientIp, rateLimit } from "@/lib/security";

export function GET(request: NextRequest) {
  if (!rateLimit(`search:${clientIp(request)}`, 120, 60_000)) {
    return NextResponse.json({ hits: [] }, { status: 429, headers: { "x-robots-tag": "noindex" } });
  }
  const q = (request.nextUrl.searchParams.get("q") || "").slice(0, 80);
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  if (!isRoutedLocale(locale)) return NextResponse.json({ hits: [] });
  const hits = searchRegistry(locale, q).map((hit) => {
    if (hit.kind === "tool") {
      const copy = copyForTool(hit.tool, locale);
      return {
        kind: "tool",
        id: hit.tool.id,
        label: copy.name,
        description: copy.description,
        category: hit.tool.category,
        href: `/${locale}/tools/${copy.slug}`,
      };
    }
    const cat = hit.category;
    const catCopy = cat ? copyForCategory(cat, locale) : undefined;
    return {
      kind: "category",
      id: cat?.id,
      label: catCopy?.name,
      href: `/${locale}/tools/${catCopy?.slug}`,
    };
  });
  return NextResponse.json({ hits }, { headers: { "x-robots-tag": "noindex" } });
}

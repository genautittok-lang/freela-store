import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/data/locales";
import { searchRegistry } from "@/lib/search";
import { categoryById } from "@/lib/registry";
import { clientIp, rateLimit } from "@/lib/security";

export function GET(request: NextRequest) {
  if (!rateLimit(`search:${clientIp(request)}`, 120, 60_000)) {
    return NextResponse.json({ hits: [] }, { status: 429, headers: { "x-robots-tag": "noindex" } });
  }
  const q = (request.nextUrl.searchParams.get("q") || "").slice(0, 80);
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  if (!isLocale(locale)) return NextResponse.json({ hits: [] });
  const hits = searchRegistry(locale, q).map((hit) => {
    if (hit.kind === "tool") {
      return {
        kind: "tool",
        id: hit.tool.id,
        label: hit.tool.copy[locale].name,
        href: `/${locale}/tools/${hit.tool.copy[locale].slug}`,
      };
    }
    const cat = "category" in hit ? hit.category : categoryById("");
    return {
      kind: "category",
      id: cat?.id,
      label: cat?.copy[locale].name,
      href: `/${locale}/tools/${cat?.copy[locale].slug}`,
    };
  });
  return NextResponse.json({ hits }, { headers: { "x-robots-tag": "noindex" } });
}

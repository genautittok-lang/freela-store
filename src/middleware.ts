import { NextRequest, NextResponse } from "next/server";
import { isRoutedLocale } from "@/data/locales";
import { toolBySlug, categoryBySlug } from "@/lib/registry";
import { toolRegistry } from "@/data/tools";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const requestHeaders = new Headers(request.headers);
  const first = pathname.split("/")[1] || "";

  if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.includes(".")) {
    requestHeaders.set("x-locale", "en");
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", request.url));
  }

  if (!isRoutedLocale(first)) {
    return NextResponse.next();
  }

  const locale = first;
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", pathname);

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 3 && parts[1] === "tools") {
    const slug = parts[2];
    const tool = toolBySlug(locale, slug);
    if (tool?.status === "disabled") {
      return new NextResponse("Gone", { status: 410, headers: { "x-robots-tag": "noindex" } });
    }
    if (tool?.status === "deprecated") {
      requestHeaders.set("x-robots-tag", "noindex");
    }
    void categoryBySlug;
    void toolRegistry;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

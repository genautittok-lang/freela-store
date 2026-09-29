"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTED_LOCALES, getLocale, isLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { track } from "@/components/analytics-provider";
import { ToolsCategorySheet } from "@/components/tools-menu";
import { Home, Wrench, Search, Languages } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function restForLocale(pathname: string, from: string, to: string) {
  const rest = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?/, "") || "/";
  const match = rest.match(/^\/tools\/([^/]+)$/);
  if (!match || !isLocale(from) || !isLocale(to)) return rest;
  const slug = decodeURIComponent(match[1]!);
  const cat = categories.find((item) =>
    (Object.keys(item.copy) as string[]).some((code) => isLocale(code) && item.copy[code].slug === slug),
  );
  if (!cat) return rest;
  return `/tools/${cat.copy[to].slug}`;
}

export function MobileBottomNav({ locale, active = "" }: { locale: string; active?: string }) {
  const ui = t(locale);
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsOn = active === "tools" || categories.some((c) => c.id === active);
  const items = [
    { href: `/${locale}`, label: ui.home, icon: Home, on: active === "home" },
    { href: `/${locale}/search`, label: ui.searchButton, icon: Search, on: active === "search" },
  ];

  function switchLocale(next: string) {
    document.cookie = `freela_locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    try {
      localStorage.setItem("freela_locale", next);
    } catch {
      /* ignore */
    }
    track("language_change", { locale: next });
    const rest = restForLocale(pathname, locale, next);
    setLangOpen(false);
    router.push(`/${next}${rest === "/" ? "" : rest}`);
  }

  return (
    <nav
      aria-label={ui.toolsNav}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(21_122_69_/_0.08)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
        <li>
          <Link
            href={items[0]!.href}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold ${
              items[0]!.on ? "bg-accent text-primary" : "text-muted-foreground"
            }`}
            aria-current={items[0]!.on ? "page" : undefined}
          >
            <Home className="h-5 w-5" aria-hidden />
            <span className="truncate">{items[0]!.label}</span>
          </Link>
        </li>
        <li>
          <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
            <SheetTrigger
              className={`flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold ${
                toolsOn ? "bg-accent text-primary" : "text-muted-foreground"
              }`}
              aria-label={ui.tools}
            >
              <Wrench className="h-5 w-5" aria-hidden />
              <span className="truncate">{ui.tools}</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>{ui.tools}</SheetTitle>
              </SheetHeader>
              <div className="mt-3 pb-6">
                <ToolsCategorySheet locale={locale} active={active} onNavigate={() => setToolsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </li>
        <li>
          <Link
            href={items[1]!.href}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold ${
              items[1]!.on ? "bg-accent text-primary" : "text-muted-foreground"
            }`}
            aria-current={items[1]!.on ? "page" : undefined}
          >
            <Search className="h-5 w-5" aria-hidden />
            <span className="truncate">{items[1]!.label}</span>
          </Link>
        </li>
        <li>
          <Sheet open={langOpen} onOpenChange={setLangOpen}>
            <SheetTrigger
              className="flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground"
              aria-label={ui.language}
            >
              <Languages className="h-5 w-5" aria-hidden />
              <span className="truncate">{ui.language}</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>{ui.language}</SheetTitle>
              </SheetHeader>
              <ul className="mt-3 grid gap-1 pb-6">
                {ROUTED_LOCALES.map((code) => {
                  const rec = getLocale(code);
                  const selected = code === locale;
                  return (
                    <li key={code}>
                      <button
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-medium ${
                          selected ? "bg-accent text-primary" : "hover:bg-muted"
                        }`}
                        aria-current={selected ? "true" : undefined}
                        onClick={() => switchLocale(code)}
                      >
                        <span aria-hidden className="text-lg">
                          {rec?.flag}
                        </span>
                        <span className="flex-1">
                          {rec?.nativeName}{" "}
                          <span className="text-muted-foreground">({code})</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}

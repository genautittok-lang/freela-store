"use client";

import Link from "next/link";
import { contentLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { Home, Wrench, Search, Languages } from "lucide-react";

export function MobileBottomNav({ locale, active = "" }: { locale: string; active?: string }) {
  const ui = t(locale);
  const cl = contentLocale(locale);
  const firstCat = categories[0];
  const toolsHref = firstCat ? `/${locale}/tools/${firstCat.copy[cl].slug}` : `/${locale}`;
  const items = [
    { href: `/${locale}`, label: ui.home, icon: Home, on: active === "home" },
    { href: toolsHref, label: ui.tools, icon: Wrench, on: active.startsWith("pdf") || active === "tools" || categories.some((c) => c.id === active) },
    { href: `/${locale}/search`, label: ui.searchButton, icon: Search, on: active === "search" },
    { href: `/${locale}/about`, label: ui.language, icon: Languages, on: false },
  ];
  return (
    <nav
      aria-label={ui.toolsNav}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(21_122_69_/_0.08)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold ${
                  item.on ? "bg-accent text-primary" : "text-muted-foreground"
                }`}
                aria-current={item.on ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/data/locales";
import { ROUTED_LOCALES, contentLocale, getLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { categoryIcons } from "@/lib/tool-icons";
import { Menu, X } from "lucide-react";
import type { CategoryId } from "@/data/categories";

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = categoryIcons[id];
  return <Icon className={className ?? "h-5 w-5 text-primary"} aria-hidden />;
}

export function SiteHeader({ locale, pathname }: { locale: string; pathname: string }) {
  const ui = t(locale);
  const cl = contentLocale(locale);
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Logo locale={locale} compact />
        <nav className="hidden items-center gap-5 text-sm lg:flex" aria-label={ui.toolsNav}>
          <Link className="font-medium text-foreground" href={`/${locale}`}>
            {ui.home}
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              className="text-muted-foreground hover:text-foreground"
              href={`/${locale}/tools/${cat.copy[cl].slug}`}
            >
              {cat.copy[cl].name}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-2 lg:max-w-sm">
          <div className="hidden min-w-0 flex-1 max-lg:hidden lg:block">
            <SearchBox locale={locale} />
          </div>
          <div className="max-lg:hidden">
            <LanguageSwitcher locale={locale} pathname={pathname} />
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label={open ? ui.closeMenu : ui.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t px-4 py-4 lg:hidden">
          <div className="grid gap-4">
            <SearchBox locale={locale} />
            <LanguageSwitcher locale={locale} pathname={pathname} />
            <nav className="grid gap-1 text-sm" aria-label={ui.categories}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted"
                  href={`/${locale}/tools/${cat.copy[cl].slug}`}
                  onClick={() => setOpen(false)}
                >
                  <CategoryIcon id={cat.id} />
                  {cat.copy[cl].name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export const legalLinks = (locale: string) => {
  const ui = t(locale);
  return [
    { href: `/${locale}/about`, label: ui.about },
    { href: `/${locale}/contact`, label: ui.contact },
    { href: `/${locale}/privacy`, label: ui.privacyPolicy },
    { href: `/${locale}/terms`, label: ui.terms },
    { href: `/${locale}/acceptable-use`, label: ui.aup },
    { href: `/${locale}/abuse`, label: ui.abuse },
    { href: `/${locale}/data-deletion`, label: ui.deletion },
    { href: `/${locale}/file-processing`, label: ui.filePolicy },
    { href: `/${locale}/vendors`, label: ui.vendors },
    { href: `/${locale}/copyright`, label: ui.copyright },
    { href: `/${locale}/data-inventory`, label: ui.inventory },
    { href: `/${locale}/affiliate-disclosure`, label: ui.affiliate },
  ];
};

export function SiteFooter({ locale }: { locale: string }) {
  const ui = t(locale);
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo locale={locale} />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{ui.tagline}</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Legal">
          {legalLinks(locale).map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div>
          <p className="text-sm font-medium">{ui.language}</p>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {ROUTED_LOCALES.map((code) => {
              const rec = getLocale(code);
              return (
                <li key={code}>
                  <Link className="text-muted-foreground hover:text-foreground" href={`/${code}`}>
                    {rec?.flag} {rec?.nativeName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Freela · {ui.adDisclosure}
      </p>
    </footer>
  );
}

export function AdSlot({ position }: { position: string }) {
  return (
    <aside
      className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-5 text-center text-xs text-muted-foreground"
      aria-label="Advertisement"
    >
      Ad slot ({position}) — labeled inventory, never mixed with tool actions.
    </aside>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/data/locales";
import { INITIAL_LOCALES, localeRegistry } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Type, Code2, Search, Calculator, ArrowRightLeft, Palette, Sparkles, Calendar, Menu, X } from "lucide-react";
import type { CategoryId } from "@/data/categories";

const icons: Record<CategoryId, typeof FileText> = {
  "pdf-documents": FileText,
  images: ImageIcon,
  text: Type,
  developer: Code2,
  seo: Search,
  calculators: Calculator,
  converters: ArrowRightLeft,
  color: Palette,
  generators: Sparkles,
  "date-time": Calendar,
};

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = icons[id];
  return <Icon className={className ?? "h-5 w-5 text-primary"} aria-hidden />;
}

export function SiteHeader({ locale, pathname }: { locale: Locale; pathname: string }) {
  const ui = t(locale);
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Logo locale={locale} />
        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm lg:flex" aria-label={ui.allCategories}>
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={`/${locale}/tools/${cat.copy[locale].slug}`}
            >
              {cat.copy[locale].name}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-2 lg:max-w-md lg:flex-none">
          <div className="hidden min-w-0 flex-1 sm:block">
            <SearchBox locale={locale} />
          </div>
          <div className="hidden sm:block">
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
                  href={`/${locale}/tools/${cat.copy[locale].slug}`}
                  onClick={() => setOpen(false)}
                >
                  <CategoryIcon id={cat.id} />
                  {cat.copy[locale].name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export const legalLinks = (locale: Locale) => {
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

export function SiteFooter({ locale }: { locale: Locale }) {
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
            {INITIAL_LOCALES.map((code) => (
              <li key={code}>
                <Link className="text-muted-foreground hover:text-foreground" href={`/${code}`}>
                  {localeRegistry[code].flag} {localeRegistry[code].nativeName}
                </Link>
              </li>
            ))}
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
      className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-xs text-muted-foreground"
      aria-label="Advertisement"
    >
      Ad slot ({position}) — labeled inventory, never mixed with tool actions.
    </aside>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { BrandCategoryIcon } from "@/components/brand-icons";
import { ToolsCategorySheet, ToolsNavMenu } from "@/components/tools-menu";
import { Menu, X } from "lucide-react";
import type { CategoryId } from "@/data/categories";
export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  return <BrandCategoryIcon id={id} className={className ?? "h-8 w-8"} />;
}

export function SiteHeader({
  locale,
  pathname,
  active = "",
}: {
  locale: string;
  pathname: string;
  active?: string;
}) {
  const ui = t(locale);
  const [open, setOpen] = useState(false);
  const homeActive = active === "home";
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 shadow-[0_8px_24px_rgb(21_122_69_/_0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Logo locale={locale} compact homeLabel={ui.home} />
        <span className="hidden rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:inline">
          v1.2.1
        </span>
        <nav className="hidden items-center gap-5 text-sm lg:flex" aria-label={ui.toolsNav}>
          <Link className="nav-link" href={`/${locale}`} data-active={homeActive ? "true" : "false"} aria-current={homeActive ? "page" : undefined}>
            {ui.home}
          </Link>
          <ToolsNavMenu locale={locale} active={active} />
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
            <Link
              className="nav-item rounded-lg px-2 py-2"
              href={`/${locale}`}
              data-active={homeActive ? "true" : "false"}
              aria-current={homeActive ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="nav-link">{ui.home}</span>
            </Link>
            <ToolsCategorySheet locale={locale} active={active} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function AdSlot({ position, locale = "en" }: { position: string; locale?: string }) {
  const ui = t(locale);
  return (
    <aside
      className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-4 text-center"
      aria-label={ui.advertised}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.advertised}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {ui.advertisedHint} ({position})
      </p>
    </aside>
  );
}

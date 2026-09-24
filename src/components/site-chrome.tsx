import Link from "next/link";
import type { Locale } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader({ locale, pathname }: { locale: Locale; pathname: string }) {
  const ui = t(locale);
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-baseline gap-2 font-semibold tracking-tight">
            <span className="text-xl">{ui.brand}</span>
            <span className="hidden text-sm font-normal text-muted-foreground sm:inline">.store</span>
          </Link>
          <div className="sm:hidden">
            <LanguageSwitcher locale={locale} pathname={pathname} />
          </div>
        </div>
        <nav className="hidden items-center gap-4 text-sm md:flex" aria-label="Categories">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              className="text-muted-foreground hover:text-foreground"
              href={`/${locale}/tools/${cat.copy[locale].slug}`}
            >
              {cat.copy[locale].name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center gap-3 sm:max-w-md">
          <SearchBox locale={locale} />
          <div className="hidden sm:block">
            <LanguageSwitcher locale={locale} pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const ui = t(locale);
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Freela · {ui.tagline}</p>
        <nav className="flex flex-wrap gap-4">
          <Link href={`/${locale}/about`}>{ui.about}</Link>
          <Link href={`/${locale}/privacy`}>{ui.privacyPolicy}</Link>
          <Link href={`/${locale}/terms`}>{ui.terms}</Link>
          <Link href={`/${locale}/contact`}>{ui.contact}</Link>
          <Link href={`/${locale}/affiliate-disclosure`}>{ui.affiliate}</Link>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">{ui.adDisclosure}</p>
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

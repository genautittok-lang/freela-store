import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ROUTED_LOCALES, isRoutedLocale } from "@/data/locales";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteHeader } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { DocumentLang } from "@/components/document-lang";
import { getLocale } from "@/data/locales";
import { t } from "@/i18n/messages";
import { categoryBySlug, toolBySlug } from "@/lib/registry";

function activeNav(locale: string, pathname: string) {
  const rest = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?/, "") || "/";
  if (rest === "/" || rest === "") return "home";
  const match = rest.match(/^\/tools\/([^/?#]+)/);
  if (!match) return "";
  const slug = decodeURIComponent(match[1]);
  const cat = categoryBySlug(locale, slug);
  if (cat) return cat.id;
  return toolBySlug(locale, slug)?.category ?? "";
}

export function generateStaticParams() {
  return ROUTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isRoutedLocale(locale)) notFound();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || `/${locale}`;
  const rec = getLocale(locale);
  const ui = t(locale);
  return (
    <AnalyticsProvider>
      <DocumentLang lang={rec?.htmlLang || locale} dir={rec?.dir || "ltr"} />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:text-background">
        {ui.skipToContent}
      </a>
      <SiteHeader locale={locale} pathname={pathname} active={activeNav(locale, pathname)} />
      <div id="main" className="flex-1">
        {children}
      </div>
      <SiteFooter locale={locale} />
      <CookieBanner locale={locale} />
    </AnalyticsProvider>
  );
}

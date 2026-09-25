import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { INITIAL_LOCALES, isLocale, type Locale } from "@/data/locales";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DocumentLang } from "@/components/document-lang";
import { getLocale } from "@/data/locales";
import { t } from "@/i18n/messages";

export function generateStaticParams() {
  return INITIAL_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || `/${locale}`;
  const rec = getLocale(locale);
  const ui = t(locale as Locale);
  return (
    <AnalyticsProvider>
      <DocumentLang lang={rec?.htmlLang || locale} dir={rec?.dir || "ltr"} />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:text-background">
        {ui.skipToContent}
      </a>
      <SiteHeader locale={locale} pathname={pathname} />
      <div id="main" className="flex-1">
        {children}
      </div>
      <SiteFooter locale={locale} />
      <CookieBanner locale={locale} />
    </AnalyticsProvider>
  );
}

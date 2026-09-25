import { notFound } from "next/navigation";
import { isRoutedLocale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { PageTracker } from "@/components/page-tracker";
import { type LegalSlug } from "@/data/legal-slugs";
import { legalBody } from "@/i18n/legal";

const titles: Record<LegalSlug, (locale: string) => string> = {
  about: (locale) => t(locale).about,
  privacy: (locale) => t(locale).privacyPolicy,
  terms: (locale) => t(locale).terms,
  contact: (locale) => t(locale).contact,
  "affiliate-disclosure": (locale) => t(locale).affiliate,
  "acceptable-use": (locale) => t(locale).aup,
  abuse: (locale) => t(locale).abuse,
  "data-deletion": (locale) => t(locale).deletion,
  vendors: (locale) => t(locale).vendors,
  "file-processing": (locale) => t(locale).filePolicy,
  copyright: (locale) => t(locale).copyright,
  "data-inventory": (locale) => t(locale).inventory,
};

export function makeLegalPage(slug: LegalSlug) {
  return {
    generateMetadata: async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      if (!isRoutedLocale(locale)) return {};
      const body = legalBody(slug, locale);
      return pageMetadata({
        locale,
        title: titles[slug](locale),
        description: body[0].slice(0, 160),
        pathWithoutLocale: `/${slug}`,
      });
    },
    Page: async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      if (!isRoutedLocale(locale)) notFound();
      const body = legalBody(slug, locale);
      return (
        <article className="mx-auto max-w-2xl px-4 py-10">
          <PageTracker locale={locale} />
          <h1 className="text-3xl font-semibold">{titles[slug](locale)}</h1>
          {body.map((para) => (
            <p key={para.slice(0, 48)} className="mt-4 leading-7 text-muted-foreground">
              {para}
            </p>
          ))}
        </article>
      );
    },
  };
}

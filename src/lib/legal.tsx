import { notFound } from "next/navigation";
import { isRoutedLocale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { PageTracker } from "@/components/page-tracker";
import { type LegalSlug } from "@/data/legal-slugs";
import { legalBody } from "@/i18n/legal";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/site";

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

function LegalParagraph({ text }: { text: string }) {
  const parts = text.split(CONTACT_EMAIL);
  return (
    <p className="mt-4 leading-7 text-muted-foreground">
      {parts.map((part, i) => (
        <span key={`${i}-${part.slice(0, 16)}`}>
          {part}
          {i < parts.length - 1 ? (
            <a className="font-medium text-primary underline-offset-2 hover:underline" href={CONTACT_MAILTO}>
              {CONTACT_EMAIL}
            </a>
          ) : null}
        </span>
      ))}
    </p>
  );
}

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
      const ui = t(locale);
      return (
        <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
          <PageTracker locale={locale} />
          <p className="inline-flex rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Freela
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{titles[slug](locale)}</h1>
          {slug === "contact" || slug === "abuse" ? (
            <p className="mt-5">
              <a
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                href={CONTACT_MAILTO}
              >
                {ui.contactHint}
              </a>
            </p>
          ) : null}
          {body.map((para) => (
            <LegalParagraph key={para.slice(0, 72)} text={para} />
          ))}
        </article>
      );
    },
  };
}

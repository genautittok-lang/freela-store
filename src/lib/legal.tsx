import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { PageTracker } from "@/components/page-tracker";

const pages = {
  about: {
    title: (locale: Locale) => t(locale).about,
    body: {
      en: `Freela is a catalogue of free browser tools. Files are processed on your device whenever the format allows it. We do not promise search rankings. We publish a page only when the tool works and the copy has been reviewed.`,
    },
  },
  privacy: {
    title: (locale: Locale) => t(locale).privacyPolicy,
    body: {
      en: `Freela does not upload your tool files to our servers for the published client-side tools. Analytics events, if you consent, include a random session id, tool id, locale, timestamp and success/error — never file bytes or pasted secrets. Admin authentication uses a hashed password. You can refuse analytics cookies and still use every tool.`,
    },
  },
  terms: {
    title: (locale: Locale) => t(locale).terms,
    body: {
      en: `Tools are provided as-is for personal and professional convenience. Calculators are not tax, medical or legal advice. Do not use Freela to break authentication, hide malware, or generate scaled spam. You are responsible for the files you process.`,
    },
  },
  contact: {
    title: (locale: Locale) => t(locale).contact,
    body: {
      en: `Email hello@freela.store for product questions. Security reports: security@freela.store. We do not accept unsolicited bulk tool pages that are not in the registry.`,
    },
  },
  "affiliate-disclosure": {
    title: (locale: Locale) => t(locale).affiliate,
    body: {
      en: `Some links may be affiliate or sponsored placements. They are labeled. Clicking them is never required to run a tool, download a result, or copy text. Display ads, when enabled, sit outside the tool card.`,
    },
  },
} as const;

export function makeLegalPage(slug: keyof typeof pages) {
  return {
    generateMetadata: async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      if (!isLocale(locale)) return {};
      return pageMetadata({
        locale,
        title: pages[slug].title(locale),
        description: pages[slug].body.en.slice(0, 160),
        pathWithoutLocale: `/${slug === "affiliate-disclosure" ? "affiliate-disclosure" : slug}`,
      });
    },
    Page: async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      if (!isLocale(locale)) notFound();
      return (
        <article className="mx-auto max-w-2xl px-4 py-10">
          <PageTracker locale={locale} />
          <h1 className="text-3xl font-semibold">{pages[slug].title(locale)}</h1>
          <p className="mt-4 leading-7 text-muted-foreground">{pages[slug].body.en}</p>
        </article>
      );
    },
  };
}

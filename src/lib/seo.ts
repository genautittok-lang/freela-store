import type { Metadata } from "next";
import type { Locale } from "@/data/locales";
import { getLocale, localeRegistry, SOURCE_LOCALE } from "@/data/locales";
import { LEGAL_SLUGS } from "@/data/legal-slugs";
import { absoluteUrl } from "@/lib/site";
import { indexableTools, publicLocalesForTool } from "@/lib/registry";
import type { ToolDefinition } from "@/data/schema";

export function robotsFor(locale: Locale, extraIndex = true): Metadata["robots"] {
  const loc = getLocale(locale);
  const index = Boolean(loc?.indexable && extraIndex);
  return { index, follow: true, googleBot: { index, follow: true } };
}

export function languageAlternates(pathWithoutLocale: string, locales: Locale[]) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(`/${locale}${pathWithoutLocale}`);
  }
  languages["x-default"] = absoluteUrl(`/${SOURCE_LOCALE}${pathWithoutLocale}`);
  return languages;
}

export function pageMetadata(opts: {
  locale: Locale;
  title: string;
  description: string;
  pathWithoutLocale: string;
  index?: boolean;
  ogType?: "website" | "article";
}): Metadata {
  const loc = getLocale(opts.locale)!;
  const canonical = absoluteUrl(`/${opts.locale}${opts.pathWithoutLocale}`);
  const index = opts.index ?? loc.indexable;
  const locales = Object.keys(localeRegistry) as Locale[];
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical,
      languages: languageAlternates(opts.pathWithoutLocale, locales),
    },
    robots: robotsFor(opts.locale, index),
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      siteName: "Freela",
      locale: loc.ogLocale,
      type: opts.ogType ?? "website",
    },
    twitter: {
      card: "summary",
      title: opts.title,
      description: opts.description,
    },
  };
}

export function toolMetadata(tool: ToolDefinition, locale: Locale): Metadata {
  const copy = tool.copy[locale];
  const loc = getLocale(locale)!;
  const index = loc.indexable && tool.status === "published" && loc.translationReviewed;
  const path = `/tools/${copy.slug}`;
  const langs = publicLocalesForTool(tool).filter((code) => getLocale(code)?.indexable);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: absoluteUrl(`/${locale}${path}`),
      languages: languageAlternates(path, langs.length ? langs : [locale]),
    },
    robots: robotsFor(locale, index),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: absoluteUrl(`/${locale}${path}`),
      siteName: "Freela",
      locale: loc.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: copy.title,
      description: copy.description,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function softwareJsonLd(tool: ToolDefinition, locale: Locale) {
  const copy = tool.copy[locale];
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: copy.name,
    applicationCategory: "BrowserApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: absoluteUrl(`/${locale}/tools/${copy.slug}`),
    description: copy.description,
    inLanguage: locale,
  };
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function sitemapEntries() {
  const pages = ["", ...LEGAL_SLUGS.map((slug) => `/${slug}`)];
  const urls: {
    url: string;
    lastModified?: string;
    alternates: { languages: Record<string, string> };
  }[] = [];
  const locales = (Object.keys(localeRegistry) as Locale[]).filter((code) => getLocale(code)?.indexable);
  for (const path of pages) {
    for (const locale of locales) {
      urls.push({
        url: absoluteUrl(`/${locale}${path || ""}`),
        lastModified: "2026-09-24",
        alternates: { languages: languageAlternates(path || "", locales) },
      });
    }
  }
  for (const locale of locales) {
    for (const tool of indexableTools(locale)) {
      const path = `/tools/${tool.copy[locale].slug}`;
      urls.push({
        url: absoluteUrl(`/${locale}${path}`),
        lastModified: tool.lastModified,
        alternates: {
          languages: languageAlternates(
            path,
            publicLocalesForTool(tool).filter((code) => getLocale(code)?.indexable),
          ),
        },
      });
    }
  }
  return urls;
}

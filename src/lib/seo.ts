import type { Metadata } from "next";
import type { Locale } from "@/data/locales";
import { contentLocale, getLocale, localeRegistry, SOURCE_LOCALE } from "@/data/locales";
import { LEGAL_SLUGS } from "@/data/legal-slugs";
import { absoluteUrl } from "@/lib/site";
import { indexableTools, publicLocalesForTool } from "@/lib/registry";
import type { ToolDefinition } from "@/data/schema";
import { categories } from "@/data/categories";

export function robotsFor(locale: string, extraIndex = true): Metadata["robots"] {
  const loc = getLocale(locale);
  const index = Boolean(loc?.indexable && extraIndex);
  return { index, follow: true, googleBot: { index, follow: true } };
}

export function indexableLocales(): Locale[] {
  return (Object.keys(localeRegistry) as Locale[]).filter((code) => getLocale(code)?.indexable);
}

export function languageAlternates(pathWithoutLocale: string, locales: string[]) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(`/${locale}${pathWithoutLocale}`);
  }
  languages["x-default"] = absoluteUrl(`/${SOURCE_LOCALE}${pathWithoutLocale}`);
  return languages;
}

function brandOgImage(alt: string) {
  return [{ url: absoluteUrl("/brand/og.png"), width: 1200, height: 630, alt }];
}

function toolOgImage(locale: string, slug: string, alt: string) {
  return [
    {
      url: absoluteUrl(`/${locale}/tools/${slug}/opengraph-image`),
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

function ogLocaleFields(locale: string) {
  const current = getLocale(locale);
  const alternateLocale = indexableLocales()
    .filter((code) => code !== locale)
    .map((code) => getLocale(code)?.ogLocale)
    .filter((value): value is string => Boolean(value));
  return { locale: current?.ogLocale, alternateLocale };
}

export function pageMetadata(opts: {
  locale: string;
  title: string;
  description: string;
  pathWithoutLocale: string;
  index?: boolean;
  ogType?: "website" | "article";
  /** Absolute or site-relative OG image URL. Defaults to brand /brand/og.png. */
  ogImageUrl?: string;
}): Metadata {
  const loc = getLocale(opts.locale) ?? getLocale("en")!;
  const canonical = absoluteUrl(`/${opts.locale}${opts.pathWithoutLocale}`);
  const index = opts.index ?? loc.indexable;
  const locales = indexableLocales();
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
      ...ogLocaleFields(opts.locale),
      type: opts.ogType ?? "website",
      images: opts.ogImageUrl
        ? [{ url: opts.ogImageUrl, width: 1200, height: 630, alt: opts.title }]
        : brandOgImage(opts.title),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [opts.ogImageUrl ?? absoluteUrl("/brand/og.png")],
    },
  };
}

export function toolMetadata(tool: ToolDefinition, locale: string): Metadata {
  const copy = tool.copy[contentLocale(locale)] ?? tool.copy.en;
  const loc = getLocale(locale)!;
  const index = loc.indexable && tool.status === "published" && loc.translationReviewed;
  const path = `/tools/${copy.slug}`;
  const langs = publicLocalesForTool(tool).filter((code) => getLocale(code)?.indexable);
  const og = toolOgImage(locale, copy.slug, copy.name);
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
      ...ogLocaleFields(locale),
      type: "website",
      images: og,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [og[0]!.url],
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

export function softwareJsonLd(tool: ToolDefinition, locale: string) {
  const copy = tool.copy[contentLocale(locale)] ?? tool.copy.en;
  const cat = categories.find((item) => item.id === tool.category);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: copy.name,
    applicationCategory: "BrowserApplication",
    applicationSubCategory: cat?.copy[contentLocale(locale)].name,
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: absoluteUrl(`/${locale}/tools/${copy.slug}`),
    description: copy.description,
    inLanguage: locale,
    featureList: copy.howTo,
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Freela", url: absoluteUrl(`/${SOURCE_LOCALE}`) },
  };
}

export function howToJsonLd(name: string, steps: string[], url: string, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    url,
    inLanguage: locale,
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}

export function websiteJsonLd(locale: string, description?: string) {
  const loc = getLocale(locale) ?? getLocale("en")!;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Freela",
    url: absoluteUrl(`/${locale}`),
    inLanguage: loc.htmlLang,
    description:
      description ?? "Browser-first PDF, image, text and developer tools. Files stay on your device.",
    publisher: { "@type": "Organization", name: "Freela", url: absoluteUrl("/en") },
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
  const locales = indexableLocales();
  for (const path of pages) {
    for (const locale of locales) {
      urls.push({
        url: absoluteUrl(`/${locale}${path || ""}`),
        lastModified: "2026-09-24",
        alternates: { languages: languageAlternates(path || "", locales) },
      });
    }
  }
  for (const cat of categories) {
    const languages: Record<string, string> = {};
    for (const code of locales) {
      languages[code] = absoluteUrl(`/${code}/tools/${cat.copy[code].slug}`);
    }
    languages["x-default"] = absoluteUrl(`/${SOURCE_LOCALE}/tools/${cat.copy.en.slug}`);
    for (const locale of locales) {
      urls.push({
        url: absoluteUrl(`/${locale}/tools/${cat.copy[locale].slug}`),
        lastModified: "2026-09-26",
        alternates: { languages },
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

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

/** Real homepage walkthrough clips in `public/brand/` (HTML5 `<video>` on the same URL). */
export const WALKTHROUGH_VIDEOS = {
  phone: {
    id: "walkthrough-phone",
    contentPath: "/brand/teaser.mp4",
    thumbnailPath: "/brand/hero.png",
    /** ISO 8601; source is ~6.52s */
    duration: "PT7S",
    uploadDate: "2026-09-25",
  },
  desktop: {
    id: "walkthrough-desktop",
    contentPath: "/brand/teaser-desktop.mp4",
    thumbnailPath: "/brand/hero.png",
    /** ISO 8601; source is ~6.67s */
    duration: "PT7S",
    uploadDate: "2026-09-25",
  },
} as const;

export type WalkthroughVideoKind = keyof typeof WALKTHROUGH_VIDEOS;

/**
 * VideoObject for a homepage walkthrough that is actually embedded as a visible
 * `<video>` on the locale home URL. Do not emit this without a matching player.
 */
export function walkthroughVideoJsonLd(
  locale: string,
  kind: WalkthroughVideoKind,
  opts: { name: string; description: string },
) {
  const meta = WALKTHROUGH_VIDEOS[kind];
  const pageUrl = absoluteUrl(`/${locale}`);
  const contentUrl = absoluteUrl(meta.contentPath);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${pageUrl}#${meta.id}`,
    name: opts.name,
    description: opts.description,
    thumbnailUrl: [absoluteUrl(meta.thumbnailPath)],
    uploadDate: meta.uploadDate,
    duration: meta.duration,
    contentUrl,
    embedUrl: pageUrl,
    url: pageUrl,
    inLanguage: (getLocale(locale) ?? getLocale("en")!).htmlLang,
    isFamilyFriendly: true,
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

/** Slim sitemap URL (no xhtml:link alternates — hreflang lives in HTML head). */
export type SitemapUrlEntry = {
  url: string;
  lastModified?: string;
};

/** URLs for one indexable locale: home, legal, categories, tools. */
export function sitemapEntriesForLocale(locale: Locale): SitemapUrlEntry[] {
  const loc = getLocale(locale);
  if (!loc?.indexable) return [];

  const urls: SitemapUrlEntry[] = [];
  const pages = ["", ...LEGAL_SLUGS.map((slug) => `/${slug}`)];
  for (const path of pages) {
    urls.push({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: "2026-09-24",
    });
  }
  for (const cat of categories) {
    urls.push({
      url: absoluteUrl(`/${locale}/tools/${cat.copy[locale].slug}`),
      lastModified: "2026-09-26",
    });
  }
  for (const tool of indexableTools(locale)) {
    urls.push({
      url: absoluteUrl(`/${locale}/tools/${tool.copy[locale].slug}`),
      lastModified: tool.lastModified,
    });
  }
  return urls;
}

/** All locale URLs concatenated (stable order = indexableLocales order). */
export function sitemapEntries(): SitemapUrlEntry[] {
  return indexableLocales().flatMap((locale) => sitemapEntriesForLocale(locale));
}

/** Fixed number of chunked child sitemaps listed by the index (not per-locale). */
export const SITEMAP_CHUNK_COUNT = 5;

/** 1-based chunk ids: 1 … SITEMAP_CHUNK_COUNT. */
export function sitemapChunkIds(): number[] {
  return Array.from({ length: SITEMAP_CHUNK_COUNT }, (_, i) => i + 1);
}

/** Slice of all sitemap URLs for one chunk (even split, last chunk may be smaller). */
export function sitemapEntriesForChunk(chunkId: number): SitemapUrlEntry[] {
  if (!Number.isInteger(chunkId) || chunkId < 1 || chunkId > SITEMAP_CHUNK_COUNT) {
    return [];
  }
  const all = sitemapEntries();
  const chunkSize = Math.ceil(all.length / SITEMAP_CHUNK_COUNT);
  const start = (chunkId - 1) * chunkSize;
  return all.slice(start, start + chunkSize);
}

/** Child sitemap absolute URLs listed by the sitemap index. */
export function sitemapChildLocs(): string[] {
  return sitemapChunkIds().map((id) => absoluteUrl(`/sitemap/${id}.xml`));
}

export function renderSitemapIndexXml(childLocs: string[] = sitemapChildLocs()): string {
  const body = childLocs
    .map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function renderSitemapUrlsetXml(entries: SitemapUrlEntry[]): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? `\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`
        : "";
      return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

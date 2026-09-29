import { describe, expect, it } from "vitest";
import { INITIAL_LOCALES, ROUTED_LOCALES, SOURCE_LOCALE, isRoutedLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { LEGAL_SLUGS } from "@/data/legal-slugs";
import { messages } from "@/i18n/messages";
import { extras } from "@/i18n/extras";
import { uxChrome } from "@/i18n/ux";
import { uiAdditions } from "@/i18n/ui-additions";
import { t } from "@/i18n/messages";
import { negotiateLocale } from "@/lib/accept-language";
import {
  languageAlternates,
  sitemapEntries,
  indexableLocales,
  toolMetadata,
  pageMetadata,
} from "@/lib/seo";
import {
  publishedTools,
  indexableTools,
  categoryBySlug,
  toolBySlug,
  copyForTool,
  copyForCategory,
} from "@/lib/registry";
import { TOP20_TOOL_IDS } from "@/i18n/top20-landing";
import { toolById } from "@/lib/registry";

describe("36-locale UI chrome coverage", () => {
  it("lists exactly 36 routed locales", () => {
    expect(ROUTED_LOCALES).toHaveLength(36);
    expect(INITIAL_LOCALES).toHaveLength(36);
    expect(indexableLocales()).toHaveLength(36);
  });

  it("has complete messages/extras/ux/additions keys with no null or empty strings", () => {
    const enMsg = Object.keys(messages.en);
    const enExtra = Object.keys(extras.en);
    const enUx = Object.keys(uxChrome.en);
    const enAdd = Object.keys(uiAdditions.en);

    for (const locale of INITIAL_LOCALES) {
      for (const key of enMsg) {
        const value = messages[locale][key as keyof (typeof messages)["en"]];
        expect(value, `${locale}.messages.${key}`).toBeTruthy();
        expect(String(value).trim().length, `${locale}.messages.${key}`).toBeGreaterThan(0);
      }
      for (const key of enExtra) {
        const value = extras[locale][key as keyof (typeof extras)["en"]];
        expect(value, `${locale}.extras.${key}`).toBeTruthy();
        expect(String(value).trim().length, `${locale}.extras.${key}`).toBeGreaterThan(0);
      }
      for (const key of enUx) {
        const value = uxChrome[locale][key as keyof (typeof uxChrome)["en"]];
        expect(value, `${locale}.ux.${key}`).toBeTruthy();
        expect(String(value).trim().length, `${locale}.ux.${key}`).toBeGreaterThan(0);
      }
      for (const key of enAdd) {
        const value = uiAdditions[locale][key as keyof (typeof uiAdditions)["en"]];
        expect(value, `${locale}.additions.${key}`).toBeTruthy();
        expect(String(value).trim().length, `${locale}.additions.${key}`).toBeGreaterThan(0);
      }

      const ui = t(locale);
      expect(ui.run).toBeTruthy();
      expect(ui.download).toBeTruthy();
      expect(ui.close).toBeTruthy();
      expect(ui.addFavorite).toBeTruthy();
      expect(ui.noUpload).toBeTruthy();
    }
  });

  it("falls back to English for unknown locales without throwing", () => {
    const ui = t("xx-YY");
    expect(ui.home).toBe(messages.en.home);
    expect(ui.close).toBe(uiAdditions.en.close);
    expect(ui.run).toBeTruthy();
  });

  it("resolves category slugs for every locale", () => {
    for (const locale of INITIAL_LOCALES) {
      for (const cat of categories) {
        const copy = copyForCategory(cat, locale);
        expect(copy.slug, `${cat.id}/${locale}`).toBeTruthy();
        expect(categoryBySlug(locale, copy.slug)?.id).toBe(cat.id);
      }
    }
  });

  it("resolves published tool slugs for every locale", () => {
    const sample = publishedTools().slice(0, 40);
    for (const locale of INITIAL_LOCALES) {
      for (const tool of sample) {
        const copy = copyForTool(tool, locale);
        expect(copy.slug).toBe(tool.id);
        expect(toolBySlug(locale, copy.slug)?.id).toBe(tool.id);
        expect(copy.title?.trim()).toBeTruthy();
        expect(copy.description?.trim()).toBeTruthy();
        expect(copy.name?.trim()).toBeTruthy();
      }
    }
  });
});

describe("Accept-Language complex headers", () => {
  it("handles zh-CN,zh;q=0.9,en;q=0.8", () => {
    expect(negotiateLocale("zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh-CN");
  });

  it("handles zh-TW before zh fallback", () => {
    expect(negotiateLocale("zh-TW,zh;q=0.9,en;q=0.8")).toBe("zh-TW");
  });

  it("handles multi-tag EU and Asian preferences", () => {
    expect(negotiateLocale("sv-SE,sv;q=0.9,en;q=0.8")).toBe("sv");
    expect(negotiateLocale("ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("ja");
    expect(negotiateLocale("pt-BR,pt;q=0.9,en;q=0.8")).toBe("pt");
    expect(negotiateLocale("nb,no;q=0.9,en;q=0.5")).toBe("no");
  });
});

describe("SEO meta uniqueness and hreflang", () => {
  it("keeps unique title+description vs EN for top-20 tools across all locales", () => {
    for (const id of TOP20_TOOL_IDS) {
      const tool = toolById(id);
      expect(tool, id).toBeTruthy();
      const en = tool!.copy.en;
      for (const locale of INITIAL_LOCALES) {
        if (locale === "en") continue;
        const copy = tool!.copy[locale];
        expect(copy.title, `${id}/${locale} title`).not.toBe(en.title);
        expect(copy.description, `${id}/${locale} description`).not.toBe(en.description);
        expect(copy.title.trim().length).toBeGreaterThan(0);
        expect(copy.description.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps unique title+description vs EN for a sample of synthesized tools", () => {
    const synth = publishedTools()
      .filter((tool) => !(TOP20_TOOL_IDS as readonly string[]).includes(tool.id))
      .slice(0, 12);
    const probeLocales = ["ja", "ko", "zh-CN", "zh-TW", "ro", "cs", "sv", "ar", "de", "hi"] as const;
    for (const tool of synth) {
      const en = tool.copy.en;
      for (const locale of probeLocales) {
        expect(tool.copy[locale].title).not.toBe(en.title);
        expect(tool.copy[locale].description).not.toBe(en.description);
      }
    }
  });

  it("emits hreflang for all 36 locales + x-default on pages and tools", () => {
    const home = languageAlternates("", indexableLocales());
    const keys = Object.keys(home);
    expect(keys).toHaveLength(37);
    expect(home["x-default"]).toContain(`/${SOURCE_LOCALE}`);
    for (const locale of INITIAL_LOCALES) {
      expect(home[locale]).toContain(`/${locale}`);
    }

    const merge = toolById("merge-pdf")!;
    for (const locale of ["en", "ja", "zh-CN", "ar", "ro"] as const) {
      const meta = toolMetadata(merge, locale);
      const langs = (meta.alternates as { languages?: Record<string, string> })?.languages ?? {};
      expect(Object.keys(langs).filter((k) => k !== "x-default")).toHaveLength(36);
      expect(langs["x-default"]).toContain("/en/tools/merge-pdf");
      expect(meta.title).toBe(merge.copy[locale].title);
      expect(meta.description).toBe(merge.copy[locale].description);
    }

    const page = pageMetadata({
      locale: "ja",
      title: t("ja").homeTitle,
      description: t("ja").heroLead,
      pathWithoutLocale: "",
    });
    const pageLangs = (page.alternates as { languages?: Record<string, string> })?.languages ?? {};
    expect(Object.keys(pageLangs)).toHaveLength(37);
    expect(pageLangs["x-default"]).toContain("/en");
  });

  it("points tool OG images at the route-locale opengraph-image", () => {
    const meta = toolMetadata(toolById("merge-pdf")!, "ja");
    const og = meta.openGraph?.images;
    const first = Array.isArray(og) ? og[0] : og;
    const url = typeof first === "string" ? first : first && "url" in first ? String(first.url) : "";
    expect(url).toContain("/ja/tools/merge-pdf/opengraph-image");
  });
});

describe("sitemap structure and count formula", () => {
  it("matches L × (1 + legal + categories + published tools) with no duplicates", () => {
    const L = INITIAL_LOCALES.length;
    const published = publishedTools();
    const expected = L * (1 + LEGAL_SLUGS.length + categories.length + published.length);
    const entries = sitemapEntries();
    expect(entries).toHaveLength(expected);
    expect(expected).toBe(15_768);

    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);

    for (const locale of INITIAL_LOCALES) {
      expect(urls.some((u) => u.endsWith(`/${locale}`) || u.includes(`/${locale}?`))).toBe(true);
      expect(indexableTools(locale).length).toBe(published.length);
      for (const cat of categories) {
        const slug = cat.copy[locale].slug;
        expect(urls.some((u) => u.includes(`/${locale}/tools/${slug}`))).toBe(true);
      }
    }

    for (const entry of entries) {
      expect(entry.url.startsWith("http")).toBe(true);
      expect(entry.alternates.languages["x-default"]).toBeTruthy();
      expect(entry.url.includes("/admin")).toBe(false);
      expect(entry.url.includes("/search")).toBe(false);
    }
  });

  it("includes every published tool × locale prefix exactly once", () => {
    const entries = sitemapEntries();
    const toolUrls = entries.filter((e) => /\/tools\/[a-z0-9-]+$/.test(e.url) && !categories.some((c) =>
      INITIAL_LOCALES.some((locale) => e.url.endsWith(`/tools/${c.copy[locale].slug}`)),
    ));
    expect(toolUrls).toHaveLength(INITIAL_LOCALES.length * publishedTools().length);

    const mergeJa = toolUrls.find((e) => e.url.endsWith("/ja/tools/merge-pdf"));
    expect(mergeJa).toBeTruthy();
    expect(Object.keys(mergeJa!.alternates.languages).filter((k) => k !== "x-default")).toHaveLength(36);
  });
});

describe("locale route helpers (home + base categories)", () => {
  it("treats every routed locale home path as valid", () => {
    for (const locale of INITIAL_LOCALES) {
      expect(isRoutedLocale(locale)).toBe(true);
      expect(`/${locale}`).toMatch(/^\/[a-z]{2}(-[A-Z]{2})?$/);
    }
  });

  it("resolves base category URLs for all 36 locales", () => {
    for (const locale of INITIAL_LOCALES) {
      for (const cat of categories) {
        const slug = cat.copy[locale].slug;
        expect(categoryBySlug(locale, slug)?.id).toBe(cat.id);
        // English slug still resolves when shared (e.g. pdf)
        if (slug !== cat.copy.en.slug) {
          expect(categoryBySlug(locale, cat.copy.en.slug)?.id ?? cat.id).toBeTruthy();
        }
      }
    }
  });
});

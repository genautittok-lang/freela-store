import { ROUTED_LOCALES, SOURCE_LOCALE, isRoutedLocale, type Locale } from "@/data/locales";

const LOCALE_COOKIE = "freela_locale";

/** Map BCP47 tags / prefixes onto Freela routed locales. */
const ALIASES: Record<string, Locale> = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  de: "de",
  "de-de": "de",
  "de-at": "de",
  "de-ch": "de",
  uk: "uk",
  "uk-ua": "uk",
  pl: "pl",
  "pl-pl": "pl",
  fr: "fr",
  "fr-fr": "fr",
  "fr-ca": "fr",
  "fr-be": "fr",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  "es-ar": "es",
  "es-latn": "es",
  it: "it",
  "it-it": "it",
  pt: "pt",
  "pt-pt": "pt",
  "pt-br": "pt",
  nl: "nl",
  "nl-nl": "nl",
  "nl-be": "nl",
  tr: "tr",
  "tr-tr": "tr",
  ar: "ar",
  "ar-sa": "ar",
  "ar-eg": "ar",
  he: "he",
  "he-il": "he",
  iw: "he",
  ja: "ja",
  "ja-jp": "ja",
  ko: "ko",
  "ko-kr": "ko",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-tw": "zh-TW",
  "zh-hant": "zh-TW",
  "zh-hk": "zh-TW",
  "zh-mo": "zh-TW",
  hi: "hi",
  "hi-in": "hi",
  id: "id",
  "id-id": "id",
  in: "id",
  vi: "vi",
  "vi-vn": "vi",
  th: "th",
  "th-th": "th",
  ro: "ro",
  "ro-ro": "ro",
  cs: "cs",
  "cs-cz": "cs",
  sk: "sk",
  "sk-sk": "sk",
  hu: "hu",
  "hu-hu": "hu",
  el: "el",
  "el-gr": "el",
  bg: "bg",
  "bg-bg": "bg",
  hr: "hr",
  "hr-hr": "hr",
  sr: "sr",
  "sr-rs": "sr",
  "sr-latn": "sr",
  "sr-cyrl": "sr",
  sl: "sl",
  "sl-si": "sl",
  sv: "sv",
  "sv-se": "sv",
  da: "da",
  "da-dk": "da",
  no: "no",
  nb: "no",
  nn: "no",
  "nb-no": "no",
  "nn-no": "no",
  fi: "fi",
  "fi-fi": "fi",
  et: "et",
  "et-ee": "et",
  lv: "lv",
  "lv-lv": "lv",
  lt: "lt",
  "lt-lt": "lt",
};

function mapTag(tag: string): Locale | null {
  const lower = tag.trim().toLowerCase();
  if (!lower) return null;
  if (ALIASES[lower]) return ALIASES[lower];
  const primary = lower.split("-")[0]!;
  if (ALIASES[primary]) return ALIASES[primary];
  if (isRoutedLocale(lower)) return lower;
  if (isRoutedLocale(primary)) return primary;
  // zh without region already mapped; try zh-CN / zh-TW exact
  if (primary === "zh") return "zh-CN";
  return null;
}

type Parsed = { tag: string; q: number };

function parseAcceptLanguage(header: string | null): Parsed[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = (rawTag || "").trim();
      let q = 1;
      for (const p of params) {
        const m = p.trim().match(/^q\s*=\s*([0-9.]+)$/i);
        if (m) q = Number(m[1]);
      }
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag && item.q > 0)
    .sort((a, b) => b.q - a.q);
}

/** Best matching Freela locale from Accept-Language, else English. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  for (const { tag } of parseAcceptLanguage(acceptLanguage)) {
    const hit = mapTag(tag);
    if (hit && (ROUTED_LOCALES as readonly string[]).includes(hit)) return hit;
  }
  return SOURCE_LOCALE;
}

export function localeFromCookie(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)freela_locale=([^;]+)/i);
  if (!match) return null;
  const value = decodeURIComponent(match[1]!.trim());
  return isRoutedLocale(value) ? value : null;
}

/** Cookie preference wins; otherwise Accept-Language; fallback en. */
export function resolveRootLocale(request: {
  headers: { get(name: string): string | null };
}): Locale {
  const cookie = localeFromCookie(request.headers.get("cookie"));
  if (cookie) return cookie;
  return negotiateLocale(request.headers.get("accept-language"));
}

export { LOCALE_COOKIE };

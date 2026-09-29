export const SOURCE_LOCALE = "en" as const;

/** Locales that currently have routed UI chrome. */
export const INITIAL_LOCALES = [
  "en",
  "de",
  "uk",
  "pl",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "tr",
  "ar",
  "he",
  "ja",
  "ko",
  "zh-CN",
  "zh-TW",
  "hi",
  "id",
  "vi",
  "th",
  "ro",
  "cs",
  "sk",
  "hu",
  "el",
  "bg",
  "hr",
  "sr",
  "sl",
  "sv",
  "da",
  "no",
  "fi",
  "et",
  "lv",
  "lt",
] as const;

export const NEW_LOCALES = ["ja", "ko", "zh-CN", "zh-TW", "hi", "id", "vi", "th"] as const;
export type NewLocale = (typeof NEW_LOCALES)[number];

/** European locales activated in v1.2 (previously prepared). */
export const EU_LOCALES = [
  "ro",
  "cs",
  "sk",
  "hu",
  "el",
  "bg",
  "hr",
  "sr",
  "sl",
  "sv",
  "da",
  "no",
  "fi",
  "et",
  "lv",
  "lt",
] as const;
export type EuLocale = (typeof EU_LOCALES)[number];

export type Locale = (typeof INITIAL_LOCALES)[number];

/** No prepared/unpublished locales after v1.2 activation. */
export const PREPARED_LOCALES = [] as const;

export type PreparedLocale = (typeof PREPARED_LOCALES)[number];

export type LocaleRecord = {
  code: string;
  name: string;
  nativeName: string;
  htmlLang: string;
  ogLocale: string;
  dir: "ltr" | "rtl";
  dateLocale: string;
  flag: string;
  indexable: boolean;
  translationReviewed: boolean;
  routed: boolean;
};

const base = (
  code: string,
  name: string,
  nativeName: string,
  htmlLang: string,
  ogLocale: string,
  dateLocale: string,
  flag: string,
  extra: Partial<LocaleRecord> = {},
): LocaleRecord => ({
  code,
  name,
  nativeName,
  htmlLang,
  ogLocale,
  dateLocale,
  flag,
  dir: extra.dir ?? "ltr",
  indexable: extra.indexable ?? false,
  translationReviewed: extra.translationReviewed ?? false,
  routed: extra.routed ?? false,
});

const active = (extra: Partial<LocaleRecord> = {}): Partial<LocaleRecord> => ({
  routed: true,
  indexable: true,
  translationReviewed: true,
  ...extra,
});

export const localeRegistry: Record<Locale, LocaleRecord> = {
  en: base("en", "English", "English", "en", "en_US", "en-US", "🇬🇧", active()),
  de: base("de", "German", "Deutsch", "de", "de_DE", "de-DE", "🇩🇪", active()),
  uk: base("uk", "Ukrainian", "Українська", "uk", "uk_UA", "uk-UA", "🇺🇦", active()),
  pl: base("pl", "Polish", "Polski", "pl", "pl_PL", "pl-PL", "🇵🇱", active()),
  fr: base("fr", "French", "Français", "fr", "fr_FR", "fr-FR", "🇫🇷", active()),
  es: base("es", "Spanish", "Español", "es", "es_ES", "es-ES", "🇪🇸", active()),
  it: base("it", "Italian", "Italiano", "it", "it_IT", "it-IT", "🇮🇹", active()),
  pt: base("pt", "Portuguese", "Português", "pt", "pt_PT", "pt-PT", "🇵🇹", active()),
  nl: base("nl", "Dutch", "Nederlands", "nl", "nl_NL", "nl-NL", "🇳🇱", active()),
  tr: base("tr", "Turkish", "Türkçe", "tr", "tr_TR", "tr-TR", "🇹🇷", active()),
  ar: base("ar", "Arabic", "العربية", "ar", "ar_SA", "ar-SA", "🇸🇦", active({ dir: "rtl" })),
  he: base("he", "Hebrew", "עברית", "he", "he_IL", "he-IL", "🇮🇱", active({ dir: "rtl" })),
  ja: base("ja", "Japanese", "日本語", "ja", "ja_JP", "ja-JP", "🇯🇵", active()),
  ko: base("ko", "Korean", "한국어", "ko", "ko_KR", "ko-KR", "🇰🇷", active()),
  "zh-CN": base("zh-CN", "Chinese (Simplified)", "简体中文", "zh-CN", "zh_CN", "zh-CN", "🇨🇳", active()),
  "zh-TW": base("zh-TW", "Chinese (Traditional)", "繁體中文", "zh-TW", "zh_TW", "zh-TW", "🇹🇼", active()),
  hi: base("hi", "Hindi", "हिन्दी", "hi", "hi_IN", "hi-IN", "🇮🇳", active()),
  id: base("id", "Indonesian", "Bahasa Indonesia", "id", "id_ID", "id-ID", "🇮🇩", active()),
  vi: base("vi", "Vietnamese", "Tiếng Việt", "vi", "vi_VN", "vi-VN", "🇻🇳", active()),
  th: base("th", "Thai", "ไทย", "th", "th_TH", "th-TH", "🇹🇭", active()),
  ro: base("ro", "Romanian", "Română", "ro", "ro_RO", "ro-RO", "🇷🇴", active()),
  cs: base("cs", "Czech", "Čeština", "cs", "cs_CZ", "cs-CZ", "🇨🇿", active()),
  sk: base("sk", "Slovak", "Slovenčina", "sk", "sk_SK", "sk-SK", "🇸🇰", active()),
  hu: base("hu", "Hungarian", "Magyar", "hu", "hu_HU", "hu-HU", "🇭🇺", active()),
  el: base("el", "Greek", "Ελληνικά", "el", "el_GR", "el-GR", "🇬🇷", active()),
  bg: base("bg", "Bulgarian", "Български", "bg", "bg_BG", "bg-BG", "🇧🇬", active()),
  hr: base("hr", "Croatian", "Hrvatski", "hr", "hr_HR", "hr-HR", "🇭🇷", active()),
  sr: base("sr", "Serbian", "Српски", "sr", "sr_RS", "sr-RS", "🇷🇸", active()),
  sl: base("sl", "Slovenian", "Slovenščina", "sl", "sl_SI", "sl-SI", "🇸🇮", active()),
  sv: base("sv", "Swedish", "Svenska", "sv", "sv_SE", "sv-SE", "🇸🇪", active()),
  da: base("da", "Danish", "Dansk", "da", "da_DK", "da-DK", "🇩🇰", active()),
  no: base("no", "Norwegian", "Norsk", "no", "nb_NO", "nb-NO", "🇳🇴", active()),
  fi: base("fi", "Finnish", "Suomi", "fi", "fi_FI", "fi-FI", "🇫🇮", active()),
  et: base("et", "Estonian", "Eesti", "et", "et_EE", "et-EE", "🇪🇪", active()),
  lv: base("lv", "Latvian", "Latviešu", "lv", "lv_LV", "lv-LV", "🇱🇻", active()),
  lt: base("lt", "Lithuanian", "Lietuvių", "lt", "lt_LT", "lt-LT", "🇱🇹", active()),
};

/** Kept empty after v1.2; type retained for admin/qa compatibility. */
export const preparedLocaleRegistry: Record<string, LocaleRecord> = {};

export const RTL_ROUTED = ["ar", "he"] as const;
export const ROUTED_LOCALES = INITIAL_LOCALES;
export type RoutedLocale = Locale;

export function isLocale(value: string): value is Locale {
  return (INITIAL_LOCALES as readonly string[]).includes(value);
}

export function isRoutedLocale(value: string): value is RoutedLocale {
  return (ROUTED_LOCALES as readonly string[]).includes(value);
}

/** Tool/category copy: every routed locale uses its own pack. */
export function contentLocale(code: string): Locale {
  return isLocale(code) ? code : SOURCE_LOCALE;
}

export function getLocale(code: string): LocaleRecord | undefined {
  if (isLocale(code)) return localeRegistry[code];
  return undefined;
}

export const defaultLocale: Locale = SOURCE_LOCALE;

export const allKnownLocales: LocaleRecord[] = Object.values(localeRegistry);

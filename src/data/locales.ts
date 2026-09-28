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
] as const;

export const NEW_LOCALES = ["ja", "ko", "zh-CN", "zh-TW", "hi", "id", "vi", "th"] as const;
export type NewLocale = (typeof NEW_LOCALES)[number];

export type Locale = (typeof INITIAL_LOCALES)[number];

/** Prepared for future publication; no public URLs until translations pass QA. */
export const PREPARED_LOCALES = [
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

export const localeRegistry: Record<Locale, LocaleRecord> = {
  en: base("en", "English", "English", "en", "en_US", "en-US", "🇬🇧", {
    indexable: true,
    translationReviewed: true,
    routed: true,
  }),
  de: base("de", "German", "Deutsch", "de", "de_DE", "de-DE", "🇩🇪", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  uk: base("uk", "Ukrainian", "Українська", "uk", "uk_UA", "uk-UA", "🇺🇦", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  pl: base("pl", "Polish", "Polski", "pl", "pl_PL", "pl-PL", "🇵🇱", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  fr: base("fr", "French", "Français", "fr", "fr_FR", "fr-FR", "🇫🇷", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  es: base("es", "Spanish", "Español", "es", "es_ES", "es-ES", "🇪🇸", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  it: base("it", "Italian", "Italiano", "it", "it_IT", "it-IT", "🇮🇹", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  pt: base("pt", "Portuguese", "Português", "pt", "pt_PT", "pt-PT", "🇵🇹", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  nl: base("nl", "Dutch", "Nederlands", "nl", "nl_NL", "nl-NL", "🇳🇱", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  tr: base("tr", "Turkish", "Türkçe", "tr", "tr_TR", "tr-TR", "🇹🇷", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  ar: base("ar", "Arabic", "العربية", "ar", "ar_SA", "ar-SA", "🇸🇦", {
    dir: "rtl",
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  he: base("he", "Hebrew", "עברית", "he", "he_IL", "he-IL", "🇮🇱", {
    dir: "rtl",
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  ja: base("ja", "Japanese", "日本語", "ja", "ja_JP", "ja-JP", "🇯🇵", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  ko: base("ko", "Korean", "한국어", "ko", "ko_KR", "ko-KR", "🇰🇷", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  "zh-CN": base("zh-CN", "Chinese (Simplified)", "简体中文", "zh-CN", "zh_CN", "zh-CN", "🇨🇳", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  "zh-TW": base("zh-TW", "Chinese (Traditional)", "繁體中文", "zh-TW", "zh_TW", "zh-TW", "🇹🇼", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  hi: base("hi", "Hindi", "हिन्दी", "hi", "hi_IN", "hi-IN", "🇮🇳", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  id: base("id", "Indonesian", "Bahasa Indonesia", "id", "id_ID", "id-ID", "🇮🇩", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  vi: base("vi", "Vietnamese", "Tiếng Việt", "vi", "vi_VN", "vi-VN", "🇻🇳", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
  th: base("th", "Thai", "ไทย", "th", "th_TH", "th-TH", "🇹🇭", {
    routed: true,
    indexable: true,
    translationReviewed: true,
  }),
};

export const preparedLocaleRegistry: Record<PreparedLocale, LocaleRecord> = {
  ro: base("ro", "Romanian", "Română", "ro", "ro_RO", "ro-RO", "🇷🇴"),
  cs: base("cs", "Czech", "Čeština", "cs", "cs_CZ", "cs-CZ", "🇨🇿"),
  sk: base("sk", "Slovak", "Slovenčina", "sk", "sk_SK", "sk-SK", "🇸🇰"),
  hu: base("hu", "Hungarian", "Magyar", "hu", "hu_HU", "hu-HU", "🇭🇺"),
  el: base("el", "Greek", "Ελληνικά", "el", "el_GR", "el-GR", "🇬🇷"),
  bg: base("bg", "Bulgarian", "Български", "bg", "bg_BG", "bg-BG", "🇧🇬"),
  hr: base("hr", "Croatian", "Hrvatski", "hr", "hr_HR", "hr-HR", "🇭🇷"),
  sr: base("sr", "Serbian", "Српски", "sr", "sr_RS", "sr-RS", "🇷🇸"),
  sl: base("sl", "Slovenian", "Slovenščina", "sl", "sl_SI", "sl-SI", "🇸🇮"),
  sv: base("sv", "Swedish", "Svenska", "sv", "sv_SE", "sv-SE", "🇸🇪"),
  da: base("da", "Danish", "Dansk", "da", "da_DK", "da-DK", "🇩🇰"),
  no: base("no", "Norwegian", "Norsk", "no", "nb_NO", "nb-NO", "🇳🇴"),
  fi: base("fi", "Finnish", "Suomi", "fi", "fi_FI", "fi-FI", "🇫🇮"),
  et: base("et", "Estonian", "Eesti", "et", "et_EE", "et-EE", "🇪🇪"),
  lv: base("lv", "Latvian", "Latviešu", "lv", "lv_LV", "lv-LV", "🇱🇻"),
  lt: base("lt", "Lithuanian", "Lietuvių", "lt", "lt_LT", "lt-LT", "🇱🇹"),
};

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
  if ((PREPARED_LOCALES as readonly string[]).includes(code)) {
    return preparedLocaleRegistry[code as PreparedLocale];
  }
  return undefined;
}

export const defaultLocale: Locale = SOURCE_LOCALE;

export const allKnownLocales: LocaleRecord[] = [
  ...Object.values(localeRegistry),
  ...Object.values(preparedLocaleRegistry),
];

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
] as const;

export type Locale = (typeof INITIAL_LOCALES)[number];

/** Prepared for future publication; no public URLs until translations pass QA. */
export const PREPARED_LOCALES = [
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
  de: base("de", "German", "Deutsch", "de", "de_DE", "de-DE", "🇩🇪", { routed: true }),
  uk: base("uk", "Ukrainian", "Українська", "uk", "uk_UA", "uk-UA", "🇺🇦", { routed: true }),
  pl: base("pl", "Polish", "Polski", "pl", "pl_PL", "pl-PL", "🇵🇱", { routed: true }),
  fr: base("fr", "French", "Français", "fr", "fr_FR", "fr-FR", "🇫🇷", { routed: true }),
  es: base("es", "Spanish", "Español", "es", "es_ES", "es-ES", "🇪🇸", { routed: true }),
  it: base("it", "Italian", "Italiano", "it", "it_IT", "it-IT", "🇮🇹", { routed: true }),
  pt: base("pt", "Portuguese", "Português", "pt", "pt_PT", "pt-PT", "🇵🇹", { routed: true }),
  nl: base("nl", "Dutch", "Nederlands", "nl", "nl_NL", "nl-NL", "🇳🇱", { routed: true }),
  tr: base("tr", "Turkish", "Türkçe", "tr", "tr_TR", "tr-TR", "🇹🇷", { routed: true }),
};

export const preparedLocaleRegistry: Record<PreparedLocale, LocaleRecord> = {
  ar: base("ar", "Arabic", "العربية", "ar", "ar_SA", "ar-SA", "🇸🇦", { dir: "rtl" }),
  he: base("he", "Hebrew", "עברית", "he", "he_IL", "he-IL", "🇮🇱", { dir: "rtl" }),
  ja: base("ja", "Japanese", "日本語", "ja", "ja_JP", "ja-JP", "🇯🇵"),
  ko: base("ko", "Korean", "한국어", "ko", "ko_KR", "ko-KR", "🇰🇷"),
  "zh-CN": base("zh-CN", "Chinese (Simplified)", "简体中文", "zh-CN", "zh_CN", "zh-CN", "🇨🇳"),
  "zh-TW": base("zh-TW", "Chinese (Traditional)", "繁體中文", "zh-TW", "zh_TW", "zh-TW", "🇹🇼"),
  hi: base("hi", "Hindi", "हिन्दी", "hi", "hi_IN", "hi-IN", "🇮🇳"),
  id: base("id", "Indonesian", "Bahasa Indonesia", "id", "id_ID", "id-ID", "🇮🇩"),
  vi: base("vi", "Vietnamese", "Tiếng Việt", "vi", "vi_VN", "vi-VN", "🇻🇳"),
  th: base("th", "Thai", "ไทย", "th", "th_TH", "th-TH", "🇹🇭"),
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

export function isLocale(value: string): value is Locale {
  return (INITIAL_LOCALES as readonly string[]).includes(value);
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

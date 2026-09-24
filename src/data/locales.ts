export const SOURCE_LOCALE = "en" as const;

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

export type LocaleRecord = {
  code: Locale;
  name: string;
  nativeName: string;
  htmlLang: string;
  ogLocale: string;
  dir: "ltr" | "rtl";
  dateLocale: string;
  /** Locales are indexable only after translation QA. */
  indexable: boolean;
  translationReviewed: boolean;
};

export const localeRegistry: Record<Locale, LocaleRecord> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    htmlLang: "en",
    ogLocale: "en_US",
    dir: "ltr",
    dateLocale: "en-US",
    indexable: true,
    translationReviewed: true,
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    htmlLang: "de",
    ogLocale: "de_DE",
    dir: "ltr",
    dateLocale: "de-DE",
    indexable: false,
    translationReviewed: false,
  },
  uk: {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    htmlLang: "uk",
    ogLocale: "uk_UA",
    dir: "ltr",
    dateLocale: "uk-UA",
    indexable: false,
    translationReviewed: false,
  },
  pl: {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    htmlLang: "pl",
    ogLocale: "pl_PL",
    dir: "ltr",
    dateLocale: "pl-PL",
    indexable: false,
    translationReviewed: false,
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    htmlLang: "fr",
    ogLocale: "fr_FR",
    dir: "ltr",
    dateLocale: "fr-FR",
    indexable: false,
    translationReviewed: false,
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    htmlLang: "es",
    ogLocale: "es_ES",
    dir: "ltr",
    dateLocale: "es-ES",
    indexable: false,
    translationReviewed: false,
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    htmlLang: "it",
    ogLocale: "it_IT",
    dir: "ltr",
    dateLocale: "it-IT",
    indexable: false,
    translationReviewed: false,
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    htmlLang: "pt",
    ogLocale: "pt_PT",
    dir: "ltr",
    dateLocale: "pt-PT",
    indexable: false,
    translationReviewed: false,
  },
  nl: {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    htmlLang: "nl",
    ogLocale: "nl_NL",
    dir: "ltr",
    dateLocale: "nl-NL",
    indexable: false,
    translationReviewed: false,
  },
  tr: {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    htmlLang: "tr",
    ogLocale: "tr_TR",
    dir: "ltr",
    dateLocale: "tr-TR",
    indexable: false,
    translationReviewed: false,
  },
};

export function isLocale(value: string): value is Locale {
  return (INITIAL_LOCALES as readonly string[]).includes(value);
}

export function getLocale(code: string): LocaleRecord | undefined {
  if (!isLocale(code)) return undefined;
  return localeRegistry[code];
}

export const defaultLocale: Locale = SOURCE_LOCALE;

import { localeRegistry, type Locale } from "@/data/locales";

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(localeRegistry[locale].dateLocale, options).format(value);
}

export function formatDate(locale: Locale, date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(localeRegistry[locale].dateLocale, options).format(d);
}

export function formatBytes(locale: Locale, bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${formatNumber(locale, mb, { maximumFractionDigits: mb < 1 ? 2 : 0 })} MB`;
}

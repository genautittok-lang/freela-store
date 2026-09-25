import { getLocale, localeRegistry } from "@/data/locales";

function dateTag(locale: string) {
  return (getLocale(locale) ?? localeRegistry.en).dateLocale;
}

export function formatNumber(locale: string, value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(dateTag(locale), options).format(value);
}

export function formatDate(locale: string, date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(dateTag(locale), options).format(d);
}

export function formatBytes(locale: string, bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${formatNumber(locale, mb, { maximumFractionDigits: mb < 1 ? 2 : 0 })} MB`;
}

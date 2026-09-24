"use client";

import { useRouter } from "next/navigation";
import { INITIAL_LOCALES, localeRegistry, type Locale } from "@/data/locales";
import { t } from "@/i18n/messages";
import { track } from "@/components/analytics-provider";

export function LanguageSwitcher({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const router = useRouter();
  const ui = t(locale);
  const rest = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, "") || "/";
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{ui.language}</span>
      <select
        className="h-9 max-w-[10rem] rounded-lg border bg-background px-2"
        value={locale}
        onChange={(e) => {
          const next = e.target.value as Locale;
          document.cookie = `freela_locale=${next};path=/;max-age=31536000`;
          localStorage.setItem("freela_locale", next);
          track("language_change", { locale: next });
          router.push(`/${next}${rest === "/" ? "" : rest}`);
        }}
        aria-label={ui.language}
      >
        {INITIAL_LOCALES.map((code) => (
          <option key={code} value={code}>
            {localeRegistry[code].nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}

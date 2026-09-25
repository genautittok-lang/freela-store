"use client";

import { useRouter } from "next/navigation";
import { ROUTED_LOCALES, getLocale } from "@/data/locales";
import { t } from "@/i18n/messages";
import { track } from "@/components/analytics-provider";

export function LanguageSwitcher({
  locale,
  pathname,
}: {
  locale: string;
  pathname: string;
}) {
  const router = useRouter();
  const ui = t(locale);
  const rest = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?/, "") || "/";
  const current = getLocale(locale);
  return (
    <label className="flex min-w-0 items-center gap-2 text-sm">
      <span className="sr-only">{ui.language}</span>
      <select
        className="h-9 max-w-[14rem] rounded-lg border bg-background px-2"
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          document.cookie = `freela_locale=${next};path=/;max-age=31536000;SameSite=Lax`;
          localStorage.setItem("freela_locale", next);
          track("language_change", { locale: next });
          router.push(`/${next}${rest === "/" ? "" : rest}`);
        }}
        aria-label={ui.language}
      >
        {ROUTED_LOCALES.map((code) => {
          const rec = getLocale(code);
          return (
            <option key={code} value={code}>
              {rec?.flag} {rec?.nativeName} ({code})
            </option>
          );
        })}
      </select>
      <span className="hidden text-xs text-muted-foreground lg:inline" aria-hidden>
        {current?.flag} {current?.code}
      </span>
    </label>
  );
}

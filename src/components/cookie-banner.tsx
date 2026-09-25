"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/data/locales";
import { t } from "@/i18n/messages";
import { Button } from "@/components/ui/button";

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((fn) => fn());
}
function readConsent() {
  return localStorage.getItem("freela_consent");
}

export function CookieBanner({ locale }: { locale: string }) {
  const ui = t(locale);
  const consent = useSyncExternalStore(subscribe, readConsent, () => "ssr");
  if (consent === "ssr" || consent === "yes" || consent === "no") return null;
  return (
    <div className="fixed end-4 bottom-4 z-50 w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-border bg-card p-4 shadow-lg">
      <p className="text-sm font-semibold">{ui.cookieTitle}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {ui.cookiesBody}{" "}
        <Link className="underline" href={`/${locale}/privacy`}>
          {ui.privacyPolicy}
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            localStorage.setItem("freela_consent", "no");
            emit();
          }}
        >
          {ui.necessaryOnly}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            localStorage.setItem("freela_consent", "yes");
            emit();
          }}
        >
          {ui.accept}
        </Button>
      </div>
    </div>
  );
}

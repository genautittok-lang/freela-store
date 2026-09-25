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

export function CookieBanner({ locale }: { locale: Locale }) {
  const ui = t(locale);
  const consent = useSyncExternalStore(subscribe, readConsent, () => "ssr");
  if (consent === "ssr" || consent === "yes" || consent === "no") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {ui.cookiesBody}{" "}
          <Link className="underline" href={`/${locale}/privacy`}>
            {ui.privacyPolicy}
          </Link>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.setItem("freela_consent", "no");
              emit();
            }}
          >
            {ui.reject}
          </Button>
          <Button
            onClick={() => {
              localStorage.setItem("freela_consent", "yes");
              emit();
            }}
          >
            {ui.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}

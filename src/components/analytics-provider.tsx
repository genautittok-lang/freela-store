"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { AnalyticsEventName } from "@/lib/analytics-events";

type Consent = "unknown" | "yes" | "no";
type Ctx = { sessionId: string; consent: Consent; setConsent: (v: "yes" | "no") => void };

const AnalyticsContext = createContext<Ctx | null>(null);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function sid() {
  const key = "freela_sid";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function readSid() {
  return sid();
}

function readConsent(): Consent {
  const stored = localStorage.getItem("freela_consent");
  if (stored === "yes" || stored === "no") return stored;
  return "unknown";
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useSyncExternalStore(subscribe, readSid, () => "");
  const consent = useSyncExternalStore(subscribe, readConsent, () => "unknown" as Consent);

  function setConsent(v: "yes" | "no") {
    localStorage.setItem("freela_consent", v);
    emit();
  }

  const value = useMemo(() => ({ sessionId, consent, setConsent }), [sessionId, consent]);
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("analytics");
  return ctx;
}

export function track(
  name: AnalyticsEventName | string,
  extra: Record<string, string | undefined> = {},
) {
  if (typeof window === "undefined") return;
  const consent = localStorage.getItem("freela_consent");
  if (consent === "no") return;
  const sessionId = localStorage.getItem("freela_sid");
  if (!sessionId) return;
  let source: string | undefined;
  try {
    if (document.referrer) source = new URL(document.referrer).hostname;
  } catch {
    source = undefined;
  }
  const payload = {
    name,
    sessionId,
    toolId: extra.toolId,
    locale: extra.locale,
    processingMode: extra.processingMode,
    result: extra.result === "ok" || extra.result === "error" ? extra.result : undefined,
    path: extra.path && extra.path.startsWith("/") ? extra.path : window.location.pathname,
    source: extra.source && /^[a-z0-9.-]{1,120}$/.test(extra.source) ? extra.source : source,
  };
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => undefined);
}

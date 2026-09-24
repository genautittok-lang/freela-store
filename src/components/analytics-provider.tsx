"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AnalyticsEventName } from "@/lib/analytics";

type Ctx = { sessionId: string; consent: "unknown" | "yes" | "no"; setConsent: (v: "yes" | "no") => void };

const AnalyticsContext = createContext<Ctx | null>(null);

function sid() {
  const key = "freela_sid";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState("");
  const [consent, setConsentState] = useState<"unknown" | "yes" | "no">("unknown");

  useEffect(() => {
    setSessionId(sid());
    const stored = localStorage.getItem("freela_consent") as "yes" | "no" | null;
    if (stored) setConsentState(stored);
  }, []);

  function setConsent(v: "yes" | "no") {
    localStorage.setItem("freela_consent", v);
    setConsentState(v);
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
  const payload = {
    name,
    sessionId,
    toolId: extra.toolId,
    locale: extra.locale,
    processingMode: extra.processingMode,
    result: extra.result,
    path: window.location.pathname,
  };
  navigator.sendBeacon?.("/api/analytics", new Blob([JSON.stringify(payload)], { type: "application/json" })) ||
    fetch("/api/analytics", { method: "POST", body: JSON.stringify(payload), headers: { "content-type": "application/json" } });
}

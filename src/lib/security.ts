import { ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/analytics-events";
import { isLocale } from "@/data/locales";

const BLOCKED_KEYS = [
  "content",
  "file",
  "files",
  "bytes",
  "text",
  "body",
  "password",
  "secret",
  "token",
  "document",
  "image",
  "base64",
];

export function clientOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return false;
}

const buckets = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || row.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (row.n >= limit) return false;
  row.n += 1;
  return true;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export type SanitizedEvent = {
  name: AnalyticsEventName | "ad_view";
  sessionId: string;
  toolId: string | null;
  locale: string | null;
  processingMode: "LOCAL_ONLY" | "SERVER_PROCESSING" | "THIRD_PARTY_PROCESSING" | null;
  result: "ok" | "error" | null;
  path: string | null;
  source: string | null;
};

export function sanitizeAnalyticsPayload(input: unknown): SanitizedEvent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (BLOCKED_KEYS.includes(key.toLowerCase())) return null;
    const value = raw[key];
    if (typeof value === "string" && value.length > 240) return null;
  }
  const name = String(raw.name || "");
  if (!ANALYTICS_EVENTS.includes(name as AnalyticsEventName) && name !== "ad_view") return null;
  const sessionId = String(raw.sessionId || "").slice(0, 80);
  if (!/^[a-z0-9-]{8,80}$/i.test(sessionId)) return null;
  const toolId = raw.toolId == null || raw.toolId === "" ? null : String(raw.toolId);
  if (toolId && !/^[a-z0-9-]{1,80}$/.test(toolId)) return null;
  const locale = raw.locale == null || raw.locale === "" ? null : String(raw.locale);
  if (locale && !isLocale(locale)) return null;
  const mode = raw.processingMode == null || raw.processingMode === "" ? null : String(raw.processingMode);
  if (mode && mode !== "LOCAL_ONLY" && mode !== "SERVER_PROCESSING" && mode !== "THIRD_PARTY_PROCESSING") {
    return null;
  }
  const result = raw.result == null || raw.result === "" ? null : String(raw.result);
  if (result && result !== "ok" && result !== "error") return null;
  let path = raw.path == null ? null : String(raw.path).split("?")[0].slice(0, 200);
  if (path && !path.startsWith("/")) path = null;
  let source = raw.source == null || raw.source === "" ? null : String(raw.source).toLowerCase();
  if (source && !/^[a-z0-9.-]{1,120}$/.test(source)) source = null;
  return {
    name: name as SanitizedEvent["name"],
    sessionId,
    toolId,
    locale,
    processingMode: mode as SanitizedEvent["processingMode"],
    result: result as SanitizedEvent["result"],
    path,
    source,
  };
}

export function looksLikeFileContent(value: string) {
  if (value.length > 400) return true;
  if (/%PDF-|begin:vcard|-----BEGIN /i.test(value)) return true;
  if (/data:image\/|;base64,/.test(value) && value.length > 80) return true;
  return false;
}

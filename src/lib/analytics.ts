import { tryGetDb } from "@/lib/db";
import { ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/analytics-events";
import { looksLikeFileContent } from "@/lib/security";
import { toolRegistry } from "@/data/tools";
import { INITIAL_LOCALES, localeRegistry } from "@/data/locales";
import { messages } from "@/i18n/messages";
import { extras } from "@/i18n/extras";
import { dataInventory, vendors } from "@/data/privacy-ops";

export { ANALYTICS_EVENTS, type AnalyticsEventName };

export function recordEvent(input: {
  name: AnalyticsEventName | string;
  toolId?: string | null;
  locale?: string | null;
  sessionId: string;
  processingMode?: string | null;
  result?: string | null;
  path?: string | null;
  source?: string | null;
}) {
  if (!ANALYTICS_EVENTS.includes(input.name as AnalyticsEventName) && input.name !== "ad_view") {
    return;
  }
  const fields = [input.sessionId, input.toolId, input.locale, input.result, input.path, input.source];
  if (fields.some((v) => typeof v === "string" && looksLikeFileContent(v))) {
    return;
  }
  try {
    tryGetDb()
      ?.prepare(
        `INSERT INTO events (name, tool_id, locale, session_id, processing_mode, result, path, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.name,
        input.toolId ?? null,
        input.locale ?? null,
        input.sessionId,
        input.processingMode ?? null,
        input.result ?? null,
        input.path ?? null,
        input.source ?? null,
        new Date().toISOString(),
      );
  } catch {
    /* drop analytics if SQLite is unavailable */
  }
}

export function rangeStart(range: string) {
  const now = Date.now();
  const days =
    range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 30;
  return new Date(now - days * 86400000).toISOString();
}

export function analyticsSummary(range: string) {
  const empty = {
    visits: 0,
    opens: 0,
    starts: 0,
    completions: 0,
    errors: 0,
    downloads: 0,
    searches: 0,
    uniqueSessions: 0,
    topTools: [] as { id: string; opens: number; starts: number; completions: number; errors: number }[],
    bySuccess: [] as { id: string; opens: number; starts: number; completions: number; errors: number; rate: number }[],
    byError: [] as { id: string; opens: number; starts: number; completions: number; errors: number; rate: number }[],
    byLocale: [] as { locale: string; opens: number; starts: number; success: number }[],
    byDay: [] as { day: string; n: number }[],
    sources: [] as { source: string; n: number }[],
    errorTools: [] as { id: string; n: number }[],
    storage: "none" as "sqlite" | "none",
  };
  const db = tryGetDb();
  if (!db) return empty;
  try {
  const since = rangeStart(range);
  const count = (name?: string) => {
    if (name) {
      return (db.prepare(`SELECT COUNT(*) as n FROM events WHERE created_at >= ? AND name = ?`).get(since, name) as { n: number }).n;
    }
    return (db.prepare(`SELECT COUNT(*) as n FROM events WHERE created_at >= ?`).get(since) as { n: number }).n;
  };
  const unique = (
    db.prepare(`SELECT COUNT(DISTINCT session_id) as n FROM events WHERE created_at >= ?`).get(since) as { n: number }
  ).n;
  const topTools = db
    .prepare(
      `SELECT tool_id as id,
              SUM(name = 'tool_open') as opens,
              SUM(name = 'tool_start') as starts,
              SUM(name = 'tool_success') as completions,
              SUM(name = 'tool_error') as errors
       FROM events WHERE created_at >= ? AND tool_id IS NOT NULL
       GROUP BY tool_id ORDER BY opens DESC LIMIT 15`,
    )
    .all(since) as { id: string; opens: number; starts: number; completions: number; errors: number }[];
  const bySuccess = [...topTools]
    .map((row) => ({
      ...row,
      rate: row.starts ? row.completions / row.starts : 0,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);
  const byError = [...topTools]
    .map((row) => ({
      ...row,
      rate: row.starts ? row.errors / row.starts : row.errors,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);
  const byLocale = db
    .prepare(
      `SELECT locale,
              SUM(name = 'tool_open') as opens,
              SUM(name = 'tool_start') as starts,
              SUM(name = 'tool_success') as success
       FROM events WHERE created_at >= ? AND locale IS NOT NULL
       GROUP BY locale ORDER BY opens DESC`,
    )
    .all(since) as { locale: string; opens: number; starts: number; success: number }[];
  const byDay = db
    .prepare(
      `SELECT substr(created_at, 1, 10) as day, COUNT(*) as n
       FROM events WHERE created_at >= ? GROUP BY day ORDER BY day`,
    )
    .all(since) as { day: string; n: number }[];
  const sources = db
    .prepare(
      `SELECT source, COUNT(*) as n FROM events
       WHERE created_at >= ? AND source IS NOT NULL AND source != ''
       GROUP BY source ORDER BY n DESC LIMIT 10`,
    )
    .all(since) as { source: string; n: number }[];
  const errors = db
    .prepare(
      `SELECT tool_id as id, COUNT(*) as n FROM events
       WHERE created_at >= ? AND name = 'tool_error' AND tool_id IS NOT NULL
       GROUP BY tool_id ORDER BY n DESC LIMIT 10`,
    )
    .all(since) as { id: string; n: number }[];
  return {
    visits: count("page_view"),
    opens: count("tool_open"),
    starts: count("tool_start"),
    completions: count("tool_success"),
    errors: count("tool_error"),
    downloads: count("file_download"),
    searches: count("search_submit"),
    uniqueSessions: unique,
    topTools,
    bySuccess,
    byError,
    byLocale,
    byDay,
    sources,
    errorTools: errors,
    storage: "sqlite" as const,
  };
  } catch {
    return empty;
  }
}

export function eventsCsv(range: string) {
  const since = rangeStart(range);
  const header = "name,tool_id,locale,processing_mode,result,path,source,created_at";
  const db = tryGetDb();
  if (!db) return `${header}\n`;
  try {
    const rows = db
      .prepare(
        `SELECT name, tool_id, locale, processing_mode, result, path, source, created_at
       FROM events WHERE created_at >= ? ORDER BY created_at DESC LIMIT 5000`,
      )
      .all(since) as Record<string, string>[];
  const body = rows
    .map((row) =>
      [row.name, row.tool_id, row.locale, row.processing_mode, row.result, row.path, row.source, row.created_at]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
    return `${header}\n${body}`;
  } catch {
    return `${header}\n`;
  }
}

export function processingModeCounts() {
  const counts = { LOCAL_ONLY: 0, SERVER_PROCESSING: 0, THIRD_PARTY_PROCESSING: 0 };
  for (const tool of toolRegistry) {
    counts[tool.processingMode] += 1;
  }
  return counts;
}

export function translationHealth() {
  const required = Object.keys(messages.en).length + Object.keys(extras.en).length;
  return INITIAL_LOCALES.map((locale) => {
    const uiKeys = Object.keys(messages[locale]).length + Object.keys(extras[locale]).length;
    const tools = toolRegistry.filter((tool) => tool.copy[locale]);
    const reviewed = localeRegistry[locale].translationReviewed;
    return {
      locale,
      name: localeRegistry[locale].nativeName,
      uiKeys,
      required,
      toolsWithCopy: tools.length,
      toolsTotal: toolRegistry.length,
      reviewed,
      indexable: localeRegistry[locale].indexable,
    };
  });
}

export function retentionOverview() {
  return { inventory: dataInventory, vendors, analyticsRetention: "Until export or wipe; no file contents stored" };
}

export function recentAudit(limit = 50) {
  const db = tryGetDb();
  if (!db) return [];
  try {
    return db
      .prepare(
        `SELECT id, user_id, action, entity, entity_id, details, created_at
       FROM audit_log ORDER BY id DESC LIMIT ?`,
      )
      .all(limit) as {
      id: number;
      user_id: number | null;
      action: string;
      entity: string;
      entity_id: string | null;
      details: string | null;
      created_at: string;
    }[];
  } catch {
    return [];
  }
}

import { getDb } from "@/lib/db";

export const ANALYTICS_EVENTS = [
  "page_view",
  "tool_open",
  "tool_start",
  "tool_success",
  "tool_error",
  "file_selected",
  "file_download",
  "copy_result",
  "share_click",
  "language_change",
  "search_submit",
  "related_tool_click",
  "affiliate_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function recordEvent(input: {
  name: AnalyticsEventName | string;
  toolId?: string | null;
  locale?: string | null;
  sessionId: string;
  processingMode?: string | null;
  result?: string | null;
  path?: string | null;
}) {
  if (!ANALYTICS_EVENTS.includes(input.name as AnalyticsEventName) && input.name !== "ad_view") {
    return;
  }
  getDb()
    .prepare(
      `INSERT INTO events (name, tool_id, locale, session_id, processing_mode, result, path, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.toolId ?? null,
      input.locale ?? null,
      input.sessionId,
      input.processingMode ?? null,
      input.result ?? null,
      input.path ?? null,
      new Date().toISOString(),
    );
}

export function rangeStart(range: string) {
  const now = Date.now();
  const days =
    range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 30;
  return new Date(now - days * 86400000).toISOString();
}

export function analyticsSummary(range: string) {
  const db = getDb();
  const since = rangeStart(range);
  const count = (name?: string, extra = "") => {
    if (name) {
      return (
        db
          .prepare(`SELECT COUNT(*) as n FROM events WHERE created_at >= ? AND name = ? ${extra}`)
          .get(since, name) as { n: number }
      ).n;
    }
    return (db.prepare(`SELECT COUNT(*) as n FROM events WHERE created_at >= ?`).get(since) as { n: number })
      .n;
  };
  const unique = (
    db
      .prepare(`SELECT COUNT(DISTINCT session_id) as n FROM events WHERE created_at >= ?`)
      .get(since) as { n: number }
  ).n;
  const topTools = db
    .prepare(
      `SELECT tool_id as id,
              SUM(name = 'tool_open') as opens,
              SUM(name = 'tool_success') as completions,
              SUM(name = 'tool_error') as errors
       FROM events WHERE created_at >= ? AND tool_id IS NOT NULL
       GROUP BY tool_id ORDER BY opens DESC LIMIT 15`,
    )
    .all(since) as { id: string; opens: number; completions: number; errors: number }[];
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
    completions: count("tool_success"),
    errors: count("tool_error"),
    downloads: count("file_download"),
    uniqueSessions: unique,
    topTools,
    byLocale,
    byDay,
    errorTools: errors,
  };
}

export function eventsCsv(range: string) {
  const since = rangeStart(range);
  const rows = getDb()
    .prepare(
      `SELECT name, tool_id, locale, processing_mode, result, path, created_at
       FROM events WHERE created_at >= ? ORDER BY created_at DESC LIMIT 5000`,
    )
    .all(since) as Record<string, string>[];
  const header = "name,tool_id,locale,processing_mode,result,path,created_at";
  const body = rows
    .map((row) =>
      [row.name, row.tool_id, row.locale, row.processing_mode, row.result, row.path, row.created_at]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

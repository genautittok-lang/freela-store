import { tryGetDb } from "@/lib/db";
import { rangeStart } from "@/lib/analytics";
import { publishedTools, toolById, visibleTools } from "@/lib/registry";
import type { ToolDefinition } from "@/data/schema";

/**
 * Editorial bootstrap only. Never shown as usage counts.
 * Real events override once SQLite has tool_open/start/success/download/search.
 */
export const POPULARITY_SEED: Record<string, number> = {
  "video-to-mp4": 95,
  "video-to-gif": 88,
  "video-to-mp3": 87,
  "compress-video": 85,
  "image-upscaler": 83,
  "background-remover": 81,
  "merge-pdf": 96,
  "compress-pdf": 90,
  "pdf-to-image": 88,
  "compress-image": 86,
  "resize-image": 84,
  "convert-image": 82,
  "json-formatter": 80,
  "word-counter": 78,
  "qr-generator": 76,
  "tip-calculator": 74,
  "images-to-pdf": 72,
  "split-pdf": 70,
  "case-converter": 68,
  "hash-generator": 64,
  "percentage": 62,
  "csv-json": 60,
  "heic-to-jpg": 58,
  "password-generator": 56,
  "extract-pdf-pages": 54,
  "text-to-pdf": 52,
  "utm-builder": 50,
};

export type PopularityRow = {
  id: string;
  score: number;
  opens: number;
  starts: number;
  completions: number;
  downloads: number;
  errors: number;
  searches: number;
  completionRate: number;
  growth: number;
  source: "analytics" | "seed" | "blend";
};

type Agg = {
  opens: number;
  starts: number;
  completions: number;
  downloads: number;
  errors: number;
  searches: number;
};

function emptyAgg(): Agg {
  return { opens: 0, starts: 0, completions: 0, downloads: 0, errors: 0, searches: 0 };
}

function loadAgg(since: string, until?: string): Map<string, Agg> {
  const map = new Map<string, Agg>();
  const db = tryGetDb();
  if (!db) return map;
  try {
    const untilClause = until ? "AND created_at < ?" : "";
    const params = until ? [since, until] : [since];
    const rows = db
      .prepare(
        `SELECT tool_id as id, name, COUNT(*) as n
         FROM events
         WHERE created_at >= ? ${untilClause} AND tool_id IS NOT NULL
         GROUP BY tool_id, name`,
      )
      .all(...params) as { id: string; name: string; n: number }[];
    for (const row of rows) {
      const cur = map.get(row.id) ?? emptyAgg();
      if (row.name === "tool_open") cur.opens += row.n;
      if (row.name === "tool_start") cur.starts += row.n;
      if (row.name === "tool_success") cur.completions += row.n;
      if (row.name === "file_download") cur.downloads += row.n;
      if (row.name === "tool_error") cur.errors += row.n;
      if (row.name === "search_submit") cur.searches += row.n;
      map.set(row.id, cur);
    }
  } catch {
    return map;
  }
  return map;
}

function scoreFrom(agg: Agg, seed: number, prev: Agg | undefined, hasEvents: boolean): { score: number; growth: number; source: PopularityRow["source"] } {
  const rate = agg.starts ? agg.completions / agg.starts : 0;
  const growth = (agg.completions || agg.opens) - (prev ? prev.completions || prev.opens : 0);
  const usage =
    agg.completions * 4 +
    agg.downloads * 3 +
    agg.opens * 2 +
    agg.starts * 1.5 +
    agg.searches * 1.2 +
    rate * 20 +
    Math.max(0, growth) * 0.5 -
    agg.errors * 2;
  if (!hasEvents) return { score: seed, growth: 0, source: "seed" };
  if (usage <= 0) return { score: seed * 0.25, growth, source: "blend" };
  return { score: usage + seed * 0.12, growth, source: "blend" };
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function popularityRows(range = "30d"): PopularityRow[] {
  const since = rangeStart(range);
  const days = range === "today" ? 1 : range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const prevStart = isoDaysAgo(days * 2);
  const current = loadAgg(since);
  const previous = loadAgg(prevStart, since);
  const hasEvents = [...current.values()].some((a) => a.opens + a.starts + a.completions + a.downloads > 0);
  return publishedTools()
    .filter((tool) => tool.id !== "convert-video")
    .map((tool) => {
      const agg = current.get(tool.id) ?? emptyAgg();
      const { score, growth, source } = scoreFrom(agg, POPULARITY_SEED[tool.id] ?? 8, previous.get(tool.id), hasEvents);
      return {
        id: tool.id,
        score,
        opens: agg.opens,
        starts: agg.starts,
        completions: agg.completions,
        downloads: agg.downloads,
        errors: agg.errors,
        searches: agg.searches,
        completionRate: agg.starts ? agg.completions / agg.starts : 0,
        growth,
        source,
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function rankedToolIds(opts?: { limit?: number; maxPerCategory?: number; range?: string }) {
  const limit = opts?.limit ?? 12;
  const maxPerCategory = opts?.maxPerCategory ?? 3;
  const rows = popularityRows(opts?.range ?? "30d");
  const perCat = new Map<string, number>();
  const ids: string[] = [];
  for (const row of rows) {
    const tool = toolById(row.id);
    if (!tool) continue;
    const n = perCat.get(tool.category) ?? 0;
    if (n >= maxPerCategory) continue;
    perCat.set(tool.category, n + 1);
    ids.push(row.id);
    if (ids.length >= limit) break;
  }
  return ids;
}

export function rankedTools(locale: string, opts?: { limit?: number; maxPerCategory?: number; range?: string }): ToolDefinition[] {
  return rankedToolIds(opts)
    .map((id) => toolById(id))
    .filter((tool): tool is ToolDefinition => Boolean(tool && visibleTools(locale).some((t) => t.id === tool.id)));
}

export function rankedInCategory(locale: string, categoryId: string, limit = 4) {
  const order = new Map(popularityRows().map((row, i) => [row.id, i]));
  return visibleTools(locale)
    .filter((tool) => tool.category === categoryId && tool.id !== "convert-video")
    .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
    .slice(0, limit);
}

export function popularityScoreById() {
  return Object.fromEntries(popularityRows().map((row) => [row.id, row.score]));
}

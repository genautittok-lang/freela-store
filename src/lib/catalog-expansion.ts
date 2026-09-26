import { WAVE_TOOL_IDS } from "@/data/tools/english-wave";
import { WAVE2_TOOL_IDS } from "@/data/tools/english-wave2";
import { toolRegistry } from "@/data/tools";

export type ExpansionStatus = "implemented" | "candidate" | "deferred";

export type ExpansionCandidate = {
  id: string;
  category: string;
  value: number;
  implementability: number;
  status: ExpansionStatus;
  reason: string;
};

/**
 * Expansion system:
 * 1. Load published ids from the live registry.
 * 2. Score pool rows as value × implementability × (0 if already published).
 * 3. implementability 1 = honest LOCAL_ONLY in this tab today; 0 = server/native/fake.
 * 4. CLI: `npx tsx scripts/catalog-expansion.ts`
 */
const WAVE_CANDIDATES: ExpansionCandidate[] = [
  ...WAVE_TOOL_IDS.map((id) => ({
    id,
    category: "wave-local",
    value: 7,
    implementability: 1,
    status: "candidate" as const,
    reason: "Wave 1 LOCAL_ONLY in-tab utility",
  })),
  ...WAVE2_TOOL_IDS.map((id) => ({
    id,
    category: "wave2-local",
    value: 7,
    implementability: 1,
    status: "candidate" as const,
    reason: "Wave 2 LOCAL_ONLY in-tab utility",
  })),
];

/** High = unique user value. Implementability 1 = in-tab today, 0 = needs server/native. */
export const EXPANSION_POOL: ExpansionCandidate[] = [
  ...WAVE_CANDIDATES,
  { id: "pdf-to-word", category: "pdf-documents", value: 10, implementability: 0, status: "deferred", reason: "Layout replica / not honest in pdf-lib" },
  { id: "ocr-pdf", category: "pdf-documents", value: 9, implementability: 0, status: "deferred", reason: "Needs vision model or Tesseract wasm pack + QA" },
  { id: "webpage-to-pdf", category: "pdf-documents", value: 8, implementability: 0, status: "deferred", reason: "Headless browser" },
  { id: "pdf-encrypt", category: "pdf-documents", value: 8, implementability: 0, status: "deferred", reason: "Standard Security Handler not shipped" },
  { id: "ffmpeg-transcode", category: "converters", value: 8, implementability: 0, status: "deferred", reason: "ffmpeg.wasm not shipped" },
  { id: "live-serp-rank", category: "seo", value: 6, implementability: 0, status: "deferred", reason: "Third-party crawl" },
  { id: "fx-rates", category: "calculators", value: 6, implementability: 0, status: "deferred", reason: "Live market data" },
  { id: "jpg-to-webp", category: "images", value: 4, implementability: 1, status: "deferred", reason: "Duplicate of convert-image" },
  { id: "csv-transpose", category: "developer", value: 7, implementability: 1, status: "candidate", reason: "LOCAL_ONLY CSV matrix transpose" },
  { id: "image-grayscale", category: "images", value: 7, implementability: 1, status: "candidate", reason: "Canvas grayscale recode" },
  { id: "pdf-blank-page", category: "pdf-documents", value: 6, implementability: 1, status: "candidate", reason: "pdf-lib insert blank page" },
  { id: "ics-parse", category: "date-time", value: 6, implementability: 1, status: "candidate", reason: "Parse VEVENT locally" },
  { id: "vcard-build", category: "generators", value: 6, implementability: 1, status: "candidate", reason: "Build a vCard 3.0 string" },
  { id: "diff-percent", category: "calculators", value: 5, implementability: 1, status: "candidate", reason: "Duplicate-adjacent to percentage — skip if too close" },
];

export function scoreCandidate(row: ExpansionCandidate) {
  if (row.status === "deferred") return 0;
  const published = new Set(toolRegistry.map((t) => t.id));
  const dup = published.has(row.id) ? 0 : 1;
  return row.value * row.implementability * dup;
}

export function expansionReport() {
  const published = toolRegistry.filter((t) => t.status === "published");
  const ids = new Set(published.map((t) => t.id));
  const pool = EXPANSION_POOL.map((row) => {
    const status: ExpansionStatus = ids.has(row.id) ? "implemented" : row.status;
    return {
      ...row,
      status,
      score: scoreCandidate({ ...row, status }),
    };
  });
  return {
    published: published.length,
    implementedIds: [...ids].sort(),
    missingCandidates: pool.filter((p) => p.status === "candidate" && !ids.has(p.id)).sort((a, b) => b.score - a.score),
    deferred: pool.filter((p) => p.status === "deferred"),
  };
}

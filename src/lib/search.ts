import { visibleTools, categories } from "@/lib/registry";
import { copyForTool, copyForCategory } from "@/lib/copy";
import { popularityScoreById } from "@/lib/popularity";

const SEARCH_ALIASES: Record<string, string[]> = {
  "merge-pdf": ["combine pdf", "join pdf", "pdf zusammenfuehren", "unir pdf"],
  "split-pdf": ["cut pdf", "divide pdf", "pdf teilen"],
  "compress-pdf": ["shrink pdf", "reduce pdf size"],
  "compress-image": ["shrink image", "reduce jpg", "compress png"],
  "convert-image": ["jpg to webp", "png to jpg", "webp converter"],
  "pdf-to-image": ["pdf to jpg", "pdf to png"],
  "images-to-pdf": ["jpg to pdf", "png to pdf"],
  "json-formatter": ["pretty json", "beautify json"],
  "word-counter": ["count words", "word count"],
  "qr-generator": ["make qr", "qr code"],
  "utm-builder": ["utm link", "campaign url"],
  "text-to-pdf": ["txt to pdf", "notes to pdf"],
  "delete-pdf-pages": ["remove pdf pages", "drop pages"],
  "extract-pdf-text": ["pdf text", "copy pdf text"],
};

function aliasScore(toolId: string, needle: string) {
  const aliases = SEARCH_ALIASES[toolId];
  if (!aliases) return 0;
  return Math.max(0, ...aliases.map((alias) => score(alias, needle)));
}

function normalize(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function score(haystack: string, needle: string) {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 80;
  if (h.includes(n)) return 60;
  const parts = n.split(/\s+/).filter(Boolean);
  let hits = 0;
  for (const part of parts) if (h.includes(part)) hits += 1;
  if (hits === parts.length) return 40;
  // simple typo: levenshtein-ish on tokens
  if (n.length >= 3 && h.split(/\s+/).some((token) => distance(token, n) <= 1)) return 25;
  return 0;
}

function distance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

export function searchRegistry(locale: string, query: string, category?: string) {
  const q = query.trim();
  const tools = visibleTools(locale).filter((tool) => !category || tool.category === category);
  const pop = popularityScoreById();
  if (!q) {
    return tools.map((tool) => ({ tool, score: 0, kind: "tool" as const }));
  }
  const toolHits = tools
    .map((tool) => {
      const copy = copyForTool(tool, locale);
      const s = Math.max(
        score(copy.name, q),
        score(copy.title, q),
        score(copy.h1, q),
        score(copy.description, q),
        score(tool.id, q),
        score(tool.tags.join(" "), q),
        score(tool.supportedFormats.join(" "), q),
        aliasScore(tool.id, q),
      );
      const boosted = s > 0 ? s + Math.min(8, (pop[tool.id] || 0) / 40) : 0;
      return { tool, score: boosted, kind: "tool" as const };
    })
    .filter((hit) => hit.score > 0);
  const catHits = categories
    .filter(() => !category)
    .map((cat) => ({
      category: cat,
      score: Math.max(
        score(copyForCategory(cat, locale).name, q),
        score(copyForCategory(cat, locale).description, q),
      ),
      kind: "category" as const,
    }))
    .filter((hit) => hit.score > 0);
  return [...toolHits, ...catHits].sort((a, b) => b.score - a.score).slice(0, 30);
}

export function suggestRegistry(locale: string, query: string) {
  return searchRegistry(locale, query).slice(0, 8);
}

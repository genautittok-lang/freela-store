export function countText(text: string) {
  const characters = text.length;
  const charactersNoSpace = text.replace(/\s/g, "").length;
  const codePoints = [...text].length;
  const lines = text.length === 0 ? 0 : text.split(/\n/).length;
  const words = (text.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? []).length;
  const sentences = text.trim()
    ? (text.split(/[.!?…]+(?:\s|$)/u).filter((part) => part.trim()).length || 1)
    : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const tokens = text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const unique = new Set(tokens).size;
  const avgWordLength =
    tokens.length === 0 ? 0 : tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length;
  const readingMinutes = words / 200;
  return {
    characters,
    charactersNoSpace,
    codePoints,
    lines,
    words,
    sentences,
    paragraphs,
    uniqueWords: unique,
    avgWordLength,
    readingMinutes,
  };
}

const SMALL = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to"]);

export function toTitleCase(text: string, locale: string) {
  return text
    .toLocaleLowerCase(locale)
    .split(/(\s+)/)
    .map((part, index, arr) => {
      if (/^\s+$/.test(part)) return part;
      const word = part;
      const isFirst = index === 0;
      const isLast = index === arr.length - 1;
      if (!isFirst && !isLast && SMALL.has(word.toLocaleLowerCase("en"))) return word;
      return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
    })
    .join("");
}

export function convertCase(
  text: string,
  mode: "upper" | "lower" | "title" | "sentence" | "invert",
  locale: string,
) {
  if (mode === "upper") return text.toLocaleUpperCase(locale);
  if (mode === "lower") return text.toLocaleLowerCase(locale);
  if (mode === "title") return toTitleCase(text, locale);
  if (mode === "sentence") {
    return text
      .toLocaleLowerCase(locale)
      .replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gu, (match) => match.toLocaleUpperCase(locale));
  }
  return [...text]
    .map((ch) =>
      ch === ch.toLocaleUpperCase(locale) ? ch.toLocaleLowerCase(locale) : ch.toLocaleUpperCase(locale),
    )
    .join("");
}

export function dedupeLines(text: string, insensitive: boolean) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const key = (insensitive ? line.trim().toLocaleLowerCase() : line.trim());
    if (key === "" && out[out.length - 1] === "") continue;
    if (key !== "" && seen.has(key)) continue;
    if (key !== "") seen.add(key);
    out.push(line.trimEnd());
  }
  return out.join("\n");
}

export function sortLines(text: string, mode: "asc" | "desc" | "numeric", locale: string) {
  const lines = text.split("\n");
  const collator = new Intl.Collator(locale, { numeric: mode === "numeric", sensitivity: "base" });
  const decorated = lines.map((line, index) => ({ line, index }));
  decorated.sort((a, b) => {
    let cmp = 0;
    if (mode === "numeric") {
      const an = a.line.match(/-?\d+(?:\.\d+)?/);
      const bn = b.line.match(/-?\d+(?:\.\d+)?/);
      if (an && bn) cmp = Number(an[0]) - Number(bn[0]);
      else cmp = collator.compare(a.line, b.line);
    } else {
      cmp = collator.compare(a.line, b.line);
    }
    if (mode === "desc") cmp = -cmp;
    return cmp || a.index - b.index;
  });
  return decorated.map((item) => item.line).join("\n");
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function cleanWhitespace(text: string, dropBlank: boolean) {
  let next = text.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ");
  next = next.replace(/[ \t]+/g, " ");
  next = next
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  if (dropBlank) next = next.replace(/\n{2,}/g, "\n");
  return next.trim();
}

export function diffLines(a: string, b: string) {
  const left = a.split("\n");
  const right = b.split("\n");
  const n = left.length;
  const m = right.length;
  const max = Math.min(n * m, 250000);
  if (n * m > max) {
    throw new Error("Diff is too large. Keep each side under a few thousand lines.");
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const rows: { type: "same" | "add" | "del"; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (left[i] === right[j]) {
      rows.push({ type: "same", text: left[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "del", text: left[i] });
      i++;
    } else {
      rows.push({ type: "add", text: right[j] });
      j++;
    }
  }
  while (i < n) rows.push({ type: "del", text: left[i++] });
  while (j < m) rows.push({ type: "add", text: right[j++] });
  return rows;
}

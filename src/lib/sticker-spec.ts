/** Deterministic Freela sticker identity. Same id always draws the same mark. */

export const MOTIFS = [
  "pages",
  "split",
  "rotate",
  "squeeze",
  "crop",
  "frame",
  "image",
  "grid",
  "lock",
  "qr",
  "swatch",
  "braces",
  "code",
  "hash",
  "link",
  "clock",
  "calc",
  "text",
  "check",
  "spark",
  "table",
  "mail",
  "globe",
  "list",
  "percent",
  "key",
  "eye",
  "wave",
] as const;

export type Motif = (typeof MOTIFS)[number];

export type StickerSpec = {
  id: string;
  motif: Motif;
  ink: number;
  badge: number;
  pips: number[];
};

const RULES: [RegExp, Motif][] = [
  [/merge|combine|join-lines/, "pages"],
  [/split|extract-pdf|line-range/, "split"],
  [/rotate|flip/, "rotate"],
  [/compress|squeeze|minify/, "squeeze"],
  [/crop/, "crop"],
  [/resize|dimension|pixelate|favicon|ico/, "frame"],
  [/grayscale|blur|exif|pixel/, "image"],
  [/qr|barcode/, "qr"],
  [/color|hex|hsl|rgb|tint|shade|luminan|palette|ink/, "swatch"],
  [/json|yaml|xml|csv|tsv|ndjson/, "braces"],
  [/regex|cron|semver/, "code"],
  [/hash|base64|uuid|ulid|jwt|encode|decode|morse|cipher|rot47|atbash|quoted|escape|unicode/, "hash"],
  [/url|slug|domain|mailto|query|sitemap|robots|heading|noindex|alt-text|meta-|canonical|og-/, "link"],
  [/date|time|clock|month|year|leap|pomodoro|weekday|timezone/, "clock"],
  [/percent|roi|price|pay|cost|tax|loan|interest|overtime|meeting|salary|vat/, "calc"],
  [/password|iban|isbn|email|validate|checksum|luhn/, "check"],
  [/lock|redact|secret|privacy|strip/, "lock"],
  [/pdf/, "pages"],
  [/image|png|jpe?g|webp|heic|svg/, "image"],
  [/markdown|html|lorem|diacritic|palindrome|flesch|word|sentence|line|text|case/, "text"],
  [/table|column|row/, "table"],
  [/mail/, "mail"],
  [/prime|fraction|stdev|quadratic|round|median|average|math|number-to/, "percent"],
  [/key|token|csp|header/, "key"],
  [/list|sort|dedup|filter/, "list"],
  [/globe|ipv4|ipv6|cidr|subnet|port|mac-/, "globe"],
  [/eye|contrast|readable/, "eye"],
];

export function fnv(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function motifFor(id: string): Motif {
  for (const [re, motif] of RULES) {
    if (re.test(id)) return motif;
  }
  return MOTIFS[fnv(id) % MOTIFS.length];
}

/** Four distinct cells in a 4×4 corner grid. */
export function pipsFor(id: string) {
  const cells = Array.from({ length: 16 }, (_, i) => i);
  let h = fnv(`${id}:pips`);
  const picked: number[] = [];
  while (picked.length < 4) {
    const index = h % cells.length;
    picked.push(cells.splice(index, 1)[0]);
    h = Math.imul(h ^ 0x9e3779b9, 16777619) >>> 0;
  }
  return picked.sort((a, b) => a - b);
}

export function stickerSpec(id: string): StickerSpec {
  const h = fnv(id);
  return {
    id,
    motif: motifFor(id),
    ink: h % 6,
    badge: (h >>> 8) % 8,
    pips: pipsFor(id),
  };
}

export function stickerFingerprint(id: string) {
  const spec = stickerSpec(id);
  return `${spec.motif}|${spec.ink}|${spec.badge}|${spec.pips.join(",")}`;
}

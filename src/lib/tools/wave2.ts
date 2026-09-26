import type { WaveInput } from "@/lib/tools/wave";

export type Wave2Mode = "text" | "pdf" | "image";

function need(text: string) {
  const t = (text ?? "").trim();
  if (!t) throw new Error("Add some input first.");
  return t;
}

function nums(text: string) {
  const parts = need(text).split(/[\s,;]+/).map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n))) throw new Error("Enter numbers separated by spaces or commas.");
  return parts;
}

function csvSplit(line: string, sep = ",") {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      q = !q;
      continue;
    }
    if (c === sep && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function csvJoin(cells: string[], sep = ",") {
  return cells
    .map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell))
    .join(sep);
}

function linesOf(text: string) {
  return need(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

function parseCsv(text: string, sep = ",") {
  return linesOf(text).filter((line) => line.length).map((line) => csvSplit(line, sep));
}

function hexColor(raw: string) {
  let t = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(t)) t = t.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(t)) throw new Error("Enter a hex color such as #157a45.");
  const n = parseInt(t, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, hex: `#${t.toLowerCase()}` };
}

function toHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function ipv4Parts(ip: string) {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

function ipv4ToInt(parts: number[]) {
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function intToIpv4(n: number) {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const ULID_ALPH = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function ulidNow() {
  let time = Date.now();
  let t = "";
  for (let i = 0; i < 10; i++) {
    t = ULID_ALPH[time % 32] + t;
    time = Math.floor(time / 32);
  }
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return t + [...buf].map((b) => ULID_ALPH[b % 32]).join("");
}

function semverParts(raw: string) {
  const m = need(raw).match(/^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!m) throw new Error("Use a version like 1.2.3.");
  return [Number(m[1]), Number(m[2]), Number(m[3])] as const;
}

function cmpSemver(a: readonly number[], b: readonly number[]) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}

function syllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.replace(/e$/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups?.length ?? 1);
}

function wordsOf(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? [];
}

function cronFieldOk(field: string) {
  return /^(\*|\*\/\d+|\d+(-\d+)?)(,(\*|\*\/\d+|\d+(-\d+)?))*$/.test(field);
}

function explainCronField(field: string, unit: string) {
  if (field === "*") return `every ${unit}`;
  if (field.startsWith("*/")) return `every ${field.slice(2)} ${unit}`;
  return `${unit} ${field}`;
}

function parseIsoDate(raw: string) {
  const t = need(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) throw new Error("Use an ISO date YYYY-MM-DD.");
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    throw new Error("That calendar date does not exist.");
  }
  return dt;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function jsonDupKeys(src: string) {
  const s = need(src);
  const dups: string[] = [];
  const keySets: Set<string>[] = [];
  let i = 0;
  const len = s.length;
  const skip = () => {
    while (i < len && /\s/.test(s[i])) i++;
  };
  const readString = () => {
    if (s[i] !== '"') throw new Error("Invalid JSON.");
    i++;
    let out = "";
    while (i < len) {
      if (s[i] === "\\") {
        out += s[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (s[i] === '"') {
        i++;
        return out;
      }
      out += s[i++];
    }
    throw new Error("Invalid JSON string.");
  };
  const parseValue = (): void => {
    skip();
    if (s[i] === "{") {
      i++;
      keySets.push(new Set());
      parseObject();
      keySets.pop();
      return;
    }
    if (s[i] === "[") {
      i++;
      parseArray();
      return;
    }
    if (s[i] === '"') {
      readString();
      return;
    }
    if (s[i] === "-" || (s[i] >= "0" && s[i] <= "9")) {
      while (i < len && /[0-9eE+.\-]/.test(s[i])) i++;
      return;
    }
    if (s.startsWith("true", i)) {
      i += 4;
      return;
    }
    if (s.startsWith("false", i)) {
      i += 5;
      return;
    }
    if (s.startsWith("null", i)) {
      i += 4;
      return;
    }
    throw new Error("Invalid JSON.");
  };
  const parseObject = () => {
    skip();
    if (s[i] === "}") {
      i++;
      return;
    }
    while (i < len) {
      skip();
      const key = readString();
      const set = keySets[keySets.length - 1];
      if (set.has(key)) dups.push(key);
      set.add(key);
      skip();
      if (s[i] !== ":") throw new Error("Invalid JSON.");
      i++;
      parseValue();
      skip();
      if (s[i] === ",") {
        i++;
        continue;
      }
      if (s[i] === "}") {
        i++;
        return;
      }
      throw new Error("Invalid JSON.");
    }
  };
  const parseArray = () => {
    skip();
    if (s[i] === "]") {
      i++;
      return;
    }
    while (i < len) {
      parseValue();
      skip();
      if (s[i] === ",") {
        i++;
        continue;
      }
      if (s[i] === "]") {
        i++;
        return;
      }
      throw new Error("Invalid JSON.");
    }
  };
  parseValue();
  return dups;
}

function flattenJson(value: unknown, prefix: string, out: string[]) {
  if (Array.isArray(value)) {
    if (!value.length) out.push(`${prefix}: []`);
    value.forEach((item, i) => flattenJson(item, `${prefix}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) out.push(`${prefix}: {}`);
    for (const [k, v] of entries) flattenJson(v, prefix ? `${prefix}.${k}` : k, out);
    return;
  }
  out.push(`${prefix}: ${JSON.stringify(value)}`);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
}

function tagBalance(html: string) {
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
  const stack: string[] = [];
  const re = /<\/?([a-zA-Z0-9]+)(\s[^>]*?)?\s*\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const name = m[1].toLowerCase();
    const closing = m[0].startsWith("</");
    const self = m[0].endsWith("/>") || voidTags.has(name);
    if (closing) {
      if (!stack.length || stack[stack.length - 1] !== name) return `Mismatch near </${name}>.`;
      stack.pop();
    } else if (!self) stack.push(name);
  }
  return stack.length ? `Unclosed: ${stack.join(", ")}` : "balanced";
}

function simpleHtmlToMd(html: string) {
  let s = html.replace(/\r\n/g, "\n");
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
  s = s.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  s = s.replace(/<\/(p|div|ul|ol)>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

const NAMED_COLORS: [string, string][] = [
  ["black", "#000000"], ["white", "#ffffff"], ["red", "#ff0000"], ["green", "#008000"], ["blue", "#0000ff"],
  ["yellow", "#ffff00"], ["cyan", "#00ffff"], ["magenta", "#ff00ff"], ["orange", "#ffa500"], ["purple", "#800080"],
  ["pink", "#ffc0cb"], ["brown", "#a52a2a"], ["gray", "#808080"], ["navy", "#000080"], ["teal", "#008080"],
  ["lime", "#00ff00"], ["maroon", "#800000"], ["silver", "#c0c0c0"], ["olive", "#808000"], ["gold", "#ffd700"],
];

function onesWords(n: number): string {
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? `-${ones[n % 10]}` : "");
  if (n < 1000) return `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ` ${onesWords(n % 100)}` : ""}`;
  return "";
}

function numberToWords(n: number) {
  if (n < 1000) return onesWords(n);
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  return `${onesWords(thousands)} thousand${rest ? ` ${onesWords(rest)}` : ""}`;
}

function clockMinutes(raw: string) {
  const m = need(raw).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) throw new Error("Use HH:MM (24-hour).");
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) throw new Error("Use HH:MM (24-hour).");
  return h * 60 + min;
}

function fmtClock(total: number) {
  const day = 24 * 60;
  const n = ((total % day) + day) % day;
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

export const WAVE2_SAMPLES: Record<string, WaveInput> = {
  "reverse-words": { text: "one two three" },
  "word-frequency": { text: "pdf pdf merge" },
  "sentence-per-line": { text: "Hi there. Next one!" },
  "dedent-text": { text: "  alpha\n  beta" },
  "tabs-to-spaces": { text: "a\tb" },
  "join-lines": { text: "a\nb", extra: ", " },
  "split-delimiter": { text: "a, b, c", extra: "," },
  "filter-lines": { text: "alpha\nbeta\nalpha", extra: "alpha" },
  "line-range": { text: "a\nb\nc", extra: "2-3" },
  "extract-hashtags": { text: "Ship #Freela and #local" },
  "extract-mentions": { text: "Thanks @ada and @bob" },
  "extract-ipv4": { text: "gw 10.0.0.1 and 192.168.0.2" },
  "extract-hex-colors": { text: "brand #157a45 and #fff" },
  "extract-iso-dates": { text: "due 2026-09-26 or 2026-01-01" },
  "remove-diacritics": { text: "café naïve" },
  "morse-encode": { text: "HI" },
  "morse-decode": { text: ".... .." },
  "atbash-cipher": { text: "ABC" },
  "rot47-cipher": { text: "A" },
  "palindrome-check": { text: "A man a plan a canal Panama" },
  "strip-zero-width": { text: "a\u200Bb" },
  "unicode-escape": { text: "é" },
  "unicode-unescape": { text: "\\u00e9" },
  "normalize-newlines": { text: "a\r\nb\rc" },
  "flesch-ease": { text: "The cat sat on the mat. The dog ran." },
  "sort-words": { text: "b a c" },
  "redact-ipv4": { text: "see 1.2.3.4 now" },
  "entropy-estimate": { text: "aaaa" },
  "secret-scan": { text: "key AKIAIOSFODNN7EXAMPLE" },
  "slug-each-line": { text: "Hello World!\nOK" },
  "pascal-case": { text: "foo_bar baz" },
  "path-basename": { text: "a/b/c.txt" },
  "path-dirname": { text: "a/b/c.txt" },
  "json-sort-keys": { text: '{"b":1,"a":{"d":1,"c":2}}' },
  "json-flatten": { text: '{"a":{"b":1},"c":[2]}' },
  "json-array-length": { text: "[1,2,3]" },
  "csv-transpose": { text: "a,b\n1,2" },
  "csv-pick-column": { text: "a,b\n1,2", extra: "2" },
  "csv-row-count": { text: "a,b\n1,2\n3,4" },
  "csv-width-check": { text: "a,b\n1,2" },
  "ndjson-to-array": { text: '{"a":1}\n{"a":2}' },
  "array-to-ndjson": { text: '[{"a":1},{"a":2}]' },
  "tsv-to-csv": { text: "a\tb\n1\t2" },
  "xml-escape": { text: `a<b>&"c"` },
  "html-to-markdown": { text: '<h1>Hi</h1><p>See <a href="https://freela.store/en/">Freela</a></p>' },
  "html-tag-balance": { text: "<div><p>a</p></div>" },
  "regex-escape": { text: "a+b?" },
  "cron-explain": { text: "0 9 * * 1" },
  "semver-compare": { text: "1.2.3", extra: "1.2.10" },
  "semver-bump": { text: "1.2.3", extra: "patch" },
  "json-duplicate-keys": { text: '{"a":1,"a":2}' },
  "ipv4-to-int": { text: "1.2.3.4" },
  "int-to-ipv4": { text: "16909060" },
  "cidr-contains": { text: "10.0.0.0/8", extra: "10.1.2.3" },
  "subnet-info": { text: "192.168.1.10/24" },
  "basic-auth-header": { text: "user:pass" },
  "binary-to-decimal": { text: "1101" },
  "hex-to-decimal": { text: "FF" },
  "ulid-generator": { text: "1" },
  "ulid-validate": { text: "01ARZ3NDEKTSV4RRFFQ69G5FAV" },
  "email-syntax": { text: "tools@freela.store" },
  "iban-check": { text: "GB82WEST12345698765432" },
  "isbn-check": { text: "9780306406157" },
  "cron-validate": { text: "0 9 * * 1" },
  "ipv4-validate": { text: "192.168.0.1" },
  "ipv6-validate": { text: "2001:db8::1" },
  "semver-validate": { text: "1.2.3-beta.1" },
  "iso-date-validate": { text: "2026-02-31" },
  "yaml-top-keys": { text: "name: Freela\nlocal: true\n# skip\nnested:\n  a: 1" },
  "quoted-printable": { text: "café" },
  "mac-format": { text: "aa-bb-cc-dd-ee-ff" },
  "meta-length": { text: "Merge PDF files in the browser without an upload." },
  "heading-outline": { text: "<h1>Home</h1><h2>Tools</h2>" },
  "missing-alt": { text: '<img src="a.png"><img alt="ok" src="b.png">' },
  "heading-order": { text: "<h1>A</h1><h3>B</h3>" },
  "noindex-detect": { text: '<meta name="robots" content="noindex,follow">' },
  "mailto-builder": { text: "tools@freela.store", extra: "Hello" },
  "query-drop-key": { text: "https://freela.store/en/?q=1&utm_source=x", extra: "utm_source" },
  "url-origin": { text: "https://freela.store/en/tools" },
  "url-pathname": { text: "https://freela.store/en/tools" },
  "resolve-relative-url": { text: "/en/", extra: "https://freela.store/de/tools" },
  "sort-query": { text: "https://freela.store/en/?b=1&a=2" },
  "toggle-trailing-slash": { text: "https://freela.store/en" },
  "keyword-in-title": { text: "Merge PDF files", extra: "pdf" },
  "empty-link-check": { text: '<a href="/en/"></a><a href="/en/">Home</a>' },
  "port-from-url": { text: "https://freela.store:8443/en" },
  "domain-syntax": { text: "freela.store" },
  "stdev-list": { text: "2 4 4 4 5 5 7 9" },
  "range-stats": { text: "2 4 9" },
  "round-number": { text: "3.14159", extra: "2" },
  "fraction-to-decimal": { text: "1/2" },
  "prime-factors": { text: "12" },
  "quadratic-roots": { text: "1 -3 2" },
  "overtime-pay": { text: "5 20 1.5" },
  "roi-calculator": { text: "150 100" },
  "meeting-cost": { text: "4 50 2" },
  "leap-year": { text: "2024" },
  "days-in-month": { text: "2026-02" },
  "add-months": { text: "2026-01-31", extra: "1" },
  "end-of-month": { text: "2026-02-05" },
  "add-clock": { text: "09:30", extra: "90" },
  "clock-difference": { text: "09:00", extra: "10:30" },
  "pomodoro-blocks": { text: "60", extra: "25" },
  "unit-price": { text: "10 4" },
  "number-to-words": { text: "21" },
  "relative-luminance": { text: "#ffffff" },
  "tint-hex": { text: "#000000", extra: "50" },
  "shade-hex": { text: "#ffffff", extra: "50" },
  "nearest-named-color": { text: "#157a45" },
  "readable-ink": { text: "#ffffff" },
  "csp-builder": { text: "default-src 'self'\nimg-src 'self' data:" },
  "web-manifest": { text: "Freela\nFreela\nhttps://freela.store/en/" },
  "pdf-page-sizes": { text: "" },
  "pdf-set-info": { text: "", extra: "Freela note\nLocal" },
  "image-dimensions": { text: "" },
  "image-grayscale": { text: "" },
  "image-pixelate": { text: "" },
};

export const WAVE2_EXTRA_HINT: Record<string, string> = {
  "join-lines": "delimiter between lines",
  "split-delimiter": "delimiter to split on",
  "filter-lines": "substring a line must contain",
  "line-range": "1-based range such as 2-3",
  "csv-pick-column": "1-based column number",
  "semver-compare": "second version",
  "semver-bump": "patch, minor, or major",
  "cidr-contains": "IPv4 address to test",
  "mailto-builder": "optional subject",
  "query-drop-key": "query key to remove",
  "resolve-relative-url": "base URL",
  "keyword-in-title": "keyword to look for",
  "round-number": "decimal places",
  "add-months": "months to add (negative subtracts)",
  "add-clock": "minutes to add",
  "clock-difference": "end time HH:MM",
  "pomodoro-blocks": "block length in minutes",
  "tint-hex": "percent toward white",
  "shade-hex": "percent toward black",
  "pdf-set-info": "title, then author on the next line",
};

export const WAVE2_MODES: Record<string, Wave2Mode> = Object.fromEntries(
  Object.keys(WAVE2_SAMPLES).map((id) => {
    const mode: Wave2Mode = id.startsWith("pdf-") ? "pdf" : id.startsWith("image-") ? "image" : "text";
    return [id, mode];
  }),
);

export const PDF_WAVE2 = new Set(["pdf-page-sizes", "pdf-set-info"]);
export const IMAGE_WAVE2 = new Set(["image-dimensions", "image-grayscale", "image-pixelate"]);

export function isWave2Tool(id: string) {
  return Object.prototype.hasOwnProperty.call(WAVE2_SAMPLES, id);
}

export function runWave2Sync(id: string, input: WaveInput): string {
  const text = input.text ?? "";
  const extra = input.extra ?? "";
  switch (id) {
    case "reverse-words":
      return need(text).split(/\s+/).reverse().join(" ");
    case "word-frequency": {
      const counts = new Map<string, number>();
      for (const w of wordsOf(need(text).toLocaleLowerCase())) counts.set(w, (counts.get(w) ?? 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([w, n]) => `${w}: ${n}`).join("\n");
    }
    case "sentence-per-line":
      return need(text).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean).join("\n");
    case "dedent-text": {
      const lines = linesOf(text);
      const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0);
      const cut = Math.min(...indents);
      return lines.map((l) => l.slice(cut)).join("\n");
    }
    case "tabs-to-spaces":
      return need(text).replace(/\t/g, "    ");
    case "join-lines":
      return linesOf(text).join(extra.length ? extra : ", ");
    case "split-delimiter": {
      const sep = extra.length ? extra : ",";
      return need(text).split(sep).map((s) => s.trim()).join("\n");
    }
    case "filter-lines": {
      const needle = extra.trim();
      if (!needle) throw new Error("Enter the text a line must contain.");
      const kept = linesOf(text).filter((l) => l.includes(needle));
      if (!kept.length) throw new Error("No lines matched.");
      return kept.join("\n");
    }
    case "line-range": {
      const m = extra.trim().match(/^(\d+)\s*-\s*(\d+)$/);
      if (!m) throw new Error("Use a range like 2-3.");
      const a = Number(m[1]);
      const b = Number(m[2]);
      const lines = linesOf(text);
      if (a < 1 || b < a || a > lines.length) throw new Error("That range is outside the text.");
      return lines.slice(a - 1, b).join("\n");
    }
    case "extract-hashtags": {
      const found = need(text).match(/#[\p{L}\p{N}_]+/gu) ?? [];
      if (!found.length) throw new Error("No hashtags found.");
      return [...new Set(found)].join("\n");
    }
    case "extract-mentions": {
      const found = need(text).match(/@[\p{L}\p{N}_]+/gu) ?? [];
      if (!found.length) throw new Error("No @mentions found.");
      return [...new Set(found)].join("\n");
    }
    case "extract-ipv4": {
      const found = need(text).match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)?.filter((ip) => ipv4Parts(ip)) ?? [];
      if (!found.length) throw new Error("No IPv4 addresses found.");
      return [...new Set(found)].join("\n");
    }
    case "extract-hex-colors": {
      const found = need(text).match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g) ?? [];
      if (!found.length) throw new Error("No hex colors found.");
      return [...new Set(found)].join("\n");
    }
    case "extract-iso-dates": {
      const found = need(text).match(/\b\d{4}-\d{2}-\d{2}\b/g)?.filter((d) => {
        try { parseIsoDate(d); return true; } catch { return false; }
      }) ?? [];
      if (!found.length) throw new Error("No ISO dates found.");
      return [...new Set(found)].join("\n");
    }
    case "remove-diacritics":
      return need(text).normalize("NFD").replace(/\p{M}+/gu, "");
    case "morse-encode":
      return need(text).toUpperCase().split(/\s+/).map((word) => [...word].map((ch) => {
        const code = MORSE[ch];
        if (!code) throw new Error(`No Morse for “${ch}”. Use A–Z and digits.`);
        return code;
      }).join(" ")).join(" / ");
    case "morse-decode":
      return need(text).split("/").map((word) => word.trim().split(/\s+/).map((code) => {
        const ch = MORSE_REV[code];
        if (!ch) throw new Error(`Unknown Morse code “${code}”.`);
        return ch;
      }).join("")).join(" ");
    case "atbash-cipher":
      return need(text).replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(base + (25 - (ch.charCodeAt(0) - base)));
      });
    case "rot47-cipher":
      return need(text).replace(/[!-~]/g, (ch) => String.fromCharCode(33 + ((ch.charCodeAt(0) - 33 + 47) % 94)));
    case "palindrome-check": {
      const letters = need(text).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      const rev = [...letters].reverse().join("");
      return letters === rev ? "palindrome" : "not a palindrome";
    }
    case "strip-zero-width":
      return need(text).replace(/[\u200B-\u200D\uFEFF]/g, "");
    case "unicode-escape":
      return [...need(text)].map((ch) => {
        const cp = ch.codePointAt(0)!;
        return cp <= 0xffff ? `\\u${cp.toString(16).padStart(4, "0")}` : `\\u{${cp.toString(16)}}`;
      }).join("");
    case "unicode-unescape":
      return need(text)
        .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    case "normalize-newlines":
      return need(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    case "flesch-ease": {
      const raw = need(text);
      const words = wordsOf(raw);
      const sentences = raw.split(/[.!?]+/).filter((s) => s.trim()).length || 1;
      const syl = words.reduce((sum, w) => sum + syllables(w), 0);
      if (!words.length) throw new Error("Add a sentence or two.");
      const score = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length);
      const rounded = Math.round(score * 10) / 10;
      const band = rounded >= 70 ? "easier" : rounded >= 50 ? "standard" : "harder";
      return `score: ${rounded}\nband: ${band} (estimate, not a reading diagnosis)`;
    }
    case "sort-words":
      return need(text).split(/\s+/).sort((a, b) => a.localeCompare(b)).join(" ");
    case "redact-ipv4":
      return need(text).replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, (ip) => (ipv4Parts(ip) ? "[ip]" : ip));
    case "entropy-estimate": {
      const s = need(text);
      const counts = new Map<string, number>();
      for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
      let h = 0;
      for (const n of counts.values()) {
        const p = n / s.length;
        h -= p * Math.log2(p);
      }
      return `bits/char: ${Math.round(h * 1000) / 1000}\ntotal bits: ${Math.round(h * s.length * 1000) / 1000}`;
    }
    case "secret-scan": {
      const raw = need(text);
      const rules: [string, RegExp][] = [
        ["aws-access-key-shape", /AKIA[0-9A-Z]{16}/g],
        ["private-key-header", /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
        ["stripe-live-shape", /sk_live_[0-9A-Za-z]{8,}/g],
        ["slack-token-shape", /xox[baprs]-[0-9A-Za-z-]{8,}/g],
      ];
      const hits: string[] = [];
      for (const [name, re] of rules) {
        const found = raw.match(re);
        if (found) hits.push(`${name}: ${found.length}`);
      }
      return hits.length ? hits.join("\n") : "No common secret patterns.";
    }
    case "slug-each-line":
      return linesOf(text).map((line) => line.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).join("\n");
    case "pascal-case":
      return need(text).split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "path-basename": {
      const t = need(text).replace(/[\\/]+$/, "");
      const parts = t.split(/[\\/]/);
      return parts[parts.length - 1] || t;
    }
    case "path-dirname": {
      const t = need(text).replace(/[\\/]+$/, "");
      const idx = Math.max(t.lastIndexOf("/"), t.lastIndexOf("\\"));
      if (idx < 0) return ".";
      return t.slice(0, idx) || (t[0] === "/" ? "/" : ".");
    }
    case "json-sort-keys":
      return JSON.stringify(sortKeys(JSON.parse(need(text))), null, 2);
    case "json-flatten": {
      const out: string[] = [];
      flattenJson(JSON.parse(need(text)), "", out);
      return out.join("\n");
    }
    case "json-array-length": {
      const value = JSON.parse(need(text));
      if (!Array.isArray(value)) throw new Error("JSON array required.");
      return String(value.length);
    }
    case "csv-transpose": {
      const rows = parseCsv(text);
      const width = Math.max(...rows.map((r) => r.length));
      const cols = Array.from({ length: width }, (_, c) => rows.map((r) => r[c] ?? ""));
      return cols.map((col) => csvJoin(col)).join("\n");
    }
    case "csv-pick-column": {
      const index = Number(extra.trim());
      if (!Number.isInteger(index) || index < 1) throw new Error("Use a 1-based column number.");
      return parseCsv(text).map((row) => {
        if (index > row.length) throw new Error("Column is past the end of a row.");
        return row[index - 1];
      }).join("\n");
    }
    case "csv-row-count": {
      const rows = parseCsv(text);
      return `rows: ${rows.length}\nheader included: yes`;
    }
    case "csv-width-check": {
      const rows = parseCsv(text);
      const widths = rows.map((r) => r.length);
      const same = widths.every((w) => w === widths[0]);
      return same ? `consistent: ${widths[0]} columns` : `inconsistent: ${widths.join(", ")}`;
    }
    case "ndjson-to-array": {
      const rows = linesOf(text).filter((l) => l.trim()).map((l) => JSON.parse(l));
      return JSON.stringify(rows, null, 2);
    }
    case "array-to-ndjson": {
      const value = JSON.parse(need(text));
      if (!Array.isArray(value)) throw new Error("JSON array required.");
      return value.map((row) => JSON.stringify(row)).join("\n");
    }
    case "tsv-to-csv":
      return linesOf(text).map((line) => csvJoin(line.split("\t"))).join("\n");
    case "xml-escape":
      return need(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    case "html-to-markdown":
      return simpleHtmlToMd(need(text));
    case "html-tag-balance":
      return tagBalance(need(text));
    case "regex-escape":
      return need(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    case "cron-explain": {
      const fields = need(text).trim().split(/\s+/);
      if (fields.length !== 5) throw new Error("Use five UNIX cron fields.");
      const units = ["minute", "hour", "day-of-month", "month", "day-of-week"];
      return fields.map((f, i) => explainCronField(f, units[i])).join("\n");
    }
    case "semver-compare": {
      const delta = cmpSemver(semverParts(text), semverParts(extra));
      return delta < 0 ? "first is older" : delta > 0 ? "first is newer" : "same core version";
    }
    case "semver-bump": {
      const [major, minor, patch] = semverParts(text);
      const kind = (extra || "patch").trim().toLowerCase();
      if (kind === "major") return `${major + 1}.0.0`;
      if (kind === "minor") return `${major}.${minor + 1}.0`;
      if (kind === "patch") return `${major}.${minor}.${patch + 1}`;
      throw new Error("Use patch, minor, or major.");
    }
    case "json-duplicate-keys": {
      const dups = jsonDupKeys(text);
      return dups.length ? `duplicates: ${[...new Set(dups)].join(", ")}` : "no duplicate keys";
    }
    case "ipv4-to-int": {
      const parts = ipv4Parts(need(text));
      if (!parts) throw new Error("Enter an IPv4 address.");
      return String(ipv4ToInt(parts));
    }
    case "int-to-ipv4": {
      const n = Number(need(text));
      if (!Number.isInteger(n) || n < 0 || n > 0xffffffff) throw new Error("Enter an integer from 0 to 4294967295.");
      return intToIpv4(n);
    }
    case "cidr-contains": {
      const [ip, prefixRaw] = need(text).split("/");
      const prefix = Number(prefixRaw);
      const base = ipv4Parts(ip);
      const target = ipv4Parts(need(extra));
      if (!base || !target || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error("Use CIDR plus an IPv4 address.");
      if (prefix === 0) return "yes";
      const mask = prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
      return (ipv4ToInt(base) & mask) === (ipv4ToInt(target) & mask) ? "yes" : "no";
    }
    case "subnet-info": {
      const [ip, prefixRaw] = need(text).split("/");
      const prefix = Number(prefixRaw);
      const parts = ipv4Parts(ip);
      if (!parts || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error("Use an IPv4 CIDR such as 192.168.1.10/24.");
      const mask = prefix === 0 ? 0 : prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
      const ipInt = ipv4ToInt(parts);
      const network = ipInt & mask;
      const broadcast = network | (~mask >>> 0);
      const hosts = prefix >= 31 ? 0 : broadcast - network - 1;
      return [`network: ${intToIpv4(network)}`, `mask: ${intToIpv4(mask)}`, `broadcast: ${intToIpv4(broadcast)}`, `hosts: ${hosts}`].join("\n");
    }
    case "basic-auth-header": {
      const raw = need(text);
      if (!raw.includes(":")) throw new Error("Use user:password.");
      const bytes = new TextEncoder().encode(raw);
      let bin = "";
      for (const b of bytes) bin += String.fromCharCode(b);
      return `Authorization: Basic ${btoa(bin)}`;
    }
    case "binary-to-decimal": {
      const bits = need(text).replace(/\s+/g, "");
      if (!/^[01]+$/.test(bits) || bits.length > 32) throw new Error("Enter up to 32 bits of 0 and 1.");
      return String(parseInt(bits, 2));
    }
    case "hex-to-decimal": {
      const hex = need(text).replace(/^0x/i, "").replace(/\s+/g, "");
      if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length > 8) throw new Error("Enter hex digits (up to 8).");
      return String(parseInt(hex, 16));
    }
    case "ulid-generator":
      return ulidNow();
    case "ulid-validate": {
      const t = need(text).toUpperCase();
      const ok = t.length === 26 && [...t].every((ch) => ULID_ALPH.includes(ch));
      return ok ? "valid ULID shape" : "not a ULID";
    }
    case "email-syntax": {
      const t = need(text);
      if (t !== t.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) throw new Error("That does not look like one email address.");
      return "syntax ok (not a mailbox check)";
    }
    case "iban-check": {
      const t = need(text).replace(/\s+/g, "").toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(t)) throw new Error("Enter an IBAN.");
      const moved = t.slice(4) + t.slice(0, 4);
      let expanded = "";
      for (const c of moved) expanded += /[A-Z]/.test(c) ? String(c.charCodeAt(0) - 55) : c;
      let mod = BigInt(0);
      for (const ch of expanded) mod = (mod * BigInt(10) + BigInt(ch)) % BigInt(97);
      return mod === BigInt(1) ? "checksum ok" : "checksum failed";
    }
    case "isbn-check": {
      const t = need(text).replace(/[-\s]/g, "").toUpperCase();
      if (/^\d{13}$/.test(t)) {
        const sum = [...t.slice(0, 12)].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 ? 3 : 1), 0);
        const check = (10 - (sum % 10)) % 10;
        return check === Number(t[12]) ? "ISBN-13 ok" : "ISBN-13 checksum failed";
      }
      if (/^\d{9}[\dX]$/.test(t)) {
        const sum = [...t.slice(0, 9)].reduce((acc, ch, i) => acc + Number(ch) * (10 - i), 0);
        const check = (11 - (sum % 11)) % 11;
        const digit = check === 10 ? "X" : String(check);
        return digit === t[9] ? "ISBN-10 ok" : "ISBN-10 checksum failed";
      }
      throw new Error("Enter an ISBN-10 or ISBN-13.");
    }
    case "cron-validate": {
      const fields = need(text).trim().split(/\s+/);
      if (fields.length !== 5 || fields.some((f) => !cronFieldOk(f))) throw new Error("Use five simple UNIX cron fields.");
      return "five fields, simple syntax ok";
    }
    case "ipv4-validate":
      return ipv4Parts(need(text)) ? "valid IPv4" : "not an IPv4 address";
    case "ipv6-validate": {
      const t = need(text);
      if (t.includes(":::")) return "not an IPv6 address";
      const parts = t.split("::");
      if (parts.length > 2) return "not an IPv6 address";
      const groups = parts.map((p) => (p ? p.split(":") : []));
      const total = groups[0].length + (groups[1]?.length ?? 0);
      if (parts.length === 1 ? total !== 8 : total >= 8) return "not an IPv6 address";
      const ok = groups.flat().every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
      return ok ? "valid IPv6 shape" : "not an IPv6 address";
    }
    case "semver-validate":
      return semverParts(text) ? "semver core ok" : "not semver";
    case "iso-date-validate": {
      try {
        parseIsoDate(text);
        return "valid calendar date";
      } catch (err) {
        return err instanceof Error ? err.message : "invalid date";
      }
    }
    case "yaml-top-keys": {
      const keys = linesOf(text).filter((l) => /^[A-Za-z0-9_-]+:\s*/.test(l) && !l.startsWith(" ")).map((l) => l.split(":")[0]);
      if (!keys.length) throw new Error("No top-level key: value lines found.");
      return keys.join("\n");
    }
    case "quoted-printable": {
      const bytes = new TextEncoder().encode(need(text));
      return [...bytes].map((b) => (b === 61 || b < 32 || b > 126 ? `=${b.toString(16).toUpperCase().padStart(2, "0")}` : String.fromCharCode(b))).join("");
    }
    case "mac-format": {
      const hex = need(text).replace(/[^0-9a-fA-F]/g, "");
      if (hex.length !== 12) throw new Error("Enter a 48-bit MAC address.");
      return hex.match(/.{2}/g)!.join(":").toUpperCase();
    }
    case "meta-length": {
      const n = need(text).length;
      const band = n >= 120 && n <= 160 ? "inside a common description budget" : n < 120 ? "shorter than 120" : "longer than 160";
      return `characters: ${n}\n${band}`;
    }
    case "heading-outline": {
      const found = [...need(text).matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
      if (!found.length) throw new Error("No h1–h6 headings found.");
      return found.map((m) => `${"  ".repeat(Number(m[1]) - 1)}H${m[1]} ${m[2].replace(/<[^>]+>/g, "").trim()}`).join("\n");
    }
    case "missing-alt": {
      const imgs = [...need(text).matchAll(/<img\b[^>]*>/gi)];
      if (!imgs.length) throw new Error("No img tags found.");
      const missing = imgs.filter((m) => !/\balt\s*=\s*(['"])\s*\S[\s\S]*?\1/i.test(m[0]));
      return `images: ${imgs.length}\nmissing or empty alt: ${missing.length}`;
    }
    case "heading-order": {
      const levels = [...need(text).matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
      if (!levels.length) throw new Error("No headings found.");
      const skips: string[] = [];
      for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skips.push(`H${levels[i - 1]} to H${levels[i]}`);
      return skips.length ? `skipped levels: ${skips.join(", ")}` : "no skipped heading levels";
    }
    case "noindex-detect": {
      const html = need(text);
      const robots = [...html.matchAll(/<meta\b[^>]*>/gi)].some((m) => /name\s*=\s*["']robots["']/i.test(m[0]) && /noindex/i.test(m[0]));
      return robots ? "noindex: yes" : "noindex: no";
    }
    case "mailto-builder": {
      const email = need(text);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter one email address.");
      const subject = extra.trim();
      return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
    }
    case "query-drop-key": {
      const key = extra.trim();
      if (!key) throw new Error("Enter the query key to remove.");
      const u = new URL(need(text));
      u.searchParams.delete(key);
      return u.toString();
    }
    case "url-origin":
      return new URL(need(text)).origin;
    case "url-pathname":
      return new URL(need(text)).pathname;
    case "resolve-relative-url":
      return new URL(need(text), need(extra)).toString();
    case "sort-query": {
      const u = new URL(need(text));
      const entries = [...u.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
      u.search = "";
      for (const [k, v] of entries) u.searchParams.append(k, v);
      return u.toString();
    }
    case "toggle-trailing-slash": {
      const u = new URL(need(text));
      if (u.pathname.length > 1 && u.pathname.endsWith("/")) u.pathname = u.pathname.replace(/\/+$/, "");
      else if (!u.pathname.endsWith("/")) u.pathname += "/";
      return u.toString();
    }
    case "keyword-in-title": {
      const key = extra.trim();
      if (!key) throw new Error("Enter a keyword.");
      return need(text).toLocaleLowerCase().includes(key.toLocaleLowerCase()) ? "yes" : "no";
    }
    case "empty-link-check": {
      const links = [...need(text).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
      if (!links.length) throw new Error("No anchor tags found.");
      const empty = links.filter((m) => !/\baria-label\s*=\s*(['"])\s*\S/i.test(m[1]) && !m[2].replace(/<[^>]+>/g, "").trim());
      return `anchors: ${links.length}\nempty names: ${empty.length}`;
    }
    case "port-from-url": {
      const u = new URL(need(text));
      if (u.port) return u.port;
      if (u.protocol === "https:") return "443";
      if (u.protocol === "http:") return "80";
      throw new Error("No default port for that scheme.");
    }
    case "domain-syntax": {
      const t = need(text).replace(/\.$/, "");
      const ok = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(t);
      return ok ? "syntax ok (not a DNS lookup)" : "not a hostname";
    }
    case "stdev-list": {
      const list = nums(text);
      if (list.length < 2) throw new Error("Enter at least two numbers.");
      const mean = list.reduce((a, b) => a + b, 0) / list.length;
      const variance = list.reduce((a, b) => a + (b - mean) ** 2, 0) / (list.length - 1);
      return `sample stdev: ${Math.round(Math.sqrt(variance) * 1000) / 1000}`;
    }
    case "range-stats": {
      const list = nums(text);
      const sum = list.reduce((a, b) => a + b, 0);
      return `count: ${list.length}\nmin: ${Math.min(...list)}\nmax: ${Math.max(...list)}\nsum: ${sum}\nmean: ${Math.round((sum / list.length) * 1000) / 1000}`;
    }
    case "round-number": {
      const [n] = nums(text);
      const places = Number(extra === "" ? "0" : extra);
      if (!Number.isInteger(places) || places < 0 || places > 8) throw new Error("Use 0–8 decimal places.");
      return n.toFixed(places);
    }
    case "fraction-to-decimal": {
      const m = need(text).match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
      if (!m) throw new Error("Use a fraction like 1/2.");
      if (Number(m[2]) === 0) throw new Error("Denominator cannot be 0.");
      return String(Number(m[1]) / Number(m[2]));
    }
    case "prime-factors": {
      let n = Number(need(text).split(/\s+/)[0]);
      if (!Number.isInteger(n) || n < 2 || n > 1_000_000) throw new Error("Enter an integer from 2 to 1000000.");
      const factors: number[] = [];
      for (let p = 2; p * p <= n; p++) while (n % p === 0) { factors.push(p); n /= p; }
      if (n > 1) factors.push(n);
      return factors.join(" × ");
    }
    case "quadratic-roots": {
      const [a, b, c] = nums(text);
      if (a === 0) throw new Error("a cannot be 0.");
      const d = b * b - 4 * a * c;
      if (d < 0) return "no real roots";
      const s = Math.sqrt(d);
      const r1 = (-b + s) / (2 * a);
      const r2 = (-b - s) / (2 * a);
      return d === 0 ? `root: ${r1}` : `roots: ${r1}, ${r2}`;
    }
    case "overtime-pay": {
      const [hours, rate, mult] = nums(text);
      if (hours < 0 || rate < 0 || mult < 0) throw new Error("Use non-negative hours, rate, and multiplier.");
      return `overtime pay: ${Math.round(hours * rate * mult * 100) / 100}`;
    }
    case "roi-calculator": {
      const [end, start] = nums(text);
      if (start === 0) throw new Error("Start value cannot be 0.");
      return `change: ${Math.round(((end - start) / start) * 1000) / 10}%`;
    }
    case "meeting-cost": {
      const [people, rate, hours] = nums(text);
      if (people < 0 || rate < 0 || hours < 0) throw new Error("Use non-negative people, rate, and hours.");
      return `cost: ${Math.round(people * rate * hours * 100) / 100}`;
    }
    case "leap-year": {
      const y = Number(need(text));
      if (!Number.isInteger(y) || y < 1 || y > 9999) throw new Error("Enter a year from 1 to 9999.");
      const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      return leap ? "leap year" : "not a leap year";
    }
    case "days-in-month": {
      const m = need(text).match(/^(\d{4})-(\d{2})$/);
      if (!m) throw new Error("Use YYYY-MM.");
      const y = Number(m[1]);
      const month = Number(m[2]);
      if (month < 1 || month > 12) throw new Error("Use a month from 01 to 12.");
      return String(new Date(Date.UTC(y, month, 0)).getUTCDate());
    }
    case "add-months": {
      const n = Number(extra || "0");
      if (!Number.isInteger(n)) throw new Error("Enter a whole number of months.");
      const d = parseIsoDate(text);
      const day = d.getUTCDate();
      const moved = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
      const last = new Date(Date.UTC(moved.getUTCFullYear(), moved.getUTCMonth() + 1, 0)).getUTCDate();
      moved.setUTCDate(Math.min(day, last));
      return iso(moved);
    }
    case "end-of-month": {
      const d = parseIsoDate(text);
      return iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
    }
    case "add-clock": {
      const mins = Number(extra || "0");
      if (!Number.isFinite(mins)) throw new Error("Enter minutes to add.");
      return fmtClock(clockMinutes(text) + mins);
    }
    case "clock-difference":
      return String(clockMinutes(extra) - clockMinutes(text));
    case "pomodoro-blocks": {
      const total = Number(need(text));
      const block = Number(extra || "25");
      if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(block) || block <= 0) throw new Error("Enter positive minutes.");
      return `blocks: ${Math.floor(total / block)}\nremainder: ${Math.round((total % block) * 100) / 100} min`;
    }
    case "unit-price": {
      const [price, qty] = nums(text);
      if (qty === 0) throw new Error("Quantity cannot be 0.");
      return `per unit: ${Math.round((price / qty) * 1000) / 1000}`;
    }
    case "number-to-words": {
      const n = Number(need(text));
      if (!Number.isInteger(n) || n < 0 || n > 999999) throw new Error("Enter an integer from 0 to 999999. Words are English.");
      return numberToWords(n);
    }
    case "relative-luminance": {
      const { r, g, b } = hexColor(text);
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return String(Math.round(L * 1000) / 1000);
    }
    case "tint-hex":
    case "shade-hex": {
      const { r, g, b } = hexColor(text);
      const pct = Number(extra || "20");
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) throw new Error("Use a percent from 0 to 100.");
      const t = pct / 100;
      const target = id === "tint-hex" ? 255 : 0;
      return toHex(mix(r, target, t), mix(g, target, t), mix(b, target, t));
    }
    case "nearest-named-color": {
      const { r, g, b } = hexColor(text);
      let best = NAMED_COLORS[0];
      let bestD = Infinity;
      for (const row of NAMED_COLORS) {
        const c = hexColor(row[1]);
        const d = (c.r - r) ** 2 + (c.g - g) ** 2 + (c.b - b) ** 2;
        if (d < bestD) {
          best = row;
          bestD = d;
        }
      }
      return `${best[0]} ${best[1]}`;
    }
    case "readable-ink": {
      const { r, g, b } = hexColor(text);
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return L > 0.179 ? "#000000" : "#ffffff";
    }
    case "csp-builder":
      return linesOf(text).map((l) => l.trim()).filter(Boolean).join("; ");
    case "web-manifest": {
      const [name, shortName, start] = linesOf(text);
      if (!name?.trim() || !shortName?.trim() || !start?.trim()) throw new Error("Use three lines: name, short name, start URL.");
      return JSON.stringify({ name: name.trim(), short_name: shortName.trim(), start_url: start.trim(), display: "standalone" }, null, 2);
    }
    default:
      throw new Error(`Unknown wave2 tool ${id}`);
  }
}

async function samplePdfBytes() {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.addPage([200, 100]);
  return doc.save();
}

export async function runWave2Pdf(id: string, bytes: Uint8Array, extra: string) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.load(bytes);
  if (id === "pdf-page-sizes") {
    const lines = pdf.getPages().map((page, index) => {
      const { width, height } = page.getSize();
      return `${index + 1}: ${Math.round(width)}×${Math.round(height)} pt`;
    });
    if (!lines.length) throw new Error("This PDF has no pages.");
    return { text: lines.join("\n"), bytes };
  }
  if (id === "pdf-set-info") {
    const [title, author] = extra.split(/\r?\n/);
    const nextTitle = (title ?? "").trim();
    if (!nextTitle) throw new Error("Enter a document title.");
    pdf.setTitle(nextTitle);
    if (author?.trim()) pdf.setAuthor(author.trim());
    const saved = await pdf.save();
    const check = await PDFDocument.load(saved);
    return { text: `title: ${check.getTitle() ?? ""}\nauthor: ${check.getAuthor() ?? ""}`, bytes: saved };
  }
  throw new Error(`Unknown wave2 pdf tool ${id}`);
}

export async function runWave2Image(id: string, file: File) {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    throw new Error("Image encoding uses the browser canvas; covered by Playwright.");
  }
  const bmp = await createImageBitmap(file);
  const width = bmp.width;
  const height = bmp.height;
  if (!width || !height) throw new Error("Could not read that image.");
  if (id === "image-dimensions") {
    bmp.close?.();
    return { text: `${width}×${height} px` };
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  if (id === "image-pixelate") {
    const block = 8;
    const small = document.createElement("canvas");
    small.width = Math.max(1, Math.round(width / block));
    small.height = Math.max(1, Math.round(height / block));
    small.getContext("2d")!.drawImage(bmp, 0, 0, small.width, small.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, width, height);
  } else if (id === "image-grayscale") {
    ctx.drawImage(bmp, 0, 0);
    const frame = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < frame.data.length; i += 4) {
      const y = frame.data[i] * 0.299 + frame.data[i + 1] * 0.587 + frame.data[i + 2] * 0.114;
      frame.data[i] = frame.data[i + 1] = frame.data[i + 2] = y;
    }
    ctx.putImageData(frame, 0, 0);
  } else {
    throw new Error(`Unknown wave2 image tool ${id}`);
  }
  bmp.close?.();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((out) => (out ? resolve(out) : reject(new Error("Could not encode PNG."))), "image/png");
  });
  const filename = id === "image-grayscale" ? "grayscale.png" : "pixelated.png";
  return { text: `${width}×${height} px PNG`, blob, filename };
}

export async function runWave2Async(id: string, input: WaveInput & { bytes?: Uint8Array }): Promise<string> {
  if (!isWave2Tool(id)) throw new Error(`Unknown wave2 tool ${id}`);
  if (IMAGE_WAVE2.has(id)) throw new Error("Image encoding uses the browser canvas; covered by Playwright.");
  if (PDF_WAVE2.has(id)) {
    const bytes = input.bytes ?? (await samplePdfBytes());
    const result = await runWave2Pdf(id, bytes, input.extra ?? "");
    return result.text;
  }
  return runWave2Sync(id, input);
}

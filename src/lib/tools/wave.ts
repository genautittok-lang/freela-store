export type WaveInput = { text: string; extra?: string };

function need(text: string) {
  const t = text.trim();
  if (!t) throw new Error("Add some input first.");
  return t;
}

function nums(text: string) {
  const parts = text.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean).map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n))) throw new Error("Enter numbers separated by spaces or commas.");
  return parts;
}

function oneInt(text: string, lo: number, hi: number) {
  const n = Number(need(text).split(/\s+/)[0]);
  if (!Number.isInteger(n) || n < lo || n > hi) throw new Error(`Enter an integer from ${lo} to ${hi}.`);
  return n;
}

function hexColor(raw: string) {
  const t = raw.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(t)) throw new Error("Enter a 6-digit hex color such as #157a45.");
  const n = parseInt(t, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, hex: `#${t.toLowerCase()}` };
}

function toHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function crc32(str: string) {
  let c = 0xffffffff;
  for (const ch of new TextEncoder().encode(str)) {
    c ^= ch;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

function isPrime(n: number) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  const s = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= s; i += 2) if (n % i === 0) return false;
  return true;
}

function roman(n: number) {
  if (n < 1 || n > 3999) throw new Error("Use an integer from 1 to 3999.");
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

function luhn(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length < 2) throw new Error("Enter at least two digits.");
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return { digits: d, ok: sum % 10 === 0, sum };
}

function parseIsoDate(raw: string) {
  const t = need(raw).slice(0, 10);
  const d = new Date(`${t}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || t.length !== 10) throw new Error("Use an ISO date YYYY-MM-DD.");
  return d;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  const hue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (!s) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return { r: hue(p, q, h + 1 / 3) * 255, g: hue(p, q, h) * 255, b: hue(p, q, h - 1 / 3) * 255 };
}

function identToSnake(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}

export const WAVE_SAMPLES: Record<string, WaveInput> = {
  "reverse-text": { text: "Freela" },
  "reverse-lines": { text: "a\nb\nc" },
  "number-lines": { text: "alpha\nbeta" },
  "prefix-suffix": { text: "one\ntwo", extra: "[,] " },
  "wrap-text": { text: "The quick brown fox jumps over the lazy dog.", extra: "12" },
  "extract-emails": { text: "Hi a@b.co and c@d.net" },
  "extract-urls": { text: "See https://freela.store/en/ and http://example.com/a" },
  "extract-phones": { text: "Call +1 202 555 0111 or 07911 123456" },
  "remove-empty-lines": { text: "a\n\n\nb" },
  "count-lines": { text: "a\na\nb\n" },
  rot13: { text: "Freela" },
  "caesar-shift": { text: "Freela", extra: "3" },
  "find-replace": { text: "pdf pdf", extra: "pdf\nPDF" },
  "repeat-text": { text: "ha", extra: "3" },
  "truncate-text": { text: "abcdefghijklmnopqrstuvwxyz", extra: "8" },
  "name-initials": { text: "Ada Lovelace" },
  "remove-punctuation": { text: "Hello, world!" },
  "letter-frequency": { text: "banana" },
  "camel-snake": { text: "fooBarBaz" },
  "snake-camel": { text: "foo_bar_baz" },
  "kebab-camel": { text: "foo-bar-baz" },
  "markdown-toc": { text: "# Title\n\n## One\n\n### Two" },
  "lines-to-csv": { text: "a\nb\nc" },
  "json-to-yaml": { text: '{"name":"Freela","local":true}' },
  "json-keys": { text: '{"a":1,"b":2}' },
  "json-escape": { text: 'He said "hi"' },
  "hex-encode": { text: "Hi" },
  "hex-decode": { text: "4869" },
  "binary-encode": { text: "A" },
  "decimal-binary": { text: "13" },
  "uuid-validate": { text: "123e4567-e89b-12d3-a456-426614174000" },
  "cookie-parse": { text: "sid=abc; theme=dark" },
  "mime-guess": { text: "photo.webp" },
  "file-extension": { text: "archive.tar.gz" },
  "json-env": { text: '{"TOKEN":"x","N":2}' },
  "env-json": { text: "TOKEN=x\nN=2" },
  "crc32-hash": { text: "freela" },
  levenshtein: { text: "kitten", extra: "sitting" },
  "luhn-check": { text: "79927398713" },
  "html-minify": { text: "<div>  a  </div>" },
  "css-minify": { text: "body { color: #111; }" },
  "strip-comments": { text: "a(); // x\n/* y */ b();" },
  "query-build": { text: "q=pdf\nlang=en" },
  base64url: { text: "hi?" },
  "title-length": { text: "Merge PDF files in your browser" },
  "keyword-density": { text: "pdf merge pdf tools", extra: "pdf" },
  "robots-path-test": { text: "User-agent: *\nDisallow: /admin\nAllow: /en", extra: "/admin/login" },
  "twitter-card": { text: "Freela\nLocal browser tools\nhttps://freela.store/en/\nhttps://freela.store/brand/og.png" },
  "breadcrumb-ld": { text: "Home|https://freela.store/en/\nTools|https://freela.store/en/" },
  "faq-jsonld": { text: "Are files uploaded?||No. LOCAL_ONLY.\nIs it free?||Yes." },
  "meta-robots": { text: "noindex,follow" },
  "href-extract": { text: '<a href="/en/">Home</a> <a href="https://freela.store/en/about">About</a>' },
  "slug-from-url": { text: "https://freela.store/en/tools/merge-pdf" },
  "strip-utm": { text: "https://freela.store/en/?utm_source=x&q=1&gclid=abc" },
  "canonical-host": { text: "HTTP://WWW.Freela.STORE:443/en/" },
  "redirect-pairs": { text: "/old -> /en/\n/x → /en/about" },
  "simple-interest": { text: "1000 5 2" },
  "rule-of-three": { text: "2 10 4" },
  "hourly-rate": { text: "52000 40" },
  cagr: { text: "100 121 2" },
  "break-even": { text: "1000 12 7" },
  "roman-numeral": { text: "2026" },
  "gcd-lcm": { text: "12 18" },
  "prime-check": { text: "97" },
  factorial: { text: "6" },
  fibonacci: { text: "8" },
  "average-mean": { text: "1 2 3 4" },
  "median-list": { text: "1 3 2" },
  "aspect-ratio": { text: "1920 1080" },
  "px-to-rem": { text: "16 16" },
  "savings-goal": { text: "1200 100" },
  "triangle-area": { text: "10 4" },
  "circle-math": { text: "3" },
  pythagoras: { text: "3 4" },
  "ratio-simplify": { text: "12 18" },
  "add-days": { text: "2026-01-15", extra: "10" },
  "weekday-of": { text: "2026-09-25" },
  "iso-week": { text: "2026-01-01" },
  "year-quarter": { text: "2026-09-25" },
  "business-days": { text: "2026-09-21", extra: "2026-09-25" },
  "format-date": { text: "2026-09-25" },
  "days-until": { text: "2026-12-31" },
  "invert-hex": { text: "#157a45" },
  "mix-hex": { text: "#157a45", extra: "#ffffff" },
  "is-dark-hex": { text: "#111111" },
  "rgb-cmyk": { text: "#157a45" },
  "complementary-hex": { text: "#157a45" },
  "random-hex": { text: "1" },
  "dummy-json": { text: "2" },
  "dummy-csv": { text: "2" },
  "pin-generator": { text: "4" },
  "dice-roller": { text: "2d6" },
  "pick-from-list": { text: "alpha\nbeta\ngamma" },
  "password-score": { text: "Tr0ub4dor&3" },
  "redact-emails": { text: "mail a@b.co please" },
  "redact-phones": { text: "Call 2025550111 now" },
  "mask-center": { text: "ABCDEFGH" },
  "hash-line": { text: "freela" },
  "deg-to-rad": { text: "180 deg" },
  "px-to-pt": { text: "16" },
  "extract-domain": { text: "https://www.freela.store/en/" },
  "force-https": { text: "http://freela.store/en/" },
};

/** Second-field labels for tools that need extra input. */
export const WAVE_EXTRA_HINT: Record<string, string> = {
  "prefix-suffix": "prefix,suffix  (comma-separated)",
  "wrap-text": "wrap width in characters (default 72)",
  "caesar-shift": "shift amount (default 13)",
  "find-replace": "find on line 1, replace on line 2",
  "repeat-text": "times to repeat",
  "truncate-text": "max length",
  levenshtein: "second string",
  "keyword-density": "phrase to measure",
  "robots-path-test": "path to test, such as /admin",
  "add-days": "days to add (negative subtracts)",
  "business-days": "end date YYYY-MM-DD",
  "mix-hex": "second hex color",
};

export function waveNeedsExtra(id: string) {
  return Boolean(WAVE_SAMPLES[id]?.extra !== undefined || WAVE_EXTRA_HINT[id]);
}

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  json: "application/json",
  csv: "text/csv",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  ts: "text/plain",
  md: "text/markdown",
  txt: "text/plain",
  xml: "application/xml",
  svg: "image/svg+xml",
  zip: "application/zip",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function runWave(id: string, input: WaveInput): string {
  const text = input.text ?? "";
  const extra = input.extra ?? "";
  switch (id) {
    case "reverse-text":
      return [...need(text)].reverse().join("");
    case "reverse-lines":
      return need(text).split(/\r?\n/).reverse().join("\n");
    case "number-lines":
      return need(text)
        .split(/\r?\n/)
        .map((line, i) => `${i + 1}. ${line}`)
        .join("\n");
    case "prefix-suffix": {
      const [pre = "", suf = ""] = extra.split(",");
      return need(text)
        .split(/\r?\n/)
        .map((line) => `${pre}${line}${suf}`)
        .join("\n");
    }
    case "wrap-text": {
      const width = Math.max(8, Number(extra || 72) || 72);
      const words = need(text).split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        if ((cur + " " + w).trim().length > width) {
          if (cur) lines.push(cur);
          cur = w;
        } else cur = (cur + " " + w).trim();
      }
      if (cur) lines.push(cur);
      return lines.join("\n");
    }
    case "extract-emails": {
      const found = need(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
      if (!found.length) throw new Error("No email addresses found.");
      return [...new Set(found)].join("\n");
    }
    case "extract-urls": {
      const found = need(text).match(/https?:\/\/[^\s<>"']+/gi) ?? [];
      if (!found.length) throw new Error("No http(s) URLs found.");
      return [...new Set(found)].join("\n");
    }
    case "extract-phones": {
      const found = need(text).match(/(?:\+?\d[\d\s().-]{7,}\d)/g) ?? [];
      if (!found.length) throw new Error("No phone-like digit runs found.");
      return [...new Set(found.map((s) => s.trim()))].join("\n");
    }
    case "remove-empty-lines":
      return need(text)
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .join("\n");
    case "count-lines": {
      const lines = text.replace(/\n$/, "").split(/\r?\n/);
      const nonempty = lines.filter((l) => l.trim());
      return `lines: ${lines.length}\nnonempty: ${nonempty.length}\nunique: ${new Set(nonempty).size}`;
    }
    case "rot13":
      return need(text).replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(base + ((ch.charCodeAt(0) - base + 13) % 26));
      });
    case "caesar-shift": {
      const n = Number(extra || "13");
      if (!Number.isInteger(n)) throw new Error("Shift must be an integer.");
      const shift = ((n % 26) + 26) % 26;
      return need(text).replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(base + ((ch.charCodeAt(0) - base + shift) % 26));
      });
    }
    case "find-replace": {
      const [find, repl = ""] = extra.split("\n");
      if (!find) throw new Error("Put the find string on the first extra line.");
      return need(text).split(find).join(repl);
    }
    case "repeat-text": {
      const n = oneInt(extra || "2", 1, 200);
      return Array.from({ length: n }, () => need(text)).join("");
    }
    case "truncate-text": {
      const n = oneInt(extra || "80", 1, 10_000);
      const t = need(text);
      return t.length <= n ? t : t.slice(0, Math.max(1, n - 1)) + "…";
    }
    case "name-initials": {
      const parts = need(text).split(/\s+/).filter(Boolean);
      if (parts.length < 1) throw new Error("Enter a name.");
      return parts.map((p) => p[0]!.toUpperCase()).join(".");
    }
    case "remove-punctuation":
      return need(text).replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
    case "letter-frequency": {
      const letters = need(text).toLowerCase().replace(/[^a-z]/g, "");
      if (!letters) throw new Error("No A–Z letters found.");
      const map = new Map<string, number>();
      for (const ch of letters) map.set(ch, (map.get(ch) || 0) + 1);
      return [...map.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([ch, n]) => `${ch}: ${n}`)
        .join("\n");
    }
    case "camel-snake":
      return identToSnake(need(text));
    case "snake-camel": {
      const p = need(text).toLowerCase().split(/[_]+/).filter(Boolean);
      return p[0] + p.slice(1).map((w) => w[0]!.toUpperCase() + w.slice(1)).join("");
    }
    case "kebab-camel": {
      const p = need(text).toLowerCase().split(/[-]+/).filter(Boolean);
      return p[0] + p.slice(1).map((w) => w[0]!.toUpperCase() + w.slice(1)).join("");
    }
    case "markdown-toc": {
      const heads = need(text)
        .split(/\r?\n/)
        .map((l) => l.match(/^(#{1,6})\s+(.+)$/))
        .filter((m): m is RegExpMatchArray => Boolean(m));
      if (!heads.length) throw new Error("No Markdown headings found.");
      return heads.map((m) => `${"  ".repeat(m[1].length - 1)}- ${m[2]}`).join("\n");
    }
    case "lines-to-csv":
      return need(text)
        .split(/\r?\n/)
        .map((l) => `"${l.replace(/"/g, '""')}"`)
        .join("\n");
    case "json-to-yaml": {
      const obj = JSON.parse(need(text)) as unknown;
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Provide a JSON object (not an array).");
      return Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n");
    }
    case "json-keys": {
      const obj = JSON.parse(need(text)) as unknown;
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Provide a JSON object.");
      const keys = Object.keys(obj as object);
      if (!keys.length) throw new Error("Object has no keys.");
      return keys.join("\n");
    }
    case "json-escape":
      return JSON.stringify(need(text));
    case "hex-encode":
      return [...new TextEncoder().encode(need(text))].map((b) => b.toString(16).padStart(2, "0")).join("");
    case "hex-decode": {
      const h = need(text).replace(/\s+/g, "");
      if (h.length % 2 || /[^0-9a-f]/i.test(h)) throw new Error("Enter even-length hex.");
      const bytes = new Uint8Array(h.length / 2);
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
      return new TextDecoder().decode(bytes);
    }
    case "binary-encode":
      return [...new TextEncoder().encode(need(text))].map((b) => b.toString(2).padStart(8, "0")).join(" ");
    case "decimal-binary": {
      const n = oneInt(text, 0, 2 ** 40);
      return n.toString(2);
    }
    case "uuid-validate": {
      const t = need(text);
      const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t);
      if (!ok) throw new Error("Not a hyphenated UUID with a valid version/variant nibble.");
      return `valid version ${t[14]}`;
    }
    case "cookie-parse": {
      const parts = need(text).split(";").map((p) => p.trim()).filter(Boolean);
      const out = parts.map((p) => {
        const i = p.indexOf("=");
        if (i < 1) throw new Error("Each cookie needs name=value.");
        return `${p.slice(0, i)}=${p.slice(i + 1)}`;
      });
      return out.join("\n");
    }
    case "mime-guess": {
      const name = need(text).split(/[\\/]/).pop() || "";
      const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
      return MIME[ext] || "application/octet-stream";
    }
    case "file-extension": {
      const name = need(text).split(/[\\/]/).pop() || "";
      const i = name.lastIndexOf(".");
      if (i < 1) throw new Error("No extension on that path.");
      return name.slice(i + 1).toLowerCase();
    }
    case "json-env": {
      const obj = JSON.parse(need(text)) as Record<string, unknown>;
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Provide a JSON object.");
      return Object.entries(obj)
        .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n");
    }
    case "env-json": {
      const obj: Record<string, string> = {};
      for (const line of need(text).split(/\r?\n/)) {
        if (!line.trim() || line.trim().startsWith("#")) continue;
        const i = line.indexOf("=");
        if (i < 1) throw new Error("Use KEY=value lines.");
        obj[line.slice(0, i).trim()] = line.slice(i + 1);
      }
      return JSON.stringify(obj, null, 2);
    }
    case "crc32-hash":
      return crc32(need(text));
    case "levenshtein": {
      const a = need(text);
      const b = need(extra);
      const dp = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
      );
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
      }
      return String(dp[a.length][b.length]);
    }
    case "luhn-check": {
      const r = luhn(need(text));
      return r.ok ? `pass (${r.digits.length} digits)` : `fail (${r.digits.length} digits)`;
    }
    case "html-minify":
      return need(text).replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
    case "css-minify":
      return need(text).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim();
    case "strip-comments":
      return need(text).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1").trim();
    case "query-build": {
      const p = new URLSearchParams();
      for (const line of need(text).split(/\r?\n/)) {
        if (!line.trim()) continue;
        const i = line.indexOf("=");
        if (i < 1) throw new Error("Use key=value lines.");
        p.append(line.slice(0, i).trim(), line.slice(i + 1));
      }
      return p.toString();
    }
    case "base64url": {
      const b64 = btoa(unescape(encodeURIComponent(need(text))));
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    case "title-length": {
      const t = need(text).split("\n")[0] || "";
      return `${[...t].length} characters (common SERP title budget ~50–60; this is not a live ranking).`;
    }
    case "keyword-density": {
      const phrase = need(extra).toLowerCase();
      const words = need(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
      if (!words.length) throw new Error("No words found.");
      const needle = phrase.match(/[\p{L}\p{N}]+/gu) ?? [];
      if (!needle.length) throw new Error("Enter a keyword on the extra line.");
      let hits = 0;
      for (let i = 0; i <= words.length - needle.length; i++) {
        if (needle.every((w, j) => words[i + j] === w)) hits += 1;
      }
      const density = (hits / words.length) * 100;
      return `hits: ${hits}\nwords: ${words.length}\ndensity: ${density.toFixed(2)}%`;
    }
    case "robots-path-test": {
      const path = extra.trim() || "/";
      const rules = need(text)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => /^disallow:/i.test(l))
        .map((l) => l.slice(l.indexOf(":") + 1).trim())
        .filter(Boolean);
      const blocked = rules.some((rule) => rule !== "/" && path.startsWith(rule));
      return blocked ? `blocked by Disallow (${path})` : `allowed (${path}) — simple prefix test only`;
    }
    case "twitter-card": {
      const [title, desc, url, image] = need(text).split("\n");
      return [
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${(title || "").replace(/"/g, "&quot;")}" />`,
        `<meta name="twitter:description" content="${(desc || "").replace(/"/g, "&quot;")}" />`,
        url ? `<meta name="twitter:url" content="${url.trim()}" />` : "",
        image ? `<meta name="twitter:image" content="${image.trim()}" />` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "breadcrumb-ld": {
      const items = need(text)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => {
          const [name, url] = l.split("|");
          if (!name || !url) throw new Error("Use name|https://url lines.");
          return { "@type": "ListItem", position: i + 1, name: name.trim(), item: url.trim() };
        });
      return JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items }, null, 2);
    }
    case "faq-jsonld": {
      const ents = need(text)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [q, a] = l.split("||");
          if (!q || !a) throw new Error("Use question||answer lines. Reviews are not generated.");
          return { "@type": "Question", name: q.trim(), acceptedAnswer: { "@type": "Answer", text: a.trim() } };
        });
      return JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ents }, null, 2);
    }
    case "meta-robots": {
      const c = (extra.trim() || need(text)).replace(/\s+/g, "");
      return `<meta name="robots" content="${c}" />`;
    }
    case "href-extract": {
      const hrefs = [...need(text).matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
      if (!hrefs.length) throw new Error("No href attributes found.");
      return [...new Set(hrefs)].join("\n");
    }
    case "slug-from-url": {
      const u = new URL(need(text).includes("://") ? need(text) : `https://${need(text)}`);
      const seg = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop();
      if (!seg) throw new Error("No path segment to use as a slug.");
      return decodeURIComponent(seg);
    }
    case "strip-utm": {
      const u = new URL(need(text).includes("://") ? need(text) : `https://${need(text)}`);
      [...u.searchParams.keys()].forEach((k) => {
        if (/^utm_/i.test(k) || /^(gclid|fbclid|mc_eid|igshid)$/i.test(k)) u.searchParams.delete(k);
      });
      return u.toString();
    }
    case "canonical-host": {
      const u = new URL(need(text).includes("://") ? need(text) : `https://${need(text)}`);
      u.protocol = "https:";
      u.hostname = u.hostname.toLowerCase();
      if (u.port === "443") u.port = "";
      return u.toString();
    }
    case "redirect-pairs": {
      const rows = need(text)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const m = l.split(/\s*(?:->|→|,)\s*/);
          if (m.length < 2) throw new Error("Use from -> to lines.");
          return `${m[0]},${m[1]}`;
        });
      return ["from,to", ...rows].join("\n");
    }
    case "simple-interest": {
      const [p, r, t] = nums(text);
      if (p < 0 || r < 0 || t < 0) throw new Error("Values must be zero or more.");
      const interest = p * (r / 100) * t;
      return `interest: ${interest}\ntotal: ${p + interest}`;
    }
    case "rule-of-three": {
      const [a, b, c] = nums(text);
      if (a === 0) throw new Error("First value cannot be zero.");
      return String((b * c) / a);
    }
    case "hourly-rate": {
      const [yearly, hours] = nums(text);
      if (hours <= 0) throw new Error("Hours per week must be positive.");
      return String(yearly / (hours * 52));
    }
    case "cagr": {
      const [start, end, years] = nums(text);
      if (start <= 0 || years <= 0) throw new Error("Start value and years must be positive.");
      return String((end / start) ** (1 / years) - 1);
    }
    case "break-even": {
      const [fixed, price, cost] = nums(text);
      const margin = price - cost;
      if (margin <= 0) throw new Error("Price must be greater than unit cost.");
      return String(Math.ceil(fixed / margin));
    }
    case "roman-numeral":
      return roman(oneInt(text, 1, 3999));
    case "gcd-lcm": {
      const [a, b] = nums(text);
      const g = gcd(a, b);
      const l = Math.abs(Math.trunc(a) * Math.trunc(b)) / (g || 1);
      return `gcd: ${g}\nlcm: ${l}`;
    }
    case "prime-check": {
      const n = oneInt(text, 0, 10_000_000);
      return isPrime(n) ? `${n} is prime` : `${n} is not prime`;
    }
    case "factorial": {
      const n = oneInt(text, 0, 170);
      let x = 1;
      for (let i = 2; i <= n; i++) x *= i;
      return String(x);
    }
    case "fibonacci": {
      const n = oneInt(text, 1, 80);
      const seq = [0, 1];
      while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      return seq.slice(0, n).join(", ");
    }
    case "average-mean": {
      const n = nums(text);
      return String(n.reduce((a, b) => a + b, 0) / n.length);
    }
    case "median-list": {
      const n = [...nums(text)].sort((a, b) => a - b);
      const mid = Math.floor(n.length / 2);
      return String(n.length % 2 ? n[mid] : (n[mid - 1] + n[mid]) / 2);
    }
    case "aspect-ratio": {
      const [w, h] = nums(text);
      const g = gcd(w, h) || 1;
      return `${Math.trunc(w / g)}:${Math.trunc(h / g)}`;
    }
    case "px-to-rem": {
      const [px, root = 16] = nums(text);
      if (root === 0) throw new Error("Root font size cannot be zero.");
      return `${px / root}rem`;
    }
    case "savings-goal": {
      const [goal, monthly] = nums(text);
      if (monthly <= 0) throw new Error("Monthly amount must be positive.");
      return `${Math.ceil(goal / monthly)} months`;
    }
    case "triangle-area": {
      const [b, h] = nums(text);
      if (b < 0 || h < 0) throw new Error("Base and height must be zero or more.");
      return String((b * h) / 2);
    }
    case "circle-math": {
      const [r] = nums(text);
      if (r < 0) throw new Error("Radius must be zero or more.");
      return `area: ${Math.PI * r * r}\ncircumference: ${2 * Math.PI * r}`;
    }
    case "pythagoras": {
      const [a, b] = nums(text);
      if (a < 0 || b < 0) throw new Error("Legs must be zero or more.");
      return String(Math.hypot(a, b));
    }
    case "ratio-simplify": {
      const [a, b] = nums(text);
      const g = gcd(a, b) || 1;
      return `${Math.trunc(a / g)}:${Math.trunc(b / g)}`;
    }
    case "add-days": {
      const d = parseIsoDate(text);
      const n = Number(extra);
      if (!Number.isInteger(n)) throw new Error("Extra field: whole days to add (negative allowed).");
      d.setUTCDate(d.getUTCDate() + n);
      return iso(d);
    }
    case "weekday-of":
      return new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(parseIsoDate(text));
    case "iso-week": {
      const d = parseIsoDate(text);
      const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      const day = t.getUTCDay() || 7;
      t.setUTCDate(t.getUTCDate() + 4 - day);
      const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
      const week = Math.ceil(((t.getTime() - y.getTime()) / 86400000 + 1) / 7);
      return String(week);
    }
    case "year-quarter": {
      const m = parseIsoDate(text).getUTCMonth();
      return `Q${Math.floor(m / 3) + 1}`;
    }
    case "business-days": {
      const a = parseIsoDate(text);
      const b = parseIsoDate(extra || text);
      const start = a < b ? a : b;
      const end = a < b ? b : a;
      let n = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const w = cur.getUTCDay();
        if (w !== 0 && w !== 6) n += 1;
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
      return String(n);
    }
    case "format-date": {
      const d = parseIsoDate(text);
      return `${iso(d)}\n${new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" }).format(d)}`;
    }
    case "days-until": {
      const target = parseIsoDate(text);
      const today = new Date();
      const t0 = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      return String(Math.round((target.getTime() - t0) / 86400000));
    }
    case "invert-hex": {
      const { r, g, b } = hexColor(text);
      return toHex(255 - r, 255 - g, 255 - b);
    }
    case "mix-hex": {
      const a = hexColor(text);
      const b = hexColor(extra);
      return toHex((a.r + b.r) / 2, (a.g + b.g) / 2, (a.b + b.b) / 2);
    }
    case "is-dark-hex": {
      const { r, g, b } = hexColor(text);
      const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return y < 0.45 ? "dark" : "light";
    }
    case "rgb-cmyk": {
      const { r, g, b } = hexColor(text);
      const k = 1 - Math.max(r, g, b) / 255;
      if (k === 1) return "c=0 m=0 y=0 k=1";
      const c = (1 - r / 255 - k) / (1 - k);
      const m = (1 - g / 255 - k) / (1 - k);
      const y = (1 - b / 255 - k) / (1 - k);
      return `c=${c.toFixed(3)} m=${m.toFixed(3)} y=${y.toFixed(3)} k=${k.toFixed(3)}`;
    }
    case "complementary-hex": {
      const { r, g, b } = hexColor(text);
      const hsl = rgbToHsl(r, g, b);
      const rgb = hslToRgb((hsl.h + 0.5) % 1, hsl.s, hsl.l);
      return toHex(rgb.r, rgb.g, rgb.b);
    }
    case "random-hex": {
      const buf = new Uint8Array(3);
      crypto.getRandomValues(buf);
      return toHex(buf[0], buf[1], buf[2]);
    }
    case "dummy-json": {
      const n = oneInt(text, 1, 50);
      return JSON.stringify(
        Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `item-${i + 1}`, local: true })),
        null,
        2,
      );
    }
    case "dummy-csv": {
      const n = oneInt(text, 1, 50);
      return ["id,name", ...Array.from({ length: n }, (_, i) => `${i + 1},item-${i + 1}`)].join("\n");
    }
    case "pin-generator": {
      const n = oneInt(text, 3, 12);
      const buf = new Uint8Array(n);
      crypto.getRandomValues(buf);
      return [...buf].map((b) => String(b % 10)).join("");
    }
    case "dice-roller": {
      const m = need(text).trim().match(/^(\d+)d(\d+)$/i);
      if (!m) throw new Error("Use NdS such as 2d6.");
      const count = Number(m[1]);
      const sides = Number(m[2]);
      if (count < 1 || count > 40 || sides < 2 || sides > 1000) throw new Error("Dice count 1–40, sides 2–1000.");
      const buf = new Uint32Array(count);
      crypto.getRandomValues(buf);
      const rolls = [...buf].map((v) => 1 + (v % sides));
      return `${rolls.join(" + ")} = ${rolls.reduce((a, b) => a + b, 0)}`;
    }
    case "pick-from-list": {
      const lines = need(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (!lines.length) throw new Error("Add one item per line.");
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return lines[buf[0] % lines.length];
    }
    case "password-score": {
      const p = need(text);
      let score = 0;
      if (p.length >= 8) score += 1;
      if (p.length >= 12) score += 1;
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
      if (/\d/.test(p)) score += 1;
      if (/[^a-zA-Z0-9]/.test(p)) score += 1;
      return `score ${score}/5 — heuristic only, not a breach check`;
    }
    case "redact-emails":
      return need(text).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]");
    case "redact-phones":
      return need(text).replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone]");
    case "mask-center": {
      const t = need(text);
      if (t.length <= 4) return "*".repeat(t.length);
      return t.slice(0, 2) + "*".repeat(t.length - 4) + t.slice(-2);
    }
    case "hash-line":
      throw new Error("HASH_ASYNC");
    case "deg-to-rad": {
      const raw = need(text).toLowerCase();
      const n = Number(raw.match(/-?\d+(?:\.\d+)?/)?.[0]);
      if (!Number.isFinite(n)) throw new Error("Enter a number.");
      if (/\brad/.test(raw)) return `${(n * 180) / Math.PI} deg`;
      return `${(n * Math.PI) / 180} rad`;
    }
    case "px-to-pt": {
      const [px] = nums(text);
      return `${px * 0.75}pt`;
    }
    case "extract-domain": {
      const raw = need(text);
      try {
        return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.replace(/^www\./, "");
      } catch {
        throw new Error("Enter a URL or host.");
      }
    }
    case "force-https": {
      const u = new URL(need(text).includes("://") ? need(text) : `http://${need(text)}`);
      u.protocol = "https:";
      return u.toString();
    }
    default:
      throw new Error(`Unknown wave tool ${id}`);
  }
}

export async function runWaveAsync(id: string, input: WaveInput): Promise<string> {
  if (id === "hash-line") {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(need(input.text)));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  try {
    return runWave(id, input);
  } catch (err) {
    if (err instanceof Error && err.message === "HASH_ASYNC") return runWaveAsync(id, input);
    throw err;
  }
}

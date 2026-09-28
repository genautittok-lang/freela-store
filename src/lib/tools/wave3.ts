export type WaveInput = { text?: string; extra?: string };

function need(text: string) {
  const value = text.trim();
  if (!value) throw new Error("Add input to run this tool.");
  return value;
}

function linesOf(text: string) {
  return need(text).replace(/\r\n/g, "\n").split("\n");
}

function num(text: string, label = "number") {
  const n = Number(String(text).trim().replace(",", "."));
  if (!Number.isFinite(n)) throw new Error(`Enter a ${label}.`);
  return n;
}

const EMOJI = /\p{Extended_Pictographic}/gu;

export const WAVE3_SAMPLES: Record<string, WaveInput> = {
  "title-case": { text: "hello world" },
  "sentence-case": { text: "hello. world" },
  "swap-case": { text: "Ab" },
  "shuffle-lines": { text: "a\nb\nc" },
  "unique-words": { text: "a b a" },
  "extract-numbers": { text: "a 12 b 3.5" },
  "reading-time": { text: "one two three four" },
  "longest-line": { text: "a\nbbb\nc" },
  "strip-emoji": { text: "hi 😀" },
  "extract-emoji": { text: "hi 😀" },
  "strip-bom": { text: "\uFEFFhi" },
  "center-lines": { text: "hi", extra: "6" },
  "indent-lines": { text: "a\nb", extra: "2" },
  "sort-numeric": { text: "10\n2\n1" },
  "reverse-each-line": { text: "ab\ncd" },
  "char-codes": { text: "Ab" },
  "nfc-form": { text: "e\u0301" },
  "speaking-pace": { text: "one two three four" },
  "unwrap-lines": { text: "a\nb" },
  "keep-letters": { text: "a1!" },
  "line-lengths": { text: "ab\nc" },
  "duplicate-words": { text: "a a b" },
  "trim-each-line": { text: " a \n b" },
  "collapse-spaces": { text: "a  b" },
  "base32-encode": { text: "f" },
  "base32-decode": { text: "MY======" },
  "json-to-csv": { text: '[{"a":1,"b":2}]' },
  "csv-to-tsv": { text: "a,b\n1,2" },
  "html-unescape": { text: "a&amp;b" },
  "xml-unescape": { text: "&lt;b&gt;" },
  "sql-quote": { text: "a'b" },
  "utf8-bytes": { text: "é" },
  "text-data-uri": { text: "hi" },
  "octal-encode": { text: "A" },
  "octal-decode": { text: "101" },
  "string-xor": { text: "abc", extra: "k" },
  "semver-major": { text: "1.2.3" },
  "port-check": { text: "443" },
  "ua-browser": { text: "Mozilla/5.0 Chrome/120.0" },
  "mime-to-ext": { text: "text/html" },
  "ext-to-mime": { text: "png" },
  "text-equal": { text: "a", extra: "a" },
  "random-id": { text: "8", extra: "freela" },
  "css-clamp": { text: "16 2vw 32" },
  "rem-to-px": { text: "1.5", extra: "16" },
  "json-types": { text: '{"a":1,"b":"x"}' },
  "unique-json-array": { text: "[1,1,2]" },
  "percent-change": { text: "100", extra: "150" },
  "percent-of": { text: "20", extra: "80" },
  "split-bill": { text: "90", extra: "3" },
  "margin-markup": { text: "25" },
  modulo: { text: "10", extra: "3" },
  "nth-power": { text: "2", extra: "8" },
  "square-root": { text: "9" },
  log10: { text: "1000" },
  "run-pace": { text: "30", extra: "5" },
  "work-hours": { text: "09:00", extra: "17:30" },
  "simple-inflation": { text: "100", extra: "3" },
  "loan-payment": { text: "10000", extra: "6,10" },
  "add-weeks": { text: "2026-01-01", extra: "2" },
  "seconds-hms": { text: "3661" },
  "hms-seconds": { text: "1:01:01" },
  "week-of-month": { text: "2026-09-28" },
  "unix-day": { text: "2026-01-01" },
  "hours-between": { text: "2026-01-01T00:00", extra: "2026-01-01T05:00" },
  "og-title-tags": { text: "Hello", extra: "https://freela.store/en" },
  "keyword-count": { text: "cat cat dog", extra: "cat" },
  "slug-ok": { text: "hello-world" },
  "robots-line": { text: "Allow", extra: "/private" },
  "image-sepia": { text: "" },
  "image-invert": { text: "" },
};

export const WAVE3_EXTRA_HINT: Record<string, string> = {
  "center-lines": "width in characters",
  "indent-lines": "spaces to add",
  "string-xor": "key",
  "text-equal": "second text",
  "random-id": "optional seed",
  "rem-to-px": "root px",
  "percent-change": "new value",
  "percent-of": "of this number",
  "split-bill": "people",
  modulo: "divisor",
  "nth-power": "exponent",
  "run-pace": "kilometers",
  "work-hours": "end time HH:MM",
  "simple-inflation": "percent",
  "loan-payment": "annual rate, years",
  "add-weeks": "weeks to add",
  "hours-between": "end date-time",
  "og-title-tags": "page URL",
  "keyword-count": "keyword",
  "robots-line": "path",
};

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(text: string) {
  const bytes = new TextEncoder().encode(need(text));
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  while (out.length % 8) out += "=";
  return out;
}

function base32Decode(text: string) {
  const clean = need(text).toUpperCase().replace(/=+$/g, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) throw new Error("Invalid base32.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function shuffleLines(text: string) {
  const lines = linesOf(text);
  const scored = lines.map((line, i) => {
    let h = 2166136261 ^ (i + 1);
    for (let c = 0; c < line.length; c++) h = Math.imul(h ^ line.charCodeAt(c), 16777619);
    return { line, h: h >>> 0 };
  });
  scored.sort((a, b) => a.h - b.h || a.line.localeCompare(b.line));
  return scored.map((row) => row.line).join("\n");
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
  css: "text/css",
  txt: "text/plain",
  svg: "image/svg+xml",
  xml: "application/xml",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  zip: "application/zip",
};

const EXT: Record<string, string> = Object.fromEntries(Object.entries(MIME).map(([ext, mime]) => [mime, ext]));

function clockToMin(value: string) {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) throw new Error("Use HH:MM.");
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 47 || min > 59) throw new Error("Invalid time.");
  return h * 60 + min;
}

export const IMAGE_WAVE3 = new Set(["image-sepia", "image-invert"]);

export function isWave3Tool(id: string) {
  return Object.prototype.hasOwnProperty.call(WAVE3_SAMPLES, id);
}

export function runWave3Sync(id: string, input: WaveInput): string {
  const text = input.text ?? "";
  const extra = input.extra ?? "";
  switch (id) {
    case "title-case":
      return need(text).replace(/\p{L}+/gu, (w) => w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase());
    case "sentence-case":
      return need(text).replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toLocaleUpperCase());
    case "swap-case":
      return [...need(text)].map((ch) => (ch === ch.toLocaleUpperCase() ? ch.toLocaleLowerCase() : ch.toLocaleUpperCase())).join("");
    case "shuffle-lines":
      return shuffleLines(text);
    case "unique-words":
      return [...new Set(need(text).split(/\s+/).filter(Boolean))].join("\n");
    case "extract-numbers": {
      const found = need(text).match(/-?\d+(?:[.,]\d+)?/g);
      if (!found) throw new Error("No numbers found.");
      return found.join("\n");
    }
    case "reading-time": {
      const words = need(text).split(/\s+/).filter(Boolean).length;
      return `${Math.max(1, Math.ceil(words / 200))} min`;
    }
    case "longest-line":
      return linesOf(text).slice().sort((a, b) => b.length - a.length || a.localeCompare(b))[0];
    case "strip-emoji":
      return need(text).replace(EMOJI, "").replace(/[ \t]{2,}/g, " ").trim();
    case "extract-emoji": {
      const found = need(text).match(EMOJI);
      if (!found?.length) throw new Error("No emoji found.");
      return found.join(" ");
    }
    case "strip-bom":
      return need(text).replace(/^\uFEFF/, "");
    case "center-lines": {
      const width = Math.min(120, Math.max(1, Math.round(num(extra || "40", "width"))));
      return linesOf(text)
        .map((line) => {
          if (line.length >= width) return line;
          const pad = width - line.length;
          return " ".repeat(Math.floor(pad / 2)) + line + " ".repeat(Math.ceil(pad / 2));
        })
        .join("\n");
    }
    case "indent-lines": {
      const n = Math.min(16, Math.max(0, Math.round(num(extra || "2", "spaces"))));
      return linesOf(text).map((line) => " ".repeat(n) + line).join("\n");
    }
    case "sort-numeric":
      return linesOf(text)
        .map((line) => ({ line, n: Number(line.trim()) }))
        .sort((a, b) => (Number.isFinite(a.n) && Number.isFinite(b.n) ? a.n - b.n : a.line.localeCompare(b.line)))
        .map((row) => row.line)
        .join("\n");
    case "reverse-each-line":
      return linesOf(text).map((line) => [...line].reverse().join("")).join("\n");
    case "char-codes":
      return [...need(text)].map((ch) => `${ch} U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`).join("\n");
    case "nfc-form":
      return need(text).normalize("NFC");
    case "speaking-pace": {
      const words = need(text).split(/\s+/).filter(Boolean).length;
      return `${Math.max(1, Math.ceil(words / 130))} min`;
    }
    case "unwrap-lines":
      return need(text)
        .replace(/\r\n/g, "\n")
        .split(/\n{2,}/)
        .map((p) => p.replace(/\n/g, " ").replace(/[ \t]{2,}/g, " ").trim())
        .join("\n\n");
    case "keep-letters":
      return [...need(text)].filter((ch) => /\p{L}/u.test(ch)).join("");
    case "line-lengths":
      return linesOf(text).map((line) => String([...line].length)).join("\n");
    case "duplicate-words": {
      const counts = new Map<string, number>();
      for (const w of need(text).toLocaleLowerCase().split(/\s+/).filter(Boolean)) counts.set(w, (counts.get(w) ?? 0) + 1);
      const dups = [...counts.entries()].filter(([, n]) => n > 1).map(([w, n]) => `${w}: ${n}`);
      if (!dups.length) throw new Error("No repeated words.");
      return dups.join("\n");
    }
    case "trim-each-line":
      return linesOf(text).map((line) => line.trim()).join("\n");
    case "collapse-spaces":
      return need(text).replace(/[ \t]{2,}/g, " ");
    case "base32-encode":
      return base32Encode(text);
    case "base32-decode":
      return base32Decode(text);
    case "json-to-csv": {
      const data = JSON.parse(need(text)) as unknown;
      if (!Array.isArray(data) || !data.length || typeof data[0] !== "object" || data[0] === null) {
        throw new Error("Paste a JSON array of objects.");
      }
      const keys = [...new Set(data.flatMap((row) => Object.keys(row as object)))];
      const cell = (value: unknown) => {
        const raw = value == null ? "" : String(value);
        return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
      };
      const body = data.map((row) => keys.map((key) => cell((row as Record<string, unknown>)[key])).join(","));
      return [keys.join(","), ...body].join("\n");
    }
    case "csv-to-tsv":
      return linesOf(text).map((line) => line.split(",").join("\t")).join("\n");
    case "html-unescape":
      return need(text)
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
    case "xml-unescape":
      return need(text)
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
    case "sql-quote":
      return `'${need(text).replace(/'/g, "''")}'`;
    case "utf8-bytes":
      return String(new TextEncoder().encode(need(text)).length);
    case "text-data-uri":
      return `data:text/plain;charset=utf-8,${encodeURIComponent(need(text))}`;
    case "octal-encode":
      return [...new TextEncoder().encode(need(text))].map((b) => b.toString(8).padStart(3, "0")).join(" ");
    case "octal-decode": {
      const bytes = need(text).split(/\s+/).map((part) => {
        if (!/^[0-7]{1,3}$/.test(part)) throw new Error("Use octal bytes.");
        return Number.parseInt(part, 8);
      });
      return new TextDecoder().decode(new Uint8Array(bytes));
    }
    case "string-xor": {
      const key = extra || "k";
      const src = new TextEncoder().encode(need(text));
      const k = new TextEncoder().encode(key);
      const out = src.map((b, i) => b ^ k[i % k.length]);
      return [...out].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    case "semver-major": {
      const m = need(text).match(/^v?(\d+)\.(\d+)\.(\d+)/);
      if (!m) throw new Error("Enter a version like 1.2.3.");
      return m[1];
    }
    case "port-check": {
      const n = Math.round(num(text, "port"));
      if (n < 1 || n > 65535) throw new Error("Ports run from 1 to 65535.");
      if (n < 1024) return `${n} system`;
      if (n < 49152) return `${n} registered`;
      return `${n} ephemeral`;
    }
    case "ua-browser": {
      const ua = need(text);
      const hit = ua.match(/Edg\/|OPR\/|Chrome\/|Firefox\/|Safari\/|Version\//);
      if (!hit) return "unknown";
      if (hit[0].startsWith("Edg")) return "Edge";
      if (hit[0].startsWith("OPR")) return "Opera";
      if (hit[0].startsWith("Chrome")) return "Chrome";
      if (hit[0].startsWith("Firefox")) return "Firefox";
      return "Safari";
    }
    case "mime-to-ext": {
      const ext = EXT[need(text).toLowerCase()];
      if (!ext) throw new Error("Unknown MIME type.");
      return ext;
    }
    case "ext-to-mime": {
      const mime = MIME[need(text).replace(/^\./, "").toLowerCase()];
      if (!mime) throw new Error("Unknown extension.");
      return mime;
    }
    case "text-equal":
      return need(text) === extra ? "equal" : "different";
    case "random-id": {
      const len = Math.min(64, Math.max(4, Math.round(num(text || "12", "length"))));
      const seed = extra || "freela";
      let h = 2166136261;
      const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
      let out = "";
      for (let i = 0; i < len; i++) {
        h ^= seed.charCodeAt(i % seed.length) + i;
        h = Math.imul(h, 16777619);
        out += alphabet[(h >>> 0) % alphabet.length];
      }
      return out;
    }
    case "css-clamp": {
      const parts = need(text).split(/\s+/);
      if (parts.length !== 3) throw new Error("Use min preferred max, for example 16px 2vw 32px.");
      const unit = (part: string) => (/^-?\d+(?:\.\d+)?$/.test(part) ? `${part}px` : part);
      return `clamp(${unit(parts[0])}, ${parts[1]}, ${unit(parts[2])})`;
    }
    case "rem-to-px":
      return String(num(text, "rem") * num(extra || "16", "root px"));
    case "json-types": {
      const data = JSON.parse(need(text)) as unknown;
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Paste a JSON object.");
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value === null ? "null" : Array.isArray(value) ? "array" : typeof value}`)
        .join("\n");
    }
    case "unique-json-array": {
      const data = JSON.parse(need(text)) as unknown;
      if (!Array.isArray(data)) throw new Error("Paste a JSON array.");
      const seen = new Set<string>();
      const out = [];
      for (const item of data) {
        const key = JSON.stringify(item);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(item);
      }
      return JSON.stringify(out);
    }
    case "percent-change": {
      const from = num(text, "start");
      const to = num(extra, "new value");
      if (from === 0) throw new Error("Start value cannot be 0.");
      return `${((to - from) / from) * 100}%`;
    }
    case "percent-of":
      return String((num(text, "percent") / 100) * num(extra, "base"));
    case "split-bill": {
      const people = num(extra, "people");
      if (people <= 0) throw new Error("People must be greater than 0.");
      return String(num(text, "total") / people);
    }
    case "margin-markup": {
      const margin = num(text, "margin percent") / 100;
      if (margin >= 1) throw new Error("Margin must be under 100%.");
      return `${(margin / (1 - margin)) * 100}%`;
    }
    case "modulo": {
      const d = num(extra, "divisor");
      if (d === 0) throw new Error("Divisor cannot be 0.");
      return String(num(text) % d);
    }
    case "nth-power":
      return String(num(text, "base") ** num(extra, "exponent"));
    case "square-root": {
      const n = num(text);
      if (n < 0) throw new Error("Enter a number that is zero or greater.");
      return String(Math.sqrt(n));
    }
    case "log10": {
      const n = num(text);
      if (n <= 0) throw new Error("Enter a number greater than 0.");
      return String(Math.log10(n));
    }
    case "run-pace": {
      const km = num(extra, "kilometers");
      if (km <= 0) throw new Error("Distance must be greater than 0.");
      return `${num(text, "minutes") / km} min/km`;
    }
    case "work-hours": {
      const mins = clockToMin(extra) - clockToMin(need(text));
      if (mins < 0) throw new Error("End time is before the start.");
      return String(mins / 60);
    }
    case "simple-inflation":
      return String(num(text, "amount") * (1 + num(extra, "percent") / 100));
    case "loan-payment": {
      const principal = num(text, "principal");
      const [rateRaw, yearsRaw] = extra.split(/[, ]+/);
      const annual = num(rateRaw ?? "", "rate") / 100;
      const years = num(yearsRaw ?? "", "years");
      const months = years * 12;
      const r = annual / 12;
      if (months <= 0) throw new Error("Years must be greater than 0.");
      const pay = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
      return String(Math.round(pay * 100) / 100);
    }
    case "add-weeks": {
      const date = new Date(`${need(text).slice(0, 10)}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) throw new Error("Use YYYY-MM-DD.");
      date.setUTCDate(date.getUTCDate() + Math.round(num(extra || "1", "weeks")) * 7);
      return date.toISOString().slice(0, 10);
    }
    case "seconds-hms": {
      let s = Math.round(num(text, "seconds"));
      if (s < 0) throw new Error("Seconds cannot be negative.");
      const h = Math.floor(s / 3600);
      s %= 3600;
      const m = Math.floor(s / 60);
      s %= 60;
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    case "hms-seconds": {
      const m = need(text).match(/^(\d+):(\d{2}):(\d{2})$/);
      if (!m) throw new Error("Use H:MM:SS.");
      return String(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
    }
    case "week-of-month": {
      const date = new Date(`${need(text).slice(0, 10)}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) throw new Error("Use YYYY-MM-DD.");
      return String(Math.ceil(date.getUTCDate() / 7));
    }
    case "unix-day": {
      const date = new Date(`${need(text).slice(0, 10)}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) throw new Error("Use YYYY-MM-DD.");
      return String(Math.floor(date.getTime() / 86400000));
    }
    case "hours-between": {
      const a = new Date(need(text));
      const b = new Date(extra);
      if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) throw new Error("Use ISO date-times.");
      return String((b.getTime() - a.getTime()) / 3600000);
    }
    case "og-title-tags": {
      const title = need(text).replace(/"/g, "&quot;");
      const url = (extra || "https://freela.store").replace(/"/g, "");
      return `<meta property="og:title" content="${title}">\n<meta property="og:url" content="${url}">`;
    }
    case "keyword-count": {
      const key = extra.trim().toLocaleLowerCase();
      if (!key) throw new Error("Enter a keyword.");
      const words = need(text).toLocaleLowerCase().split(/\s+/);
      return String(words.filter((w) => w === key).length);
    }
    case "slug-ok":
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(need(text)) ? "ok" : "no";
    case "robots-line": {
      const rule = need(text);
      if (!/^(Allow|Disallow)$/i.test(rule)) throw new Error("Use Allow or Disallow.");
      const path = extra.trim() || "/";
      return `${rule[0].toUpperCase()}${rule.slice(1).toLowerCase()}: ${path.startsWith("/") ? path : `/${path}`}`;
    }
    default:
      throw new Error(`Unknown wave3 tool ${id}`);
  }
}

export async function runWave3Image(id: string, file: File) {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    throw new Error("Image encoding uses the browser canvas; covered by Playwright.");
  }
  const bmp = await createImageBitmap(file);
  const width = bmp.width;
  const height = bmp.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(bmp, 0, 0);
  const frame = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < frame.data.length; i += 4) {
    const r = frame.data[i];
    const g = frame.data[i + 1];
    const b = frame.data[i + 2];
    if (id === "image-invert") {
      frame.data[i] = 255 - r;
      frame.data[i + 1] = 255 - g;
      frame.data[i + 2] = 255 - b;
    } else {
      frame.data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      frame.data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      frame.data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  }
  ctx.putImageData(frame, 0, 0);
  bmp.close?.();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((out) => (out ? resolve(out) : reject(new Error("Could not encode PNG."))), "image/png");
  });
  return { text: `${width}×${height} px PNG`, blob, filename: id === "image-invert" ? "invert.png" : "sepia.png" };
}

export async function runWave3Async(id: string, input: WaveInput): Promise<string> {
  if (IMAGE_WAVE3.has(id)) throw new Error("Image encoding uses the browser canvas; covered by Playwright.");
  return runWave3Sync(id, input);
}

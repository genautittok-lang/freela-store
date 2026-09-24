export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

export function csvToJson(text: string) {
  const rows = parseCsv(text);
  if (rows.length === 0) return "[]";
  const [header, ...body] = rows;
  const objects = body.map((line) => {
    const obj: Record<string, string | number> = {};
    header.forEach((key, i) => {
      const raw = line[i] ?? "";
      obj[key] = raw !== "" && !Number.isNaN(Number(raw)) && raw.trim() !== "" ? Number(raw) : raw;
    });
    return obj;
  });
  return JSON.stringify(objects, null, 2);
}

export function jsonToCsv(text: string) {
  const data = JSON.parse(text) as unknown;
  if (!Array.isArray(data)) throw new Error("JSON must be an array of objects.");
  const keys = Array.from(
    data.reduce((set: Set<string>, row) => {
      if (row && typeof row === "object") Object.keys(row as object).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const escape = (value: unknown) => {
    const s = value == null ? "" : String(value);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [keys.join(",")];
  for (const row of data) {
    const rec = (row ?? {}) as Record<string, unknown>;
    lines.push(keys.map((key) => escape(rec[key])).join(","));
  }
  return lines.join("\n");
}

export function formatJson(text: string, minify = false) {
  const parsed = JSON.parse(text) as unknown;
  return minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
}

export function encodeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function decodeHtml(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function decodeJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A compact JWT has three segments.");
  const decode = (segment: string) => {
    const b64 = segment.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((segment.length % 4) || 4);
    const json = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json) as unknown;
  };
  return {
    header: decode(parts[0]),
    payload: decode(parts[1]),
    signature: parts[2],
  };
}

export function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function utf8ToBase64(text: string) {
  return bytesToBase64(new TextEncoder().encode(text));
}

export function base64ToUtf8(text: string) {
  const normalized = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

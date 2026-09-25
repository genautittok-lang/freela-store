export function prettyXml(input: string) {
  const compact = input.replace(/>\s+</g, "><").trim();
  if (!compact.startsWith("<")) throw new Error("Not XML/HTML markup.");
  let pad = 0;
  return compact
    .replace(/></g, ">\n<")
    .split("\n")
    .map((line) => {
      if (/^<\//.test(line)) pad = Math.max(pad - 1, 0);
      const out = `${"  ".repeat(pad)}${line}`;
      if (/^<[^!?/][^>]*[^/]>$/.test(line) && !/^<.*<\/.*>$/.test(line)) pad += 1;
      return out;
    })
    .join("\n");
}

export function simpleYamlToJson(text: string) {
  const obj: Record<string, string | number | boolean> = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx < 1) throw new Error("Use simple key: value YAML. Nested YAML is not supported.");
    const key = line.slice(0, idx).trim();
    let value: string | number | boolean = line.slice(idx + 1).trim();
    if (value === "true" || value === "false") value = value === "true";
    else if (value !== "" && !Number.isNaN(Number(value))) value = Number(value);
    else value = String(value).replace(/^["']|["']$/g, "");
    obj[key] = value;
  }
  return JSON.stringify(obj, null, 2);
}

export function parseUrl(raw: string) {
  const url = new URL(raw);
  return {
    href: url.href,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
  };
}

export function parseQuery(raw: string) {
  const q = raw.startsWith("?") ? raw.slice(1) : raw.includes("?") ? raw.split("?")[1] : raw;
  return Object.fromEntries(new URLSearchParams(q));
}

export function invoiceMath(qty: number, unit: number, taxRate: number) {
  if (qty < 0 || unit < 0 || taxRate < 0) throw new Error("Values must be zero or positive.");
  const net = qty * unit;
  const tax = net * (taxRate / 100);
  return { net, tax, gross: net + tax };
}

export function icsEvent(summary: string, startIso: string, endIso: string) {
  if (!summary.trim()) throw new Error("Add a title.");
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d+/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Freela//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}@freela.store`}`,
    `DTSTAMP:${stamp(new Date().toISOString())}Z`,
    `DTSTART:${stamp(startIso)}`,
    `DTEND:${stamp(endIso)}`,
    `SUMMARY:${summary.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function linearGradient(from: string, to: string, angle = 90) {
  return `background: linear-gradient(${angle}deg, ${from}, ${to});`;
}

export function canonicalTag(url: string) {
  const href = new URL(url).href;
  return `<link rel="canonical" href="${href}" />`;
}

export function sitemapXml(urls: string[]) {
  const body = urls
    .map((u) => new URL(u).href)
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export function schemaJsonLd(type: string, name: string, description: string, url: string) {
  if (type.toLowerCase().includes("review") || type.toLowerCase().includes("aggregate")) {
    throw new Error("Review markup is omitted unless you have real reviews.");
  }
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": type || "WebPage",
      name,
      description,
      url,
    },
    null,
    2,
  );
}

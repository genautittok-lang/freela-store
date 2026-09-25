export function tipSplit(bill: number, percent: number, people: number) {
  if (!(bill >= 0) || !(percent >= 0) || people < 1) throw new Error("Enter a bill, tip percent, and at least one person.");
  const tip = bill * (percent / 100);
  const total = bill + tip;
  return { tip, total, perPerson: total / people };
}

export function amortize(principal: number, annualPct: number, years: number) {
  if (principal <= 0 || years <= 0) throw new Error("Principal and years must be positive.");
  if (annualPct < 0) throw new Error("Rate cannot be negative.");
  const n = years * 12;
  const r = annualPct / 100 / 12;
  const payment = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const total = payment * n;
  return { payment, total, interest: total - principal, months: n };
}

export function compound(principal: number, annualPct: number, years: number, perYear: number) {
  if (principal < 0 || years < 0 || perYear < 1) throw new Error("Check principal, years, and compounds per year.");
  const r = annualPct / 100;
  const amount = principal * (1 + r / perYear) ** (perYear * years);
  return { amount, interest: amount - principal };
}

export function salaryFrom(amount: number, hoursPerWeek: number, source: "hourly" | "monthly") {
  if (amount < 0 || hoursPerWeek <= 0) throw new Error("Amount and hours per week must be valid.");
  const yearly = source === "hourly" ? amount * hoursPerWeek * 52 : amount * 12;
  return {
    hourly: yearly / (hoursPerWeek * 52),
    monthly: yearly / 12,
    yearly,
  };
}

export function fuelCost(distanceKm: number, litersPer100: number, price: number) {
  if (distanceKm < 0 || litersPer100 < 0 || price < 0) throw new Error("Distance, consumption and price must be zero or more.");
  const liters = (distanceKm / 100) * litersPer100;
  return { liters, cost: liters * price };
}

export function ageOn(birthIso: string, onIso?: string) {
  const start = new Date(`${birthIso}T00:00:00`);
  const end = onIso ? new Date(`${onIso}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Enter a valid birth date.");
  if (end < start) throw new Error("The end date is before the birth date.");
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  return { years, months, days, totalDays };
}

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

export function loremParagraphs(count: number) {
  const n = Math.min(12, Math.max(1, Math.floor(count)));
  return Array.from({ length: n }, () => LOREM).join("\n\n");
}

export function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function csvOrHtmlToMarkdown(input: string) {
  const trimmed = input.trim();
  if (trimmed.includes("<table")) {
    const rows = [...trimmed.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((row) =>
      [...row[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => stripTags(c[1]).replace(/\|/g, "\\|")),
    );
    if (rows.length < 1 || rows[0].length < 1) throw new Error("No table rows found.");
    const head = rows[0];
    const sep = head.map(() => "---");
    const body = rows.slice(1);
    return [`| ${head.join(" | ")} |`, `| ${sep.join(" | ")} |`, ...body.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  }
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 1) throw new Error("Paste a CSV or an HTML table.");
  const cells = lines.map((l) => l.split(",").map((c) => c.trim().replace(/\|/g, "\\|")));
  const width = Math.max(...cells.map((c) => c.length));
  const norm = cells.map((c) => [...c, ...Array(width - c.length).fill("")]);
  const head = norm[0];
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...norm.slice(1).map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

export const SOCIAL_LIMITS: { id: string; label: string; limit: number }[] = [
  { id: "x", label: "X / Twitter", limit: 280 },
  { id: "threads", label: "Threads", limit: 500 },
  { id: "instagram", label: "Instagram caption", limit: 2200 },
  { id: "linkedin", label: "LinkedIn", limit: 3000 },
  { id: "youtube", label: "YouTube title", limit: 100 },
  { id: "tiktok", label: "TikTok caption", limit: 2200 },
];

export function socialCounts(text: string) {
  const n = [...text].length;
  return SOCIAL_LIMITS.map((row) => ({
    ...row,
    used: n,
    left: row.limit - n,
    over: n > row.limit,
  }));
}

export function cronFrom(min: string, hour: string, day: string, month: string, weekday: string) {
  const expr = [min, hour, day, month, weekday].join(" ");
  if (!/^[\d*,/\- ]+$/.test(expr)) throw new Error("Use numbers, *, commas or dashes in cron fields.");
  return expr;
}

export function wrapPdfText(text: string, width = 90) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) {
      if (line) lines.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 2000);
}

export type DetectedKind = "image" | "pdf" | "csv" | "json" | "xlsx" | "markdown" | "html" | "yaml" | "docx" | "heic" | "video" | "unknown";

export function detectKind(file: File): DetectedKind {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif") || type.includes("heic") || type.includes("heif")) return "heic";
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/.test(name)) return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".csv") || type.includes("csv")) return "csv";
  if (name.endsWith(".json") || type.includes("json")) return "json";
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || type.includes("spreadsheet")) return "xlsx";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";
  if (name.endsWith(".html") || name.endsWith(".htm") || type.includes("html")) return "html";
  if (name.endsWith(".yaml") || name.endsWith(".yml")) return "yaml";
  if (name.endsWith(".docx")) return "docx";
  if (type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/.test(name)) return "video";
  return "unknown";
}

export type Target = { id: string; label: string };

export function targetsFor(kind: DetectedKind): Target[] {
  switch (kind) {
    case "image":
      return [
        { id: "jpg", label: "JPG" },
        { id: "png", label: "PNG" },
        { id: "webp", label: "WebP" },
        { id: "avif", label: "AVIF" },
        { id: "pdf", label: "PDF" },
        { id: "ico", label: "ICO" },
      ];
    case "heic":
      return [{ id: "jpg", label: "JPG" }, { id: "png", label: "PNG" }];
    case "pdf":
      return [{ id: "jpg", label: "JPG" }, { id: "png", label: "PNG" }];
    case "csv":
      return [{ id: "json", label: "JSON" }, { id: "xlsx", label: "XLSX" }, { id: "md", label: "Markdown" }];
    case "json":
      return [{ id: "csv", label: "CSV" }];
    case "xlsx":
      return [{ id: "csv", label: "CSV" }];
    case "markdown":
      return [{ id: "html", label: "HTML" }];
    case "html":
      return [{ id: "text", label: "Text" }];
    case "yaml":
      return [{ id: "json", label: "JSON" }];
    case "docx":
      return [{ id: "pdf", label: "PDF (text)" }];
    case "video":
      return [];
    default:
      return [];
  }
}

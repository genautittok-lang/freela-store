import { wrapPdfText } from "@/lib/tools/pack";

export function markdownToPlain(input: string) {
  const text = input
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
  if (!text) throw new Error("Paste some markdown or plain text first.");
  return text;
}

export function randomIntegers(min: number, max: number, count: number) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  const n = Math.min(100, Math.max(1, Math.floor(count)));
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) {
    throw new Error("Enter a minimum that is not greater than the maximum.");
  }
  const span = hi - lo + 1;
  const buf = new Uint32Array(n);
  crypto.getRandomValues(buf);
  return [...buf].map((v) => lo + (v % span));
}

export function buildUtm(rawUrl: string, source: string, medium: string, campaign: string, term = "", content = "") {
  const trimmed = rawUrl.trim();
  if (!trimmed) throw new Error("Enter a destination URL.");
  const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  if (source.trim()) url.searchParams.set("utm_source", source.trim());
  if (medium.trim()) url.searchParams.set("utm_medium", medium.trim());
  if (campaign.trim()) url.searchParams.set("utm_campaign", campaign.trim());
  if (term.trim()) url.searchParams.set("utm_term", term.trim());
  if (content.trim()) url.searchParams.set("utm_content", content.trim());
  if (!url.searchParams.has("utm_source") || !url.searchParams.has("utm_medium") || !url.searchParams.has("utm_campaign")) {
    throw new Error("Source, medium and campaign are required.");
  }
  return url.toString();
}

export async function linesToPdfBytes(text: string) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const lines = wrapPdfText(text, 92);
  if (!lines.length) throw new Error("Nothing to put on the PDF.");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pageSize: [number, number] = [595.28, 841.89];
  let page = pdf.addPage(pageSize);
  let y = 800;
  for (const line of lines) {
    if (y < 48) {
      page = pdf.addPage(pageSize);
      y = 800;
    }
    page.drawText(line.slice(0, 120), { x: 48, y, size: 11, font, color: rgb(0.1, 0.1, 0.12) });
    y -= 14;
  }
  return pdf.save();
}

export function parsePageList(spec: string, total: number) {
  const wanted = new Set<number>();
  for (const part of spec.split(",")) {
    const piece = part.trim();
    if (!piece) continue;
    if (piece.includes("-")) {
      const [a, b] = piece.split("-").map((n) => Number(n.trim()));
      if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error("Use page numbers like 2 or 2-4.");
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      for (let i = from; i <= to; i++) wanted.add(i);
    } else {
      const n = Number(piece);
      if (!Number.isInteger(n)) throw new Error("Use page numbers like 2 or 2-4.");
      wanted.add(n);
    }
  }
  if (!wanted.size) throw new Error("List the pages to delete.");
  for (const n of wanted) {
    if (n < 1 || n > total) throw new Error(`Page ${n} is outside 1–${total}.`);
  }
  return wanted;
}

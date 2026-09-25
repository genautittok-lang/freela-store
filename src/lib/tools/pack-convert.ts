import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { csvToJson, jsonToCsv } from "@/lib/tools/dev";
import { simpleYamlToJson } from "@/lib/tools/web";
import { buildIco } from "@/lib/tools/ico";
import {
  csvOrHtmlToMarkdown,
  detectKind,
  stripTags,
  targetsFor,
  wrapPdfText,
  type DetectedKind,
} from "@/lib/tools/pack";

export function loadPdfJs() {
  return import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    return pdfjs;
  });
}

export async function rasterizePdf(file: File, mime: "image/jpeg" | "image/png", onProgress?: (p: number) => void) {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const blobs: { blob: Blob; name: string }[] = [];
  const ext = mime === "image/jpeg" ? "jpg" : "png";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode the page image."))), mime, 0.88);
    });
    blobs.push({ blob, name: `${file.name.replace(/\.pdf$/i, "")}-p${i}.${ext}` });
    onProgress?.(i / doc.numPages);
  }
  if (!blobs.length) throw new Error("No pages to rasterize.");
  return blobs;
}

export async function stampPdf(
  file: File,
  mode: "watermark" | "pages",
  text = "FREELA",
) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    if (mode === "watermark") {
      page.drawText(text.slice(0, 48) || "FREELA", {
        x: width / 4,
        y: height / 2,
        size: Math.min(48, width / 8),
        font,
        color: rgb(0.55, 0.55, 0.55),
        rotate: degrees(-24),
        opacity: 0.28,
      });
    } else {
      const label = `${i + 1} / ${pages.length}`;
      page.drawText(label, {
        x: width / 2 - font.widthOfTextAtSize(label, 10) / 2,
        y: 18,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
  });
  const bytes = await doc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function docxToTextPdf(file: File) {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const text = value.trim();
  if (!text) throw new Error("This DOCX had no extractable text. Layout, images and tracked changes are not converted.");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pageSize: [number, number] = [595.28, 841.89];
  let page = pdf.addPage(pageSize);
  let y = 800;
  const lines = wrapPdfText(text, 92);
  for (const line of lines) {
    if (y < 48) {
      page = pdf.addPage(pageSize);
      y = 800;
    }
    page.drawText(line.slice(0, 120), { x: 48, y, size: 11, font, color: rgb(0.1, 0.1, 0.12) });
    y -= 14;
  }
  const bytes = await pdf.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function heicToBlob(file: File, toType: "image/jpeg" | "image/png") {
  const name = file.name.toLowerCase();
  const isHeic = name.endsWith(".heic") || name.endsWith(".heif") || (file.type || "").includes("heic");
  if (!isHeic) {
    return canvasRecode(file, toType);
  }
  const heic2any = (await import("heic2any")).default;
  const out = await heic2any({ blob: file, toType, quality: 0.9 });
  const blob = Array.isArray(out) ? out[0] : out;
  if (!blob) throw new Error("HEIC conversion returned nothing. Try another photo.");
  return blob;
}

export async function canvasRecode(file: File, mime: string, quality = 0.9) {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error(`This browser could not encode ${mime}. Try PNG or JPG.`);
  return blob;
}

export function fileToImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode this image in the browser."));
    };
    img.src = url;
  });
}

export async function imageToPdf(file: File) {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(img, 0, 0);
  const png = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed."))), "image/png");
  });
  const pdf = await PDFDocument.create();
  const embedded = await pdf.embedPng(await png.arrayBuffer());
  const page = pdf.addPage([embedded.width, embedded.height]);
  page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  const bytes = await pdf.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function pngToIco(file: File) {
  const img = await fileToImage(file);
  const sizes = [16, 32, 48];
  const frames: Uint8Array[] = [];
  for (const size of sizes) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");
    const scale = Math.min(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG frame failed."))), "image/png");
    });
    frames.push(new Uint8Array(await blob.arrayBuffer()));
  }
  const ico = buildIco(frames);
  return new Blob([ico.buffer as ArrayBuffer], { type: "image/x-icon" });
}

export async function overlayText(file: File, text: string) {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(img, 0, 0);
  const size = Math.max(18, Math.round(img.width / 18));
  ctx.font = `bold ${size}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = Math.max(2, size / 14);
  const x = img.width * 0.06;
  const y = img.height * 0.92;
  ctx.strokeText(text.slice(0, 80), x, y);
  ctx.fillText(text.slice(0, 80), x, y);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed."))), "image/png");
  });
  return blob;
}

export async function blurImage(file: File, px: number, mode: "blur" | "pixelate" = "blur") {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  if (mode === "pixelate") {
    const block = Math.min(48, Math.max(4, px));
    const w = Math.max(1, Math.round(img.width / block));
    const h = Math.max(1, Math.round(img.height / block));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, img.width, img.height);
  } else {
    const radius = Math.min(48, Math.max(2, px));
    ctx.filter = `blur(${radius}px)`;
    ctx.drawImage(img, 0, 0);
  }
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed."))), "image/png");
  });
  return blob;
}

export async function xlsxToCsv(file: File) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("The workbook has no sheets.");
  return XLSX.utils.sheet_to_csv(sheet);
}

export async function csvToXlsx(text: string, name = "table.xlsx") {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(text.split(/\r?\n/).map((row) => row.split(",")));
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
  return { blob: new Blob([out.buffer as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), name };
}

export async function markdownToHtml(text: string) {
  const { marked } = await import("marked");
  return String(await marked.parse(text, { async: false }));
}

export async function formatSql(text: string) {
  const { format } = await import("sql-formatter");
  return format(text, { language: "sql" });
}

export async function convertDetected(file: File, target: string, onProgress?: (p: number) => void) {
  const kind: DetectedKind = detectKind(file);
  const allowed = targetsFor(kind).map((t) => t.id);
  if (!allowed.includes(target)) throw new Error("That output is not available for this file type.");
  onProgress?.(0.15);
  const stem = file.name.replace(/\.[^.]+$/, "") || "converted";
  if (kind === "image") {
    if (target === "pdf") return { blob: await imageToPdf(file), name: `${stem}.pdf` };
    if (target === "ico") return { blob: await pngToIco(file), name: `${stem}.ico` };
    const mime = target === "jpg" ? "image/jpeg" : target === "png" ? "image/png" : target === "webp" ? "image/webp" : "image/avif";
    const blob = await canvasRecode(file, mime);
    onProgress?.(1);
    return { blob, name: `${stem}.${target}` };
  }
  if (kind === "heic") {
    const blob = await heicToBlob(file, target === "png" ? "image/png" : "image/jpeg");
    onProgress?.(1);
    return { blob, name: `${stem}.${target === "png" ? "png" : "jpg"}` };
  }
  if (kind === "pdf") {
    const pages = await rasterizePdf(file, target === "png" ? "image/png" : "image/jpeg", onProgress);
    return pages[0];
  }
  if (kind === "csv") {
    const text = await file.text();
    if (target === "json") return { blob: new Blob([csvToJson(text)], { type: "application/json" }), name: `${stem}.json` };
    if (target === "md") return { blob: new Blob([csvOrHtmlToMarkdown(text)], { type: "text/markdown" }), name: `${stem}.md` };
    return csvToXlsx(text, `${stem}.xlsx`);
  }
  if (kind === "json") {
    return { blob: new Blob([jsonToCsv(await file.text())], { type: "text/csv" }), name: `${stem}.csv` };
  }
  if (kind === "xlsx") {
    const csv = await xlsxToCsv(file);
    onProgress?.(1);
    return { blob: new Blob([csv], { type: "text/csv" }), name: `${stem}.csv` };
  }
  if (kind === "markdown") {
    const html = await markdownToHtml(await file.text());
    return { blob: new Blob([html], { type: "text/html" }), name: `${stem}.html` };
  }
  if (kind === "html") {
    return { blob: new Blob([stripTags(await file.text())], { type: "text/plain" }), name: `${stem}.txt` };
  }
  if (kind === "yaml") {
    return { blob: new Blob([simpleYamlToJson(await file.text())], { type: "application/json" }), name: `${stem}.json` };
  }
  if (kind === "docx") {
    const blob = await docxToTextPdf(file);
    onProgress?.(1);
    return { blob, name: `${stem}.pdf` };
  }
  throw new Error("No client-side conversion for this type.");
}

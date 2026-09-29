import { toolById, publishedTools } from "@/lib/registry";
import type { ToolDefinition } from "@/data/schema";

export type FileKind = "pdf" | "image" | "video" | "audio" | "archive" | "office" | "data" | "text" | "unknown";

const VIDEO_EXT = new Set(["mp4", "webm", "mov", "mkv", "avi", "flv", "wmv", "m4v", "mpeg", "mpg"]);
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "aac", "m4a", "flac", "wma"]);
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "heif", "bmp", "svg", "ico"]);
const ARCHIVE_EXT = new Set(["zip", "rar", "7z", "tar", "gz"]);
const OFFICE_EXT = new Set(["docx", "doc", "xlsx", "xls", "pptx", "odt"]);
const DATA_EXT = new Set(["csv", "json", "xml", "yaml", "yml", "tsv"]);
const TEXT_EXT = new Set(["txt", "md", "html", "htm", "css", "js", "ts"]);

export function extOfName(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] || "";
}

export function detectFileKind(file: File): FileKind {
  const ext = extOfName(file.name);
  const mime = (file.type || "").toLowerCase();
  if (mime.includes("pdf") || ext === "pdf") return "pdf";
  if (mime.startsWith("video/") || VIDEO_EXT.has(ext)) return "video";
  if (mime.startsWith("audio/") || AUDIO_EXT.has(ext)) return "audio";
  if (mime.startsWith("image/") || IMAGE_EXT.has(ext)) return "image";
  if (ARCHIVE_EXT.has(ext)) return "archive";
  if (OFFICE_EXT.has(ext) || mime.includes("spreadsheet") || mime.includes("wordprocessing")) return "office";
  if (DATA_EXT.has(ext) || mime.includes("json") || mime.includes("csv")) return "data";
  if (TEXT_EXT.has(ext) || mime.startsWith("text/")) return "text";
  return "unknown";
}

const SUGGESTIONS: Record<FileKind, string[]> = {
  pdf: ["merge-pdf", "compress-pdf", "pdf-to-image", "pdf-password", "pdf-signature", "extract-pdf-text"],
  image: [
    "convert-image",
    "compress-image",
    "resize-image",
    "background-remover",
    "image-upscaler",
    "heic-to-jpg",
    "images-to-pdf",
  ],
  video: ["video-to-mp4", "video-to-webm", "video-to-mp3", "compress-video", "trim-video", "resize-video", "video-to-gif", "video-file-info"],
  audio: ["audio-converter", "video-to-mp3"],
  archive: ["universal-converter"],
  office: ["docx-to-pdf", "xlsx-csv", "word-html-cleaner"],
  data: ["csv-json", "json-to-csv", "xlsx-csv", "yaml-json"],
  text: ["strip-html", "word-html-cleaner", "markdown-html", "clipboard-list-helper"],
  unknown: ["universal-converter", "hash-generator"],
};

export function suggestToolsForFile(file: File, limit = 6): ToolDefinition[] {
  const kind = detectFileKind(file);
  const ids = SUGGESTIONS[kind] ?? SUGGESTIONS.unknown;
  const out: ToolDefinition[] = [];
  for (const id of ids) {
    const tool = toolById(id);
    if (tool && tool.status === "published") out.push(tool);
    if (out.length >= limit) break;
  }
  if (out.length < 2) {
    for (const tool of publishedTools()) {
      if (out.some((t) => t.id === tool.id)) continue;
      out.push(tool);
      if (out.length >= limit) break;
    }
  }
  return out;
}

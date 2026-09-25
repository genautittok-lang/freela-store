import type { ToolDefinition } from "@/data/schema";
import { isLocale } from "@/data/locales";
import { ACTION_LABEL_EN, ACTION_LABELS } from "@/lib/action-labels";

export { ACTION_LABEL_EN };

export type InputKind =
  | "file"
  | "text"
  | "number"
  | "url"
  | "color"
  | "date"
  | "structured"
  | "none"
  | "mixed";

export type OutputKind = "file" | "text" | "number" | "preview" | "code" | "url" | "multiple";

export type UxFamily =
  | "pdf"
  | "image"
  | "text"
  | "developer"
  | "calculator"
  | "converter"
  | "color"
  | "datetime"
  | "seo"
  | "generator"
  | "qr";

export type ToolUx = {
  toolId: string;
  slug: string;
  family: UxFamily;
  inputType: InputKind;
  outputType: OutputKind;
  actionLabel: string;
  options: string[];
  privacyMode: ToolDefinition["processingMode"];
  hasExample: boolean;
  hasErrorState: true;
  hasSuccessState: true;
};

const FAMILY: Record<ToolDefinition["runtime"]["kind"], UxFamily> = {
  pdf: "pdf",
  image: "image",
  "text-stats": "text",
  "text-transform": "text",
  "json-format": "developer",
  codec: "developer",
  regex: "developer",
  jwt: "developer",
  hash: "developer",
  calculator: "calculator",
  converter: "converter",
  color: "color",
  datetime: "datetime",
  seo: "seo",
  generator: "generator",
  qr: "qr",
  pack: "converter",
  wave: "text",
};

const OPTIONS: Record<string, string[]> = {
  "rotate-pdf": ["angle: 90 (default), 180, 270"],
  "split-pdf": ["pages: 1-1 (default) or all"],
  "extract-pdf-pages": ["pages: 1-1 (default)"],
  "compress-image": ["quality: 0.8 default"],
  "resize-image": ["width: 800 default"],
  "crop-image": ["x,y,w,h: 0,0,256,256 default"],
  "case-converter": ["upper, lower, title, sentence, invert"],
  "remove-duplicate-lines": ["sensitive | insensitive"],
  "sort-lines": ["asc | desc | numeric"],
  "whitespace-cleaner": ["keep | drop empty lines"],
  "json-formatter": ["pretty | min"],
  "csv-json": ["to json | to csv"],
  base64: ["encode | decode"],
  "url-codec": ["encode | decode"],
  "html-entities": ["encode | decode"],
  "hash-generator": ["SHA-1, SHA-256 (default), SHA-384, SHA-512"],
  "regex-tester": ["pattern, flags (g default)"],
  percentage: ["X% of Y | X is what % of Y | percent change"],
  "vat-calculator": ["net | gross, rate in Value B"],
  "invoice-math": ["qty, unit price, tax %"],
  "data-size": ["SI 1000 | IEC 1024"],
  "password-generator": ["count, length"],
  "uuid-generator": ["count"],
  "random-string": ["count, length"],
  "qr-generator": ["content text"],
  "pdf-to-image": ["output: JPG or PNG"],
  "heic-to-jpg": ["output: JPG or PNG"],
  "pdf-watermark": ["text stamp"],
  "convert-image": ["output: JPG, PNG, WebP, AVIF when the browser encodes it"],
  "universal-converter": ["targets depend on detected type"],
  "image-blur": ["radius px"],
  "cron-generator": ["five UNIX fields"],
  "barcode-generator": ["EAN-13 or Code 128"],
  "text-to-pdf": ["pasted text, A4 Helvetica"],
  "markdown-to-pdf": ["markdown stripped to text PDF"],
  "extract-pdf-text": ["PDF text layer only, no OCR"],
  "delete-pdf-pages": ["pages: 1 or 2-4"],
  "rotate-image": ["angle: 90 (default), 180, 270"],
  "flip-image": ["horizontal | vertical"],
  "utm-builder": ["url, source, medium, campaign"],
  "random-number": ["min, max, count"],
  "prefix-suffix": ["prefix,suffix"],
  "wrap-text": ["width characters"],
  "caesar-shift": ["shift integer"],
  "find-replace": ["find / replace lines"],
  "repeat-text": ["repeat count"],
  "truncate-text": ["max length"],
  levenshtein: ["second string"],
  "keyword-density": ["phrase"],
  "robots-path-test": ["path to test"],
  "add-days": ["days to add"],
  "business-days": ["end date"],
  "mix-hex": ["second hex"],
};

function inputKind(tool: ToolDefinition): InputKind {
  const [raw] = tool.inputTypes;
  if (raw === "file") return "file";
  if (raw === "none") return "none";
  if (raw === "number") return "number";
  if (raw === "date") return "date";
  if (tool.runtime.kind === "color") return "color";
  if (tool.id.includes("url") || tool.runtime.action === "query") return "url";
  if (tool.runtime.kind === "seo" || tool.runtime.action === "diff") return "structured";
  if (raw === "text") return "text";
  return "mixed";
}

function outputKind(tool: ToolDefinition): OutputKind {
  if (tool.runtime.kind === "qr") return "preview";
  if (tool.id === "serp-preview") return "preview";
  if (tool.outputTypes.includes("file") && tool.outputTypes.includes("text")) return "multiple";
  if (tool.outputTypes[0] === "file") return "file";
  if (tool.outputTypes[0] === "number") return "number";
  if (["xml-formatter", "schema-generator", "meta-tag-generator", "og-preview", "ics-event"].includes(tool.id)) {
    return "code";
  }
  return "text";
}

export function actionLabel(tool: ToolDefinition, locale: string): string {
  const code = isLocale(locale) ? locale : "en";
  return ACTION_LABELS[code][tool.id] || ACTION_LABEL_EN[tool.id] || "Run";
}

export function uxFor(tool: ToolDefinition): ToolUx {
  const label = ACTION_LABEL_EN[tool.id];
  if (!label) {
    throw new Error(`Missing UX action label for ${tool.id}`);
  }
  return {
    toolId: tool.id,
    slug: tool.copy.en.slug,
    family: FAMILY[tool.runtime.kind],
    inputType: inputKind(tool),
    outputType: outputKind(tool),
    actionLabel: label,
    options: OPTIONS[tool.id] ?? [],
    privacyMode: tool.processingMode,
    hasExample: tool.copy.en.examples.length >= 2,
    hasErrorState: true,
    hasSuccessState: true,
  };
}

export function assertToolUx(tools: ToolDefinition[]) {
  const missing: string[] = [];
  for (const tool of tools.filter((t) => t.status === "published")) {
    if (!ACTION_LABEL_EN[tool.id]) missing.push(tool.id);
    if (!tool.runtime.kind || !tool.runtime.action) missing.push(`${tool.id}:runtime`);
    if (!tool.processingMode) missing.push(`${tool.id}:privacy`);
  }
  if (missing.length) throw new Error(`UX contract missing: ${missing.join(", ")}`);
}

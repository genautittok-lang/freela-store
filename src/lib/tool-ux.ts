import type { ToolDefinition } from "@/data/schema";

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
};

/** English primary actions — source of truth. Other locales fall back until native QA. */
export const ACTION_LABEL_EN: Record<string, string> = {
  "merge-pdf": "Merge PDFs",
  "split-pdf": "Split PDF",
  "rotate-pdf": "Rotate PDF",
  "images-to-pdf": "Convert images to PDF",
  "extract-pdf-pages": "Extract pages",
  "pdf-metadata": "Read metadata",
  "reorder-pdf": "Reverse page order",
  "compress-pdf": "Compress PDF",
  "compress-image": "Compress image",
  "resize-image": "Resize image",
  "crop-image": "Crop image",
  "convert-image": "Convert to WebP",
  "image-to-base64": "Encode image",
  "base64-to-image": "Decode image",
  "exif-strip": "Strip metadata",
  "favicon-generator": "Generate favicons",
  "color-extract": "Extract colors",
  "word-counter": "Count words",
  "character-counter": "Count characters",
  "case-converter": "Convert case",
  "remove-duplicate-lines": "Remove duplicates",
  "sort-lines": "Sort lines",
  "slug-generator": "Make slug",
  "whitespace-cleaner": "Clean whitespace",
  "text-statistics": "Analyze text",
  "text-diff": "Compare texts",
  "json-formatter": "Format JSON",
  "json-validator": "Validate JSON",
  "csv-json": "Convert",
  base64: "Encode or decode",
  "url-codec": "Encode or decode",
  "html-entities": "Encode or decode",
  "uuid-generator": "Generate UUIDs",
  "hash-generator": "Hash text",
  "regex-tester": "Test regex",
  "jwt-decoder": "Decode JWT",
  "meta-tag-generator": "Generate tags",
  "robots-txt-generator": "Generate robots.txt",
  "serp-preview": "Preview snippet",
  "hreflang-generator": "Generate hreflang",
  percentage: "Calculate",
  "vat-calculator": "Calculate VAT",
  discount: "Calculate discount",
  "profit-margin": "Calculate margin",
  "bmi-calculator": "Calculate BMI",
  "date-difference": "Calculate difference",
  temperature: "Convert",
  length: "Convert",
  weight: "Convert",
  "data-size": "Convert",
  "hex-rgb-hsl": "Convert color",
  "contrast-checker": "Check contrast",
  "palette-generator": "Generate palette",
  "password-generator": "Generate passwords",
  "qr-generator": "Generate QR code",
  "random-string": "Generate strings",
  "unix-timestamp": "Convert timestamp",
  "timezone-convert": "Convert timezone",
  "xml-formatter": "Format XML",
  "yaml-json": "Convert YAML",
  "sitemap-helper": "Generate sitemap",
  "canonical-helper": "Generate canonical",
  "schema-generator": "Generate schema",
  "og-preview": "Generate Open Graph",
  speed: "Convert",
  area: "Convert",
  volume: "Convert",
  pressure: "Convert",
  energy: "Convert",
  duration: "Convert",
  "gradient-generator": "Generate CSS",
  "url-parser": "Parse URL",
  "query-parser": "Parse query",
  "invoice-math": "Calculate invoice",
  "resume-bullets": "Format bullets",
  "cover-letter-template": "Build template",
  "ics-event": "Create ICS",
};

const ACTION_LABEL_UK: Record<string, string> = {
  "merge-pdf": "Об’єднати PDF",
  "split-pdf": "Розділити PDF",
  "rotate-pdf": "Повернути PDF",
  "images-to-pdf": "Зображення в PDF",
  "extract-pdf-pages": "Витягти сторінки",
  "pdf-metadata": "Прочитати метадані",
  "reorder-pdf": "Зворотний порядок",
  "compress-pdf": "Стиснути PDF",
  "compress-image": "Стиснути зображення",
  "resize-image": "Змінити розмір",
  "crop-image": "Обрізати",
  "convert-image": "Конвертувати в WebP",
  "image-to-base64": "Кодувати зображення",
  "base64-to-image": "Декодувати зображення",
  "exif-strip": "Прибрати метадані",
  "favicon-generator": "Згенерувати favicon",
  "color-extract": "Витягти кольори",
  "word-counter": "Порахувати слова",
  "character-counter": "Порахувати символи",
  "case-converter": "Змінити регістр",
  "remove-duplicate-lines": "Прибрати дублікати",
  "sort-lines": "Сортувати рядки",
  "slug-generator": "Зробити slug",
  "whitespace-cleaner": "Очистити пробіли",
  "text-statistics": "Проаналізувати текст",
  "text-diff": "Порівняти тексти",
  "json-formatter": "Форматувати JSON",
  "json-validator": "Перевірити JSON",
  "csv-json": "Конвертувати",
  base64: "Кодувати або декодувати",
  "url-codec": "Кодувати або декодувати",
  "html-entities": "Кодувати або декодувати",
  "uuid-generator": "Згенерувати UUID",
  "hash-generator": "Хешувати текст",
  "regex-tester": "Перевірити regex",
  "jwt-decoder": "Декодувати JWT",
  "meta-tag-generator": "Згенерувати теги",
  "robots-txt-generator": "Згенерувати robots.txt",
  "serp-preview": "Переглянути сніпет",
  "hreflang-generator": "Згенерувати hreflang",
  percentage: "Обчислити",
  "vat-calculator": "Обчислити ПДВ",
  discount: "Обчислити знижку",
  "profit-margin": "Обчислити маржу",
  "bmi-calculator": "Обчислити ІМТ",
  "date-difference": "Обчислити різницю",
  temperature: "Конвертувати",
  length: "Конвертувати",
  weight: "Конвертувати",
  "data-size": "Конвертувати",
  "hex-rgb-hsl": "Конвертувати колір",
  "contrast-checker": "Перевірити контраст",
  "palette-generator": "Згенерувати палітру",
  "password-generator": "Згенерувати паролі",
  "qr-generator": "Згенерувати QR-код",
  "random-string": "Згенерувати рядки",
  "unix-timestamp": "Конвертувати час",
  "timezone-convert": "Змінити часовий пояс",
  "xml-formatter": "Форматувати XML",
  "yaml-json": "Конвертувати YAML",
  "sitemap-helper": "Згенерувати sitemap",
  "canonical-helper": "Згенерувати canonical",
  "schema-generator": "Згенерувати schema",
  "og-preview": "Згенерувати Open Graph",
  speed: "Конвертувати",
  area: "Конвертувати",
  volume: "Конвертувати",
  pressure: "Конвертувати",
  energy: "Конвертувати",
  duration: "Конвертувати",
  "gradient-generator": "Згенерувати CSS",
  "url-parser": "Розібрати URL",
  "query-parser": "Розібрати query",
  "invoice-math": "Обчислити рахунок",
  "resume-bullets": "Форматувати пункти",
  "cover-letter-template": "Зібрати шаблон",
  "ics-event": "Створити ICS",
};

const OPTIONS: Record<string, string[]> = {
  "rotate-pdf": ["angle: 90 (default), 180, 270"],
  "split-pdf": ["pages: 1-1 (default) or all"],
  "extract-pdf-pages": ["pages: 1-1 (default)"],
  "compress-image": ["quality: 0.8 default"],
  "resize-image": ["width: 800 default"],
  "crop-image": ["x,y,w,h: 0,0,256,256 default"],
  "convert-image": ["output: WebP"],
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
  if (locale === "uk") return ACTION_LABEL_UK[tool.id] || ACTION_LABEL_EN[tool.id] || "Run";
  return ACTION_LABEL_EN[tool.id] || "Run";
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

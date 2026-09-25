export const PACK_TOOL_IDS = [
  "pdf-to-image",
  "heic-to-jpg",
  "docx-to-pdf",
  "pdf-watermark",
  "pdf-page-numbers",
  "pdf-password",
  "qr-reader",
  "barcode-generator",
  "tip-calculator",
  "loan-calculator",
  "compound-interest",
  "salary-converter",
  "age-calculator",
  "fuel-cost",
  "xlsx-csv",
  "markdown-html",
  "lorem-ipsum",
  "social-counter",
  "strip-html",
  "table-markdown",
  "cron-generator",
  "sql-formatter",
  "image-text-overlay",
  "image-blur",
  "png-to-ico",
  "universal-converter",
  "video-file-info",
  "convert-video",
] as const;

export type PackToolId = (typeof PACK_TOOL_IDS)[number];

export function isPackTool(id: string): id is PackToolId {
  return (PACK_TOOL_IDS as readonly string[]).includes(id);
}

export const PACK_BROWSER_WORKFLOWS = new Set<string>([
  "pdf-to-image",
  "heic-to-jpg",
  "qr-reader",
  "barcode-generator",
  "image-text-overlay",
  "image-blur",
  "png-to-ico",
  "universal-converter",
  "video-file-info",
]);

import type { ToolDefinition } from "../schema";
import { privacyFiles, privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-25";
const pdf = 25 * 1024 * 1024;
const img = 12 * 1024 * 1024;

function t(
  partial: Omit<
    EnTool,
    | "status"
    | "processingMode"
    | "clientOnly"
    | "retention"
    | "deletion"
    | "tested"
    | "translationReviewed"
    | "seoReviewed"
    | "lastReviewedAt"
    | "lastModified"
    | "eventName"
    | "toolVersion"
    | "adSlots"
  >,
): EnTool {
  return {
    status: "published",
    processingMode: "LOCAL_ONLY",
    clientOnly: true,
    retention: "none",
    deletion: "Inputs stay on this device.",
    tested: true,
    translationReviewed: true,
    seoReviewed: true,
    lastReviewedAt: day,
    lastModified: day,
    eventName: `tool_${partial.id.replace(/-/g, "_")}`,
    toolVersion: "1.0.0",
    adSlots: ["after-result"],
    ...partial,
  };
}

export const improveTools: EnTool[] = [
  t({
    id: "text-to-pdf",
    category: "pdf-documents",
    tags: ["pdf", "text", "convert"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["file"],
    maxFileSize: 0,
    supportedFormats: ["txt", "pdf"],
    relatedTools: ["markdown-to-pdf", "images-to-pdf", "word-counter"],
    runtime: { kind: "pack", action: "text-to-pdf" },
    copyEn: {
      name: "Text to PDF",
      title: "Convert text to PDF in your browser",
      description: "Paste notes or a letter and download a simple Helvetica PDF. Nothing is uploaded from this page.",
      h1: "Convert text to PDF",
      intro:
        "This builds an A4 text PDF with wrapped lines. It is not a print designer and does not recreate Word layouts.",
      howTo: ["Paste the text you need as a PDF.", "Create the document.", "Download the generated PDF."],
      faq: [
        { question: "Is this a Word replica?", answer: "No. Output is wrapped Helvetica on A4 pages only." },
        { question: "Are files uploaded?", answer: "No. The PDF is created in this browser tab." },
      ],
      privacy: privacyText.en,
      formats: "Input: pasted text. Output: PDF.",
      examples: ["Turn meeting notes into a one-file PDF.", "Save a plain letter without a word processor."],
    },
  }),
  t({
    id: "markdown-to-pdf",
    category: "pdf-documents",
    tags: ["pdf", "markdown", "convert"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["file"],
    maxFileSize: 0,
    supportedFormats: ["md", "pdf"],
    relatedTools: ["text-to-pdf", "markdown-html"],
    runtime: { kind: "pack", action: "markdown-to-pdf" },
    copyEn: {
      name: "Markdown to PDF",
      title: "Convert Markdown to a text PDF",
      description: "Strip Markdown markers and save an A4 PDF locally. This is not a CSS print engine or DOCX export.",
      h1: "Markdown to PDF",
      intro:
        "Headings and emphasis become plain text on A4. Images, tables and theme CSS are not rendered.",
      howTo: ["Paste Markdown.", "Generate the PDF.", "Download the file."],
      faq: [
        { question: "Will images in Markdown appear?", answer: "No. Only extractable text is placed on the page." },
        { question: "Is the file uploaded?", answer: "No. Conversion stays in the tab." },
      ],
      privacy: privacyText.en,
      formats: "Input: Markdown text. Output: PDF.",
      examples: ["Archive a README as a PDF.", "Share notes without a Markdown renderer."],
    },
  }),
  t({
    id: "extract-pdf-text",
    category: "pdf-documents",
    tags: ["pdf", "text", "extract", "ocr"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["text"],
    maxFileSize: pdf,
    supportedFormats: ["pdf"],
    relatedTools: ["extract-pdf-pages", "pdf-metadata", "text-to-pdf"],
    runtime: { kind: "pack", action: "extract-pdf-text" },
    copyEn: {
      name: "Extract PDF text",
      title: "Extract text from a PDF in the browser",
      description: "Read selectable text from a PDF with pdf.js on your device. Scanned pages without a text layer stay empty.",
      h1: "Extract text from a PDF",
      intro:
        "This copies the existing text layer. It is not OCR and will not invent words from photos of pages.",
      howTo: ["Choose a PDF.", "Extract the text layer.", "Copy the result."],
      faq: [
        { question: "Does this do OCR?", answer: "No. Image-only scans have no text layer to extract." },
        { question: "Is the PDF uploaded?", answer: "No. pdf.js runs in this tab." },
      ],
      privacy: privacyFiles.en,
      formats: "Input: PDF. Output: plain text.",
      examples: ["Copy quotes from a contract PDF.", "Check whether a scan even has a text layer."],
    },
  }),
  t({
    id: "delete-pdf-pages",
    category: "pdf-documents",
    tags: ["pdf", "delete", "pages"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: pdf,
    supportedFormats: ["pdf"],
    relatedTools: ["extract-pdf-pages", "split-pdf", "reorder-pdf"],
    runtime: { kind: "pdf", action: "delete" },
    copyEn: {
      name: "Delete PDF pages",
      title: "Delete pages from a PDF locally",
      description: "Remove listed pages and download a new PDF in the browser. Encrypted files that cannot open will error.",
      h1: "Delete PDF pages",
      intro: "Enter pages to drop (for example 2 or 2-4). At least one page must remain. Nothing is uploaded.",
      howTo: ["Add a PDF.", "List pages to delete.", "Download the shorter file."],
      faq: [
        { question: "Can I delete every page?", answer: "No. The result must keep at least one page." },
        { question: "Are files uploaded?", answer: "No. Page copy happens with pdf-lib in the tab." },
      ],
      privacy: privacyFiles.en,
      formats: "Input/output: PDF.",
      examples: ["Drop a cover sheet before sending a draft.", "Remove blank pages from a scan packet."],
    },
  }),
  t({
    id: "rotate-image",
    category: "images",
    tags: ["image", "rotate"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["flip-image", "resize-image", "crop-image"],
    runtime: { kind: "image", action: "rotate" },
    copyEn: {
      name: "Rotate image",
      title: "Rotate JPG PNG WebP in the browser",
      description: "Turn a photo 90, 180 or 270 degrees on a canvas. The original file is not sent to Freela.",
      h1: "Rotate an image",
      intro: "Pick an angle and download a recoded image. EXIF orientation is not a separate camera profile editor.",
      howTo: ["Choose an image.", "Select 90, 180 or 270 degrees.", "Download the rotated file."],
      faq: [
        { question: "Is this uploaded?", answer: "No. Rotation uses the canvas API in this tab." },
        { question: "Will metadata stay?", answer: "Canvas recode typically drops EXIF. Use Strip EXIF if you need that explicitly." },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPG, PNG, WebP. Output: recoded image.",
      examples: ["Fix a sideways phone photo.", "Turn a screenshot before a PDF pack."],
    },
  }),
  t({
    id: "flip-image",
    category: "images",
    tags: ["image", "flip", "mirror"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["rotate-image", "crop-image", "compress-image"],
    runtime: { kind: "image", action: "flip" },
    copyEn: {
      name: "Flip image",
      title: "Flip or mirror an image locally",
      description: "Mirror a photo horizontally or vertically on a canvas. Files stay on your device.",
      h1: "Flip an image",
      intro: "Horizontal flip mirrors left and right. Vertical flip mirrors top and bottom. No cloud editor is used.",
      howTo: ["Choose an image.", "Pick horizontal or vertical.", "Download the flipped file."],
      faq: [
        { question: "Is the file uploaded?", answer: "No. The pixels are drawn in this tab." },
        { question: "Can I undo?", answer: "Flip again, or pick the original from your disk. We do not keep history." },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPG, PNG, WebP. Output: recoded image.",
      examples: ["Mirror a product shot.", "Correct a selfie taken in a mirror."],
    },
  }),
  t({
    id: "utm-builder",
    category: "seo",
    tags: ["utm", "url", "campaign", "seo"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["url"],
    relatedTools: ["url-parser", "query-parser", "canonical-helper"],
    runtime: { kind: "seo", action: "utm" },
    copyEn: {
      name: "UTM builder",
      title: "Build UTM campaign URLs locally",
      description: "Add utm_source, utm_medium and utm_campaign to a URL in the browser. Values are not sent to Freela.",
      h1: "UTM campaign URL builder",
      intro:
        "Paste a destination and campaign fields. This does not shorten links or invent traffic stats.",
      howTo: ["Paste the destination URL.", "Fill source, medium and campaign.", "Copy the tagged URL."],
      faq: [
        { question: "Do you store my campaign names?", answer: "No. The string is built in this tab only." },
        { question: "Is this a link shortener?", answer: "No. It only adds UTM query parameters." },
      ],
      privacy: privacyText.en,
      formats: "Input: URL + campaign fields. Output: tagged URL.",
      examples: ["Tag a newsletter link with utm_medium=email.", "Build a consistent paid-search landing URL."],
    },
  }),
  t({
    id: "random-number",
    category: "generators",
    tags: ["random", "number", "generator"],
    featured: false,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["text"],
    relatedTools: ["random-string", "password-generator", "uuid-generator"],
    runtime: { kind: "generator", action: "random-number" },
    copyEn: {
      name: "Random number",
      title: "Random number generator in the browser",
      description: "Draw integers between a minimum and maximum using the Web Crypto API. No server raffle, no fake odds.",
      h1: "Random number generator",
      intro: "Inclusive integer range, up to 100 values. This is not a lottery or cryptographic key ceremony.",
      howTo: ["Set minimum, maximum and how many numbers.", "Generate.", "Copy the list."],
      faq: [
        { question: "Is this a lottery?", answer: "No. It draws integers locally. Do not use it for gambling or keys." },
        { question: "Are draws uploaded?", answer: "No. crypto.getRandomValues runs in this tab." },
      ],
      privacy: privacyText.en,
      formats: "Input: min, max, count. Output: integers.",
      examples: ["Pick a number between 1 and 100.", "Generate a short list of sample IDs."],
    },
  }),
];

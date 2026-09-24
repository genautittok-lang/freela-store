import type { ToolDefinition } from "../schema";
import { privacyFiles, privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-24";

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
    processingMode: "client",
    clientOnly: true,
    retention: "none",
    deletion:
      "Files never leave this device. Object URLs are revoked when you leave the page or pick a new file.",
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

export const englishTools: EnTool[] = [
  t({
    id: "merge-pdf",
    category: "pdf-documents",
    tags: ["pdf", "merge"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 25 * 1024 * 1024,
    supportedFormats: ["pdf"],
    relatedTools: ["split-pdf", "reorder-pdf", "extract-pdf-pages"],
    runtime: { kind: "pdf", action: "merge" },
    copyEn: {
      name: "Merge PDF",
      title: "Merge PDF files in your browser",
      description:
        "Combine several PDF documents into one file on your device. Nothing is uploaded.",
      h1: "Merge PDF files",
      intro:
        "Drop two or more PDFs, reorder them, then download a single document. Pages keep their original size.",
      howTo: [
        "Add the PDF files you want to combine.",
        "Drag the list to set the file order.",
        "Click Merge and save the combined PDF.",
      ],
      faq: [
        {
          question: "Are bookmarks preserved?",
          answer:
            "Outlines may be dropped because pages are copied at byte level. Page content and size stay intact.",
        },
        {
          question: "What is the file size limit?",
          answer:
            "Each file can be up to 25 MB. Very large merges may be limited by your device memory.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: application/pdf. Output: a single PDF.",
      examples: [
        "Combine signed contracts into one packet for a client.",
        "Join scanned chapters before sharing a booklet.",
      ],
    },
  }),
  t({
    id: "split-pdf",
    category: "pdf-documents",
    tags: ["pdf", "split"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 25 * 1024 * 1024,
    supportedFormats: ["pdf"],
    relatedTools: ["merge-pdf", "extract-pdf-pages", "reorder-pdf"],
    runtime: { kind: "pdf", action: "split" },
    copyEn: {
      name: "Split PDF",
      title: "Split a PDF into separate pages",
      description:
        "Cut a PDF into individual page files in your browser. Choose a range or export every page.",
      h1: "Split PDF pages",
      intro:
        "Upload one PDF and download either each page as its own file or a consecutive range. Processing stays on-device.",
      howTo: [
        "Choose a PDF up to 25 MB.",
        "Pick every page or a start and end page.",
        "Download the resulting PDF files.",
      ],
      faq: [
        {
          question: "Can I split only a chapter?",
          answer:
            "Yes. Enter a start and end page to keep a consecutive range as one file.",
        },
        {
          question: "Do form fields survive splitting?",
          answer:
            "AcroForm widgets on copied pages are usually kept. JavaScript actions may not run after the split.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: PDF. Output: one or more PDF files.",
      examples: [
        "Detach an appendix before sending the main report.",
        "Export each invoice page for separate bookkeeping.",
      ],
    },
  }),
  t({
    id: "rotate-pdf",
    category: "pdf-documents",
    tags: ["pdf", "rotate"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 25 * 1024 * 1024,
    supportedFormats: ["pdf"],
    relatedTools: ["reorder-pdf", "pdf-metadata", "merge-pdf"],
    runtime: { kind: "pdf", action: "rotate" },
    copyEn: {
      name: "Rotate PDF",
      title: "Rotate PDF pages 90° or 180°",
      description:
        "Turn sideways scans upright without re-printing. Rotation is applied locally with pdf-lib.",
      h1: "Rotate PDF pages",
      intro:
        "Fix landscape scans or upside-down pages. Choose 90°, 180° or 270° for all pages, then download the corrected file.",
      howTo: [
        "Open the PDF that needs rotation.",
        "Select 90, 180 or 270 degrees.",
        "Save the rotated document.",
      ],
      faq: [
        {
          question: "Does rotation reduce quality?",
          answer:
            "No. The page dictionary rotation flag is updated; pixel data is not recompressed.",
        },
        {
          question: "Can I rotate one page only?",
          answer:
            "This first version rotates every page the same way. Extract a page first if you need a mixed orientation.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input and output: PDF.",
      examples: [
        "Correct phone scans of signed letters.",
        "Align mixed portrait and landscape meeting notes.",
      ],
    },
  }),
  t({
    id: "images-to-pdf",
    category: "pdf-documents",
    tags: ["pdf", "images"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 15 * 1024 * 1024,
    supportedFormats: ["png", "jpg", "jpeg", "webp"],
    relatedTools: ["merge-pdf", "convert-image", "compress-image"],
    runtime: { kind: "pdf", action: "images-to-pdf" },
    copyEn: {
      name: "Images to PDF",
      title: "Convert images to a PDF file",
      description:
        "Turn JPG, PNG or WebP photos into a paginated PDF. Images never leave this browser tab.",
      h1: "Convert images to PDF",
      intro:
        "Each image becomes a page sized to its pixel dimensions. Use this for receipts, sketches or photo packets.",
      howTo: [
        "Select one or more images.",
        "Reorder them if needed.",
        "Download the generated PDF.",
      ],
      faq: [
        {
          question: "Is WebP supported?",
          answer:
            "Yes. WebP and JPEG are embedded; PNG is embedded as PNG. AVIF is not converted in this version.",
        },
        {
          question: "Will photos be compressed again?",
          answer:
            "JPEG data is passed through when possible. PNG stays lossless. We do not run a second photo encoder.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPEG, PNG, WebP. Output: PDF.",
      examples: [
        "Bundle travel receipts into one expense PDF.",
        "Turn whiteboard photos into a shareable handout.",
      ],
    },
  }),
  t({
    id: "extract-pdf-pages",
    category: "pdf-documents",
    tags: ["pdf", "extract"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 25 * 1024 * 1024,
    supportedFormats: ["pdf"],
    relatedTools: ["split-pdf", "reorder-pdf", "merge-pdf"],
    runtime: { kind: "pdf", action: "extract" },
    copyEn: {
      name: "Extract PDF pages",
      title: "Extract selected pages from a PDF",
      description:
        "Keep only the pages you list. The rest of the document is ignored and never uploaded.",
      h1: "Extract PDF pages",
      intro:
        "Type page numbers or ranges such as 1-3, 8, 10-12. Freela builds a new PDF that contains just those pages.",
      howTo: [
        "Upload the source PDF.",
        "Enter pages and ranges to keep.",
        "Download the extracted document.",
      ],
      faq: [
        {
          question: "Are page numbers 1-based?",
          answer: "Yes. Page 1 is the first page of the file, matching typical reader UI.",
        },
        {
          question: "What happens with invalid ranges?",
          answer:
            "Pages outside the document are skipped and you see a clear error if nothing remains.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: PDF. Output: PDF with selected pages.",
      examples: [
        "Pull a signature page out of a longer agreement.",
        "Keep only the summary slides from a PDF export.",
      ],
    },
  }),
  t({
    id: "pdf-metadata",
    category: "pdf-documents",
    tags: ["pdf", "metadata"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["text"],
    maxFileSize: 25 * 1024 * 1024,
    supportedFormats: ["pdf"],
    relatedTools: ["exif-strip", "rotate-pdf"],
    runtime: { kind: "pdf", action: "metadata" },
    copyEn: {
      name: "PDF metadata viewer",
      title: "View PDF title, author and page count",
      description:
        "Inspect document information dictionaries locally. Useful before you share a file that still contains author names.",
      h1: "PDF metadata viewer",
      intro:
        "Read title, author, subject, keywords, creator, producer, dates and page count without sending the file anywhere.",
      howTo: [
        "Select a PDF.",
        "Review the metadata fields.",
        "Copy values you need; nothing is stored.",
      ],
      faq: [
        {
          question: "Can I edit metadata here?",
          answer:
            "This viewer is read-only so we do not silently rewrite files. Use a dedicated editor if you must change fields.",
        },
        {
          question: "Does this remove hidden data?",
          answer:
            "No. It only displays standard info keys. Embedded files and JavaScript are not executed or listed exhaustively.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: PDF. Output: on-screen metadata.",
      examples: [
        "Check whether a resume PDF still lists a previous employer as author.",
        "Confirm page count before printing a booklet.",
      ],
    },
  }),
  t({
    id: "reorder-pdf",
    category: "pdf-documents",
    tags: ["pdf", "reorder"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 25 * 1024 * 1024,
    supportedFormats: ["pdf"],
    relatedTools: ["merge-pdf", "extract-pdf-pages", "rotate-pdf"],
    runtime: { kind: "pdf", action: "reorder" },
    copyEn: {
      name: "Reorder PDF",
      title: "Reorder pages in a PDF file",
      description:
        "Shuffle page order in the browser. Reverse a scan or move a cover to the front without extra software.",
      h1: "Reorder PDF pages",
      intro:
        "Load a PDF, drag pages into the sequence you need, then export. Page contents are copied, not rasterized.",
      howTo: [
        "Open a PDF.",
        "Drag pages into the desired order or reverse them.",
        "Download the reordered file.",
      ],
      faq: [
        {
          question: "Can I reverse the whole document?",
          answer: "Yes. Use Reverse order for back-to-front scans from a flatbed feeder.",
        },
        {
          question: "Are annotations kept?",
          answer:
            "Page-level content streams are copied. Some document-level navigation may reset.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input and output: PDF.",
      examples: [
        "Move a title page that was scanned last.",
        "Fix a shuffled homework packet before grading.",
      ],
    },
  }),
];

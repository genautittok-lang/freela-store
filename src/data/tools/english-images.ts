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
    processingMode: "LOCAL_ONLY",
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

const img = 12 * 1024 * 1024;

export const moreEnglishTools: EnTool[] = [
  t({
    id: "compress-image",
    category: "images",
    tags: ["image", "compress"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["resize-image", "convert-image", "favicon-generator"],
    runtime: { kind: "image", action: "compress" },
    copyEn: {
      name: "Compress image",
      title: "Compress JPG, PNG and WebP online",
      description:
        "Shrink image files with a quality slider. Encoding happens on a canvas in your browser.",
      h1: "Compress JPG, PNG and WebP",
      intro:
        "Choose a quality between 0.4 and 0.95, preview the new size, then download. No cloud optimizer is involved.",
      howTo: [
        "Pick a JPG, PNG or WebP file.",
        "Adjust quality and compare the estimated size.",
        "Download the compressed image.",
      ],
      faq: [
        {
          question: "Is PNG compression lossless?",
          answer:
            "PNG output uses canvas PNG encoding, which is lossless but may still change size if the source used a different filter.",
        },
        {
          question: "Why is the result sometimes larger?",
          answer:
            "Re-encoding an already tiny JPEG can add overhead. Lower the quality or resize first.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPEG, PNG, WebP. Output: same family via canvas export.",
      examples: [
        "Reduce a 5 MB photo before attaching it to email.",
        "Prepare WebP assets that stay under a CMS limit.",
      ],
    },
  }),
  t({
    id: "resize-image",
    category: "images",
    tags: ["image", "resize"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["crop-image", "compress-image", "favicon-generator"],
    runtime: { kind: "image", action: "resize" },
    copyEn: {
      name: "Resize image",
      title: "Resize images by pixels or percent",
      description:
        "Scale photos to exact dimensions while locking aspect ratio. Useful for thumbnails and social crops.",
      h1: "Resize an image",
      intro:
        "Enter width or height in pixels. The other side follows unless you unlock the aspect ratio. Scaling uses the browser canvas.",
      howTo: [
        "Open an image.",
        "Set width, height or a percentage.",
        "Download the scaled file.",
      ],
      faq: [
        {
          question: "Which interpolation is used?",
          answer:
            "The default canvas smoother of your browser. It is not a photographic RAW pipeline.",
        },
        {
          question: "Can I upscale a tiny icon?",
          answer:
            "Yes, but upscaling cannot invent detail. Prefer resizing down for photos.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPEG, PNG, WebP. Output: PNG or JPEG depending on your choice.",
      examples: [
        "Make a 1280-pixel-wide blog hero from a camera file.",
        "Scale product shots to a shop’s 800×800 rule.",
      ],
    },
  }),
  t({
    id: "crop-image",
    category: "images",
    tags: ["image", "crop"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["resize-image", "compress-image", "convert-image"],
    runtime: { kind: "image", action: "crop" },
    copyEn: {
      name: "Crop image",
      title: "Crop images to a pixel rectangle",
      description:
        "Cut unused margins from screenshots and photos. The crop runs locally on a canvas.",
      h1: "Crop an image",
      intro:
        "Set left, top, width and height in pixels. Values are clamped to the image bounds so you cannot crop outside the file.",
      howTo: [
        "Load an image to see its natural size.",
        "Enter the crop rectangle.",
        "Download the cropped result.",
      ],
      faq: [
        {
          question: "Is there a visual marquee?",
          answer:
            "This version uses numeric crop fields for predictable results and keyboard access. A drag overlay can be added later.",
        },
        {
          question: "Does crop strip EXIF?",
          answer:
            "Canvas export does not copy EXIF. Location and camera tags are not in the download.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPEG, PNG, WebP. Output: PNG.",
      examples: [
        "Remove desktop clutter from a screenshot.",
        "Isolate a chart from a larger slide export.",
      ],
    },
  }),
  t({
    id: "convert-image",
    category: "images",
    tags: ["image", "convert"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["compress-image", "image-to-base64", "images-to-pdf"],
    runtime: { kind: "image", action: "convert" },
    copyEn: {
      name: "Convert image",
      title: "Convert image to JPG, PNG or WebP",
      description:
        "Convert JPG, PNG and WebP images in your browser. Pick the output format — files stay on your device.",
      h1: "Convert image to JPG, PNG or WebP",
      intro:
        "Pick a target type and optional quality. PNG keeps sharpness for UI. JPEG is better for photographs. WebP is a smaller web default.",
      howTo: [
        "Select the source image.",
        "Choose JPEG, PNG or WebP.",
        "Download the converted file.",
      ],
      faq: [
        {
          question: "Is AVIF available?",
          answer:
            "Not in this first set. Encoding AVIF needs extra codecs we do not ship until they stay small enough for the tool bundle.",
        },
        {
          question: "What happens to transparency?",
          answer:
            "JPEG fills transparent pixels with white. PNG and WebP keep the alpha channel from the canvas.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input and output: JPEG, PNG, WebP.",
      examples: [
        "Turn a PNG icon into WebP for a landing page.",
        "Export a WebP photo as JPEG for a printer that rejects WebP.",
      ],
    },
  }),
  t({
    id: "image-to-base64",
    category: "images",
    tags: ["image", "base64"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["text"],
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    relatedTools: ["base64-to-image", "base64", "favicon-generator"],
    runtime: { kind: "image", action: "to-base64" },
    copyEn: {
      name: "Image to Base64",
      title: "Encode an image as a Base64 data URL",
      description:
        "Create a data URL for CSS or HTML prototypes. Encoding uses the FileReader API in your browser.",
      h1: "Image to Base64",
      intro:
        "Select an image and copy a data: URL. Keep payloads small; inline images bloat HTML and are a poor substitute for a CDN.",
      howTo: [
        "Choose an image under 5 MB.",
        "Copy the data URL or raw Base64.",
        "Paste it only into trusted local prototypes.",
      ],
      faq: [
        {
          question: "Should I inline photos in production?",
          answer:
            "Usually no. Data URLs skip caching and delay HTML. Use this for tiny icons or email experiments.",
        },
        {
          question: "Is SVG encoded as-is?",
          answer: "Yes. The original bytes are Base64-encoded without rewriting the markup.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: common image types. Output: text data URL.",
      examples: [
        "Embed a 1 KB chevron in an email snippet.",
        "Prototype a CSS background without extra files.",
      ],
    },
  }),
  t({
    id: "base64-to-image",
    category: "images",
    tags: ["image", "base64"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["file"],
    maxFileSize: 0,
    supportedFormats: ["png", "jpg", "webp"],
    relatedTools: ["image-to-base64", "base64"],
    runtime: { kind: "image", action: "from-base64" },
    copyEn: {
      name: "Base64 to image",
      title: "Decode a Base64 string into an image",
      description:
        "Paste a data URL or raw Base64 and preview the picture. Decoding never calls a server.",
      h1: "Base64 to image",
      intro:
        "Accepts data:image/...;base64, payloads or raw Base64. Invalid strings show an error instead of a broken image icon.",
      howTo: [
        "Paste a data URL or Base64 body.",
        "Preview the decoded image.",
        "Download it if the payload is valid.",
      ],
      faq: [
        {
          question: "Do you execute SVG scripts?",
          answer:
            "SVG is offered as a download, not injected as live markup, so scripts inside SVG are not run in this page.",
        },
        {
          question: "What is the size cap?",
          answer: "Pastes above about 8 MB of text are rejected to protect browser memory.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: Base64 text. Output: image file.",
      examples: [
        "Recover an icon that only exists as a data URL in CSS.",
        "Inspect a Base64 attachment from a log file.",
      ],
    },
  }),
  t({
    id: "exif-strip",
    category: "images",
    tags: ["image", "exif", "privacy"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["compress-image", "pdf-metadata", "crop-image"],
    runtime: { kind: "image", action: "exif-strip" },
    copyEn: {
      name: "EXIF remover",
      title: "Remove EXIF and GPS from photos",
      description:
        "Download a copy of a JPEG or PNG without metadata. Stripping is done by redrawing the image on a canvas.",
      h1: "Remove image metadata",
      intro:
        "Camera maker, GPS and timestamps live in EXIF. Canvas re-encoding drops those tags so you can share a photo more safely.",
      howTo: [
        "Select a photo.",
        "Confirm the preview still looks right.",
        "Download the stripped file.",
      ],
      faq: [
        {
          question: "Is this a forensic wipe?",
          answer:
            "No. It removes standard EXIF by re-encoding pixels. It does not claim to erase steganography or thumbnail trails in every container.",
        },
        {
          question: "Does PNG have EXIF?",
          answer:
            "PNG may carry tEXt and eXIf chunks. Re-encoding to PNG from canvas typically drops them.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: JPEG, PNG, WebP. Output: JPEG or PNG without metadata.",
      examples: [
        "Share a holiday photo without GPS coordinates.",
        "Publish a press image without camera serial tags.",
      ],
    },
  }),
  t({
    id: "favicon-generator",
    category: "images",
    tags: ["image", "favicon"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ["png", "jpg", "jpeg", "webp"],
    relatedTools: ["resize-image", "convert-image", "compress-image"],
    runtime: { kind: "image", action: "favicon" },
    copyEn: {
      name: "Favicon generator",
      title: "Generate 16, 32 and 180px favicons",
      description:
        "Create PNG favicon sizes from a square logo. Scaling runs in the browser canvas.",
      h1: "Favicon generator",
      intro:
        "Upload a high-resolution logo. Freela exports 16×16, 32×32, 180×180 and 512×512 PNG files for classic and mobile icons.",
      howTo: [
        "Upload a square-ish logo.",
        "Generate the size set.",
        "Download each PNG you need.",
      ],
      faq: [
        {
          question: "Do you build ICO files?",
          answer:
            "Not yet. Modern browsers accept PNG favicons. You can still compile an ICO elsewhere if a legacy target requires it.",
        },
        {
          question: "What if my logo is not square?",
          answer:
            "The image is fitted into a square canvas on a transparent background so nothing is stretched.",
        },
      ],
      privacy: privacyFiles.en,
      formats: "Input: PNG, JPEG, WebP. Output: PNG sizes.",
      examples: [
        "Pack a new brand mark for a static site header.",
        "Create an Apple touch icon from an existing logo.",
      ],
    },
  }),
];

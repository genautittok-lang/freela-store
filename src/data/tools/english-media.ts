import type { ToolDefinition } from "../schema";
import { privacyFiles, privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-28";
const media = 80 * 1024 * 1024;
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
  > & { status?: EnTool["status"] },
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
    toolVersion: "1.2.1",
    adSlots: ["after-result"],
    ...partial,
  };
}

function textCopy(
  name: string,
  title: string,
  description: string,
  h1: string,
  intro: string,
  howTo: [string, string, string],
  faq: [{ question: string; answer: string }, { question: string; answer: string }],
  examples: [string, string],
  formats: string,
  file = false,
) {
  return {
    name,
    title,
    description,
    h1,
    intro,
    howTo,
    faq,
    privacy: file ? privacyFiles.en : privacyText.en,
    formats,
    examples,
  };
}

const vidFormats = ["mp4", "webm", "mov", "mkv", "avi", "flv", "wmv"];
const audioFormats = ["mp3", "wav", "ogg", "aac", "m4a", "flac"];

export const mediaTools: EnTool[] = [
  t({
    id: "video-to-mp4",
    category: "converters",
    tags: ["video", "mp4", "ffmpeg"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: vidFormats,
    relatedTools: ["video-to-webm", "compress-video", "video-file-info"],
    runtime: { kind: "pack", action: "video-to-mp4" },
    copyEn: textCopy(
      "Video to MP4",
      "Convert video to MP4 in your browser",
      "Re-encode MKV, AVI, MOV, FLV, WebM or WMV to MP4 with ffmpeg.wasm. Files never leave this tab.",
      "Convert video to MP4",
      "Drop a local clip. Freela loads ffmpeg.wasm in this tab (first run downloads the WASM core to your browser cache). Output is H.264 + AAC MP4. Unsupported codecs fail with an honest error — we do not upload or fake success.",
      ["Choose a video file.", "Convert to MP4.", "Download the result."],
      [
        { question: "Do you download from YouTube or TikTok?", answer: "No. Only files already on your device. There is no URL downloader." },
        { question: "Why is the first run slow?", answer: "The ffmpeg WASM core loads once into browser cache. Later runs reuse it." },
      ],
      ["Turn a phone MOV into MP4 for email.", "Normalize a WebM screencast to MP4."],
      "Input: common video containers. Output: MP4. LOCAL_ONLY via ffmpeg.wasm.",
      true,
    ),
  }),
  t({
    id: "video-to-webm",
    category: "converters",
    tags: ["video", "webm", "ffmpeg"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: vidFormats,
    relatedTools: ["video-to-mp4", "compress-video", "video-to-gif"],
    runtime: { kind: "pack", action: "video-to-webm" },
    copyEn: textCopy(
      "Video to WebM",
      "Convert video to WebM in your browser",
      "Re-encode a local video to VP9/Opus WebM with ffmpeg.wasm. No upload.",
      "Convert video to WebM",
      "Choose a clip from your device. Conversion runs entirely in the browser with ffmpeg.wasm. Some exotic codecs may fail — we show a clear error instead of a fake file.",
      ["Choose a video.", "Convert to WebM.", "Download the WebM."],
      [
        { question: "Is this a cloud encoder?", answer: "No. Bytes stay in this tab." },
        { question: "Can I paste a YouTube link?", answer: "No. Freela never downloads remote videos." },
      ],
      ["Prepare a WebM for a web player.", "Convert an MP4 demo to WebM."],
      "Input: video file. Output: WebM. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "video-to-gif",
    category: "converters",
    tags: ["video", "gif", "ffmpeg"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: vidFormats,
    relatedTools: ["video-to-mp4", "trim-video", "compress-image"],
    runtime: { kind: "pack", action: "video-to-gif" },
    copyEn: textCopy(
      "Video to GIF",
      "Make a GIF from a video segment",
      "Turn a short local clip into an animated GIF with FPS and width controls. Runs with ffmpeg.wasm in this tab.",
      "Convert video segment to GIF",
      "Pick start time, duration, FPS and width. Long HD GIFs get huge — keep segments short. Processing stays on your device.",
      ["Choose a video.", "Set FPS, width and optional trim.", "Download the GIF."],
      [
        { question: "Full-length movie to GIF?", answer: "Not practical. Use a short segment; the tool caps FPS and width." },
        { question: "Does Freela host the GIF?", answer: "No. Download stays local." },
      ],
      ["Loop a 3-second reaction for chat.", "Make a product teaser GIF from a demo."],
      "Input: video. Output: GIF. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "video-to-mp3",
    category: "converters",
    tags: ["video", "audio", "mp3", "ffmpeg"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: [...vidFormats, ...audioFormats],
    relatedTools: ["audio-converter", "video-to-mp4", "video-file-info"],
    runtime: { kind: "pack", action: "video-to-mp3" },
    copyEn: textCopy(
      "Extract audio (MP3 / WAV / AAC)",
      "Extract audio from video locally",
      "Pull the audio track from a local video into MP3, WAV or AAC with ffmpeg.wasm. No upload.",
      "Extract audio from video",
      "Choose a video (or audio) file and an output format. We strip the video track and encode audio in this tab. Silent clips fail honestly.",
      ["Choose a video file.", "Pick MP3, WAV or AAC.", "Download the audio."],
      [
        { question: "YouTube / TikTok download?", answer: "No. Only local files. Freela does not fetch remote media." },
        { question: "Karaoke / stem separation?", answer: "No. This extracts the mixed audio track only." },
      ],
      ["Save a meeting recording as MP3.", "Pull narration from a screencast."],
      "Input: video/audio. Output: MP3, WAV or AAC. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "audio-converter",
    category: "converters",
    tags: ["audio", "mp3", "wav", "ffmpeg"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: audioFormats,
    relatedTools: ["video-to-mp3", "universal-converter"],
    runtime: { kind: "pack", action: "audio-converter" },
    copyEn: textCopy(
      "Audio converter",
      "Convert audio formats in your browser",
      "Convert WAV, MP3, OGG or AAC between formats with ffmpeg.wasm. Files stay on your device.",
      "Convert audio formats locally",
      "Drop an audio file and pick the target format. Encoding runs in-browser. DRM-protected or exotic codecs may fail with a clear message.",
      ["Choose an audio file.", "Pick the output format.", "Download the converted file."],
      [
        { question: "Batch cloud convert?", answer: "No. One file at a time, fully local." },
        { question: "Does this rip streaming sites?", answer: "No. There is no URL or downloader feature." },
      ],
      ["Turn a WAV voice note into MP3.", "Make an OGG for a web player."],
      "Input/output: MP3, WAV, OGG, AAC. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "compress-video",
    category: "converters",
    tags: ["video", "compress", "ffmpeg"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: vidFormats,
    relatedTools: ["resize-video", "trim-video", "video-to-mp4"],
    runtime: { kind: "pack", action: "compress-video" },
    copyEn: textCopy(
      "Compress video",
      "Compress video file size in the browser",
      "Re-encode a local video with a higher CRF to shrink size using ffmpeg.wasm. No upload.",
      "Compress a video locally",
      "Pick a quality (CRF). Higher CRF means smaller files and more compression artifacts. Output is MP4. Results depend on the source codec.",
      ["Choose a video.", "Set compression strength.", "Download the smaller MP4."],
      [
        { question: "Guarantee a target MB?", answer: "No. CRF controls quality, not an exact byte budget." },
        { question: "Is the original deleted?", answer: "No. Your original file stays untouched on disk." },
      ],
      ["Shrink a phone clip before email.", "Reduce a demo for a ticket attachment."],
      "Input: video. Output: compressed MP4. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "trim-video",
    category: "converters",
    tags: ["video", "trim", "ffmpeg"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: vidFormats,
    relatedTools: ["video-to-gif", "compress-video", "video-to-mp4"],
    runtime: { kind: "pack", action: "trim-video" },
    copyEn: textCopy(
      "Trim video",
      "Trim video by start and end time",
      "Cut a local clip between start and end timecodes with ffmpeg.wasm. Files stay in this tab.",
      "Trim a video clip",
      "Enter start and end times in seconds. We re-encode the segment to MP4. Frame-accurate cuts depend on keyframes and may not match a NLE.",
      ["Choose a video.", "Set start and end seconds.", "Download the trimmed MP4."],
      [
        { question: "Frame-perfect edit suite?", answer: "No. This is a quick cut, not Premiere." },
        { question: "Upload required?", answer: "Never. Processing is LOCAL_ONLY." },
      ],
      ["Keep the first 15 seconds of a demo.", "Cut a highlight from a longer recording."],
      "Input: video. Output: trimmed MP4. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "resize-video",
    category: "converters",
    tags: ["video", "resize", "ffmpeg"],
    featured: false,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: media,
    supportedFormats: vidFormats,
    relatedTools: ["compress-video", "video-to-mp4", "resize-image"],
    runtime: { kind: "pack", action: "resize-video" },
    copyEn: textCopy(
      "Resize video",
      "Resize video to 720p or 480p",
      "Scale a local 4K/1080 clip down to 720p, 480p or 360p with ffmpeg.wasm. No upload.",
      "Resize video resolution",
      "Choose a target height. Width follows aspect ratio. Output is H.264 MP4. Upscaling soft sources will not invent detail.",
      ["Choose a video.", "Pick 720, 480 or 360.", "Download the resized MP4."],
      [
        { question: "AI upscale?", answer: "No. This only scales down (or to the chosen height). See Image upscaler for honest 2× stills." },
        { question: "Keep original audio?", answer: "Audio is re-encoded to AAC for a compatible MP4." },
      ],
      ["Make a 720p copy for a LMS upload.", "Shrink a 4K phone clip for chat."],
      "Input: video. Output: resized MP4. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "image-upscaler",
    category: "images",
    tags: ["image", "upscale", "canvas"],
    featured: true,
    inputTypes: ["file"],
    outputTypes: ["file"],
    maxFileSize: img,
    supportedFormats: ["jpg", "jpeg", "png", "webp"],
    relatedTools: ["resize-image", "compress-image", "convert-image"],
    runtime: { kind: "pack", action: "image-upscaler" },
    copyEn: textCopy(
      "Image upscaler (2× canvas)",
      "2× image upscale in the browser",
      "Enlarge a photo 2× with canvas smoothing. Honest limited upscale — not an AI super-resolution model.",
      "2× canvas image upscale",
      "This is a canvas scale with browser interpolation. It does not run an ONNX ESRGAN model in this release. Expect softer detail, not invented textures. Badge on the page: Limited 2× — not AI.",
      ["Choose an image.", "Run 2× upscale.", "Download the larger PNG."],
      [
        { question: "Is this AI upscaling?", answer: "No. It is honest 2× canvas scaling. We do not claim neural restoration." },
        { question: "Can I do 4× or 8× AI?", answer: "Not in this release. Prefer a dedicated model tool if you need that." },
      ],
      ["Enlarge a small product JPG for a draft layout.", "Scale a screenshot before annotating."],
      "Input: JPG, PNG, WebP. Output: PNG at 2×. LOCAL_ONLY limited upscale.",
      true,
    ),
  }),
  t({
    id: "word-html-cleaner",
    category: "text",
    tags: ["html", "word", "clean", "docx"],
    featured: false,
    inputTypes: ["text", "file"],
    outputTypes: ["text"],
    maxFileSize: 8 * 1024 * 1024,
    supportedFormats: ["html", "htm", "docx", "txt"],
    relatedTools: ["strip-html", "markdown-html", "clipboard-list-helper"],
    runtime: { kind: "pack", action: "word-html-cleaner" },
    copyEn: textCopy(
      "HTML / Word cleaner",
      "Clean HTML or Word paste to plain text",
      "Paste HTML or drop a DOCX to strip tags and styles into plain text. Runs locally in your browser.",
      "Clean HTML and Word to plain text",
      "Paste messy CMS or Word HTML, or choose a .docx. We extract readable text without uploading. Not a layout-preserving Word converter.",
      ["Paste HTML or choose a DOCX.", "Clean to plain text.", "Copy the result."],
      [
        { question: "Keep bold and headings?", answer: "No. This version is plain text for clean paste." },
        { question: "PDF to Word?", answer: "No. Freela does not offer PDF→Word." },
      ],
      ["Clean a Word paste before Markdown.", "Strip a CMS HTML blob for notes."],
      "Input: HTML text or DOCX. Output: plain text. LOCAL_ONLY.",
      true,
    ),
  }),
  t({
    id: "clipboard-list-helper",
    category: "text",
    tags: ["clipboard", "list", "sort", "clean"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["sort-lines", "remove-duplicate-lines", "whitespace-cleaner"],
    runtime: { kind: "pack", action: "clipboard-list-helper" },
    copyEn: textCopy(
      "Clipboard list helper",
      "Clean, sort and format pasted lists",
      "Paste a list, then dedupe, sort, number or join lines in the browser. Nothing is sent to a server.",
      "Clean and format clipboard lists",
      "Paste lines from your clipboard history or notes. Choose clean, sort A–Z, reverse, unique, number, or join with commas. All edits stay in this tab — LOCAL_ONLY.",
      ["Paste your list.", "Pick a transform.", "Copy the cleaned list."],
      [
        { question: "Does Freela read OS clipboard history?", answer: "No. You paste manually. We never scrape system clipboard history." },
        { question: "Is text uploaded?", answer: "No. Processing is LOCAL_ONLY." },
      ],
      ["Dedupe a pasted email list.", "Turn bullets into a comma-separated line."],
      "Input/output: text lists. LOCAL_ONLY.",
    ),
  }),
];

export const MEDIA_ACTION_LABELS: Record<string, string> = {
  "video-to-mp4": "Convert to MP4",
  "video-to-webm": "Convert to WebM",
  "video-to-gif": "Make GIF",
  "video-to-mp3": "Extract audio",
  "audio-converter": "Convert audio",
  "compress-video": "Compress video",
  "trim-video": "Trim video",
  "resize-video": "Resize video",
  "image-upscaler": "Upscale 2×",
  "word-html-cleaner": "Clean to text",
  "clipboard-list-helper": "Format list",
};

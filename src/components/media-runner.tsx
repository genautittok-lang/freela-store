"use client";

import { useEffect, useState } from "react";
import type { ToolDefinition } from "@/data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DownloadBar, FileDropzone, triggerDownload } from "@/components/file-dropzone";
import { track } from "@/components/analytics-provider";
import { toast } from "sonner";
import { stripTags } from "@/lib/tools/pack";
import {
  convertAudio,
  convertVideoToGif,
  convertVideoToMp4,
  convertVideoToWebm,
  compressVideo,
  extractAudio,
  isCrossOriginIsolated,
  resizeVideo,
  trimVideo,
} from "@/lib/tools/ffmpeg-client";

const VIDEO_ACCEPT =
  "video/*,.mp4,.webm,.mov,.mkv,.avi,.flv,.wmv,.m4v";
const AUDIO_ACCEPT = "audio/*,.mp3,.wav,.ogg,.aac,.m4a,.flac";

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{children}</div>
  );
}

function Progress({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="grid gap-1">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{pct}%</p>
    </div>
  );
}

function CoopBanner() {
  const [isolated, setIsolated] = useState(true);
  useEffect(() => {
    setIsolated(isCrossOriginIsolated());
  }, []);
  if (isolated) return null;
  return (
    <Notice>
      This tab is not cross-origin isolated yet (COOP/COEP). Media conversion still runs on the single-thread ffmpeg core, but may be slower. Try a hard refresh after deploy.
    </Notice>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function isMediaPackTool(id: string) {
  return [
    "video-to-mp4",
    "video-to-webm",
    "video-to-gif",
    "video-to-mp3",
    "audio-converter",
    "compress-video",
    "trim-video",
    "resize-video",
    "image-upscaler",
    "word-html-cleaner",
    "clipboard-list-helper",
  ].includes(id);
}

export function MediaPackPanel({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void> | void) => Promise<void>;
  cta: string;
}) {
  const id = tool.id;
  if (id === "image-upscaler") return <ImageUpscaler tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "word-html-cleaner") return <WordHtmlCleaner locale={locale} wrap={wrap} cta={cta} />;
  if (id === "clipboard-list-helper") return <ClipboardListHelper wrap={wrap} cta={cta} />;
  if (id === "video-to-gif") return <VideoToGif tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "video-to-mp3") return <ExtractAudio tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "audio-converter") return <AudioConvert tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "compress-video") return <CompressVideo tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "trim-video") return <TrimVideo tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "resize-video") return <ResizeVideo tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "video-to-webm") {
    return (
      <SimpleVideoConvert
        tool={tool}
        locale={locale}
        wrap={wrap}
        cta={cta}
        label="WebM (VP9)"
        run={convertVideoToWebm}
      />
    );
  }
  return (
    <SimpleVideoConvert
      tool={tool}
      locale={locale}
      wrap={wrap}
      cta={cta}
      label="MP4 (H.264)"
      run={convertVideoToMp4}
    />
  );
}

function SimpleVideoConvert({
  tool,
  locale,
  wrap,
  cta,
  label,
  run,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
  label: string;
  run: (file: File, onProgress?: (r: number) => void) => Promise<{ blob: Blob; name: string }>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <Notice>
        LOCAL_ONLY via ffmpeg.wasm — {label}. Not a YouTube/TikTok downloader. First run loads the WASM core into this browser.
      </Notice>
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={VIDEO_ACCEPT}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
          setProgress(0);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            setProgress(0.01);
            try {
              const out = await run(file, setProgress);
              setResult(out);
              triggerDownload(out.blob, out.name);
              track("file_download", { toolId: tool.id, locale });
              toast.success("Conversion finished — download started.");
            } finally {
              setProgress(1);
            }
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function VideoToGif({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [fps, setFps] = useState("10");
  const [width, setWidth] = useState("320");
  const [start, setStart] = useState("0");
  const [duration, setDuration] = useState("3");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <Notice>Keep segments short — long HD GIFs become huge. LOCAL_ONLY ffmpeg.wasm.</Notice>
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={VIDEO_ACCEPT}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="FPS (4–15)">
          <Input value={fps} onChange={(e) => setFps(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Width px (120–640)">
          <Input value={width} onChange={(e) => setWidth(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Start (seconds)">
          <Input value={start} onChange={(e) => setStart(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Duration (seconds)">
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="decimal" />
        </Field>
      </div>
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const out = await convertVideoToGif(
              file,
              {
                fps: Number(fps) || 10,
                width: Number(width) || 320,
                start: Number(start) || 0,
                duration: Number(duration) || 3,
              },
              setProgress,
            );
            setResult(out);
            triggerDownload(out.blob, out.name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function ExtractAudio({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"mp3" | "wav" | "aac">("mp3");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <Notice>Extracts the mixed audio track only. No YouTube/TikTok download.</Notice>
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={`${VIDEO_ACCEPT},${AUDIO_ACCEPT}`}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <Field label="Output format">
        <select
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          value={format}
          onChange={(e) => setFormat(e.target.value as "mp3" | "wav" | "aac")}
        >
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
          <option value="aac">AAC</option>
        </select>
      </Field>
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const out = await extractAudio(file, format, setProgress);
            setResult(out);
            triggerDownload(out.blob, out.name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function AudioConvert({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"mp3" | "wav" | "ogg" | "aac">("mp3");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={AUDIO_ACCEPT}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <Field label="Target format">
        <select
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          value={format}
          onChange={(e) => setFormat(e.target.value as "mp3" | "wav" | "ogg" | "aac")}
        >
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
          <option value="ogg">OGG</option>
          <option value="aac">AAC</option>
        </select>
      </Field>
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const out = await convertAudio(file, format, setProgress);
            setResult(out);
            triggerDownload(out.blob, out.name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function CompressVideo({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [crf, setCrf] = useState("28");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <Notice>Higher CRF = smaller file, more artifacts. Output is MP4.</Notice>
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={VIDEO_ACCEPT}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <Field label={`Compression CRF (${crf}) — 18 soft · 28 default · 36 small`}>
        <input
          type="range"
          min={18}
          max={36}
          value={crf}
          onChange={(e) => setCrf(e.target.value)}
          className="w-full"
        />
      </Field>
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const out = await compressVideo(file, Number(crf) || 28, setProgress);
            setResult(out);
            triggerDownload(out.blob, out.name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function TrimVideo({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("10");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={VIDEO_ACCEPT}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start (seconds)">
          <Input value={start} onChange={(e) => setStart(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="End (seconds)">
          <Input value={end} onChange={(e) => setEnd(e.target.value)} inputMode="decimal" />
        </Field>
      </div>
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const out = await trimVideo(file, Number(start) || 0, Number(end) || 0, setProgress);
            setResult(out);
            triggerDownload(out.blob, out.name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function ResizeVideo({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [height, setHeight] = useState<720 | 480 | 360>(720);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <CoopBanner />
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={VIDEO_ACCEPT}
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <Field label="Target height">
        <div className="flex flex-wrap gap-2">
          {([720, 480, 360] as const).map((h) => (
            <Button key={h} type="button" variant={height === h ? "default" : "outline"} size="sm" onClick={() => setHeight(h)}>
              {h}p
            </Button>
          ))}
        </div>
      </Field>
      {progress > 0 && progress < 1 ? <Progress value={progress} /> : null}
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const out = await resizeVideo(file, height, setProgress);
            setResult(out);
            triggerDownload(out.blob, out.name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function ImageUpscaler({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const file = files[0];
  return (
    <div className="grid gap-3">
      <Notice>
        <span className="font-semibold">Limited 2× — not AI.</span> Canvas interpolation only. No ONNX ESRGAN in this release.
      </Notice>
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept="image/jpeg,image/png,image/webp"
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      <Button
        type="button"
        size="lg"
        disabled={!file}
        onClick={() =>
          wrap(async () => {
            if (!file) return;
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width * 2;
            canvas.height = bitmap.height * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas unavailable in this browser.");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode PNG."))), "image/png");
            });
            const name = file.name.replace(/\.[^.]+$/, "") + "-2x.png";
            setResult({ blob, name });
            triggerDownload(blob, name);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
      </Button>
      {result ? <DownloadBar locale={locale} blob={result.blob} name={result.name} /> : null}
    </div>
  );
}

function WordHtmlCleaner({
  locale,
  wrap,
  cta,
}: {
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <Notice>Paste HTML or drop a .docx. Output is plain text — styles and layout are discarded.</Notice>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste HTML or Word markup…"
      />
      <FileDropzone
        locale={locale}
        toolId="word-html-cleaner"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.html,.htm,text/html"
        multiple={false}
        files={files}
        onFiles={setFiles}
        formats={["docx", "html", "htm"]}
        maxBytes={8 * 1024 * 1024}
      />
      <Button
        type="button"
        size="lg"
        onClick={() =>
          wrap(async () => {
            let source = text;
            const file = files[0];
            if (file) {
              const name = file.name.toLowerCase();
              if (name.endsWith(".docx")) {
                const mammoth = (await import("mammoth")).default;
                const buf = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: buf });
                source = result.value;
              } else {
                source = await file.text();
              }
            }
            if (!source.trim()) throw new Error("Paste HTML or choose a DOCX/HTML file first.");
            setOut(stripTags(source));
          })
        }
      >
        {cta}
      </Button>
      {out ? (
        <>
          <Textarea readOnly value={out} rows={10} />
          <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(out)}>
            Copy plain text
          </Button>
        </>
      ) : null}
    </div>
  );
}

function ClipboardListHelper({ wrap, cta }: { wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [mode, setMode] = useState<"clean" | "sort" | "unique" | "number" | "join" | "reverse">("clean");

  function transform(input: string) {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-*•]\s*/, "").trim())
      .filter(Boolean);
    switch (mode) {
      case "sort":
        return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
      case "unique":
        return [...new Set(lines)].join("\n");
      case "number":
        return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
      case "join":
        return lines.join(", ");
      case "reverse":
        return [...lines].reverse().join("\n");
      default:
        return lines.join("\n");
    }
  }

  return (
    <div className="grid gap-3">
      <Notice>
        Paste lists yourself — Freela never reads OS clipboard history. LOCAL_ONLY transforms only.
      </Notice>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={"one item per line…"} />
      <Field label="Transform">
        <select
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
        >
          <option value="clean">Clean whitespace / bullets</option>
          <option value="sort">Sort A–Z</option>
          <option value="unique">Remove duplicates</option>
          <option value="number">Number lines</option>
          <option value="join">Join with commas</option>
          <option value="reverse">Reverse order</option>
        </select>
      </Field>
      <Button type="button" size="lg" onClick={() => wrap(() => setOut(transform(text)))}>
        {cta}
      </Button>
      {out ? (
        <>
          <Textarea readOnly value={out} rows={8} />
          <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(out)}>
            Copy result
          </Button>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "@/data/schema";
import type { Locale } from "@/data/locales";
import { t } from "@/i18n/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { track } from "@/components/analytics-provider";
import {
  cleanWhitespace,
  convertCase,
  countText,
  dedupeLines,
  diffLines,
  slugify,
  sortLines,
} from "@/lib/tools/text";
import {
  bmi,
  dateDiff,
  discountPrice,
  isWhatPercent,
  marginFrom,
  percentChange,
  percentageOf,
  vatBreakdown,
} from "@/lib/tools/calc";
import {
  convertDataSize,
  convertLength,
  convertTemperature,
  convertWeight,
  iecUnits,
  lengthUnits,
  siUnits,
  weightUnits,
} from "@/lib/tools/convert";
import { contrastRatio, hexToRgb, paletteFrom, parseRgb, rgbToHex, rgbToHsl } from "@/lib/tools/color";
import {
  base64ToUtf8,
  csvToJson,
  decodeHtml,
  decodeJwt,
  encodeHtml,
  formatJson,
  jsonToCsv,
  utf8ToBase64,
} from "@/lib/tools/dev";
import { PDFDocument, degrees } from "pdf-lib";
import QRCode from "qrcode";

function pdfBlob(bytes: Uint8Array) {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function ToolRunner({
  tool,
  locale,
}: {
  tool: ToolDefinition;
  locale: Locale;
}) {
  const copy = tool.copy[locale];
  const ui = t(locale);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cancelled = useRef(false);

  async function wrap(fn: () => Promise<void> | void, okResult = "ok") {
    cancelled.current = false;
    setError(null);
    setBusy(true);
    track("tool_start", { toolId: tool.id, locale, processingMode: tool.processingMode });
    try {
      await fn();
      if (!cancelled.current) {
        track("tool_success", {
          toolId: tool.id,
          locale,
          processingMode: tool.processingMode,
          result: okResult,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : ui.error;
      setError(message);
      track("tool_error", {
        toolId: tool.id,
        locale,
        processingMode: tool.processingMode,
        result: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const kind = tool.runtime.kind;
  const action = tool.runtime.action;

  return (
    <section
      id="tool"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
      aria-labelledby="tool-heading"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          {ui.processedLocally}
        </p>
        {busy ? (
          <Button type="button" variant="outline" size="sm" onClick={() => (cancelled.current = true)}>
            {ui.cancel}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {kind === "text-stats" || kind === "text-transform" || kind === "json-format" || kind === "codec" || kind === "seo" ? (
        <TextTool tool={tool} locale={locale} wrap={wrap} />
      ) : null}
      {kind === "regex" ? <RegexTool locale={locale} wrap={wrap} tool={tool} /> : null}
      {kind === "jwt" ? <JwtTool locale={locale} wrap={wrap} /> : null}
      {kind === "hash" ? <HashTool locale={locale} wrap={wrap} /> : null}
      {kind === "pdf" ? <PdfTool action={action} locale={locale} wrap={wrap} tool={tool} cancelled={cancelled} /> : null}
      {kind === "image" ? <ImageTool action={action} locale={locale} wrap={wrap} tool={tool} /> : null}
      {kind === "calculator" ? <CalcTool action={action} locale={locale} wrap={wrap} /> : null}
      {kind === "converter" ? <ConverterTool action={action} locale={locale} wrap={wrap} /> : null}
      {kind === "color" ? <ColorTool action={action} locale={locale} wrap={wrap} /> : null}
      {kind === "generator" ? <GeneratorTool action={action} locale={locale} wrap={wrap} /> : null}
      {kind === "qr" ? <QrTool locale={locale} wrap={wrap} /> : null}
      {kind === "datetime" ? <DateTimeTool action={action} locale={locale} wrap={wrap} /> : null}
      <p className="mt-4 text-xs text-muted-foreground">{copy.privacy}</p>
    </section>
  );
}

function TextTool({
  tool,
  locale,
  wrap,
}: {
  tool: ToolDefinition;
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
}) {
  const ui = t(locale);
  const [input, setInput] = useState("");
  const [inputB, setInputB] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("upper");
  const stats = useMemo(() => countText(input), [input]);

  function run() {
    wrap(() => {
      const a = tool.runtime.action;
      if (a === "words" || a === "chars" || a === "full") {
        setOutput(
          Object.entries(stats)
            .map(([k, v]) => `${k}: ${typeof v === "number" ? new Intl.NumberFormat(locale).format(v) : v}`)
            .join("\n"),
        );
        return;
      }
      if (a === "case") setOutput(convertCase(input, mode as "upper", locale));
      if (a === "dedupe-lines") setOutput(dedupeLines(input, mode === "insensitive"));
      if (a === "sort-lines") setOutput(sortLines(input, mode as "asc", locale));
      if (a === "slug") setOutput(slugify(input));
      if (a === "whitespace") setOutput(cleanWhitespace(input, mode === "drop"));
      if (a === "diff") {
        const rows = diffLines(input, inputB);
        setOutput(rows.map((row) => `${row.type === "add" ? "+" : row.type === "del" ? "-" : " "} ${row.text}`).join("\n"));
      }
      if (a === "format") setOutput(formatJson(input, mode === "min"));
      if (a === "validate") {
        JSON.parse(input);
        setOutput("Valid JSON");
      }
      if (a === "csv-json") setOutput(mode === "json" ? csvToJson(input) : jsonToCsv(input));
      if (a === "base64") setOutput(mode === "decode" ? base64ToUtf8(input) : utf8ToBase64(input));
      if (a === "url")
        setOutput(mode === "decode" ? decodeURIComponent(input) : encodeURIComponent(input));
      if (a === "html-entities") setOutput(mode === "decode" ? decodeHtml(input) : encodeHtml(input));
      if (a === "meta") {
        const [title, description, url] = input.split("\n");
        setOutput(
          [
            `<title>${encodeHtml(title || "")}</title>`,
            `<meta name="description" content="${encodeHtml(description || "")}" />`,
            url ? `<link rel="canonical" href="${encodeHtml(url)}" />` : "",
            `<meta property="og:title" content="${encodeHtml(title || "")}" />`,
            `<meta property="og:description" content="${encodeHtml(description || "")}" />`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
      if (a === "robots") {
        const [sitemap, ...paths] = input.split("\n");
        setOutput(
          [
            "User-agent: *",
            ...paths.filter(Boolean).map((p) => `Disallow: ${p}`),
            sitemap ? `Sitemap: ${sitemap}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
      if (a === "serp") {
        const [title, url, description] = input.split("\n");
        setOutput(`${title || ""}\n${url || ""}\n${description || ""}`);
      }
      if (a === "hreflang") {
        const lines = input.split("\n").filter(Boolean);
        const tags = lines.map((line) => {
          const [code, href] = line.split(/\s+/);
          return `<link rel="alternate" hreflang="${code}" href="${href}" />`;
        });
        setOutput(tags.join("\n"));
      }
    });
  }

  const needsSecond = tool.runtime.action === "diff";
  const select =
    tool.runtime.action === "case"
      ? ["upper", "lower", "title", "sentence", "invert"]
      : tool.runtime.action === "dedupe-lines"
        ? ["sensitive", "insensitive"]
        : tool.runtime.action === "sort-lines"
          ? ["asc", "desc", "numeric"]
          : tool.runtime.action === "whitespace"
            ? ["keep", "drop"]
            : tool.runtime.action === "format"
              ? ["pretty", "min"]
              : tool.runtime.action === "csv-json"
                ? ["json", "csv"]
                : tool.runtime.action === "base64" ||
                    tool.runtime.action === "url" ||
                    tool.runtime.action === "html-entities"
                  ? ["encode", "decode"]
                  : [];

  return (
    <div className="grid gap-3">
      {(tool.runtime.action === "words" || tool.runtime.action === "chars" || tool.runtime.action === "full") && (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Words" value={stats.words} locale={locale} />
          <Stat label="Characters" value={stats.characters} locale={locale} />
          <Stat label="Sentences" value={stats.sentences} locale={locale} />
          <Stat label="Minutes" value={Number(stats.readingMinutes.toFixed(1))} locale={locale} />
        </dl>
      )}
      {tool.runtime.action === "meta" ? (
        <p className="text-xs text-muted-foreground">One field per line: title, description, canonical URL.</p>
      ) : null}
      {tool.runtime.action === "robots" ? (
        <p className="text-xs text-muted-foreground">First line: sitemap URL. Next lines: paths to Disallow.</p>
      ) : null}
      {tool.runtime.action === "serp" ? (
        <p className="text-xs text-muted-foreground">One field per line: title, display URL, description. Not a live Google result.</p>
      ) : null}
      {tool.runtime.action === "hreflang" ? (
        <p className="text-xs text-muted-foreground">One locale and absolute URL per line, e.g. en https://freela.store/en/</p>
      ) : null}
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={needsSecond ? 6 : 10} />
      {needsSecond ? <Textarea value={inputB} onChange={(e) => setInputB(e.target.value)} rows={6} /> : null}
      {select.length ? (
        <select className="h-9 rounded-lg border px-2 text-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
          {select.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : null}
      {tool.runtime.action === "serp" ? (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-sm text-[#1a0dab]">{input.split("\n")[0] || "Title"}</p>
          <p className="text-xs text-[#006621]">{input.split("\n")[1] || "https://example.com/page"}</p>
          <p className="text-sm text-[#4d5156]">{input.split("\n")[2] || "Description"}</p>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" onClick={run}>
          {ui.run}
        </Button>
        {output ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(output);
              track("copy_result", { toolId: tool.id, locale });
            }}
          >
            {ui.copy}
          </Button>
        ) : null}
      </div>
      {output ? <Textarea readOnly value={output} rows={8} /> : null}
    </div>
  );
}

function Stat({ label, value, locale }: { label: string; value: number; locale: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold">{new Intl.NumberFormat(locale).format(value)}</dd>
    </div>
  );
}

function RegexTool({
  locale,
  wrap,
  tool,
}: {
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
  tool: ToolDefinition;
}) {
  const ui = t(locale);
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [sample, setSample] = useState("");
  const [output, setOutput] = useState("");
  return (
    <div className="grid gap-3">
      <Field label="Pattern">
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} />
      </Field>
      <Field label="Flags">
        <Input value={flags} onChange={(e) => setFlags(e.target.value)} />
      </Field>
      <Textarea value={sample} onChange={(e) => setSample(e.target.value)} rows={8} />
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            const re = new RegExp(pattern, flags);
            const matches = [];
            re.lastIndex = 0;
            let m: RegExpExecArray | null;
            let i = 0;
            if (flags.includes("g")) {
              while ((m = re.exec(sample)) && i++ < 200) {
                matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
                if (m[0] === "") re.lastIndex++;
              }
            } else {
              m = re.exec(sample);
              if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
            }
            setOutput(JSON.stringify(matches, null, 2));
          })
        }
      >
        {ui.run}
      </Button>
      {output ? <Textarea readOnly value={output} rows={8} /> : null}
    </div>
  );
}

function JwtTool({ locale, wrap }: { locale: Locale; wrap: (fn: () => void) => Promise<void> }) {
  const ui = t(locale);
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">
        Sample tokens only. Signatures are not verified. Do not paste production secrets.
      </p>
      <Textarea value={token} onChange={(e) => setToken(e.target.value)} rows={5} />
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            setOutput(JSON.stringify(decodeJwt(token), null, 2));
          })
        }
      >
        {ui.run}
      </Button>
      {output ? <Textarea readOnly value={output} rows={10} /> : null}
    </div>
  );
}

function HashTool({ locale, wrap }: { locale: Locale; wrap: (fn: () => void) => Promise<void> }) {
  const ui = t(locale);
  const [text, setText] = useState("");
  const [algo, setAlgo] = useState("SHA-256");
  const [output, setOutput] = useState("");
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      <select className="h-9 rounded-lg border px-2 text-sm" value={algo} onChange={(e) => setAlgo(e.target.value)}>
        {["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <Button
        type="button"
        onClick={() =>
          wrap(async () => {
            const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
            setOutput([...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""));
          })
        }
      >
        {ui.run}
      </Button>
      {output ? <Textarea readOnly value={output} rows={4} /> : null}
    </div>
  );
}

function PdfTool({
  action,
  locale,
  wrap,
  tool,
  cancelled,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  tool: ToolDefinition;
  cancelled: React.MutableRefObject<boolean>;
}) {
  const ui = t(locale);
  const [files, setFiles] = useState<File[]>([]);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState("1-1");
  const [meta, setMeta] = useState("");

  async function load(file: File) {
    if (file.size > tool.maxFileSize) throw new Error(`Max file size is ${Math.round(tool.maxFileSize / 1024 / 1024)} MB.`);
    if (file.type && file.type !== "application/pdf" && action !== "images-to-pdf") {
      throw new Error("Please choose a PDF file.");
    }
    return PDFDocument.load(await file.arrayBuffer());
  }

  return (
    <div className="grid gap-3">
      <input
        type="file"
        multiple={action === "merge" || action === "images-to-pdf"}
        accept={action === "images-to-pdf" ? "image/png,image/jpeg,image/webp" : "application/pdf"}
        onChange={(e) => {
          const list = [...(e.target.files ?? [])];
          setFiles(list);
          if (list.length) track("file_selected", { toolId: tool.id, locale });
        }}
      />
      {action === "rotate" ? (
        <select className="h-9 rounded-lg border px-2" value={angle} onChange={(e) => setAngle(Number(e.target.value))}>
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
      ) : null}
      {action === "extract" || action === "split" ? (
        <Field label="Pages (e.g. 1-3,5)">
          <Input value={pages} onChange={(e) => setPages(e.target.value)} />
        </Field>
      ) : null}
      <Button
        type="button"
        onClick={() =>
          wrap(async () => {
            if (!files.length) throw new Error("Choose a file first.");
            if (cancelled.current) return;
            if (action === "metadata") {
              const pdf = await load(files[0]);
              setMeta(
                JSON.stringify(
                  {
                    title: pdf.getTitle(),
                    author: pdf.getAuthor(),
                    subject: pdf.getSubject(),
                    keywords: pdf.getKeywords(),
                    creator: pdf.getCreator(),
                    producer: pdf.getProducer(),
                    pages: pdf.getPageCount(),
                  },
                  null,
                  2,
                ),
              );
              return;
            }
            if (action === "merge") {
              const out = await PDFDocument.create();
              for (const file of files) {
                const src = await load(file);
                const copied = await out.copyPages(src, src.getPageIndices());
                copied.forEach((p) => out.addPage(p));
              }
              downloadBlob(pdfBlob(await out.save()), "merged.pdf");
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            if (action === "images-to-pdf") {
              const out = await PDFDocument.create();
              for (const file of files) {
                const bytes = new Uint8Array(await file.arrayBuffer());
                const img = file.type.includes("png")
                  ? await out.embedPng(bytes)
                  : await out.embedJpg(bytes);
                const page = out.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
              }
              downloadBlob(pdfBlob(await out.save()), "images.pdf");
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            const src = await load(files[0]);
            const out = await PDFDocument.create();
            if (action === "rotate") {
              src.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + angle) % 360)));
              downloadBlob(pdfBlob(await src.save()), "rotated.pdf");
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            if (action === "reorder") {
              const indices = src.getPageIndices().reverse();
              const copied = await out.copyPages(src, indices);
              copied.forEach((p) => out.addPage(p));
              downloadBlob(pdfBlob(await out.save()), "reordered.pdf");
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            const wanted = parsePages(pages, src.getPageCount());
            if (action === "split" && pages === "all") {
              for (const i of src.getPageIndices()) {
                const one = await PDFDocument.create();
                const [page] = await one.copyPages(src, [i]);
                one.addPage(page);
                downloadBlob(pdfBlob(await one.save()), `page-${i + 1}.pdf`);
              }
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            const copied = await out.copyPages(src, wanted);
            copied.forEach((p) => out.addPage(p));
            downloadBlob(pdfBlob(await out.save()), "extracted.pdf");
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {ui.run}
      </Button>
      {meta ? <Textarea readOnly value={meta} rows={10} /> : null}
    </div>
  );
}

function parsePages(spec: string, count: number) {
  if (spec.trim() === "all") return Array.from({ length: count }, (_, i) => i);
  const set = new Set<number>();
  for (const part of spec.split(",")) {
    const [a, b] = part.trim().split("-").map((n) => Number(n));
    if (!a || a < 1) continue;
    const start = a;
    const end = b || a;
    for (let p = start; p <= end; p++) if (p >= 1 && p <= count) set.add(p - 1);
  }
  if (!set.size) throw new Error("No valid pages in range.");
  return [...set];
}

function ImageTool({
  action,
  locale,
  wrap,
  tool,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  tool: ToolDefinition;
}) {
  const ui = t(locale);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState(800);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 200, h: 200 });
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");

  function loadImage(src: File) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(src);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unsupported or corrupted image."));
      };
      img.src = url;
    });
  }

  return (
    <div className="grid gap-3">
      {action !== "from-base64" ? (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            if (f) track("file_selected", { toolId: tool.id, locale });
          }}
        />
      ) : (
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      )}
      {action === "compress" || action === "convert" ? (
        <Field label="Quality">
          <Input type="number" min={0.4} max={0.95} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        </Field>
      ) : null}
      {action === "resize" ? (
        <Field label="Width (px)">
          <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </Field>
      ) : null}
      {action === "crop" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["x", "y", "w", "h"] as const).map((key) => (
            <Field key={key} label={key}>
              <Input
                type="number"
                value={crop[key]}
                onChange={(e) => setCrop({ ...crop, [key]: Number(e.target.value) })}
              />
            </Field>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        onClick={() =>
          wrap(async () => {
            if (action === "from-base64") {
              if (text.length > 8_000_000) throw new Error("Payload is too large.");
              const raw = text.trim();
              const url = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
              setPreview(url);
              const res = await fetch(url);
              const blob = await res.blob();
              downloadBlob(blob, "decoded.png");
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            if (!file) throw new Error("Choose an image first.");
            if (file.size > tool.maxFileSize) throw new Error("File is too large.");
            if (action === "to-base64") {
              const data = await file.arrayBuffer();
              const b64 = btoa(String.fromCharCode(...new Uint8Array(data)));
              setText(`data:${file.type};base64,${b64}`);
              return;
            }
            const img = await loadImage(file);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas is not available.");
            if (action === "resize") {
              const ratio = img.height / img.width;
              canvas.width = width;
              canvas.height = Math.round(width * ratio);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else if (action === "crop") {
              canvas.width = crop.w;
              canvas.height = crop.h;
              ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
            } else if (action === "favicon") {
              const sizes = [16, 32, 180, 512];
              for (const size of sizes) {
                canvas.width = size;
                canvas.height = size;
                ctx.clearRect(0, 0, size, size);
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
                await new Promise<void>((resolve) => {
                  canvas.toBlob((blob) => {
                    if (blob) {
                      downloadBlob(blob, `favicon-${size}.png`);
                    }
                    resolve();
                  }, "image/png");
                });
              }
              track("file_download", { toolId: tool.id, locale });
              return;
            } else {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
            const type =
              action === "convert" && quality < 1 ? "image/jpeg" : file.type === "image/png" ? "image/png" : "image/jpeg";
            await new Promise<void>((resolve, reject) => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) return reject(new Error("Could not encode image."));
                  setPreview(URL.createObjectURL(blob));
                  downloadBlob(blob, `result.${type.split("/")[1]}`);
                  track("file_download", { toolId: tool.id, locale });
                  resolve();
                },
                action === "convert" ? "image/webp" : type,
                quality,
              );
            });
          })
        }
      >
        {ui.run}
      </Button>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Result preview" className="max-h-64 w-max rounded-lg border" />
      ) : null}
      {text && action === "to-base64" ? <Textarea readOnly value={text} rows={6} /> : null}
    </div>
  );
}

function CalcTool({
  action,
  locale,
  wrap,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
}) {
  const ui = t(locale);
  const [a, setA] = useState("100");
  const [b, setB] = useState("20");
  const [mode, setMode] = useState("of");
  const [out, setOut] = useState("");
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(n);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={action === "bmi" ? "Weight kg / Height m" : "Value A"}>
          <Input value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label="Value B">
          <Input value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>
      {action === "percentage" ? (
        <select className="h-9 rounded-lg border px-2" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="of">X% of Y</option>
          <option value="is">X is what % of Y</option>
          <option value="change">Percent change</option>
        </select>
      ) : null}
      {action === "vat" ? (
        <select className="h-9 rounded-lg border px-2" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="net">Amount is net</option>
          <option value="gross">Amount is gross</option>
        </select>
      ) : null}
      {action === "date-diff" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" value={a} onChange={(e) => setA(e.target.value)} />
          <Input type="date" value={b} onChange={(e) => setB(e.target.value)} />
        </div>
      ) : null}
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            const x = Number(a);
            const y = Number(b);
            if (action === "percentage") {
              const n =
                mode === "of" ? percentageOf(x, y) : mode === "is" ? isWhatPercent(x, y) : percentChange(x, y);
              setOut(fmt(n));
            }
            if (action === "vat") {
              const v = vatBreakdown(x, y, mode as "net");
              setOut(`Net ${fmt(v.net)} · VAT ${fmt(v.vat)} · Gross ${fmt(v.gross)}`);
            }
            if (action === "discount") {
              const d = discountPrice(x, y);
              setOut(`Sale ${fmt(d.sale)} · Saved ${fmt(d.saved)}`);
            }
            if (action === "margin") {
              const m = marginFrom(x, y);
              setOut(
                `Profit ${fmt(m.profit)} · Margin ${fmt(m.margin)}% · Markup ${m.markup == null ? "n/a" : fmt(m.markup) + "%"}`,
              );
            }
            if (action === "bmi") {
              const m = bmi(x, y);
              setOut(`${fmt(m.value)} (${m.category})`);
            }
            if (action === "date-diff") {
              const d = dateDiff(a, b);
              setOut(`${d.days} days · ${fmt(d.weeks)} weeks · ${d.years}y ${d.months}m ${d.restDays}d`);
            }
          })
        }
      >
        {ui.run}
      </Button>
      {out ? <p className="text-lg font-semibold">{out}</p> : null}
    </div>
  );
}

function ConverterTool({
  action,
  locale,
  wrap,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
}) {
  const ui = t(locale);
  const units =
    action === "length"
      ? lengthUnits
      : action === "weight"
        ? weightUnits
        : action === "data-size"
          ? siUnits
          : ["C", "F", "K"];
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1]);
  const [system, setSystem] = useState<"si" | "iec">("si");
  const [out, setOut] = useState("");
  const list = action === "data-size" ? (system === "si" ? siUnits : iecUnits) : units;
  return (
    <div className="grid gap-3">
      <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      {action === "data-size" ? (
        <select className="h-9 rounded-lg border px-2" value={system} onChange={(e) => setSystem(e.target.value as "si")}>
          <option value="si">SI (1000)</option>
          <option value="iec">IEC (1024)</option>
        </select>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <select className="h-9 rounded-lg border px-2" value={from} onChange={(e) => setFrom(e.target.value)}>
          {list.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <select className="h-9 rounded-lg border px-2" value={to} onChange={(e) => setTo(e.target.value)}>
          {list.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            const n = Number(value);
            const v =
              action === "length"
                ? convertLength(n, from, to)
                : action === "weight"
                  ? convertWeight(n, from, to)
                  : action === "temperature"
                    ? convertTemperature(n, from as "C", to as "C")
                    : convertDataSize(n, from, to, system);
            setOut(new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(v));
          })
        }
      >
        {ui.run}
      </Button>
      {out ? <p className="text-lg font-semibold">{out}</p> : null}
    </div>
  );
}

function ColorTool({
  action,
  locale,
  wrap,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
}) {
  const ui = t(locale);
  const [a, setA] = useState("#1a2b3c");
  const [b, setB] = useState("#ffffff");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Color A">
          <Input value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        {action === "contrast" ? (
          <Field label="Color B">
            <Input value={b} onChange={(e) => setB(e.target.value)} />
          </Field>
        ) : null}
      </div>
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            if (action === "convert") {
              const rgb = a.trim().startsWith("rgb") ? parseRgb(a) : hexToRgb(a);
              const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
              const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
              setOut(
                `${hex} · rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) · hsl(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%)`,
              );
            }
            if (action === "contrast") {
              const c = contrastRatio(a, b);
              setOut(
                `${c.ratio.toFixed(2)}:1 · AA text ${c.aaNormal ? "pass" : "fail"} · AAA text ${c.aaaNormal ? "pass" : "fail"} · AA large ${c.aaLarge ? "pass" : "fail"}`,
              );
            }
            if (action === "palette") {
              const p = paletteFrom(a);
              setOut([...p.tints, p.base, ...p.shades].join("\n"));
            }
          })
        }
      >
        {ui.run}
      </Button>
      {out ? <pre className="overflow-auto rounded-lg bg-muted p-3 text-sm">{out}</pre> : null}
      <div className="flex gap-2">
        <span className="h-10 w-10 rounded border" style={{ background: a }} />
        {action === "contrast" ? <span className="h-10 w-10 rounded border" style={{ background: b }} /> : null}
      </div>
    </div>
  );
}

function GeneratorTool({
  action,
  locale,
  wrap,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
}) {
  const ui = t(locale);
  const [count, setCount] = useState(5);
  const [length, setLength] = useState(20);
  const [out, setOut] = useState("");
  function randomString(len: number, alphabet: string) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  }
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Count">
          <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </Field>
        <Field label="Length">
          <Input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} />
        </Field>
      </div>
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            if (action === "uuid") {
              setOut(Array.from({ length: count }, () => crypto.randomUUID()).join("\n"));
            }
            if (action === "password") {
              const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
              setOut(Array.from({ length: count }, () => randomString(length, alphabet)).join("\n"));
            }
            if (action === "random") {
              const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
              setOut(Array.from({ length: count }, () => randomString(length, alphabet)).join("\n"));
            }
          })
        }
      >
        {ui.run}
      </Button>
      {out ? (
        <Textarea
          readOnly
          value={out}
          rows={8}
          onFocus={() => undefined}
        />
      ) : null}
      {out ? (
        <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(out)}>
          {ui.copy}
        </Button>
      ) : null}
    </div>
  );
}

function QrTool({ locale, wrap }: { locale: Locale; wrap: (fn: () => Promise<void>) => Promise<void> }) {
  const ui = t(locale);
  const [text, setText] = useState("https://freela.store/en/");
  const [src, setSrc] = useState("");
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      <Button
        type="button"
        onClick={() =>
          wrap(async () => {
            const url = await QRCode.toDataURL(text, { margin: 1, width: 320 });
            setSrc(url);
            const blob = await (await fetch(url)).blob();
            downloadBlob(blob, "qr.png");
            track("file_download", { toolId: "qr-generator", locale });
          })
        }
      >
        {ui.run}
      </Button>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Generated QR code" className="h-40 w-40" />
      ) : null}
    </div>
  );
}

function DateTimeTool({
  action,
  locale,
  wrap,
}: {
  action: string;
  locale: Locale;
  wrap: (fn: () => void) => Promise<void>;
}) {
  const ui = t(locale);
  const [value, setValue] = useState(String(Math.floor(Date.now() / 1000)));
  const [from, setFrom] = useState("Europe/Berlin");
  const [to, setTo] = useState("America/New_York");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      {action === "unix" ? (
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      ) : (
        <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
      )}
      {action === "timezone" ? (
        <div className="grid grid-cols-2 gap-2">
          <Input value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      ) : null}
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            if (action === "unix") {
              const n = Number(value);
              const ms = n > 1e12 ? n : n * 1000;
              const d = new Date(ms);
              if (Number.isNaN(d.getTime())) throw new Error("Invalid timestamp.");
              setOut(
                `${d.toISOString()}\n${new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long" }).format(d)}\n${Math.floor(d.getTime() / 1000)} s · ${d.getTime()} ms`,
              );
            } else {
              const d = new Date(value);
              if (Number.isNaN(d.getTime())) throw new Error("Invalid date-time.");
              const fmt = (tz: string) =>
                new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long", timeZone: tz }).format(d);
              setOut(`${fmt(from)}\n${fmt(to)}`);
            }
          })
        }
      >
        {ui.run}
      </Button>
      {out ? <pre className="overflow-auto rounded-lg bg-muted p-3 text-sm">{out}</pre> : null}
    </div>
  );
}

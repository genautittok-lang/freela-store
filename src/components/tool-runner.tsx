"use client";

import { useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "@/data/schema";
import { t } from "@/i18n/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { track } from "@/components/analytics-provider";
import dynamic from "next/dynamic";
import { FormatBadges, FormatMark, FormatPath } from "@/components/format-badges";
import { copyForTool } from "@/lib/copy";
import { toolById } from "@/lib/registry";
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
  convertByAction,
  iecUnits,
  siUnits,
  unitSets,
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
import {
  canonicalTag,
  icsEvent,
  invoiceMath,
  linearGradient,
  parseQuery,
  parseUrl,
  prettyXml,
  schemaJsonLd,
  simpleYamlToJson,
  sitemapXml,
} from "@/lib/tools/web";
import { privacyLabel, privacyNotice } from "@/lib/privacy";
import { actionLabel } from "@/lib/tool-ux";
import { rl } from "@/i18n/runner";
import Link from "next/link";
import { DownloadBar, FileDropzone, triggerDownload } from "@/components/file-dropzone";
import { isPackTool } from "@/lib/tools/pack-ids";
import { buildUtm, parsePageList, randomIntegers } from "@/lib/tools/improve";

const PackToolPanel = dynamic(() => import("@/components/pack-runner").then((m) => m.PackToolPanel), {
  loading: () => <p className="text-sm text-muted-foreground">Loading tool…</p>,
});

function pdfBlob(bytes: Uint8Array) {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
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
  locale: string;
}) {
  const copy = copyForTool(tool, locale);
  const ui = t(locale);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const cancelled = useRef(false);

  async function wrap(fn: () => Promise<void> | void, okResult = "ok") {
    cancelled.current = false;
    setError(null);
    setOk(false);
    setBusy(true);
    track("tool_start", { toolId: tool.id, locale, processingMode: tool.processingMode });
    try {
      await fn();
      if (!cancelled.current) {
        setOk(true);
        track("tool_success", {
          toolId: tool.id,
          locale,
          processingMode: tool.processingMode,
          result: okResult === "ok" || okResult === "error" ? okResult : "ok",
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
  const cta = actionLabel(tool, locale);
  const nextId = tool.relatedTools[0];

  return (
    <section
      id="tool"
      className="rounded-3xl border border-border bg-card p-4 shadow-md sm:p-7"
      aria-labelledby="tool-heading"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
        {busy ? ui.statusProcessing : error ? ui.statusError : ok ? ui.statusDone : ui.filesReady}
      </p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tool.processingMode === "LOCAL_ONLY"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-900"
          }`}
        >
          {privacyLabel(tool.processingMode, locale)} · {privacyNotice(tool.processingMode, locale)}
        </p>
        {busy ? (
          <Button type="button" variant="outline" size="sm" onClick={() => (cancelled.current = true)}>
            {ui.cancel}
          </Button>
        ) : null}
      </div>
        {busy ? <p className="mb-3 text-sm text-muted-foreground" role="status">{ui.processing}</p> : null}
      {ok && !error ? (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {ui.done}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {isPackTool(tool.id) ? <PackToolPanel tool={tool} locale={locale} wrap={wrap} cta={cta} /> : null}
      {!isPackTool(tool.id) && (kind === "text-stats" || kind === "text-transform" || kind === "json-format" || kind === "codec" || kind === "seo") ? (
        <TextTool tool={tool} locale={locale} wrap={wrap} cta={cta} />
      ) : null}
      {kind === "regex" ? <RegexTool locale={locale} wrap={wrap} tool={tool} cta={cta} /> : null}
      {kind === "jwt" ? <JwtTool locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "hash" ? <HashTool locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "pdf" ? <PdfTool action={action} locale={locale} wrap={wrap} tool={tool} cancelled={cancelled} cta={cta} /> : null}
      {kind === "image" ? <ImageTool action={action} locale={locale} wrap={wrap} tool={tool} cta={cta} /> : null}
      {kind === "calculator" ? <CalcTool action={action} locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "converter" ? <ConverterTool action={action} locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "color" ? <ColorTool action={action} locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "generator" ? <GeneratorTool action={action} locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "qr" ? <QrTool locale={locale} wrap={wrap} cta={cta} /> : null}
      {kind === "datetime" ? <DateTimeTool action={action} locale={locale} wrap={wrap} cta={cta} /> : null}
      {ok && nextId ? (
        <p className="mt-4 text-sm">
          <Link className="font-medium text-primary" href={`/${locale}/tools/${nextId}`}>
            {ui.nextTool}: {toolById(nextId) ? copyForTool(toolById(nextId)!, locale).name : nextId}
          </Link>
        </p>
      ) : null}
      <p className="mt-4 text-xs text-muted-foreground">{copy.privacy}</p>
    </section>
  );
}

function defaultTextInput(action: string) {
  switch (action) {
    case "format":
    case "validate":
      return '{"ok":true,"n":1}';
    case "csv-json":
      return "name,value\nalpha,1\nbeta,2";
    case "url-parse":
      return "https://freela.store/en/tools/word-counter?q=1";
    case "query":
      return "q=pdf&lang=en";
    case "canonical":
      return "https://freela.store/en/";
    case "sitemap":
      return "https://freela.store/en/\nhttps://freela.store/en/about";
    case "yaml":
      return "name: Freela\nlocal: true";
    case "xml":
      return "<root><item>1</item></root>";
    case "meta":
    case "serp":
    case "og":
      return "Freela\nFree browser tools that stay on your device.\nhttps://freela.store/en/";
    case "schema":
      return "WebPage\nFreela\nFree browser tools\nhttps://freela.store/en/";
    case "hreflang":
      return "en https://freela.store/en/\nx-default https://freela.store/en/";
    case "robots":
      return "https://freela.store/sitemap.xml\n/admin";
    case "cover":
      return "Product designer\nFreela\nI ship local-first tools.";
    case "base64":
      return "Freela";
    case "url":
      return "https://freela.store/en/?q=pdf merge";
    case "utm":
      return "https://freela.store/en/\nnewsletter\nemail\nspring-launch";
    default:
      return "Freela runs tools in your browser.\nLine two.";
  }
}

function TextTool({
  tool,
  locale,
  wrap,
  cta,
}: {
  tool: ToolDefinition;
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  cta: string;
}) {
  const ui = t(locale);
  const [input, setInput] = useState(defaultTextInput(tool.runtime.action));
  const [inputB, setInputB] = useState("Freela runs tools on the device.\nLine two.");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState(
    tool.runtime.action === "csv-json"
      ? "json"
      : tool.runtime.action === "format"
        ? "pretty"
        : tool.runtime.action === "whitespace"
          ? "keep"
          : tool.runtime.action === "sort-lines"
            ? "asc"
            : tool.runtime.action === "dedupe-lines"
              ? "sensitive"
              : "upper",
  );
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
      if (a === "xml") setOutput(prettyXml(input));
      if (a === "yaml") setOutput(simpleYamlToJson(input));
      if (a === "sitemap") setOutput(sitemapXml(input.split("\n").filter(Boolean)));
      if (a === "canonical") setOutput(canonicalTag(input.trim()));
      if (a === "schema") {
        const [type, name, description, url] = input.split("\n");
        setOutput(schemaJsonLd(type || "WebPage", name || "", description || "", url || "https://freela.store/en/"));
      }
      if (a === "og") {
        const [title, description, image] = input.split("\n");
        setOutput(
          [
            `<meta property="og:title" content="${title || ""}" />`,
            `<meta property="og:description" content="${description || ""}" />`,
            image ? `<meta property="og:image" content="${image}" />` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
      if (a === "url-parse") setOutput(JSON.stringify(parseUrl(input.trim()), null, 2));
      if (a === "query") setOutput(JSON.stringify(parseQuery(input.trim()), null, 2));
      if (a === "resume") {
        setOutput(
          input
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `• ${line.replace(/^[-*•]\s*/, "")}`)
            .join("\n"),
        );
      }
      if (a === "cover") {
        const [role, company, ...notes] = input.split("\n");
        setOutput(
          `Dear hiring team,\n\nI am writing about the ${role || "role"} at ${company || "your company"}. ${notes.filter(Boolean).join(" ")}\n\nThank you for your time.\n`,
        );
      }
      if (a === "utm") {
        const [url, source, medium, campaign, term, content] = input.split("\n");
        setOutput(buildUtm(url || "", source || "", medium || "", campaign || "", term || "", content || ""));
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
          <Stat label={rl(locale, "words")} value={stats.words} locale={locale} />
          <Stat label={rl(locale, "characters")} value={stats.characters} locale={locale} />
          <Stat label={rl(locale, "sentences")} value={stats.sentences} locale={locale} />
          <Stat label={rl(locale, "minutes")} value={Number(stats.readingMinutes.toFixed(1))} locale={locale} />
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
      {tool.runtime.action === "og" ? (
        <p className="text-xs text-muted-foreground">One field per line: title, description, image URL (not fetched).</p>
      ) : null}
      {tool.runtime.action === "schema" ? (
        <p className="text-xs text-muted-foreground">One field per line: schema type, name, description, URL. Review types are blocked.</p>
      ) : null}
      {tool.runtime.action === "utm" ? (
        <p className="text-xs text-muted-foreground">One field per line: URL, utm_source, utm_medium, utm_campaign, optional term, optional content.</p>
      ) : null}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={needsSecond ? 6 : 10}
        placeholder={copyForTool(tool, locale).examples[0]}
      />
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
          {cta}
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
        {output || input ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setInput("");
              setInputB("");
              setOutput("");
            }}
          >
            {ui.newInput}
          </Button>
        ) : null}
      </div>
      {!input.trim() ? <p className="text-xs text-muted-foreground">{ui.emptyHint}</p> : null}
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
  cta,
}: {
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  tool?: ToolDefinition;
  cta: string;
}) {
  const [pattern, setPattern] = useState("\\w+");
  const [flags, setFlags] = useState("g");
  const [sample, setSample] = useState("hello world");
  const [output, setOutput] = useState("");
  return (
    <div className="grid gap-3">
      <Field label={rl(locale, "pattern")}>
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} />
      </Field>
      <Field label={rl(locale, "flags")}>
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
          {cta}
        </Button>
      {output ? <Textarea readOnly value={output} rows={8} /> : null}
    </div>
  );
}

function JwtTool({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [token, setToken] = useState(
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vIiwiaXNzIjoiZnJlZWxhIn0.sample",
  );
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
          {cta}
        </Button>
      {output ? <Textarea readOnly value={output} rows={10} /> : null}
    </div>
  );
}

function HashTool({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [text, setText] = useState("freela.store");
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
          {cta}
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
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  tool: ToolDefinition;
  cancelled: React.MutableRefObject<boolean>;
  cta: string;
}) {
  const ui = t(locale);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState("1-1");
  const [meta, setMeta] = useState("");

  function savePdf(blob: Blob, name: string) {
    setResult({ blob, name });
    triggerDownload(blob, name);
    track("file_download", { toolId: tool.id, locale });
  }

  async function load(file: File) {
    const { PDFDocument } = await import("pdf-lib");
    if (file.size > tool.maxFileSize) throw new Error(rl(locale, "tooLarge"));
    if (file.type && file.type !== "application/pdf" && action !== "images-to-pdf") {
      throw new Error(rl(locale, "choosePdf"));
    }
    if (!file.type && action !== "images-to-pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error(rl(locale, "choosePdf"));
    }
    return PDFDocument.load(await file.arrayBuffer());
  }

  return (
    <div className="grid gap-3">
      <FormatPath
        from={action === "images-to-pdf" ? ["JPG", "PNG", "WebP"] : ["PDF"]}
        to={["PDF"]}
      />
      <p className="text-sm text-muted-foreground">
        {action === "merge"
          ? `${ui.fromLabel}: PDF → ${ui.toLabel}: PDF`
          : action === "images-to-pdf"
            ? `${ui.fromLabel}: JPG / PNG / WebP → ${ui.toLabel}: PDF`
            : `${ui.fromLabel}: PDF → ${ui.toLabel}: PDF`}
      </p>
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={action === "images-to-pdf" ? "image/png,image/jpeg,image/webp" : "application/pdf"}
        multiple={action === "merge" || action === "images-to-pdf"}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      {action === "reorder" ? (
        <p className="text-sm text-muted-foreground">{rl(locale, "reverseNote")}</p>
      ) : null}
      {action === "rotate" ? (
        <select className="h-9 rounded-lg border px-2" value={angle} onChange={(e) => setAngle(Number(e.target.value))}>
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
      ) : null}
      {action === "extract" || action === "split" || action === "delete" ? (
        <Field label={rl(locale, "pages")}>
          <Input value={pages} onChange={(e) => setPages(e.target.value)} />
        </Field>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() =>
          wrap(async () => {
            const { PDFDocument, degrees } = await import("pdf-lib");
            const native = [...document.querySelectorAll("#tool input[type=file]")].at(-1) as HTMLInputElement | undefined;
            const selected = files.length ? files : [...(native?.files ?? [])];
            if (!selected.length) throw new Error(rl(locale, "chooseFile"));
            if (cancelled.current) return;
            if (action === "metadata") {
              const pdf = await load(selected[0]);
              setMeta(
                JSON.stringify(
                  {
                    title: pdf.getTitle() ?? "",
                    author: pdf.getAuthor() ?? "",
                    subject: pdf.getSubject() ?? "",
                    keywords: String(pdf.getKeywords() ?? ""),
                    creator: pdf.getCreator() ?? "",
                    producer: pdf.getProducer() ?? "",
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
              for (const file of selected) {
                const src = await load(file);
                const copied = await out.copyPages(src, src.getPageIndices());
                copied.forEach((p) => out.addPage(p));
              }
              savePdf(pdfBlob(await out.save()), "merged.pdf");
              return;
            }
            if (action === "images-to-pdf") {
              const out = await PDFDocument.create();
              for (const file of selected) {
                const bytes = new Uint8Array(await file.arrayBuffer());
                const img = file.type.includes("png")
                  ? await out.embedPng(bytes)
                  : await out.embedJpg(bytes);
                const page = out.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
              }
              savePdf(pdfBlob(await out.save()), "images.pdf");
              return;
            }
            if (action === "compress") {
              const src = await load(selected[0]);
              savePdf(pdfBlob(await src.save({ useObjectStreams: true })), "compressed.pdf");
              return;
            }
            const src = await load(selected[0]);
            const out = await PDFDocument.create();
            if (action === "rotate") {
              src.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + angle) % 360)));
              savePdf(pdfBlob(await src.save()), "rotated.pdf");
              return;
            }
            if (action === "reorder") {
              const indices = src.getPageIndices().reverse();
              const copied = await out.copyPages(src, indices);
              copied.forEach((p) => out.addPage(p));
              savePdf(pdfBlob(await out.save()), "reordered.pdf");
              return;
            }
            if (action === "delete") {
              const drop = parsePageList(pages, src.getPageCount());
              const keep = src.getPageIndices().filter((i) => !drop.has(i + 1));
              if (!keep.length) throw new Error("Keep at least one page.");
              const copied = await out.copyPages(src, keep);
              copied.forEach((p) => out.addPage(p));
              savePdf(pdfBlob(await out.save()), "pages-removed.pdf");
              return;
            }
            const wanted = parsePages(pages, src.getPageCount(), locale);
            if (action === "split" && pages === "all") {
              let last: { blob: Blob; name: string } | null = null;
              for (const i of src.getPageIndices()) {
                const one = await PDFDocument.create();
                const [page] = await one.copyPages(src, [i]);
                one.addPage(page);
                last = { blob: pdfBlob(await one.save()), name: `page-${i + 1}.pdf` };
                triggerDownload(last.blob, last.name);
              }
              if (last) setResult(last);
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            const copied = await out.copyPages(src, wanted);
            copied.forEach((p) => out.addPage(p));
            savePdf(pdfBlob(await out.save()), "extracted.pdf");
          })
        }
      >
        {cta}
      </Button>
      <DownloadBar locale={locale} blob={result?.blob ?? null} name={result?.name ?? ""} />
      {meta ? <Textarea readOnly value={meta} rows={10} /> : null}
    </div>
  );
}

function parsePages(spec: string, count: number, locale: string) {
  if (spec.trim() === "all") return Array.from({ length: count }, (_, i) => i);
  const set = new Set<number>();
  for (const part of spec.split(",")) {
    const [a, b] = part.trim().split("-").map((n) => Number(n));
    if (!a || a < 1) continue;
    const start = a;
    const end = b || a;
    for (let p = start; p <= end; p++) if (p >= 1 && p <= count) set.add(p - 1);
  }
  if (!set.size) throw new Error(rl(locale, "noPages"));
  return [...set];
}

function ImageTool({
  action,
  locale,
  wrap,
  tool,
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  tool: ToolDefinition;
  cta: string;
}) {
  const ui = t(locale);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState(800);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 200, h: 200 });
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [outMime, setOutMime] = useState<"image/jpeg" | "image/png" | "image/webp" | "image/avif">("image/webp");
  const [angle, setAngle] = useState(90);
  const [flip, setFlip] = useState<"horizontal" | "vertical">("horizontal");
  const file = files[0] ?? null;

  function saveImage(blob: Blob, name: string) {
    setResult({ blob, name });
    triggerDownload(blob, name);
    track("file_download", { toolId: tool.id, locale });
  }

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
        reject(new Error(rl(locale, "badImage")));
      };
      img.src = url;
    });
  }

  return (
    <div className="grid gap-3">
      {action !== "from-base64" ? (
        <FileDropzone
          locale={locale}
          toolId={tool.id}
          accept="image/*"
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
      ) : (
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      )}
      {action === "convert" ? (
        <fieldset className="rounded-xl border border-border p-3">
          <legend className="px-1 text-sm font-medium">{ui.chooseOutput}</legend>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{ui.fromLabel}</span>
            <FormatPath from={["JPG", "PNG", "WebP", "AVIF"]} to={[outMime === "image/jpeg" ? "JPG" : outMime === "image/png" ? "PNG" : outMime === "image/webp" ? "WebP" : "AVIF"]} />
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ui.chooseOutput}>
            {(
              [
                ["image/jpeg", "JPG"],
                ["image/png", "PNG"],
                ["image/webp", "WebP"],
                ["image/avif", "AVIF"],
              ] as const
            ).map(([mime, label]) => (
              <button
                key={mime}
                type="button"
                role="radio"
                aria-checked={outMime === mime}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                  outMime === mime ? "border-primary bg-accent" : "border-border"
                }`}
                onClick={() => setOutMime(mime)}
              >
                <FormatMark format={label} size="sm" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      {action === "compress" || action === "convert" ? (
        <Field label={rl(locale, "quality")}>
          <Input type="number" min={0.4} max={0.95} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        </Field>
      ) : null}
      {action === "resize" ? (
        <Field label={rl(locale, "width")}>
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
      {action === "rotate" ? (
        <select className="h-9 rounded-lg border px-2" value={angle} onChange={(e) => setAngle(Number(e.target.value))} aria-label="Rotation angle">
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
      ) : null}
      {action === "flip" ? (
        <select className="h-9 rounded-lg border px-2" value={flip} onChange={(e) => setFlip(e.target.value as "horizontal" | "vertical")} aria-label="Flip direction">
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() =>
          wrap(async () => {
            if (action === "from-base64") {
              if (text.length > 8_000_000) throw new Error(rl(locale, "payloadLarge"));
              const raw = text.trim();
              const url = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
              setPreview(url);
              const comma = url.indexOf(",");
              if (comma < 0) throw new Error(rl(locale, "badBase64"));
              const b64 = url.slice(comma + 1);
              const bin = atob(b64);
              const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
              saveImage(new Blob([bytes], { type: "image/png" }), "decoded.png");
              return;
            }
            const native = [...document.querySelectorAll("#tool input[type=file]")].at(-1) as HTMLInputElement | undefined;
            const chosen = file || native?.files?.[0] || null;
            if (!chosen) throw new Error(rl(locale, "chooseImage"));
            if (chosen.size > tool.maxFileSize) throw new Error(rl(locale, "tooLarge"));
            if (action === "to-base64") {
              const data = await chosen.arrayBuffer();
              const b64 = btoa(String.fromCharCode(...new Uint8Array(data)));
              setText(`data:${chosen.type};base64,${b64}`);
              return;
            }
            const img = await loadImage(chosen);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error(rl(locale, "noCanvas"));
            if (action === "resize") {
              const ratio = img.height / img.width;
              canvas.width = width;
              canvas.height = Math.round(width * ratio);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else if (action === "crop") {
              const x = Math.max(0, Math.min(crop.x, img.width - 1));
              const y = Math.max(0, Math.min(crop.y, img.height - 1));
              const w = Math.max(1, Math.min(crop.w || img.width, img.width - x));
              const h = Math.max(1, Math.min(crop.h || img.height, img.height - y));
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
            } else if (action === "favicon") {
              const sizes = [16, 32, 180, 512];
              let last: { blob: Blob; name: string } | null = null;
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
                      last = { blob, name: `favicon-${size}.png` };
                      triggerDownload(blob, last.name);
                    }
                    resolve();
                  }, "image/png");
                });
              }
              if (last) setResult(last);
              track("file_download", { toolId: tool.id, locale });
              return;
            } else if (action === "extract-colors") {
              canvas.width = 48;
              canvas.height = 48;
              ctx.drawImage(img, 0, 0, 48, 48);
              const data = ctx.getImageData(0, 0, 48, 48).data;
              const buckets = new Map<string, number>();
              for (let i = 0; i < data.length; i += 4) {
                const hex = `#${[data[i], data[i + 1], data[i + 2]].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
                buckets.set(hex, (buckets.get(hex) || 0) + 1);
              }
              const top = [...buckets.entries()]
                .sort((x, y) => y[1] - x[1])
                .slice(0, 6)
                .map(([hex]) => hex);
              setText(top.join("\n"));
              return;
            } else if (action === "rotate") {
              const rad = (angle * Math.PI) / 180;
              const w = angle === 180 ? img.width : img.height;
              const h = angle === 180 ? img.height : img.width;
              canvas.width = w;
              canvas.height = h;
              ctx.translate(w / 2, h / 2);
              ctx.rotate(rad);
              ctx.drawImage(img, -img.width / 2, -img.height / 2);
            } else if (action === "flip") {
              canvas.width = img.width;
              canvas.height = img.height;
              if (flip === "horizontal") {
                ctx.translate(img.width, 0);
                ctx.scale(-1, 1);
              } else {
                ctx.translate(0, img.height);
                ctx.scale(1, -1);
              }
              ctx.drawImage(img, 0, 0);
            } else {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
            const type =
              action === "convert" && quality < 1 ? "image/jpeg" : chosen.type === "image/png" ? "image/png" : "image/jpeg";
            await new Promise<void>((resolve, reject) => {
              const mime = action === "convert" ? outMime : type;
              const finish = (blob: Blob | null, used: string) => {
                if (!blob) return reject(new Error(rl(locale, "encodeFail")));
                setPreview(URL.createObjectURL(blob));
                saveImage(blob, `result.${used.split("/")[1]}`);
                resolve();
              };
              canvas.toBlob(
                (blob) => {
                  if (blob || (mime !== "image/webp" && mime !== "image/avif")) return finish(blob, mime);
                  canvas.toBlob((fallback) => finish(fallback, "image/png"), "image/png");
                },
                mime,
                quality,
              );
            });
          })
        }
      >
        {action === "convert" && outMime !== "image/webp"
          ? `${ui.convert} → ${outMime === "image/jpeg" ? "JPG" : outMime === "image/png" ? "PNG" : outMime === "image/avif" ? "AVIF" : "WebP"}`
          : cta}
      </Button>
      <DownloadBar locale={locale} blob={result?.blob ?? null} name={result?.name ?? ""} />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="max-h-64 w-max rounded-lg border" />
      ) : null}
      {text && (action === "to-base64" || action === "extract-colors") ? <Textarea readOnly value={text} rows={6} /> : null}
    </div>
  );
}

function CalcTool({
  action,
  locale,
  wrap,
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  cta: string;
}) {
  const ui = t(locale);
  const [a, setA] = useState(
    action === "date-diff" ? "2026-01-01" : action === "percentage" ? "15" : action === "bmi" ? "70" : "100",
  );
  const [b, setB] = useState(
    action === "date-diff" ? "2026-09-25" : action === "percentage" ? "240" : action === "bmi" ? "1.75" : "20",
  );
  const [mode, setMode] = useState(action === "invoice" ? "20" : action === "vat" ? "net" : "of");
  const [out, setOut] = useState("");
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(n);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={
            action === "bmi"
              ? rl(locale, "weightKg")
              : action === "percentage"
                ? rl(locale, "percentage")
                : action === "vat"
                  ? rl(locale, "amount")
                  : action === "discount"
                    ? rl(locale, "price")
                    : action === "margin"
                      ? rl(locale, "cost")
                      : action === "invoice"
                        ? rl(locale, "quantity")
                        : action === "date-diff"
                          ? rl(locale, "startDate")
                          : rl(locale, "valueA")
          }
        >
          {action === "date-diff" ? (
            <Input type="date" value={a} onChange={(e) => setA(e.target.value)} />
          ) : (
            <Input value={a} onChange={(e) => setA(e.target.value)} inputMode="decimal" />
          )}
        </Field>
        <Field
          label={
            action === "bmi"
              ? rl(locale, "heightM")
              : action === "percentage"
                ? rl(locale, "number")
                : action === "vat"
                  ? rl(locale, "taxPct")
                  : action === "discount"
                    ? rl(locale, "discountPct")
                    : action === "margin"
                      ? rl(locale, "sellingPrice")
                      : action === "invoice"
                        ? rl(locale, "unitPrice")
                        : action === "date-diff"
                          ? rl(locale, "endDate")
                          : rl(locale, "valueB")
          }
        >
          {action === "date-diff" ? (
            <Input type="date" value={b} onChange={(e) => setB(e.target.value)} />
          ) : (
            <Input value={b} onChange={(e) => setB(e.target.value)} inputMode="decimal" />
          )}
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
      {action === "invoice" ? (
        <Field label={rl(locale, "taxPct")}>
          <Input value={mode} onChange={(e) => setMode(e.target.value)} />
        </Field>
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
            if (action === "invoice") {
              const v = invoiceMath(Number(a), Number(b), Number(mode) || 0);
              setOut(`Net ${fmt(v.net)} · Tax ${fmt(v.tax)} · Gross ${fmt(v.gross)}`);
            }
          })
        }
      >
        {cta}
      </Button>
      {out ? (
        <div className="rounded-xl bg-accent px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{ui.result}</p>
          <p className="text-2xl font-semibold tabular-nums">{out}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(out)}>
            {ui.copy}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ConverterTool({
  action,
  locale,
  wrap,
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  cta: string;
}) {
  const ui = t(locale);
  const units = unitSets[action] ?? unitSets.length;
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1]);
  const [system, setSystem] = useState<"si" | "iec">("si");
  const [out, setOut] = useState("");
  const list = action === "data-size" ? (system === "si" ? siUnits : iecUnits) : units;
  return (
    <div className="grid gap-3">
      <Field label={rl(locale, "value")}>
        <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
      {action === "data-size" ? (
        <select className="h-9 rounded-lg border px-2" value={system} onChange={(e) => setSystem(e.target.value as "si")}>
          <option value="si">SI (1000)</option>
          <option value="iec">IEC (1024)</option>
        </select>
      ) : null}
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <Field label={rl(locale, "from")}>
          <select className="h-9 w-full rounded-lg border px-2" value={from} onChange={(e) => setFrom(e.target.value)}>
            {list.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </Field>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mb-0.5"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          {ui.swap}
        </Button>
        <Field label={rl(locale, "to")}>
          <select className="h-9 w-full rounded-lg border px-2" value={to} onChange={(e) => setTo(e.target.value)}>
            {list.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </Field>
      </div>
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            const n = Number(value);
            const v = convertByAction(action, n, from, to, system);
            setOut(new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(v));
          })
        }
      >
        {cta}
      </Button>
      {out ? (
        <div className="rounded-xl bg-accent px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{ui.result}</p>
          <p className="text-2xl font-semibold tabular-nums">
            {out} {to}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ColorTool({
  action,
  locale,
  wrap,
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  cta: string;
}) {
  const [a, setA] = useState("#1a2b3c");
  const [b, setB] = useState("#ffffff");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={rl(locale, "colorA")}>
          <div className="flex gap-2">
            <Input type="color" value={a.startsWith("#") ? a.slice(0, 7) : "#1a2b3c"} onChange={(e) => setA(e.target.value)} className="h-10 w-14 p-1" />
            <Input value={a} onChange={(e) => setA(e.target.value)} />
          </div>
        </Field>
        {action === "contrast" || action === "gradient" ? (
          <Field label={rl(locale, "colorB")}>
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
            if (action === "gradient") {
              setOut(linearGradient(a, b, 90));
            }
          })
        }
      >
        {cta}
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
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  cta: string;
}) {
  const ui = t(locale);
  const [count, setCount] = useState(5);
  const [length, setLength] = useState(20);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [out, setOut] = useState("");
  function randomString(len: number, alphabet: string) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  }
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        {action === "random-number" ? (
          <>
            <Field label="Min">
              <Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
            </Field>
            <Field label="Max">
              <Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </Field>
            <Field label={rl(locale, "count")}>
              <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </Field>
          </>
        ) : (
          <>
            <Field label={rl(locale, "count")}>
              <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </Field>
            <Field label={rl(locale, "length")}>
              <Input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} />
            </Field>
          </>
        )}
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
            if (action === "random-number") {
              setOut(randomIntegers(min, max, count).join("\n"));
            }
          })
        }
      >
        {cta}
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

function QrTool({ locale, wrap, cta }: { locale: string; wrap: (fn: () => Promise<void>) => Promise<void>; cta: string }) {
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
            const url = await (await import("qrcode")).default.toDataURL(text, { margin: 1, width: 320 });
            setSrc(url);
          })
        }
      >
        {cta}
      </Button>
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Generated QR code" className="h-40 w-40" />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const blob = await (await fetch(src)).blob();
              triggerDownload(blob, "qr.png");
              track("file_download", { toolId: "qr-generator", locale });
            }}
          >
            {ui.download}
          </Button>
        </>
      ) : null}
    </div>
  );
}

function DateTimeTool({
  action,
  locale,
  wrap,
  cta,
}: {
  action: string;
  locale: string;
  wrap: (fn: () => void) => Promise<void>;
  cta: string;
}) {
  const [value, setValue] = useState(action === "unix" ? "1735689600" : "2026-01-15T10:00");
  const [from, setFrom] = useState(action === "ics" ? "Freela event" : "Europe/Berlin");
  const [to, setTo] = useState(action === "ics" ? "2026-01-15T11:00" : "America/New_York");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      {action === "ics" ? (
        <>
          <Field label={rl(locale, "eventTitle")}>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label={rl(locale, "start")}>
            <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <Field label={rl(locale, "end")}>
            <Input type="datetime-local" value={to || "2026-01-15T11:00"} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </>
      ) : null}
      {action === "unix" ? (
        <Field label={rl(locale, "unix")}>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="1735689600" />
        </Field>
      ) : null}
      {action === "timezone" ? (
        <>
          <Field label={rl(locale, "dateTime")}>
            <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={rl(locale, "fromTz")}>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label={rl(locale, "toTz")}>
              <Input value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        </>
      ) : null}
      <Button
        type="button"
        onClick={() =>
          wrap(() => {
            if (action === "unix") {
              const n = Number(value);
              const ms = n > 1e12 ? n : n * 1000;
              const d = new Date(ms);
              if (Number.isNaN(d.getTime())) throw new Error(rl(locale, "invalidTs"));
              setOut(
                `${d.toISOString()}\n${new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long" }).format(d)}\n${Math.floor(d.getTime() / 1000)} s · ${d.getTime()} ms`,
              );
            } else if (action === "ics") {
              if (!value) throw new Error(rl(locale, "chooseStart"));
              const end = to || value;
              setOut(icsEvent(from, new Date(value).toISOString(), new Date(end).toISOString()));
            } else {
              const d = new Date(value);
              if (Number.isNaN(d.getTime())) throw new Error(rl(locale, "invalidDate"));
              const fmt = (tz: string) =>
                new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long", timeZone: tz }).format(d);
              setOut(`${fmt(from)}\n${fmt(to)}`);
            }
          })
        }
      >
        {cta}
      </Button>
      {out ? <pre className="overflow-auto rounded-lg bg-muted p-3 text-sm">{out}</pre> : null}
    </div>
  );
}

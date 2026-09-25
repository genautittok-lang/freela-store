"use client";

import { useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "@/data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DownloadBar, FileDropzone, triggerDownload } from "@/components/file-dropzone";
import { FormatMark, FormatPath } from "@/components/format-badges";
import { t } from "@/i18n/messages";
import { rl } from "@/i18n/runner";
import { track } from "@/components/analytics-provider";
import {
  ageOn,
  compound,
  cronFrom,
  csvOrHtmlToMarkdown,
  detectKind,
  fuelCost,
  loremParagraphs,
  salaryFrom,
  SOCIAL_LIMITS,
  socialCounts,
  stripTags,
  targetsFor,
  tipSplit,
  amortize,
} from "@/lib/tools/pack";
import {
  blurImage,
  convertDetected,
  docxToTextPdf,
  extractPdfText,
  formatSql,
  heicToBlob,
  markdownToHtml,
  overlayText,
  pngToIco,
  rasterizePdf,
  stampPdf,
  xlsxToCsv,
  csvToXlsx,
} from "@/lib/tools/pack-convert";
import { linesToPdfBytes, markdownToPlain } from "@/lib/tools/improve";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{children}</div>
  );
}

export function PackToolPanel({
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
  if (id === "universal-converter") return <UniversalConverter tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  if (id === "pdf-password" || id === "convert-video") {
    return <DeferredTool tool={tool} locale={locale} wrap={wrap} cta={cta} />;
  }
  if (id === "tip-calculator") return <Tip locale={locale} wrap={wrap} cta={cta} />;
  if (id === "loan-calculator") return <Loan locale={locale} wrap={wrap} cta={cta} />;
  if (id === "compound-interest") return <Compound locale={locale} wrap={wrap} cta={cta} />;
  if (id === "salary-converter") return <Salary locale={locale} wrap={wrap} cta={cta} />;
  if (id === "age-calculator") return <Age locale={locale} wrap={wrap} cta={cta} />;
  if (id === "fuel-cost") return <Fuel locale={locale} wrap={wrap} cta={cta} />;
  if (id === "lorem-ipsum") return <Lorem locale={locale} wrap={wrap} cta={cta} />;
  if (id === "text-to-pdf" || id === "markdown-to-pdf") {
    return <TextPdf toolId={id} locale={locale} wrap={wrap} cta={cta} />;
  }
  if (id === "social-counter") return <Social locale={locale} wrap={wrap} cta={cta} />;
  if (id === "strip-html") return <Strip locale={locale} wrap={wrap} cta={cta} />;
  if (id === "table-markdown") return <TableMd locale={locale} wrap={wrap} cta={cta} />;
  if (id === "markdown-html") return <MdHtml locale={locale} wrap={wrap} cta={cta} />;
  if (id === "sql-formatter") return <Sql locale={locale} wrap={wrap} cta={cta} />;
  if (id === "cron-generator") return <Cron locale={locale} wrap={wrap} cta={cta} />;
  if (id === "barcode-generator") return <Barcode locale={locale} wrap={wrap} cta={cta} />;
  return <FilePack tool={tool} locale={locale} wrap={wrap} cta={cta} />;
}

function DeferredTool({
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
  const copy = tool.copy[locale] ?? tool.copy.en;
  return (
    <div className="grid gap-3">
      <Notice>
        <p className="font-semibold">{copy.h1}</p>
        <p className="mt-1">{copy.intro}</p>
      </Notice>
      <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => wrap(() => undefined)}>
        {cta}
      </Button>
    </div>
  );
}

function Tip({ locale, wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [bill, setBill] = useState("86.4");
  const [percent, setPercent] = useState("18");
  const [people, setPeople] = useState("4");
  const [out, setOut] = useState("");
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Bill">
          <Input value={bill} onChange={(e) => setBill(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Tip %">
          <Input value={percent} onChange={(e) => setPercent(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="People">
          <Input value={people} onChange={(e) => setPeople(e.target.value)} inputMode="numeric" />
        </Field>
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => {
        const r = tipSplit(Number(bill), Number(percent), Number(people));
        setOut(`Tip ${fmt(r.tip)} · total ${fmt(r.total)} · per person ${fmt(r.perPerson)}`);
      })}>
        {cta}
      </Button>
      {out ? <p className="text-sm font-medium">{out}</p> : null}
    </div>
  );
}

function Loan({ locale, wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [p, setP] = useState("250000");
  const [r, setR] = useState("4.5");
  const [y, setY] = useState("30");
  const [out, setOut] = useState("");
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={rl(locale, "amount")}>
          <Input value={p} onChange={(e) => setP(e.target.value)} />
        </Field>
        <Field label="Annual %">
          <Input value={r} onChange={(e) => setR(e.target.value)} />
        </Field>
        <Field label="Years">
          <Input value={y} onChange={(e) => setY(e.target.value)} />
        </Field>
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => {
        const x = amortize(Number(p), Number(r), Number(y));
        setOut(`Monthly ${fmt(x.payment)} · interest ${fmt(x.interest)} · total ${fmt(x.total)}`);
      })}>
        {cta}
      </Button>
      {out ? <p className="text-sm font-medium">{out}</p> : null}
    </div>
  );
}

function Compound({ locale, wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [p, setP] = useState("1000");
  const [r, setR] = useState("5");
  const [y, setY] = useState("10");
  const [n, setN] = useState("12");
  const [out, setOut] = useState("");
  const fmt = (v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={rl(locale, "amount")}>
          <Input value={p} onChange={(e) => setP(e.target.value)} />
        </Field>
        <Field label="Annual %">
          <Input value={r} onChange={(e) => setR(e.target.value)} />
        </Field>
        <Field label="Years">
          <Input value={y} onChange={(e) => setY(e.target.value)} />
        </Field>
        <Field label="Compounds / year">
          <Input value={n} onChange={(e) => setN(e.target.value)} />
        </Field>
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => {
        const x = compound(Number(p), Number(r), Number(y), Number(n));
        setOut(`Future value ${fmt(x.amount)} · interest ${fmt(x.interest)}`);
      })}>
        {cta}
      </Button>
      {out ? <p className="text-sm font-medium">{out}</p> : null}
    </div>
  );
}

function Salary({ locale, wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [amount, setAmount] = useState("28");
  const [hours, setHours] = useState("40");
  const [source, setSource] = useState<"hourly" | "monthly">("hourly");
  const [out, setOut] = useState("");
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={source === "hourly" ? "Hourly" : "Monthly"}>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Hours / week">
          <Input value={hours} onChange={(e) => setHours(e.target.value)} />
        </Field>
        <Field label="From">
          <select className="h-9 rounded-lg border border-input bg-background px-2" value={source} onChange={(e) => setSource(e.target.value as "hourly" | "monthly")}>
            <option value="hourly">Hourly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => {
        const x = salaryFrom(Number(amount), Number(hours), source);
        setOut(`Hourly ${fmt(x.hourly)} · monthly ${fmt(x.monthly)} · yearly ${fmt(x.yearly)}`);
      })}>
        {cta}
      </Button>
      {out ? <p className="text-sm font-medium">{out}</p> : null}
    </div>
  );
}

function Age({ locale, wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [birth, setBirth] = useState("1990-05-12");
  const [on, setOn] = useState("");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Birth date">
          <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </Field>
        <Field label="As of (optional)">
          <Input type="date" value={on} onChange={(e) => setOn(e.target.value)} />
        </Field>
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => {
        const x = ageOn(birth, on || undefined);
        setOut(`${x.years} years, ${x.months} months, ${x.days} days (${x.totalDays} days)`);
      })}>
        {cta}
      </Button>
      {out ? <p className="text-sm font-medium">{out}</p> : null}
    </div>
  );
}

function Fuel({ locale, wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [km, setKm] = useState("340");
  const [use, setUse] = useState("6.2");
  const [price, setPrice] = useState("1.49");
  const [out, setOut] = useState("");
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Distance (km)">
          <Input value={km} onChange={(e) => setKm(e.target.value)} />
        </Field>
        <Field label="L / 100 km">
          <Input value={use} onChange={(e) => setUse(e.target.value)} />
        </Field>
        <Field label={rl(locale, "price")}>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => {
        const x = fuelCost(Number(km), Number(use), Number(price));
        setOut(`${fmt(x.liters)} L · ${fmt(x.cost)}`);
      })}>
        {cta}
      </Button>
      {out ? <p className="text-sm font-medium">{out}</p> : null}
    </div>
  );
}

function Lorem({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [n, setN] = useState("3");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <Field label="Paragraphs (1–12)">
        <Input value={n} onChange={(e) => setN(e.target.value)} />
      </Field>
      <Button type="button" size="lg" onClick={() => wrap(() => setOut(loremParagraphs(Number(n))))}>
        {cta}
      </Button>
      {out ? <Textarea readOnly value={out} rows={8} /> : null}
    </div>
  );
}

function TextPdf({
  toolId,
  locale,
  wrap,
  cta,
}: {
  toolId: string;
  locale: string;
  wrap: (fn: () => Promise<void>) => Promise<void>;
  cta: string;
}) {
  const ui = t(locale);
  const [text, setText] = useState(toolId === "markdown-to-pdf" ? "# Notes\n\nHello **Freela**." : "Hello from Freela.");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  return (
    <div className="grid gap-3">
      <Notice>
        Output is wrapped Helvetica on A4. This is not a Word or CSS print layout.
      </Notice>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} />
      <Button
        type="button"
        size="lg"
        onClick={() =>
          wrap(async () => {
            const body = toolId === "markdown-to-pdf" ? markdownToPlain(text) : text.trim();
            if (!body) throw new Error(ui.emptyHint);
            const bytes = await linesToPdfBytes(body);
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const name = toolId === "markdown-to-pdf" ? "markdown.pdf" : "text.pdf";
            setResult({ blob, name });
            triggerDownload(blob, name);
            track("file_download", { toolId, locale });
          })
        }
      >
        {cta}
      </Button>
      <DownloadBar locale={locale} blob={result?.blob ?? null} name={result?.name ?? ""} />
    </div>
  );
}

function Social({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState(socialCounts(""));
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Draft a post…" />
      <Button type="button" size="lg" onClick={() => wrap(() => setRows(socialCounts(text)))}>
        {cta}
      </Button>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.id} className={`rounded-xl border px-3 py-2 text-sm ${row.over ? "border-destructive/40 bg-destructive/10" : "border-border"}`}>
            <span className="font-medium">{row.label}</span>
            <span className="mt-0.5 block text-muted-foreground">
              {row.used} / {row.limit} ({row.over ? `${-row.left} over` : `${row.left} left`})
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{SOCIAL_LIMITS.length} platform defaults — networks can change them.</p>
    </div>
  );
}

function Strip({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [text, setText] = useState("<p>Hello <b>Freela</b></p>");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} />
      <Button type="button" size="lg" onClick={() => wrap(() => setOut(stripTags(text)))}>
        {cta}
      </Button>
      {out ? <Textarea readOnly value={out} rows={6} /> : null}
    </div>
  );
}

function TableMd({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [text, setText] = useState("Name,Role\nAda,Engineer");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} />
      <Button type="button" size="lg" onClick={() => wrap(() => setOut(csvOrHtmlToMarkdown(text)))}>
        {cta}
      </Button>
      {out ? <Textarea readOnly value={out} rows={6} /> : null}
    </div>
  );
}

function MdHtml({ wrap, cta }: { locale: string; wrap: (fn: () => Promise<void>) => Promise<void>; cta: string }) {
  const [text, setText] = useState("# Hello\n\nThis is **Markdown**.");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} />
      <Button type="button" size="lg" onClick={() => wrap(async () => setOut(await markdownToHtml(text)))}>
        {cta}
      </Button>
      {out ? <Textarea readOnly value={out} rows={7} /> : null}
    </div>
  );
}

function Sql({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [text, setText] = useState("select id,name from users where active=1 order by name");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} />
      <Button type="button" size="lg" onClick={() => wrap(async () => setOut(await formatSql(text)))}>
        {cta}
      </Button>
      {out ? <Textarea readOnly value={out} rows={7} /> : null}
    </div>
  );
}

function Cron({ wrap, cta }: { locale: string; wrap: (fn: () => void) => Promise<void>; cta: string }) {
  const [min, setMin] = useState("30");
  const [hour, setHour] = useState("7");
  const [day, setDay] = useState("*");
  const [month, setMonth] = useState("*");
  const [week, setWeek] = useState("1-5");
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          ["Minute", min, setMin],
          ["Hour", hour, setHour],
          ["Day", day, setDay],
          ["Month", month, setMonth],
          ["Weekday", week, setWeek],
        ].map(([label, value, set]) => (
          <Field key={String(label)} label={String(label)}>
            <Input value={String(value)} onChange={(e) => (set as (v: string) => void)(e.target.value)} />
          </Field>
        ))}
      </div>
      <Button type="button" size="lg" onClick={() => wrap(() => setOut(cronFrom(min, hour, day, month, week)))}>
        {cta}
      </Button>
      {out ? <p className="font-mono text-sm">{out}</p> : null}
    </div>
  );
}

function Barcode({ wrap, cta }: { locale: string; wrap: (fn: () => Promise<void>) => Promise<void>; cta: string }) {
  const [value, setValue] = useState("123456789012");
  const [kind, setKind] = useState<"EAN13" | "CODE128">("EAN13");
  const [url, setUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Symbology">
          <select className="h-9 rounded-lg border border-input bg-background px-2" value={kind} onChange={(e) => setKind(e.target.value as "EAN13" | "CODE128")}>
            <option value="EAN13">EAN-13</option>
            <option value="CODE128">Code 128</option>
          </select>
        </Field>
        <Field label="Value">
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
      </div>
      <canvas ref={canvasRef} className="max-w-full rounded-lg border bg-white" />
      <Button
        type="button"
        size="lg"
        onClick={() =>
          wrap(async () => {
            const JsBarcode = (await import("jsbarcode")).default;
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("Canvas is not available.");
            JsBarcode(canvas, value.trim(), { format: kind, displayValue: true, margin: 8 });
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode PNG."))), "image/png");
            });
            const objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
            triggerDownload(blob, `barcode-${kind.toLowerCase()}.png`);
          })
        }
      >
        {cta}
      </Button>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="max-h-40 w-max rounded-lg border" />
      ) : null}
    </div>
  );
}

function FilePack({
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
  const [text, setText] = useState("");
  const [extra, setExtra] = useState(tool.id === "pdf-watermark" ? "CONFIDENTIAL" : tool.id === "image-text-overlay" ? "Freela" : "8");
  const [outKind, setOutKind] = useState<"jpg" | "png">("jpg");
  const [blurMode, setBlurMode] = useState<"blur" | "pixelate">("blur");
  const file = files[0] ?? null;
  const accept = tool.supportedFormats.map((f) => `.${f}`).join(",");

  return (
    <div className="grid gap-3">
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept={accept}
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
      {tool.id === "pdf-to-image" || tool.id === "heic-to-jpg" ? (
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {(["jpg", "png"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={outKind === k}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${outKind === k ? "border-primary bg-accent" : "border-border"}`}
              onClick={() => setOutKind(k)}
            >
              <FormatMark format={k.toUpperCase()} size="sm" />
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}
      {tool.id === "image-blur" ? (
        <Field label="Mode">
          <select className="h-9 rounded-lg border border-input bg-background px-2" value={blurMode} onChange={(e) => setBlurMode(e.target.value as "blur" | "pixelate")}>
            <option value="blur">Blur</option>
            <option value="pixelate">Pixelate</option>
          </select>
        </Field>
      ) : null}
      {tool.id === "pdf-watermark" || tool.id === "image-text-overlay" || tool.id === "image-blur" ? (
        <Field label={tool.id === "image-blur" ? (blurMode === "pixelate" ? "Block size (px)" : "Blur radius (px)") : "Text"}>
          <Input value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
      ) : null}
      {tool.id === "docx-to-pdf" ? (
        <Notice>Output is a text PDF (Helvetica on A4), not a Word layout replica. PDF→Word is not available.</Notice>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() =>
          wrap(async () => {
            if (!file) throw new Error(rl(locale, "chooseImage").replace("image", "file"));
            if (file.size > tool.maxFileSize) throw new Error(rl(locale, "tooLarge"));
            let blob: Blob | null = null;
            let name = "result";
            if (tool.id === "pdf-to-image") {
              const pages = await rasterizePdf(file, outKind === "png" ? "image/png" : "image/jpeg");
              pages.forEach((p) => triggerDownload(p.blob, p.name));
              blob = pages[0].blob;
              name = pages[0].name;
            } else if (tool.id === "heic-to-jpg") {
              blob = await heicToBlob(file, outKind === "png" ? "image/png" : "image/jpeg");
              name = `${file.name.replace(/\.[^.]+$/, "")}.${outKind === "png" ? "png" : "jpg"}`;
              triggerDownload(blob, name);
            } else if (tool.id === "docx-to-pdf") {
              blob = await docxToTextPdf(file);
              name = file.name.replace(/\.docx$/i, "") + ".pdf";
              triggerDownload(blob, name);
            } else if (tool.id === "pdf-watermark") {
              blob = await stampPdf(file, "watermark", extra);
              name = "watermarked.pdf";
              triggerDownload(blob, name);
            } else if (tool.id === "pdf-page-numbers") {
              blob = await stampPdf(file, "pages");
              name = "numbered.pdf";
              triggerDownload(blob, name);
            } else if (tool.id === "qr-reader") {
              const decoded = await readQr(file);
              setText(decoded);
              return;
            } else if (tool.id === "xlsx-csv") {
              if (/\.csv$/i.test(file.name)) {
                const built = await csvToXlsx(await file.text(), file.name.replace(/\.csv$/i, ".xlsx"));
                blob = built.blob;
                name = built.name;
              } else {
                const csv = await xlsxToCsv(file);
                blob = new Blob([csv], { type: "text/csv" });
                name = file.name.replace(/\.[^.]+$/, "") + ".csv";
              }
              triggerDownload(blob, name);
            } else if (tool.id === "image-text-overlay") {
              blob = await overlayText(file, extra);
              name = "caption.png";
              triggerDownload(blob, name);
            } else if (tool.id === "image-blur") {
              blob = await blurImage(file, Number(extra) || 8, blurMode);
              name = blurMode === "pixelate" ? "pixelate.png" : "blur.png";
              triggerDownload(blob, name);
            } else if (tool.id === "png-to-ico") {
              blob = await pngToIco(file);
              name = "favicon.ico";
              triggerDownload(blob, name);
            } else if (tool.id === "extract-pdf-text") {
              setText(await extractPdfText(file));
              return;
            } else if (tool.id === "video-file-info") {
              setText(await videoInfo(file));
              return;
            } else {
              throw new Error("This tool is not wired.");
            }
            if (blob) {
              setResult({ blob, name });
              track("file_download", { toolId: tool.id, locale });
            }
          })
        }
      >
        {cta}
      </Button>
      <DownloadBar locale={locale} blob={result?.blob ?? null} name={result?.name ?? ""} />
      {text ? <Textarea readOnly value={text} rows={8} /> : null}
    </div>
  );
}

async function readQr(file: File) {
  const jsQR = (await import("jsqr")).default;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => reject(new Error("Could not decode this image."));
    image.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(data.data, data.width, data.height);
  if (!code?.data) throw new Error("No QR code found in this image.");
  return code.data;
}

async function videoInfo(file: File) {
  const lines = [
    `Name: ${file.name}`,
    `Size: ${file.size} bytes`,
    `Type: ${file.type || "unknown"}`,
    `Modified: ${file.lastModified ? new Date(file.lastModified).toISOString() : "n/a"}`,
  ];
  if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
    lines.push("Not a video container the browser advertised. File record only.");
    return lines.join("\n");
  }
  const url = URL.createObjectURL(file);
  try {
    const meta = await new Promise<{ d: number; w: number; h: number }>((resolve, reject) => {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.muted = true;
      el.src = url;
      el.onloadedmetadata = () => resolve({ d: el.duration, w: el.videoWidth, h: el.videoHeight });
      el.onerror = () => reject(new Error("This browser could not read a video track from the file."));
    });
    lines.push(`Duration: ${Number.isFinite(meta.d) ? `${meta.d.toFixed(2)} s` : "n/a"}`);
    lines.push(`Pixels: ${meta.w}×${meta.h}`);
  } catch (err) {
    lines.push(err instanceof Error ? err.message : "No video track.");
  } finally {
    URL.revokeObjectURL(url);
  }
  return lines.join("\n");
}

function UniversalConverter({
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
  const ui = t(locale);
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const file = files[0] ?? null;
  const kind = file ? detectKind(file) : "unknown";
  const targets = useMemo(() => (file ? targetsFor(kind) : []), [file, kind]);
  const selected = targets.some((x) => x.id === target) ? target : targets[0]?.id ?? "";

  return (
    <div className="grid gap-4">
      <FileDropzone
        locale={locale}
        toolId={tool.id}
        accept="*/*"
        multiple={false}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
          setProgress(0);
          setTarget("");
        }}
        formats={tool.supportedFormats}
        maxBytes={tool.maxFileSize}
        onSelected={() => track("file_selected", { toolId: tool.id, locale })}
      />
      {file ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Detected: {kind}
          </span>
          <FormatPath from={[kind.toUpperCase()]} to={selected ? [selected.toUpperCase()] : ["—"]} />
        </div>
      ) : null}
      {file && !targets.length ? (
        <Notice>
          No client-side conversion for this type. Video transcode and PDF→Word are not offered because they are not implemented.
        </Notice>
      ) : null}
      {targets.length ? (
        <div>
          <p className="mb-2 text-sm font-medium">{ui.chooseOutput}</p>
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto pb-2">
            {targets.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`snap-start shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  selected === row.id ? "border-primary bg-accent" : "border-border bg-card"
                }`}
                onClick={() => setTarget(row.id)}
              >
                <FormatMark format={row.label} size="sm" />
                <span className="mt-1 block">{row.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {progress > 0 && progress < 1 ? (
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="h-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      ) : null}
      <Button
        type="button"
        size="lg"
        disabled={!file || !selected}
        onClick={() =>
          wrap(async () => {
            if (!file || !selected) throw new Error("Drop a file and pick a real output format.");
            if (kind === "pdf" && (selected === "jpg" || selected === "png")) {
              const pages = await rasterizePdf(file, selected === "png" ? "image/png" : "image/jpeg", setProgress);
              pages.forEach((p) => triggerDownload(p.blob, p.name));
              setResult(pages[0]);
              track("file_download", { toolId: tool.id, locale });
              return;
            }
            const converted = await convertDetected(file, selected, setProgress);
            triggerDownload(converted.blob, converted.name);
            setResult(converted);
            setProgress(1);
            track("file_download", { toolId: tool.id, locale });
          })
        }
      >
        {cta}
        {selected ? ` → ${selected.toUpperCase()}` : ""}
      </Button>
      <DownloadBar locale={locale} blob={result?.blob ?? null} name={result?.name ?? ""} />
    </div>
  );
}

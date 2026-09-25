import Link from "next/link";
import type { ToolDefinition } from "@/data/schema";
import { t } from "@/i18n/messages";
import { FormatPath, FormatBadges } from "@/components/format-badges";
import { formatBytes } from "@/lib/format";
import { copyForTool, toolById } from "@/lib/registry";

const PDF_JOBS = ["merge-pdf", "split-pdf", "rotate-pdf", "images-to-pdf", "extract-pdf-pages", "compress-pdf"];
const IMAGE_JOBS = ["convert-image", "compress-image", "resize-image", "images-to-pdf"];

export function convertPathFor(tool: ToolDefinition): { from: string[]; to: string[] } {
  if (tool.id === "images-to-pdf") return { from: ["JPG", "PNG", "WebP"], to: ["PDF"] };
  if (tool.id === "convert-image") return { from: ["JPG", "PNG", "WebP"], to: ["JPG", "PNG", "WebP"] };
  if (tool.category === "pdf-documents") return { from: ["PDF"], to: ["PDF"] };
  if (tool.category === "images") {
    const labels = [...new Set(tool.supportedFormats.map((f) => (f === "jpeg" ? "JPG" : f.toUpperCase())))];
    return { from: labels, to: labels };
  }
  return { from: tool.supportedFormats, to: tool.outputTypes };
}

export function ToolBriefing({ tool, locale }: { tool: ToolDefinition; locale: string }) {
  const ui = t(locale);
  const path = convertPathFor(tool);
  const family = tool.category === "pdf-documents" ? PDF_JOBS : tool.category === "images" ? IMAGE_JOBS : [];
  return (
    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">{ui.howItWorksLead}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <FormatPath from={path.from} to={path.to} />
        {tool.maxFileSize > 0 ? (
          <p className="text-xs text-muted-foreground">
            {ui.sizeLimit} {formatBytes(locale, tool.maxFileSize)}
          </p>
        ) : null}
      </div>
      <ol className="mt-3 grid gap-1 text-sm font-medium sm:grid-cols-3">
        <li>{ui.stepFiles}</li>
        <li>{ui.stepRun}</li>
        <li>{ui.stepSave}</li>
      </ol>
      {tool.category === "pdf-documents" ? (
        <p className="mt-3 text-xs text-muted-foreground">{ui.noWordExport}</p>
      ) : null}
      {family.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {tool.category === "pdf-documents" ? ui.pdfFamily : ui.imageFamily}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {family.map((id) => {
              const item = toolById(id);
              if (!item) return null;
              const name = copyForTool(item, locale).name;
              return (
                <li key={id}>
                  <Link
                    href={`/${locale}/tools/${copyForTool(item, locale).slug}`}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                      id === tool.id
                        ? "border-primary bg-card text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-3">
          <FormatBadges formats={tool.supportedFormats} />
        </div>
      )}
    </div>
  );
}

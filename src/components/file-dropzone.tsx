"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormatBadges } from "@/components/format-badges";
import { t } from "@/i18n/messages";
import { formatBytes } from "@/lib/format";

export function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function FileDropzone({
  locale,
  toolId,
  accept,
  multiple,
  files,
  onFiles,
  formats,
  maxBytes,
  onSelected,
}: {
  locale: string;
  toolId: string;
  accept: string;
  multiple: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
  formats: string[];
  maxBytes: number;
  onSelected?: () => void;
}) {
  const ui = t(locale);
  const inputRef = useRef<HTMLInputElement>(null);

  function take(list: File[]) {
    const next = multiple ? list : list.slice(0, 1);
    onFiles(next);
    if (next.length) onSelected?.();
  }

  return (
    <div className="grid gap-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          take([...e.dataTransfer.files]);
        }}
        className="rounded-2xl border-2 border-dashed border-primary/50 bg-accent/50 px-4 py-7 text-center shadow-inner outline-none ring-primary focus-visible:ring-2"
      >
        <p className="text-base font-semibold text-foreground">{ui.dropHint}</p>
        <p className="mt-1 text-sm text-muted-foreground">{ui.dropFiles}</p>
        <Button
          type="button"
          className="mt-4"
          size="lg"
          onClick={() => inputRef.current?.click()}
        >
          {ui.chooseFiles}
        </Button>
        <input
          id={`files-${toolId}`}
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => take([...(e.target.files ?? [])])}
        />
        <div className="mt-4 flex justify-center">
          <FormatBadges formats={formats} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {ui.sizeLimit} {formatBytes(locale, maxBytes)}
        </p>
      </div>
      {files.length ? (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {ui.statusSelected} · {files.length}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => onFiles([])}>
              {ui.clearAll}
            </Button>
          </div>
          <ul className="grid gap-2">
            {files.map((file, i) => (
              <li key={`${file.name}-${file.size}-${i}`} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span className="min-w-0 truncate font-medium">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(locale, file.size)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={ui.removeFile}
                  onClick={() => onFiles(files.filter((_, idx) => idx !== i))}
                >
                  {ui.removeFile}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function DownloadBar({
  locale,
  blob,
  name,
}: {
  locale: string;
  blob: Blob | null;
  name: string;
}) {
  const ui = t(locale);
  if (!blob) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-900">{ui.done}</p>
      <Button type="button" size="lg" className="mt-3 w-full" onClick={() => triggerDownload(blob, name)}>
        {ui.downloadResult}
      </Button>
      <p className="mt-2 truncate text-xs text-emerald-800">{name}</p>
    </div>
  );
}

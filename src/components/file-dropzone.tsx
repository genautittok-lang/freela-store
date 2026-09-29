"use client";

import { useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatBadges } from "@/components/format-badges";
import { ProcessingStatus, ProgressBar } from "@/components/tool-progress";
import { useToolRun } from "@/components/tool-run-context";
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

export type DropzonePhase = "idle" | "selected" | "processing" | "done" | "error";

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
  busy: busyProp,
  progress,
  progressLabel,
  disabled,
  onCancel,
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
  busy?: boolean;
  /** 0–1 progress while reading/encoding/image work. */
  progress?: number | null;
  progressLabel?: string;
  disabled?: boolean;
  onCancel?: () => void;
}) {
  const ui = t(locale);
  const { busy: ctxBusy } = useToolRun();
  const busy = busyProp ?? ctxBusy;
  const locked = Boolean(disabled || busy);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function take(list: File[]) {
    if (locked) return;
    const next = multiple ? list : list.slice(0, 1);
    onFiles(next);
    if (next.length) onSelected?.();
  }

  const phase: DropzonePhase = busy
    ? "processing"
    : files.length
      ? "selected"
      : "idle";

  const statusLabel =
    phase === "processing"
      ? progressLabel || ui.statusProcessing
      : phase === "selected"
        ? `${ui.statusSelected} · ${files.length}`
        : ui.dropHint;

  return (
    <div className="grid min-w-0 gap-3">
      <div
        role="button"
        tabIndex={locked ? -1 : 0}
        aria-disabled={locked}
        aria-busy={busy || undefined}
        onKeyDown={(e) => {
          if (locked) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!locked) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = locked ? "none" : "copy";
          if (!locked) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          take([...e.dataTransfer.files]);
        }}
        className={`relative min-w-0 overflow-hidden rounded-2xl border-2 border-dashed px-3 py-8 text-center shadow-inner outline-none transition-colors ring-primary focus-visible:ring-2 sm:px-4 sm:py-12 ${
          dragging
            ? "border-primary bg-primary/10"
            : busy
              ? "border-primary/60 bg-accent/70"
              : "border-primary/50 bg-accent/50"
        } ${locked && !busy ? "opacity-70" : ""}`}
      >
        {busy ? (
          <div className="pointer-events-none absolute inset-0 bg-background/35 backdrop-blur-[1px]" aria-hidden />
        ) : null}
        <div className="relative z-[1] grid gap-2">
          <p className="text-base font-semibold text-foreground sm:text-lg">{statusLabel}</p>
          {phase === "idle" ? (
            <p className="text-sm text-muted-foreground sm:text-base">
              {dragging ? ui.dragActive : ui.dropFiles}
            </p>
          ) : null}
          {busy ? (
            <div className="mx-auto flex max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
              <span>{progressLabel || ui.processing}</span>
            </div>
          ) : (
            <Button
              type="button"
              className="mx-auto mt-3 min-h-12 px-8 text-base"
              size="lg"
              disabled={locked}
              onClick={() => inputRef.current?.click()}
            >
              {ui.chooseFiles}
            </Button>
          )}
          <input
            id={`files-${toolId}`}
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={locked}
            className="sr-only"
            onChange={(e) => {
              take([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <div className="mt-3 flex max-w-full justify-center overflow-x-auto px-1">
            <FormatBadges formats={formats} locale={locale} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {ui.sizeLimit} {formatBytes(locale, maxBytes)}
          </p>
        </div>
      </div>

      {busy ? (
        <ProcessingStatus
          label={progressLabel || ui.processing}
          progress={typeof progress === "number" ? progress : null}
        />
      ) : typeof progress === "number" && progress > 0 && progress < 1 ? (
        <div className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3">
          <ProgressBar value={progress} label={progressLabel || ui.processing} />
        </div>
      ) : null}

      {files.length ? (
        <div className="min-w-0 rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {ui.statusSelected} · {files.length}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {busy && onCancel ? (
                <Button type="button" variant="outline" size="sm" className="min-h-10" onClick={onCancel}>
                  {ui.cancel}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-10"
                disabled={locked}
                onClick={() => onFiles([])}
              >
                {ui.clearAll}
              </Button>
            </div>
          </div>
          <ul className="grid gap-2">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${file.size}-${i}`}
                className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm sm:gap-3"
              >
                <span className="min-w-0 flex-1 truncate font-medium" title={file.name}>
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(locale, file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 shrink-0 p-0 sm:h-8 sm:w-auto sm:px-2"
                  disabled={locked}
                  aria-label={ui.removeFile}
                  onClick={() => onFiles(files.filter((_, idx) => idx !== i))}
                >
                  <X className="h-4 w-4 sm:hidden" aria-hidden />
                  <span className="hidden sm:inline">{ui.removeFile}</span>
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
    <div className="min-w-0 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <p className="text-sm font-medium text-primary">{ui.done}</p>
      <Button type="button" size="lg" className="mt-3 min-h-12 w-full" onClick={() => triggerDownload(blob, name)}>
        {ui.downloadResult}
      </Button>
      <p className="mt-2 truncate text-xs text-muted-foreground" title={name}>
        {name}
      </p>
    </div>
  );
}

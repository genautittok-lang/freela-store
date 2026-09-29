"use client";

import { Loader2 } from "lucide-react";

/** Shared percent bar used by media, converters, and file tools. */
export function ProgressBar({
  value,
  label,
  className = "",
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={`grid gap-1.5 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 tabular-nums text-foreground">{pct}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

/** Visible processing chrome — spinner and/or percent — that never collapses layout. */
export function ProcessingStatus({
  label,
  progress,
  className = "",
}: {
  label: string;
  progress?: number | null;
  className?: string;
}) {
  const showBar = typeof progress === "number" && progress >= 0;
  return (
    <div
      className={`grid gap-3 rounded-2xl border border-primary/25 bg-accent/60 px-4 py-3 shadow-sm ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
        <span className="min-w-0">{label}</span>
      </div>
      {showBar ? <ProgressBar value={progress} label={label} /> : null}
    </div>
  );
}

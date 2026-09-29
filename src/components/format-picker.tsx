"use client";

import { FormatMark, FormatPath } from "@/components/format-badges";
import { t } from "@/i18n/messages";

export type FormatOption<T extends string = string> = {
  value: T;
  label: string;
  /** Glyph key for FormatMark (defaults to label). */
  mark?: string;
};

type FormatPickerProps<T extends string> = {
  locale: string;
  value: T;
  options: readonly FormatOption<T>[];
  onChange: (next: T) => void;
  /** Optional from→to preview sources shown above the chips. */
  fromFormats?: string[];
  label?: string;
  className?: string;
};

/** Interactive from→to format chips shared by convert tools. */
export function FormatPicker<T extends string>({
  locale,
  value,
  options,
  onChange,
  fromFormats,
  label,
  className = "",
}: FormatPickerProps<T>) {
  const ui = t(locale);
  const heading = label ?? ui.chooseOutput;
  const selected = options.find((o) => o.value === value);
  const toLabel = selected?.label ?? value;

  return (
    <fieldset className={`rounded-xl border border-border p-3 ${className}`.trim()}>
      <legend className="px-1 text-sm font-medium">{heading}</legend>
      {fromFormats?.length ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{ui.fromLabel}</span>
          <FormatPath from={fromFormats} to={[toLabel]} />
        </div>
      ) : (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{ui.toLabel}</span>
          <FormatMark format={toLabel} size="sm" />
        </div>
      )}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={heading}>
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={on}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                on ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background hover:border-primary/50"
              }`}
              onClick={() => onChange(opt.value)}
            >
              <FormatMark format={opt.mark ?? opt.label} size="sm" />
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Read-only output confirmation chip for single-target converters. */
export function FormatOutputConfirm({
  locale,
  format,
  fromFormats,
}: {
  locale: string;
  format: string;
  fromFormats?: string[];
}) {
  const ui = t(locale);
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-sm font-medium">{ui.chooseOutput}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {fromFormats?.length ? (
          <FormatPath from={fromFormats} to={[format]} />
        ) : (
          <>
            <span className="text-sm text-muted-foreground">{ui.toLabel}</span>
            <FormatMark format={format} size="sm" />
          </>
        )}
      </div>
    </div>
  );
}

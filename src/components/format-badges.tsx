const MARK: Record<string, { label: string; bg: string; fg: string }> = {
  pdf: { label: "PDF", bg: "#c2410c", fg: "#fff7ed" },
  doc: { label: "Word", bg: "#1d4ed8", fg: "#eff6ff" },
  docx: { label: "Word", bg: "#1d4ed8", fg: "#eff6ff" },
  word: { label: "Word", bg: "#1d4ed8", fg: "#eff6ff" },
  png: { label: "PNG", bg: "#0f766e", fg: "#f0fdfa" },
  jpg: { label: "JPG", bg: "#a16207", fg: "#fffbeb" },
  jpeg: { label: "JPG", bg: "#a16207", fg: "#fffbeb" },
  webp: { label: "WebP", bg: "#5b21b6", fg: "#f5f3ff" },
  gif: { label: "GIF", bg: "#be185d", fg: "#fdf2f8" },
  svg: { label: "SVG", bg: "#0f766e", fg: "#ecfeff" },
  json: { label: "JSON", bg: "#334155", fg: "#f8fafc" },
  xml: { label: "XML", bg: "#1e3a8a", fg: "#eff6ff" },
  csv: { label: "CSV", bg: "#166534", fg: "#f0fdf4" },
  ics: { label: "ICS", bg: "#9a3412", fg: "#fff7ed" },
};

function normalize(format: string) {
  return format.replace("image/", "").replace("application/", "").toLowerCase();
}

export function formatLabel(format: string) {
  const key = normalize(format);
  return MARK[key]?.label ?? format.replace("jpeg", "JPG").toUpperCase();
}

/** Original Freela color chips — not third-party corporate logos. */
export function FormatMark({ format, size = "md" }: { format: string; size?: "sm" | "md" }) {
  const key = normalize(format);
  const mark = MARK[key] ?? { label: formatLabel(format).slice(0, 4), bg: "#157a45", fg: "#f4fff8" };
  const dim = size === "sm" ? "h-6 min-w-6 px-1 text-[9px]" : "h-7 min-w-7 px-1.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-bold tracking-wide ${dim}`}
      style={{ background: mark.bg, color: mark.fg }}
      title={mark.label}
    >
      {mark.label}
    </span>
  );
}

export function FormatBadges({ formats }: { formats: string[] }) {
  const unique = [...new Set(formats.map((f) => formatLabel(f)))];
  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Supported formats">
      {unique.map((label) => (
        <li key={label}>
          <FormatMark format={label} />
        </li>
      ))}
    </ul>
  );
}

export function FormatPath({ from, to }: { from: string[]; to: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {from.map((f) => (
        <FormatMark key={`f-${f}`} format={f} />
      ))}
      <span className="text-sm font-semibold text-muted-foreground" aria-hidden>
        →
      </span>
      {to.map((f) => (
        <FormatMark key={`t-${f}`} format={f} />
      ))}
    </div>
  );
}

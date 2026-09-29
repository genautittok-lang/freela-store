import { FormatGlyph } from "@/components/brand-icons";
import { t } from "@/i18n/messages";

const MARK: Record<string, { label: string; bg: string; fg: string }> = {
  pdf: { label: "PDF", bg: "#157a45", fg: "#f4fff8" },
  doc: { label: "DOC", bg: "#1f9a57", fg: "#f4fff8" },
  docx: { label: "DOC", bg: "#1f9a57", fg: "#f4fff8" },
  word: { label: "DOC", bg: "#1f9a57", fg: "#f4fff8" },
  png: { label: "PNG", bg: "#0f5c34", fg: "#f4fff8" },
  jpg: { label: "JPG", bg: "#163624", fg: "#f4fff8" },
  jpeg: { label: "JPG", bg: "#163624", fg: "#f4fff8" },
  webp: { label: "WebP", bg: "#157a45", fg: "#f4fff8" },
  gif: { label: "GIF", bg: "#1f9a57", fg: "#f4fff8" },
  svg: { label: "SVG", bg: "#0f5c34", fg: "#f4fff8" },
  avif: { label: "AVIF", bg: "#0f5c34", fg: "#f4fff8" },
  mp3: { label: "MP3", bg: "#157a45", fg: "#f4fff8" },
  wav: { label: "WAV", bg: "#1f9a57", fg: "#f4fff8" },
  ogg: { label: "OGG", bg: "#0f5c34", fg: "#f4fff8" },
  aac: { label: "AAC", bg: "#163624", fg: "#f4fff8" },
  flac: { label: "FLAC", bg: "#157a45", fg: "#f4fff8" },
  mp4: { label: "MP4", bg: "#157a45", fg: "#f4fff8" },
  webm: { label: "WebM", bg: "#1f9a57", fg: "#f4fff8" },
  video: { label: "VIDEO", bg: "#0f5c34", fg: "#f4fff8" },
  audio: { label: "AUDIO", bg: "#163624", fg: "#f4fff8" },
  json: { label: "JSON", bg: "#14221a", fg: "#d8f3e3" },
  xml: { label: "XML", bg: "#14221a", fg: "#d8f3e3" },
  csv: { label: "CSV", bg: "#157a45", fg: "#f4fff8" },
  ics: { label: "ICS", bg: "#1f9a57", fg: "#f4fff8" },
};

function normalize(format: string) {
  return format.replace("image/", "").replace("application/", "").toLowerCase();
}

export function formatLabel(format: string) {
  const key = normalize(format);
  return MARK[key]?.label ?? format.replace("jpeg", "JPG").toUpperCase();
}

/** Original Freela format chips — mint/green tiles, not third-party trademarks. */
export function FormatMark({ format, size = "md" }: { format: string; size?: "sm" | "md" }) {
  const key = normalize(format);
  const mark = MARK[key] ?? { label: formatLabel(format).slice(0, 4), bg: "#157a45", fg: "#f4fff8" };
  const dim = size === "sm" ? "h-7" : "h-8";
  return (
    <span className={`inline-flex items-center gap-1.5 ${dim}`} title={mark.label}>
      <FormatGlyph format={format} className={size === "sm" ? "h-7 w-7" : "h-8 w-8"} />
      <span
        className="inline-flex h-6 items-center rounded-md px-1.5 text-[10px] font-bold tracking-wide"
        style={{ background: mark.bg, color: mark.fg }}
      >
        {mark.label}
      </span>
    </span>
  );
}

export function FormatBadges({ formats, locale = "en" }: { formats: string[]; locale?: string }) {
  const unique = [...new Set(formats.map((f) => formatLabel(f)))];
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label={t(locale).formats}>
      {unique.map((fmt) => (
        <li key={fmt}>
          <FormatMark format={fmt} />
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
      <span className="text-sm font-semibold text-primary" aria-hidden>
        →
      </span>
      {to.map((f) => (
        <FormatMark key={`t-${f}`} format={f} />
      ))}
    </div>
  );
}

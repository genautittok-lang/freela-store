import { stickerSpec, type Motif } from "@/lib/sticker-spec";

const INK = [
  { bg: "#d8f3e3", fg: "#0f5c34", line: "#157a45" },
  { bg: "#157a45", fg: "#f4fff8", line: "#d8f3e3" },
  { bg: "#1f9a57", fg: "#f7fbf8", line: "#e7f6ec" },
  { bg: "#0e3d28", fg: "#d8f3e3", line: "#7dffb2" },
  { bg: "#e7f6ec", fg: "#157a45", line: "#0f5c34" },
  { bg: "#123524", fg: "#f4fff8", line: "#8ee4b0" },
] as const;

function MotifMark({ motif, fg }: { motif: Motif; fg: string }) {
  switch (motif) {
    case "pages":
      return (
        <g fill={fg}>
          <rect x="10" y="16" width="16" height="22" rx="2" opacity="0.45" />
          <rect x="16" y="12" width="16" height="22" rx="2" />
        </g>
      );
    case "split":
      return (
        <g fill={fg}>
          <path d="M14 12h14a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H14V12z" />
          <path d="M22 12v26" stroke="#f7fbf8" strokeWidth="1.6" />
        </g>
      );
    case "rotate":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
          <path d="M22 16a10 10 0 1 1-6 2" />
          <path d="M16 12v6h6" />
        </g>
      );
    case "squeeze":
      return (
        <g fill={fg}>
          <path d="M12 24h8l-3-4v8l3-4z" />
          <path d="M40 24h-8l3-4v8l-3-4z" />
          <rect x="22" y="18" width="8" height="12" rx="2" />
        </g>
      );
    case "crop":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
          <path d="M14 20V14h6M38 20V14h-6M14 32v6h6M38 32v6h-6" />
        </g>
      );
    case "frame":
      return (
        <g fill={fg}>
          <rect x="14" y="14" width="24" height="20" rx="2" fill="none" stroke={fg} strokeWidth="2" />
          <circle cx="14" cy="14" r="2" />
          <circle cx="38" cy="34" r="2" />
        </g>
      );
    case "image":
      return (
        <g fill={fg}>
          <rect x="12" y="14" width="28" height="22" rx="3" fill="none" stroke={fg} strokeWidth="2" />
          <circle cx="20" cy="21" r="2.2" />
          <path d="M14 32l8-8 6 5 4-3 8 6H14z" />
        </g>
      );
    case "grid":
      return (
        <g fill={fg}>
          <rect x="14" y="14" width="8" height="8" rx="1.5" />
          <rect x="26" y="14" width="8" height="8" rx="1.5" opacity="0.7" />
          <rect x="14" y="26" width="8" height="8" rx="1.5" opacity="0.7" />
          <rect x="26" y="26" width="8" height="8" rx="1.5" />
        </g>
      );
    case "lock":
      return (
        <g fill={fg}>
          <rect x="16" y="24" width="20" height="14" rx="3" />
          <path d="M22 24v-4a6 6 0 0 1 12 0v4" fill="none" stroke={fg} strokeWidth="2.2" />
        </g>
      );
    case "qr":
      return (
        <g fill={fg}>
          <rect x="12" y="12" width="8" height="8" />
          <rect x="32" y="12" width="8" height="8" />
          <rect x="12" y="32" width="8" height="8" />
          <rect x="28" y="28" width="4" height="4" />
          <rect x="34" y="34" width="4" height="4" />
          <rect x="28" y="36" width="3" height="3" />
        </g>
      );
    case "swatch":
      return (
        <g fill={fg}>
          <circle cx="22" cy="26" r="8" opacity="0.55" />
          <circle cx="32" cy="22" r="8" />
        </g>
      );
    case "braces":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
          <path d="M22 14c-4 0-5 3-5 6s2 4-2 6 2 6 2 6 1 6 5 6" />
          <path d="M30 14c4 0 5 3 5 6s-2 4 2 6-2 6-2 6-1 6-5 6" />
        </g>
      );
    case "code":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16l-8 10 8 10" />
          <path d="M30 16l8 10-8 10" />
        </g>
      );
    case "hash":
      return (
        <g stroke={fg} strokeWidth="2.4" strokeLinecap="round">
          <path d="M20 14v24M32 14v24M14 22h24M14 30h24" />
        </g>
      );
    case "link":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 30l-2 2a6 6 0 0 1 0-8l6-6a6 6 0 0 1 8 8" />
          <path d="M34 22l2-2a6 6 0 0 1 0 8l-6 6a6 6 0 0 1-8-8" />
        </g>
      );
    case "clock":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="26" cy="26" r="11" />
          <path d="M26 18v8l5 3" />
        </g>
      );
    case "calc":
      return (
        <g fill={fg}>
          <rect x="14" y="12" width="24" height="28" rx="3" fill="none" stroke={fg} strokeWidth="2" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={20 + c * 6} cy={24 + r * 5} r="1.3" />),
          )}
        </g>
      );
    case "text":
      return (
        <g fill={fg}>
          <rect x="14" y="16" width="22" height="2.4" rx="1" />
          <rect x="14" y="22" width="16" height="2.4" rx="1" opacity="0.75" />
          <rect x="14" y="28" width="20" height="2.4" rx="1" opacity="0.55" />
        </g>
      );
    case "check":
      return (
        <g fill="none" stroke={fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="26" cy="26" r="11" />
          <path d="M20 26l4 4 8-9" />
        </g>
      );
    case "spark":
      return <path fill={fg} d="M26 12l2.2 8.2L36 22l-7.8 1.8L26 32l-2.2-8.2L16 22l7.8-1.8z" />;
    case "table":
      return (
        <g fill={fg}>
          <rect x="12" y="14" width="28" height="22" rx="2" fill="none" stroke={fg} strokeWidth="2" />
          <path d="M12 22h28M12 28h28M22 14v22" stroke={fg} strokeWidth="1.6" />
        </g>
      );
    case "mail":
      return (
        <g fill="none" stroke={fg} strokeWidth="2" strokeLinejoin="round">
          <rect x="12" y="16" width="28" height="18" rx="2" />
          <path d="M12 18l14 10L40 18" />
        </g>
      );
    case "globe":
      return (
        <g fill="none" stroke={fg} strokeWidth="1.8">
          <circle cx="26" cy="26" r="11" />
          <ellipse cx="26" cy="26" rx="5" ry="11" />
          <path d="M15 26h22M17 20h18M17 32h18" />
        </g>
      );
    case "list":
      return (
        <g fill={fg}>
          <circle cx="15" cy="18" r="1.6" />
          <circle cx="15" cy="26" r="1.6" />
          <circle cx="15" cy="34" r="1.6" />
          <rect x="20" y="16.5" width="16" height="2.4" rx="1" />
          <rect x="20" y="24.5" width="12" height="2.4" rx="1" />
          <rect x="20" y="32.5" width="14" height="2.4" rx="1" />
        </g>
      );
    case "percent":
      return (
        <g fill={fg}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="34" cy="34" r="3" />
          <path d="M34 16L18 36" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case "key":
      return (
        <g fill={fg}>
          <circle cx="20" cy="24" r="6" fill="none" stroke={fg} strokeWidth="2.2" />
          <path d="M25 24h12l-3 3M34 24l-3-3" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case "eye":
      return (
        <g fill="none" stroke={fg} strokeWidth="2">
          <path d="M10 26s6-8 16-8 16 8 16 8-6 8-16 8-16-8-16-8z" />
          <circle cx="26" cy="26" r="3.2" fill={fg} stroke="none" />
        </g>
      );
    case "wave":
      return (
        <path
          d="M10 28c4-8 8-8 12 0s8 8 12 0 8-8 12 0"
          fill="none"
          stroke={fg}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

function Badge({ kind, fg }: { kind: number; fg: string }) {
  const common = { fill: fg };
  switch (kind) {
    case 0:
      return <circle cx="46" cy="16" r="3" {...common} />;
    case 1:
      return <rect x="43" y="13" width="6" height="6" rx="1" {...common} />;
    case 2:
      return <path d="M46 12l3 6-3 6-3-6z" {...common} />;
    case 3:
      return <path d="M43 16h6M46 13v6" stroke={fg} strokeWidth="1.8" strokeLinecap="round" />;
    case 4:
      return <circle cx="46" cy="16" r="3" fill="none" stroke={fg} strokeWidth="1.6" />;
    case 5:
      return <path d="M43 18l3-6 3 6z" {...common} />;
    case 6:
      return <rect x="43.5" y="13.5" width="5" height="5" transform="rotate(45 46 16)" {...common} />;
    default:
      return <path d="M46 12.5l1 2.4h2.6l-2 1.6.8 2.5L46 18.4l-2.4 1.6.8-2.5-2-1.6H45z" {...common} />;
  }
}

export function ToolSticker({ id, className }: { id: string; className?: string }) {
  const spec = stickerSpec(id);
  const tone = INK[spec.ink];
  const grad = `sticker-${id.replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={grad} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor={tone.bg} />
          <stop offset="1" stopColor={tone.bg} />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="16" fill={`url(#${grad})`} />
      <rect x="3" y="3" width="58" height="58" rx="16" fill={tone.bg} fillOpacity="0.92" />
      <path d="M44 5.5h14.5V20C52 20 44 12 44 5.5z" fill="#ffffff" fillOpacity="0.55" />
      <rect x="5.5" y="5.5" width="53" height="53" rx="14" fill="none" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="1.4" />
      <MotifMark motif={spec.motif} fg={tone.fg} />
      <Badge kind={spec.badge} fg={tone.line} />
      {spec.pips.map((cell) => {
        const col = cell % 4;
        const row = Math.floor(cell / 4);
        return <circle key={cell} cx={46 + col * 3.3} cy={44 + row * 3.3} r="1.15" fill={tone.line} />;
      })}
    </svg>
  );
}

import { stickerSpec, type Motif } from "@/lib/sticker-spec";

const INK = [
  { bg: "#e7f6ec", fg: "#0f5c34", chip: "#157a45" },
  { bg: "#157a45", fg: "#f4fff8", chip: "#d8f3e3" },
  { bg: "#0e3d28", fg: "#e7f6ec", chip: "#7dffb2" },
  { bg: "#d8f3e3", fg: "#0f5c34", chip: "#1f9a57" },
] as const;

function Icon({ motif, fg }: { motif: Motif; fg: string }) {
  const common = { fill: "none" as const, stroke: fg, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (motif) {
    case "merge":
      return (
        <g fill={fg}>
          <rect x="4" y="8" width="12" height="16" rx="2" opacity="0.45" />
          <rect x="4" y="14" width="12" height="16" rx="2" />
          <path d="M20 18h8M24 14l4 4-4 4" fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="32" y="10" width="14" height="18" rx="2" />
        </g>
      );
    case "split":
      return (
        <g fill={fg}>
          <rect x="16" y="8" width="16" height="20" rx="2" />
          <path d="M24 8v20" stroke="#f7fbf8" strokeWidth="2" />
          <path d="M8 18l6-4v8zM40 18l-6-4v8z" />
        </g>
      );
    case "rotate":
      return (
        <g {...common}>
          <path d="M30 10a12 12 0 1 1-8 3" />
          <path d="M18 8v8h8" />
        </g>
      );
    case "squeeze":
      return (
        <g fill={fg}>
          <path d="M4 18h10l-4-5v10z" />
          <path d="M44 18H34l4-5v10z" />
          <rect x="18" y="10" width="12" height="16" rx="2" />
        </g>
      );
    case "crop":
      return (
        <g {...common}>
          <path d="M10 16V10h6M38 16V10h-6M10 24v6h6M38 24v6h-6" />
        </g>
      );
    case "frame":
      return (
        <g {...common}>
          <rect x="10" y="8" width="28" height="22" rx="3" />
          <path d="M10 8l6 6M38 8l-6 6M10 30l6-6M38 30l-6-6" />
        </g>
      );
    case "image":
      return (
        <g fill={fg}>
          <rect x="8" y="8" width="32" height="22" rx="3" fill="none" stroke={fg} strokeWidth="2.2" />
          <circle cx="16" cy="15" r="2.4" />
          <path d="M10 27l8-8 6 5 4-3 10 6H10z" />
        </g>
      );
    case "grid":
      return (
        <g fill={fg}>
          <rect x="8" y="8" width="10" height="10" rx="2" />
          <rect x="22" y="8" width="10" height="10" rx="2" opacity="0.7" />
          <rect x="8" y="22" width="10" height="10" rx="2" opacity="0.7" />
          <rect x="22" y="22" width="10" height="10" rx="2" />
        </g>
      );
    case "lock":
      return (
        <g fill={fg}>
          <rect x="14" y="16" width="20" height="14" rx="3" />
          <path d="M18 16v-4a6 6 0 0 1 12 0v4" fill="none" stroke={fg} strokeWidth="2.2" />
        </g>
      );
    case "qr":
      return (
        <g fill={fg}>
          <rect x="8" y="6" width="10" height="10" />
          <rect x="30" y="6" width="10" height="10" />
          <rect x="8" y="24" width="10" height="10" />
          <rect x="26" y="22" width="5" height="5" />
          <rect x="34" y="30" width="5" height="5" />
        </g>
      );
    case "barcode":
      return (
        <g fill={fg}>
          <rect x="8" y="8" width="3" height="22" />
          <rect x="14" y="8" width="1.5" height="22" />
          <rect x="18" y="8" width="4" height="22" />
          <rect x="25" y="8" width="2" height="22" />
          <rect x="30" y="8" width="5" height="22" />
          <rect x="38" y="8" width="2" height="22" />
        </g>
      );
    case "swatch":
      return (
        <g fill={fg}>
          <circle cx="18" cy="20" r="9" opacity="0.45" />
          <circle cx="30" cy="16" r="9" />
        </g>
      );
    case "braces":
      return (
        <g {...common}>
          <path d="M20 8c-5 0-6 4-6 7s3 4-2 6 2 6 2 6 1 7 6 7" />
          <path d="M28 8c5 0 6 4 6 7s-3 4 2 6-2 6-2 6-1 7-6 7" />
        </g>
      );
    case "code":
      return (
        <g {...common}>
          <path d="M18 10l-8 10 8 10M30 10l8 10-8 10" />
        </g>
      );
    case "hash":
      return (
        <g stroke={fg} strokeWidth="2.6" strokeLinecap="round">
          <path d="M18 8v24M30 8v24M10 16h28M10 26h28" />
        </g>
      );
    case "link":
      return (
        <g {...common}>
          <path d="M16 24l-2 2a6 6 0 0 1 0-8l6-6a6 6 0 0 1 8 8" />
          <path d="M32 16l2-2a6 6 0 0 1 0 8l-6 6a6 6 0 0 1-8-8" />
        </g>
      );
    case "clock":
      return (
        <g {...common}>
          <circle cx="24" cy="18" r="12" />
          <path d="M24 10v8l5 3" />
        </g>
      );
    case "calc":
      return (
        <g fill={fg}>
          <rect x="12" y="6" width="24" height="28" rx="3" fill="none" stroke={fg} strokeWidth="2" />
          <rect x="16" y="10" width="16" height="5" rx="1" />
          <circle cx="18" cy="22" r="1.4" />
          <circle cx="24" cy="22" r="1.4" />
          <circle cx="30" cy="22" r="1.4" />
          <circle cx="18" cy="28" r="1.4" />
          <circle cx="24" cy="28" r="1.4" />
          <circle cx="30" cy="28" r="1.4" />
        </g>
      );
    case "text":
      return (
        <g fill={fg}>
          <rect x="10" y="10" width="26" height="3" rx="1" />
          <rect x="10" y="17" width="18" height="3" rx="1" opacity="0.75" />
          <rect x="10" y="24" width="22" height="3" rx="1" opacity="0.55" />
        </g>
      );
    case "count":
      return (
        <text x="24" y="28" textAnchor="middle" fill={fg} fontSize="18" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif">
          123
        </text>
      );
    case "check":
      return (
        <g {...common}>
          <circle cx="24" cy="18" r="12" />
          <path d="M17 18l4 4 9-10" />
        </g>
      );
    case "spark":
      return <path fill={fg} d="M24 6l2.4 8.2L34 16l-7.6 1.8L24 26l-2.4-8.2L14 16l7.6-1.8z" />;
    case "table":
      return (
        <g {...common}>
          <rect x="8" y="8" width="32" height="22" rx="2" />
          <path d="M8 16h32M8 23h32M20 8v22" />
        </g>
      );
    case "mail":
      return (
        <g {...common}>
          <rect x="8" y="10" width="32" height="18" rx="2" />
          <path d="M8 12l16 10L40 12" />
        </g>
      );
    case "globe":
      return (
        <g {...common}>
          <circle cx="24" cy="18" r="12" />
          <ellipse cx="24" cy="18" rx="5" ry="12" />
          <path d="M12 18h24" />
        </g>
      );
    case "list":
      return (
        <g fill={fg}>
          <circle cx="10" cy="12" r="2" />
          <circle cx="10" cy="20" r="2" />
          <circle cx="10" cy="28" r="2" />
          <rect x="16" y="10" width="20" height="3" rx="1" />
          <rect x="16" y="18" width="14" height="3" rx="1" />
          <rect x="16" y="26" width="18" height="3" rx="1" />
        </g>
      );
    case "percent":
      return (
        <g fill={fg}>
          <circle cx="14" cy="12" r="4" />
          <circle cx="34" cy="28" r="4" />
          <path d="M34 8L14 32" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "key":
      return (
        <g {...common}>
          <circle cx="16" cy="18" r="7" />
          <path d="M22 18h16l-4 4M34 18l-4-4" />
        </g>
      );
    case "eye":
      return (
        <g {...common}>
          <path d="M6 18s7-9 18-9 18 9 18 9-7 9-18 9S6 18 6 18z" />
          <circle cx="24" cy="18" r="4" fill={fg} stroke="none" />
        </g>
      );
    case "pages":
      return (
        <g fill={fg}>
          <rect x="14" y="6" width="22" height="28" rx="3" />
          <path d="M28 6v8h8" fill="#f4fff8" opacity="0.9" />
        </g>
      );
    case "swap":
      return (
        <g {...common}>
          <path d="M8 12h22" />
          <path d="M24 8l6 4-6 4" />
          <path d="M40 26H18" />
          <path d="M22 22l-6 4 6 4" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <circle cx="24" cy="18" r="10" />
        </g>
      );
  }
}

export function ToolSticker({ id, className }: { id: string; className?: string }) {
  const spec = stickerSpec(id);
  const tone = INK[spec.ink];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={tone.bg} />
      <path d="M44 4h16v14C52 18 44 12 44 4z" fill="#ffffff" fillOpacity="0.45" />
      <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />
      <g transform="translate(32,15) scale(0.62) translate(-24,-18)">
        <Icon motif={spec.motif} fg={tone.fg} />
      </g>
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fill={tone.fg}
        fontSize={spec.action.length > 6 ? 8 : spec.action.length > 4 ? 10 : 12}
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {spec.action}
      </text>
      <text
        x="32"
        y="58"
        textAnchor="middle"
        fill={tone.chip}
        fontSize={spec.object.length > 6 ? 7 : 9}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {spec.object}
      </text>
    </svg>
  );
}

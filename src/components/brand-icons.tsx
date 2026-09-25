import type { ReactNode, SVGProps } from "react";
import type { CategoryId } from "@/data/categories";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Svg({ title, children, className, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Original Freela document tile — not an Adobe mark. */
export function PdfMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="4" y="3" width="20" height="26" rx="3.5" fill="#157a45" />
      <path d="M17 3v6.5A2.5 2.5 0 0 0 19.5 12H24" fill="#0f5c34" />
      <path d="M17 3l7 9h-4.5A2.5 2.5 0 0 1 17 9.5V3z" fill="#d8f3e3" />
      <text x="14" y="22" textAnchor="middle" fill="#f4fff8" fontSize="7" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
        PDF
      </text>
    </Svg>
  );
}

/** Original Freela text-document tile — not a Microsoft Word logo. */
export function DocMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="5" y="3" width="22" height="26" rx="3.5" fill="#1f9a57" />
      <rect x="9" y="9" width="14" height="2" rx="1" fill="#f4fff8" />
      <rect x="9" y="14" width="11" height="2" rx="1" fill="#d8f3e3" />
      <rect x="9" y="19" width="13" height="2" rx="1" fill="#d8f3e3" />
    </Svg>
  );
}

export function ImageMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="3" y="5" width="26" height="22" rx="5" fill="#e7f6ec" stroke="#157a45" strokeWidth="1.6" />
      <circle cx="11" cy="12" r="2.4" fill="#1f9a57" />
      <path d="M6 23l7.5-8 5 5 3-3.5L26 23H6z" fill="#157a45" />
    </Svg>
  );
}

export function TextMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="4" y="4" width="24" height="24" rx="6" fill="#d8f3e3" />
      <text x="16" y="21" textAnchor="middle" fill="#157a45" fontSize="13" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Aa
      </text>
    </Svg>
  );
}

export function CodeMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="3" y="5" width="26" height="22" rx="5" fill="#14221a" />
      <path d="M12 11l-5 5 5 5" stroke="#7dffb2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 11l5 5-5 5" stroke="#d8f3e3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SeoMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <circle cx="14" cy="14" r="7.5" fill="#e7f6ec" stroke="#157a45" strokeWidth="2" />
      <path d="M19.5 19.5L26 26" stroke="#157a45" strokeWidth="3" strokeLinecap="round" />
      <path d="M11 14h6M14 11v6" stroke="#1f9a57" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function CalcMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="6" y="3" width="20" height="26" rx="4" fill="#157a45" />
      <rect x="9" y="6" width="14" height="5" rx="1.5" fill="#f4fff8" />
      <rect x="9" y="14" width="4" height="3.2" rx="0.8" fill="#d8f3e3" />
      <rect x="14" y="14" width="4" height="3.2" rx="0.8" fill="#d8f3e3" />
      <rect x="19" y="14" width="4" height="3.2" rx="0.8" fill="#d8f3e3" />
      <rect x="9" y="19.5" width="4" height="3.2" rx="0.8" fill="#d8f3e3" />
      <rect x="14" y="19.5" width="4" height="3.2" rx="0.8" fill="#d8f3e3" />
      <rect x="19" y="19.5" width="4" height="6.5" rx="0.8" fill="#7dffb2" />
    </Svg>
  );
}

export function ConvertMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="3" y="4" width="26" height="24" rx="6" fill="#e7f6ec" />
      <path d="M8 12h11l-3-3" stroke="#157a45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 20H13l3 3" stroke="#1f9a57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ColorMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <circle cx="12" cy="13" r="7" fill="#157a45" />
      <circle cx="20" cy="13" r="7" fill="#1f9a57" opacity="0.9" />
      <circle cx="16" cy="20" r="7" fill="#7dffb2" opacity="0.85" />
    </Svg>
  );
}

export function SparkMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="4" y="4" width="24" height="24" rx="8" fill="#d8f3e3" />
      <path d="M16 7l1.8 5.4H23l-4.4 3.2 1.7 5.4L16 18.8 11.7 21l1.7-5.4L9 12.4h5.2L16 7z" fill="#157a45" />
    </Svg>
  );
}

export function DateMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <Svg className={className} {...rest}>
      <rect x="4" y="6" width="24" height="22" rx="4" fill="#e7f6ec" stroke="#157a45" strokeWidth="1.7" />
      <rect x="4" y="6" width="24" height="6" rx="4" fill="#157a45" />
      <rect x="9" y="3.5" width="2.4" height="6" rx="1" fill="#0f5c34" />
      <rect x="20.6" y="3.5" width="2.4" height="6" rx="1" fill="#0f5c34" />
      <rect x="9" y="16" width="4" height="3.2" rx="0.7" fill="#1f9a57" />
      <rect x="14" y="16" width="4" height="3.2" rx="0.7" fill="#1f9a57" />
      <rect x="19" y="16" width="4" height="3.2" rx="0.7" fill="#7dffb2" />
    </Svg>
  );
}

export const brandCategoryIcons: Record<CategoryId, (props: IconProps) => ReactNode> = {
  "pdf-documents": (p) => <PdfMark {...p} />,
  images: (p) => <ImageMark {...p} />,
  text: (p) => <TextMark {...p} />,
  developer: (p) => <CodeMark {...p} />,
  seo: (p) => <SeoMark {...p} />,
  calculators: (p) => <CalcMark {...p} />,
  converters: (p) => <ConvertMark {...p} />,
  color: (p) => <ColorMark {...p} />,
  generators: (p) => <SparkMark {...p} />,
  "date-time": (p) => <DateMark {...p} />,
};

export function BrandCategoryIcon({ id, className = "h-8 w-8" }: { id: CategoryId; className?: string }) {
  const node = brandCategoryIcons[id];
  return <>{node({ className })}</>;
}

export function formatKind(format: string): "pdf" | "doc" | "img" | "json" | "code" | "other" {
  const k = format.replace("image/", "").replace("application/", "").toLowerCase();
  if (k.includes("pdf")) return "pdf";
  if (["doc", "docx", "word", "rtf", "odt"].includes(k)) return "doc";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"].includes(k)) return "img";
  if (k === "json") return "json";
  if (["xml", "yaml", "yml", "csv", "html"].includes(k)) return "code";
  return "other";
}

export function FormatGlyph({ format, className = "h-8 w-8" }: { format: string; className?: string }) {
  const kind = formatKind(format);
  if (kind === "pdf") return <PdfMark className={className} />;
  if (kind === "doc") return <DocMark className={className} />;
  if (kind === "img") return <ImageMark className={className} />;
  if (kind === "json" || kind === "code") return <CodeMark className={className} />;
  return <DocMark className={className} />;
}

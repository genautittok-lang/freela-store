import { ImageResponse } from "next/og";
import { isRoutedLocale, contentLocale, getLocale } from "@/data/locales";
import { categoryBySlug, toolBySlug, copyForTool, copyForCategory } from "@/lib/registry";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";

export const runtime = "edge";
export const alt = "Freela tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_TINT: Record<string, string> = {
  "pdf-documents": "#157A45",
  images: "#0F6B8F",
  text: "#5B4B8A",
  developer: "#1F5C99",
  seo: "#B45309",
  calculators: "#0F766E",
  converters: "#BE185D",
  color: "#7C3AED",
  generators: "#C2410C",
  "date-time": "#334155",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const safeLocale = isRoutedLocale(locale) ? locale : "en";
  const loc = getLocale(safeLocale);
  const ui = t(safeLocale);
  const tool = toolBySlug(safeLocale, slug);
  if (tool) {
    const copy = copyForTool(tool, safeLocale);
    const cat = categories.find((c) => c.id === tool.category);
    const tint = CATEGORY_TINT[tool.category] ?? "#157A45";
    const catName = cat ? copyForCategory(cat, safeLocale).name : "Freela";
    return renderCard({
      brand: "Freela",
      title: copy.name,
      subtitle: copy.h1 !== copy.name ? copy.h1 : catName,
      badge: catName,
      tint,
      localeLabel: loc ? `${loc.flag} ${loc.nativeName}` : safeLocale,
      dir: loc?.dir ?? "ltr",
      noUpload: ui.noUpload,
    });
  }
  const cat = categoryBySlug(safeLocale, slug);
  if (cat) {
    const copy = copyForCategory(cat, safeLocale);
    const tint = CATEGORY_TINT[cat.id] ?? "#157A45";
    return renderCard({
      brand: "Freela",
      title: copy.name,
      subtitle: copy.h1,
      badge: ui.tools,
      tint,
      localeLabel: loc ? `${loc.flag} ${loc.nativeName}` : safeLocale,
      dir: loc?.dir ?? "ltr",
      noUpload: ui.noUpload,
    });
  }
  return renderCard({
    brand: "Freela",
    title: ui.freeOnlineTools,
    subtitle: ui.filesStayDevice,
    badge: contentLocale(safeLocale),
    tint: "#157A45",
    localeLabel: loc ? `${loc.flag} ${loc.nativeName}` : safeLocale,
    dir: loc?.dir ?? "ltr",
    noUpload: ui.noUpload,
  });
}

function renderCard(opts: {
  brand: string;
  title: string;
  subtitle: string;
  badge: string;
  tint: string;
  localeLabel: string;
  dir: "ltr" | "rtl";
  noUpload: string;
}) {
  const title =
    opts.title.length > 64 ? `${opts.title.slice(0, 61).trimEnd()}…` : opts.title;
  const subtitle =
    opts.subtitle.length > 90 ? `${opts.subtitle.slice(0, 87).trimEnd()}…` : opts.subtitle;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: `linear-gradient(145deg, #0b1f14 0%, ${opts.tint} 48%, #f4faf6 48%, #ffffff 100%)`,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          direction: opts.dir,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#ffffff",
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              F
            </div>
            {opts.brand}
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.92)",
              color: "#0b1f14",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {opts.localeLabel}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(11,31,20,0.08)",
              color: opts.tint,
              fontSize: 22,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {opts.badge}
          </div>
          <div
            style={{
              display: "flex",
              color: "#0b1f14",
              fontSize: title.length > 40 ? 56 : 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", color: "#334155", fontSize: 28, lineHeight: 1.35, maxWidth: 900 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", color: "#475569", fontSize: 22 }}>freela.store · LOCAL_ONLY</div>
          <div
            style={{
              display: "flex",
              padding: "12px 20px",
              borderRadius: 14,
              background: opts.tint,
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {opts.noUpload}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

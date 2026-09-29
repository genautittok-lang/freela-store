export type QrEcc = "L" | "M" | "Q" | "H";

export type QrFrame = "none" | "rounded" | "badge" | "soft";

export type QrTemplateId =
  | "classic"
  | "forest"
  | "ink"
  | "sunset"
  | "ocean"
  | "mono"
  | "contrast"
  | "mint";

export type QrTemplate = {
  id: QrTemplateId;
  /** UiAdditions key for localized name */
  labelKey:
    | "qrTemplateClassic"
    | "qrTemplateForest"
    | "qrTemplateInk"
    | "qrTemplateSunset"
    | "qrTemplateOcean"
    | "qrTemplateMono"
    | "qrTemplateContrast"
    | "qrTemplateMint";
  dark: string;
  light: string;
  margin: number;
  width: number;
  errorCorrectionLevel: QrEcc;
  frame: QrFrame;
  /** Optional outer frame stroke (hex). */
  frameStroke?: string;
};

/** LOCAL_ONLY QR styles — colors / quiet zone / corner frame; no logo embeds. */
export const QR_TEMPLATES: readonly QrTemplate[] = [
  {
    id: "classic",
    labelKey: "qrTemplateClassic",
    dark: "#111111",
    light: "#ffffff",
    margin: 2,
    width: 360,
    errorCorrectionLevel: "M",
    frame: "none",
  },
  {
    id: "forest",
    labelKey: "qrTemplateForest",
    dark: "#157a45",
    light: "#f4fff8",
    margin: 2,
    width: 360,
    errorCorrectionLevel: "M",
    frame: "soft",
    frameStroke: "#157a45",
  },
  {
    id: "ink",
    labelKey: "qrTemplateInk",
    dark: "#14221a",
    light: "#ffffff",
    margin: 1,
    width: 380,
    errorCorrectionLevel: "Q",
    frame: "rounded",
    frameStroke: "#14221a",
  },
  {
    id: "sunset",
    labelKey: "qrTemplateSunset",
    dark: "#9a3412",
    light: "#fff7ed",
    margin: 2,
    width: 360,
    errorCorrectionLevel: "M",
    frame: "badge",
    frameStroke: "#c2410c",
  },
  {
    id: "ocean",
    labelKey: "qrTemplateOcean",
    dark: "#0e7490",
    light: "#ecfeff",
    margin: 2,
    width: 360,
    errorCorrectionLevel: "M",
    frame: "soft",
    frameStroke: "#0891b2",
  },
  {
    id: "mono",
    labelKey: "qrTemplateMono",
    dark: "#171717",
    light: "#f5f5f5",
    margin: 3,
    width: 340,
    errorCorrectionLevel: "L",
    frame: "none",
  },
  {
    id: "contrast",
    labelKey: "qrTemplateContrast",
    dark: "#ffffff",
    light: "#0a0a0a",
    margin: 2,
    width: 360,
    errorCorrectionLevel: "H",
    frame: "rounded",
    frameStroke: "#fafafa",
  },
  {
    id: "mint",
    labelKey: "qrTemplateMint",
    dark: "#0f5c34",
    light: "#d8f3e3",
    margin: 2,
    width: 360,
    errorCorrectionLevel: "Q",
    frame: "badge",
    frameStroke: "#157a45",
  },
] as const;

export function qrTemplateById(id: string): QrTemplate {
  return QR_TEMPLATES.find((t) => t.id === id) ?? QR_TEMPLATES[0]!;
}

/** Draw a framed QR PNG from a QR data URL (canvas-only, LOCAL_ONLY). */
export async function applyQrFrame(dataUrl: string, template: QrTemplate): Promise<string> {
  if (template.frame === "none") return dataUrl;

  const img = await loadImage(dataUrl);
  const pad = template.frame === "badge" ? 28 : template.frame === "rounded" ? 22 : 18;
  const size = img.width + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  const radius = template.frame === "badge" ? 28 : template.frame === "rounded" ? 20 : 14;
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = template.light;
  ctx.fill();

  if (template.frameStroke) {
    const inset = template.frame === "badge" ? 6 : 4;
    roundRect(ctx, inset, inset, size - inset * 2, size - inset * 2, Math.max(8, radius - 6));
    ctx.strokeStyle = template.frameStroke;
    ctx.lineWidth = template.frame === "badge" ? 4 : 3;
    ctx.stroke();
  }

  ctx.drawImage(img, pad, pad, img.width, img.height);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("QR preview failed"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

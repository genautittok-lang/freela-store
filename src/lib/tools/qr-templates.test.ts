import { describe, expect, it } from "vitest";
import { QR_TEMPLATES, qrTemplateById } from "@/lib/tools/qr-templates";

describe("qr templates", () => {
  it("exposes eight LOCAL_ONLY style presets", () => {
    expect(QR_TEMPLATES).toHaveLength(8);
    expect(new Set(QR_TEMPLATES.map((t) => t.id)).size).toBe(8);
    for (const tpl of QR_TEMPLATES) {
      expect(tpl.dark).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tpl.light).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(["L", "M", "Q", "H"]).toContain(tpl.errorCorrectionLevel);
      expect(["none", "rounded", "badge", "soft"]).toContain(tpl.frame);
    }
  });

  it("falls back to classic for unknown ids", () => {
    expect(qrTemplateById("missing").id).toBe("classic");
    expect(qrTemplateById("forest").id).toBe("forest");
  });
});

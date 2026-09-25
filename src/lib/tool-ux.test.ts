import { describe, expect, it } from "vitest";
import { toolRegistry } from "@/data/tools";
import { ACTION_LABEL_EN, actionLabel, uxFor } from "./tool-ux";
import { INITIAL_LOCALES } from "@/data/locales";

describe("tool UX contracts", () => {
  const published = toolRegistry.filter((t) => t.status === "published");

  it("covers every published tool with a specific action label", () => {
    expect(Object.keys(ACTION_LABEL_EN).sort()).toEqual(published.map((t) => t.id).sort());
    for (const tool of published) {
      const ux = uxFor(tool);
      expect(ux.actionLabel).not.toBe("Run");
      expect(ux.privacyMode).toBe("LOCAL_ONLY");
      expect(ux.hasExample).toBe(true);
    }
  });

  it("has localized copy and CTAs for every routed locale", () => {
    for (const tool of published) {
      expect(Object.keys(tool.copy).sort()).toEqual([...INITIAL_LOCALES].sort());
    }
    const merge = published.find((t) => t.id === "merge-pdf")!;
    expect(merge.copy.de.name).toMatch(/PDF/i);
    expect(merge.copy.de.name).not.toBe(merge.copy.en.name);
    expect(merge.copy.ar.name).toContain("دمج");
    expect(actionLabel(merge, "de")).toBe("PDFs zusammenführen");
    expect(actionLabel(merge, "ar")).toBe("دمج PDF");
  });
});

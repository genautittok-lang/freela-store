import { describe, expect, it } from "vitest";
import { toolRegistry } from "@/data/tools";
import { stickerFingerprint, stickerSpec } from "./sticker-spec";

describe("tool stickers", () => {
  it("gives every published tool a unique mark", () => {
    const ids = toolRegistry.filter((tool) => tool.status === "published").map((tool) => tool.id);
    const prints = ids.map(stickerFingerprint);
    expect(new Set(prints).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(300);
    const merge = stickerSpec("merge-pdf");
    const split = stickerSpec("split-pdf");
    const shrink = stickerSpec("compress-pdf");
    expect(merge.motif).toBe("merge");
    expect(merge.action).toBe("MERGE");
    expect(merge.object).toBe("PDF");
    expect(split.motif).toBe("split");
    expect(split.action).toBe("SPLIT");
    expect(shrink.motif).toBe("squeeze");
    expect(shrink.action).toBe("SHRINK");
    expect(shrink.object).toBe("PDF");
    expect(stickerSpec("compress-image").object).toBe("IMG");
    expect(stickerSpec("word-counter")).toMatchObject({ action: "WORDS", object: "COUNT" });
    const coded = new Set(["B64", "IPV4", "IPV6", "ROT13", "ROT47"]);
    for (const spec of ids.map(stickerSpec)) {
      expect(spec.action.length).toBeGreaterThan(1);
      expect(spec.object.length).toBeGreaterThan(1);
      if (!coded.has(spec.action)) expect(spec.action).not.toMatch(/^[A-Z]{1,4}[1-9]$/);
      if (!coded.has(spec.object)) expect(spec.object).not.toMatch(/^[A-Z]{1,4}[1-9]$/);
    }
    expect(stickerSpec("merge-pdf")).toEqual(merge);
  });
});
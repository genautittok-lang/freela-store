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
    expect(merge.motif).not.toBe(split.motif);
    expect(stickerSpec("merge-pdf")).toEqual(merge);
  });
});
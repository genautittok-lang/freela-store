import { describe, expect, it } from "vitest";
import { WAVE2_TOOL_IDS } from "@/data/tools/english-wave2";
import { toolRegistry } from "@/data/tools";
import { IMAGE_WAVE2, runWave2Async, runWave2Sync, WAVE2_SAMPLES } from "./wave2";

describe("wave 2 tools", () => {
  it("runs every text and pdf sample", async () => {
    expect(WAVE2_TOOL_IDS.length).toBeGreaterThanOrEqual(100);
    for (const id of WAVE2_TOOL_IDS) {
      if (IMAGE_WAVE2.has(id)) {
        await expect(runWave2Async(id, { text: "" })).rejects.toThrow(/browser canvas/);
        continue;
      }
      const out = await runWave2Async(id, WAVE2_SAMPLES[id] ?? { text: "" });
      expect(out.length, id).toBeGreaterThan(0);
    }
  });

  it("checks a few exact results", () => {
    expect(runWave2Sync("reverse-words", { text: "one two" })).toBe("two one");
    expect(runWave2Sync("iban-check", { text: "GB82WEST12345698765432" })).toBe("checksum ok");
    expect(runWave2Sync("isbn-check", { text: "9780306406157" })).toBe("ISBN-13 ok");
    expect(runWave2Sync("prime-factors", { text: "12" })).toBe("2 × 2 × 3");
    expect(runWave2Sync("cidr-contains", { text: "10.0.0.0/8", extra: "10.1.2.3" })).toBe("yes");
  });

  it("publishes 300+ unique local tools", () => {
    const published = toolRegistry.filter((t) => t.status === "published");
    const ids = published.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(published.length).toBeGreaterThanOrEqual(300);
    expect(published.every((t) => t.processingMode === "LOCAL_ONLY")).toBe(true);
    const wave2 = new Set<string>(WAVE2_TOOL_IDS);
    expect(published.filter((t) => wave2.has(t.id)).length).toBe(WAVE2_TOOL_IDS.length);
  });
});

import { describe, expect, it } from "vitest";
import { WAVE3_TOOL_IDS } from "@/data/tools/english-wave3";
import { toolRegistry } from "@/data/tools";
import { IMAGE_WAVE3, runWave3Async, runWave3Sync, WAVE3_SAMPLES } from "./wave3";

describe("wave 3 tools", () => {
  it("runs every text sample", async () => {
    expect(WAVE3_TOOL_IDS.length).toBeGreaterThanOrEqual(70);
    for (const id of WAVE3_TOOL_IDS) {
      if (IMAGE_WAVE3.has(id)) {
        await expect(runWave3Async(id, { text: "" })).rejects.toThrow(/browser canvas/);
        continue;
      }
      const out = await runWave3Async(id, WAVE3_SAMPLES[id] ?? { text: "" });
      expect(out.length, id).toBeGreaterThan(0);
    }
  });

  it("checks a few exact results", () => {
    expect(runWave3Sync("title-case", { text: "hello world" })).toBe("Hello World");
    expect(runWave3Sync("base32-encode", { text: "f" })).toBe("MY======");
    expect(runWave3Sync("json-to-csv", { text: '[{"a":1,"b":2}]' })).toBe("a,b\n1,2");
    expect(runWave3Sync("percent-change", { text: "100", extra: "150" })).toBe("50%");
    expect(runWave3Sync("add-weeks", { text: "2026-01-01", extra: "2" })).toBe("2026-01-15");
    expect(runWave3Sync("slug-ok", { text: "hello-world" })).toBe("ok");
  });

  it("publishes 400+ unique local tools", () => {
    const published = toolRegistry.filter((t) => t.status === "published");
    const ids = published.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(published.length).toBeGreaterThanOrEqual(400);
    expect(published.every((t) => t.processingMode === "LOCAL_ONLY")).toBe(true);
  });
});

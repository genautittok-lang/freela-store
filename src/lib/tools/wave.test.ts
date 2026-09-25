import { describe, expect, it } from "vitest";
import { WAVE_TOOL_IDS } from "@/data/tools/english-wave";
import { toolRegistry } from "@/data/tools";
import { runWave, runWaveAsync, WAVE_SAMPLES } from "./wave";

describe("wave tools", () => {
  it("has a sample and implementation for every wave id", async () => {
    expect(WAVE_TOOL_IDS.length).toBeGreaterThanOrEqual(90);
    for (const id of WAVE_TOOL_IDS) {
      expect(WAVE_SAMPLES[id], id).toBeTruthy();
      const out = await runWaveAsync(id, WAVE_SAMPLES[id]);
      expect(out.length, id).toBeGreaterThan(0);
    }
  });

  it("rejects empty input on reverse-text", () => {
    expect(() => runWave("reverse-text", { text: "  " })).toThrow(/Add some input/);
  });

  it("reverses text and redacts emails", () => {
    expect(runWave("reverse-text", { text: "ab" })).toBe("ba");
    expect(runWave("redact-emails", { text: "mail a@b.co please" })).toContain("[email]");
  });

  it("does not duplicate existing registry ids", () => {
    const published = toolRegistry.filter((t) => t.status === "published");
    const ids = published.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(published.length).toBeGreaterThanOrEqual(200);
    expect(published.every((t) => t.processingMode === "LOCAL_ONLY")).toBe(true);
  });
});

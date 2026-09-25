import { describe, expect, it } from "vitest";
import { toolRegistry } from "@/data/tools";
import { ACTION_LABEL_EN, uxFor } from "./tool-ux";

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
});

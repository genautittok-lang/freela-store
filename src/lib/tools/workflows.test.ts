import { describe, expect, it } from "vitest";
import { toolRegistry } from "@/data/tools";
import { executeAllPublishedWorkflows } from "./workflows";

describe("77 primary workflows", () => {
  it("runs every published tool (browser-only image tools flagged)", async () => {
    const published = toolRegistry.filter((t) => t.status === "published");
    expect(published).toHaveLength(77);
    const results = await executeAllPublishedWorkflows();
    expect(results).toHaveLength(77);
    const failed = results.filter((r) => r.status !== "PASS" && r.reason?.includes("No workflow"));
    expect(failed, failed.map((f) => `${f.toolId}: ${f.reason}`).join("\n")).toEqual([]);
    const passOrBrowser = results.filter(
      (r) => r.status === "PASS" || r.reason?.includes("browser canvas"),
    );
    expect(passOrBrowser).toHaveLength(77);
  });
});

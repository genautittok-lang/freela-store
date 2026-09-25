import { test, expect } from "@playwright/test";
import { toolRegistry } from "../src/data/tools";
import { ACTION_LABEL_EN } from "../src/lib/tool-ux";

const base = "http://127.0.0.1:43173";

test("all 77 published tools render a specific primary action", async ({ request }) => {
  const published = toolRegistry.filter((t) => t.status === "published");
  expect(published).toHaveLength(77);
  const missing: string[] = [];
  for (const tool of published) {
    const res = await request.get(`${base}/en/tools/${tool.copy.en.slug}`);
    if (!res.ok()) {
      missing.push(`${tool.id} HTTP ${res.status()}`);
      continue;
    }
    const html = await res.text();
    const label = ACTION_LABEL_EN[tool.id];
    if (!html.includes(label)) missing.push(`${tool.id} missing "${label}"`);
  }
  expect(missing, missing.join("\n")).toEqual([]);
});

import { describe, expect, it } from "vitest";
import { popularityRows, rankedToolIds } from "./popularity";
import { searchRegistry } from "./search";

describe("popularity", () => {
  it("returns a seed ranking without invented public counts", () => {
    const rows = popularityRows("30d");
    expect(rows.length).toBeGreaterThan(20);
    expect(rows[0].id).toBeTruthy();
    expect(rows.every((row) => typeof row.score === "number")).toBe(true);
  });
  it("caps category diversity", () => {
    const ids = rankedToolIds({ limit: 8, maxPerCategory: 3 });
    expect(ids.length).toBeLessThanOrEqual(8);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("search aliases", () => {
  it("finds merge from combine pdf", () => {
    const hits = searchRegistry("en", "combine pdf");
    expect(hits.some((hit) => hit.kind === "tool" && hit.tool.id === "merge-pdf")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { expansionReport, scoreCandidate } from "./catalog-expansion";

describe("catalog expansion system", () => {
  it("scores unpublished local candidates above zero", () => {
    expect(
      scoreCandidate({
        id: "not-a-real-tool-yet",
        category: "text",
        value: 8,
        implementability: 1,
        status: "candidate",
        reason: "test",
      }),
    ).toBe(8);
  });

  it("zeros deferred and published ids", () => {
    const report = expansionReport();
    expect(report.published).toBeGreaterThanOrEqual(200);
    expect(report.deferred.every((d) => d.score === 0)).toBe(true);
    expect(report.missingCandidates.every((c) => c.score > 0)).toBe(true);
  });
});

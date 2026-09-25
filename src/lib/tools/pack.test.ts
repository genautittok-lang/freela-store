import { describe, expect, it } from "vitest";
import {
  ageOn,
  amortize,
  compound,
  cronFrom,
  csvOrHtmlToMarkdown,
  detectKind,
  fuelCost,
  loremParagraphs,
  salaryFrom,
  socialCounts,
  stripTags,
  targetsFor,
  tipSplit,
} from "./pack";
import { buildIco } from "./ico";

describe("pack helpers", () => {
  it("splits a tip", () => {
    const r = tipSplit(100, 10, 2);
    expect(r.tip).toBe(10);
    expect(r.perPerson).toBe(55);
  });
  it("amortizes a loan", () => {
    expect(amortize(1200, 0, 1).payment).toBe(100);
  });
  it("compounds interest", () => {
    expect(compound(100, 0, 5, 1).amount).toBe(100);
  });
  it("converts salary", () => {
    expect(salaryFrom(10, 40, "hourly").yearly).toBe(20800);
  });
  it("costs fuel", () => {
    expect(fuelCost(100, 10, 2).cost).toBe(20);
  });
  it("ages a birthdate", () => {
    expect(ageOn("2000-01-01", "2026-01-01").years).toBe(26);
  });
  it("strips html and builds markdown tables", () => {
    expect(stripTags("<p>Hi &amp; you</p>")).toBe("Hi & you");
    expect(csvOrHtmlToMarkdown("a,b\n1,2")).toContain("| a | b |");
  });
  it("counts social limits and cron", () => {
    expect(socialCounts("abc")[0].used).toBe(3);
    expect(cronFrom("0", "1", "*", "*", "*")).toBe("0 1 * * *");
  });
  it("repeats lorem", () => {
    expect(loremParagraphs(2).split("\n\n")).toHaveLength(2);
  });
  it("detects realistic targets only", () => {
    expect(detectKind({ name: "a.pdf", type: "application/pdf" } as File)).toBe("pdf");
    expect(targetsFor("pdf").map((t) => t.id)).toEqual(["jpg", "png"]);
    expect(targetsFor("video")).toEqual([]);
    expect(targetsFor("unknown")).toEqual([]);
  });
  it("writes png-in-ico bytes", () => {
    const png = Uint8Array.from(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    );
    const ico = buildIco([png]);
    expect(ico[2]).toBe(1);
    expect(ico[4]).toBe(1);
  });
});

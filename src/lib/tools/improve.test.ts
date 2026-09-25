import { describe, expect, it } from "vitest";
import { buildUtm, markdownToPlain, parsePageList, randomIntegers } from "./improve";

describe("improve helpers", () => {
  it("builds UTM parameters", () => {
    expect(buildUtm("https://freela.store/en/", "news", "email", "spring")).toContain("utm_source=news");
  });
  it("rejects incomplete UTM", () => {
    expect(() => buildUtm("https://freela.store/en/", "news", "", "spring")).toThrow(/required/);
  });
  it("strips markdown", () => {
    expect(markdownToPlain("# Hi\n\n**bold**")).toContain("Hi");
  });
  it("parses page lists", () => {
    expect([...parsePageList("2-3", 5)].sort()).toEqual([2, 3]);
  });
  it("draws integers in range", () => {
    const nums = randomIntegers(3, 3, 4);
    expect(nums).toEqual([3, 3, 3, 3]);
  });
});

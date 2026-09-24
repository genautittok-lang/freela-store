import { describe, expect, it } from "vitest";
import { bmi, discountPrice, isWhatPercent, marginFrom, percentChange, percentageOf, vatBreakdown } from "./calc";
import { convertLength, convertTemperature, convertWeight, convertDataSize } from "./convert";
import { contrastRatio, hexToRgb, rgbToHex } from "./color";
import { slugify, countText, dedupeLines } from "./text";
import { formatJson, csvToJson } from "./dev";

describe("calculators", () => {
  it("percentage of", () => {
    expect(percentageOf(18, 240)).toBeCloseTo(43.2);
  });
  it("is what percent", () => {
    expect(isWhatPercent(25, 200)).toBe(12.5);
  });
  it("percent change", () => {
    expect(percentChange(80, 100)).toBe(25);
  });
  it("vat net to gross", () => {
    const v = vatBreakdown(100, 19, "net");
    expect(v.gross).toBeCloseTo(119);
  });
  it("discount", () => {
    expect(discountPrice(80, 25).sale).toBe(60);
  });
  it("margin vs markup", () => {
    const m = marginFrom(60, 100);
    expect(m.margin).toBe(40);
    expect(m.markup).toBeCloseTo(66.666, 2);
  });
  it("bmi", () => {
    expect(bmi(75, 1.8).value).toBeCloseTo(23.148, 2);
  });
});

describe("converters", () => {
  it("length ft to m", () => {
    expect(convertLength(1, "ft", "m")).toBeCloseTo(0.3048);
  });
  it("c to f", () => {
    expect(convertTemperature(0, "C", "F")).toBe(32);
  });
  it("rejects negative kelvin", () => {
    expect(() => convertTemperature(-300, "C", "K")).toThrow();
  });
  it("kg to lb", () => {
    expect(convertWeight(1, "kg", "lb")).toBeCloseTo(2.20462, 4);
  });
  it("data size si vs iec", () => {
    expect(convertDataSize(1, "GB", "B", "si")).toBe(1e9);
    expect(convertDataSize(1, "GiB", "B", "iec")).toBe(1024 ** 3);
  });
});

describe("text and color", () => {
  it("slugify", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
  it("word count", () => {
    expect(countText("one two three").words).toBe(3);
  });
  it("dedupe", () => {
    expect(dedupeLines("a\na\nb", true)).toBe("a\nb");
  });
  it("hex rgb", () => {
    expect(hexToRgb("#0fc").hex).toBe("#00ffcc");
    expect(rgbToHex(0, 255, 204)).toBe("#00ffcc");
  });
  it("contrast white/black", () => {
    expect(contrastRatio("#000", "#fff").ratio).toBeCloseTo(21);
  });
  it("json format", () => {
    expect(formatJson('{"a":1}', true)).toBe('{"a":1}');
  });
  it("csv json", () => {
    const json = csvToJson("n,v\na,1");
    expect(JSON.parse(json)[0].n).toBe("a");
  });
});

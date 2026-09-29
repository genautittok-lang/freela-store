import { describe, expect, it } from "vitest";
import { md5Hex } from "./md5";

describe("md5Hex", () => {
  it("matches RFC sample empty string", () => {
    expect(md5Hex("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });
  it("matches freela.store sample", () => {
    expect(md5Hex("freela.store")).toMatch(/^[a-f0-9]{32}$/);
    expect(md5Hex("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
  });
});

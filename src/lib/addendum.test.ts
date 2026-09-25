import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsPayload, looksLikeFileContent, rateLimit } from "./security";
import { convertByAction } from "./tools/convert";
import { invoiceMath, parseUrl, parseQuery, schemaJsonLd, sitemapXml } from "./tools/web";
import { sitemapEntries, languageAlternates, breadcrumbJsonLd, faqJsonLd } from "./seo";
import { privacyNotice } from "./privacy";
import robots from "../app/robots";

describe("analytics sanitization", () => {
  it("accepts a lean event", () => {
    const event = sanitizeAnalyticsPayload({
      name: "tool_success",
      sessionId: "11111111-2222-4333-8444-555555555555",
      toolId: "word-counter",
      locale: "en",
      processingMode: "LOCAL_ONLY",
      result: "ok",
      path: "/en/tools/word-counter",
    });
    expect(event?.name).toBe("tool_success");
  });
  it("rejects file contents", () => {
    expect(sanitizeAnalyticsPayload({ name: "tool_success", sessionId: "abcdefgh", content: "secret" })).toBeNull();
    expect(looksLikeFileContent("%PDF-1.4 huge stream")).toBe(true);
  });
  it("rejects bogus result payloads", () => {
    expect(
      sanitizeAnalyticsPayload({
        name: "tool_success",
        sessionId: "abcdefgh",
        result: "data:image/png;base64,aaaa",
      }),
    ).toBeNull();
  });
  it("rate-limits a key", () => {
    const key = `t-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });
});

describe("seo gates", () => {
  it("sitemap excludes admin and search", () => {
    const urls = sitemapEntries().map((u) => u.url);
    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls.some((u) => u.includes("/search"))).toBe(false);
    expect(urls.every((u) => u.startsWith("http"))).toBe(true);
  });
  it("hreflang is reciprocal with x-default", () => {
    const langs = languageAlternates("/about", ["en"]);
    expect(langs.en).toContain("/en/about");
    expect(langs["x-default"]).toContain("/en/about");
  });
  it("sitemap lists only English until other locales pass QA", () => {
    const urls = sitemapEntries().map((u) => u.url);
    expect(urls.every((u) => u.includes("/en"))).toBe(true);
    expect(urls.some((u) => u.includes("/uk"))).toBe(false);
    const langs = sitemapEntries()[0]?.alternates.languages ?? {};
    expect(Object.keys(langs).filter((k) => k !== "x-default")).toEqual(["en"]);
  });
  it("robots disallows admin and search", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const dis = rules.flatMap((rule) => (Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]));
    expect(dis).toContain("/admin");
    expect(dis).toContain("/*/search");
  });
  it("structured data matches visible types", () => {
    const crumbs = breadcrumbJsonLd([{ name: "Home", url: "https://freela.store/en" }]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    const faq = faqJsonLd([{ question: "Does it upload files?", answer: "Not for LOCAL_ONLY tools." }]);
    expect(faq["@type"]).toBe("FAQPage");
  });
});

describe("privacy notices", () => {
  it("does not claim local processing for third parties", () => {
    expect(privacyNotice("THIRD_PARTY_PROCESSING", "en")).toMatch(/third-party/i);
    expect(privacyNotice("LOCAL_ONLY", "en")).toMatch(/browser/i);
  });
});

describe("addendum helpers", () => {
  it("converts extra units", () => {
    expect(convertByAction("speed", 36, "km/h", "m/s")).toBeCloseTo(10);
    expect(convertByAction("duration", 1, "h", "min")).toBe(60);
  });
  it("invoice math", () => {
    const v = invoiceMath(2, 10, 20);
    expect(v.gross).toBeCloseTo(24);
  });
  it("url and query parsers", () => {
    expect(parseUrl("https://freela.store/en?q=1").hostname).toBe("freela.store");
    expect(parseQuery("?a=1&b=2").a).toBe("1");
  });
  it("blocks review schema", () => {
    expect(() => schemaJsonLd("Review", "x", "y", "https://freela.store/en")).toThrow();
  });
  it("builds a sitemap helper", () => {
    expect(sitemapXml(["https://freela.store/en"])).toContain("<loc>https://freela.store/en</loc>");
  });
});

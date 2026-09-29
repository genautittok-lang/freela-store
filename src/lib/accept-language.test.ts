import { describe, expect, it } from "vitest";
import { negotiateLocale, localeFromCookie, resolveRootLocale } from "@/lib/accept-language";

describe("accept-language negotiation", () => {
  it("maps common tags to routed locales", () => {
    expect(negotiateLocale("ja,en;q=0.8")).toBe("ja");
    expect(negotiateLocale("pt-BR,pt;q=0.9,en;q=0.8")).toBe("pt");
    expect(negotiateLocale("zh-TW,zh;q=0.8")).toBe("zh-TW");
    expect(negotiateLocale("zh-CN,zh;q=0.8")).toBe("zh-CN");
    expect(negotiateLocale("nb-NO,no;q=0.9")).toBe("no");
    expect(negotiateLocale("xx-YY")).toBe("en");
  });

  it("reads freela_locale cookie", () => {
    expect(localeFromCookie("a=1; freela_locale=de; b=2")).toBe("de");
    expect(localeFromCookie("freela_locale=zh-CN")).toBe("zh-CN");
    expect(localeFromCookie("freela_locale=xx")).toBeNull();
  });

  it("prefers cookie over Accept-Language", () => {
    const locale = resolveRootLocale({
      headers: {
        get(name: string) {
          if (name === "cookie") return "freela_locale=pl";
          if (name === "accept-language") return "ja,en;q=0.5";
          return null;
        },
      },
    });
    expect(locale).toBe("pl");
  });

  it("falls back to Accept-Language then en", () => {
    expect(
      resolveRootLocale({
        headers: {
          get(name: string) {
            if (name === "accept-language") return "ko-KR,ko;q=0.9";
            return null;
          },
        },
      }),
    ).toBe("ko");
    expect(
      resolveRootLocale({
        headers: { get: () => null },
      }),
    ).toBe("en");
  });
});

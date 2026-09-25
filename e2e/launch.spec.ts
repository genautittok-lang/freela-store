import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = "http://127.0.0.1:43173";

test("homepage loads in EN", async ({ page }) => {
  await page.goto(`${base}/en`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#main").getByRole("search")).toBeVisible();
});

test("search finds and opens a tool", async ({ page }) => {
  await page.goto(`${base}/en`);
  const search = page.locator("#main").getByRole("search");
  await search.getByRole("textbox").fill("word counter");
  await search.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/search/);
  await page.getByRole("link", { name: /Word counter/i }).first().click();
  await expect(page).toHaveURL(/word-counter/);
});

test("text tool completes", async ({ page }) => {
  await page.goto(`${base}/en/tools/word-counter`);
  await page.locator("textarea").first().fill("one two three four");
  await expect(page.getByText("Local only", { exact: true }).first()).toBeVisible();
  await page.locator("#tool").getByRole("button", { name: "Count words" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible();
});

test("developer json tool", async ({ page }) => {
  await page.goto(`${base}/en/tools/json-formatter`);
  await page.locator("textarea").first().fill("");
  await page.locator("textarea").first().fill('{"a":1}');
  await page.locator("#tool").getByRole("button", { name: "Format JSON" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible();
});

test("calculator returns a value", async ({ page }) => {
  await page.goto(`${base}/en/tools/percentage`);
  await page.locator("#tool").getByRole("button", { name: "Calculate" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible();
});

test("image compress completes", async ({ page }) => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4jcAAAAAElFTkSuQmCC",
    "base64",
  );
  await page.goto(`${base}/en/tools/compress-image`);
  await page.locator("#tool input[type=file]").last().setInputFiles({
    name: "dot.png",
    mimeType: "image/png",
    buffer: png,
  });
  await page.locator("#tool").getByRole("button", { name: "Compress image" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible({ timeout: 20_000 });
});

test("pdf merge completes", async ({ page }) => {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const bytes = await pdf.save();
  await page.goto(`${base}/en/tools/merge-pdf`);
  const picker = page.locator("#tool input[type=file]").last();
  await picker.setInputFiles([
    { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from(bytes) },
    { name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from(bytes) },
  ]);
  await page.locator("#tool").getByRole("button", { name: "Merge PDFs" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible({ timeout: 20_000 });
});

test("language switch to Ukrainian", async ({ page }) => {
  await page.goto(`${base}/en`);
  await page.getByLabel("Language").selectOption("uk");
  await expect(page).toHaveURL(/\/uk/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});

test("cookie necessary only", async ({ page }) => {
  await page.goto(`${base}/en`);
  const banner = page.getByText("Privacy first").first();
  if (await banner.isVisible()) {
    await page.getByRole("button", { name: /Necessary only/i }).click();
    await expect(page.getByRole("button", { name: /Necessary only/i })).toHaveCount(0);
  }
});

test("unknown tool is 404", async ({ page }) => {
  const res = await page.goto(`${base}/en/tools/not-a-real-tool-xyz`);
  expect(res?.status()).toBe(404);
});

test("canonical and hreflang on home", async ({ page }) => {
  await page.goto(`${base}/en`);
  const canon = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canon).toMatch(/\/en$/);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test("robots and sitemap", async ({ request }) => {
  const robots = await request.get(`${base}/robots.txt`);
  expect(robots.ok()).toBeTruthy();
  const body = await robots.text();
  expect(body).toContain("/admin");
  const sm = await request.get(`${base}/sitemap.xml`);
  const xml = await sm.text();
  expect(xml).not.toContain("/admin");
  expect(xml).not.toContain("/search");
});

test("mobile menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/en`);
  await page.getByRole("button", { name: /Open menu/i }).click();
  await expect(page.getByLabel("Language").last()).toBeVisible();
});

test("accessibility smoke homepage", async ({ page }) => {
  await page.goto(`${base}/en`);
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);
});

test("validation error is actionable", async ({ page }) => {
  await page.goto(`${base}/en/tools/json-formatter`);
  await page.locator("textarea").first().fill("{not-json");
  await page.locator("#tool").getByRole("button", { name: "Format JSON" }).last().click();
  await expect(page.locator("#tool").getByRole("alert")).toBeVisible();
});

test("uk locale is noindex", async ({ page }) => {
  await page.goto(`${base}/uk`);
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").toMatch(/noindex/i);
});

test("analytics rejects file content", async ({ request }) => {
  const res = await request.post(`${base}/api/analytics`, {
    headers: { Origin: "http://127.0.0.1:43173", "content-type": "application/json" },
    data: { name: "tool_success", sessionId: "abcdefghijkl", content: "secret-file" },
  });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

test("security headers present", async ({ request }) => {
  const res = await request.get(`${base}/en`);
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["content-security-policy"] || "").toContain("default-src");
});

test("tablet viewport smoke", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${base}/en`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#main").getByRole("search")).toBeVisible();
});

test("home internal links are not broken", async ({ page, request }) => {
  await page.goto(`${base}/en`);
  const hrefs = await page.locator("a[href^='/']").evaluateAll((as) =>
    [...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href") || ""))].filter(Boolean).slice(0, 20),
  );
  for (const href of hrefs) {
    const res = await request.get(`${base}${href}`);
    expect(res.status(), href).toBeLessThan(400);
  }
});

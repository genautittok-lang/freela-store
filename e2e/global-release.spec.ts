import { test, expect } from "@playwright/test";
import { toolRegistry } from "../src/data/tools";
import { ACTION_LABEL_EN } from "../src/lib/tool-ux";

const base = "http://127.0.0.1:43173";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4jcAAAAAElFTkSuQmCC",
  "base64",
);

test("RTL Arabic home is live, dir=rtl, and indexable", async ({ page }) => {
  const res = await page.goto(`${base}/ar`);
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").not.toMatch(/noindex/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("RTL Hebrew home is live, dir=rtl, and indexable", async ({ page }) => {
  const res = await page.goto(`${base}/he`);
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").not.toMatch(/noindex/i);
});

test("sitemap includes routed locales", async ({ request }) => {
  const sm = await request.get(`${base}/sitemap.xml`);
  const xml = await sm.text();
  expect(xml).toContain("<sitemapindex");
  expect(xml).toContain("/sitemap/en.xml");
  expect(xml).toContain("/sitemap/ar.xml");
  expect(xml).toContain("/sitemap/he.xml");
  expect(xml).toContain("/sitemap/uk.xml");
  expect(xml).toContain("/sitemap/de.xml");

  const child = await request.get(`${base}/sitemap/en.xml`);
  const childXml = await child.text();
  expect(childXml).toContain("<urlset");
  expect(childXml).toContain("/en/");
  expect(childXml).not.toContain("/admin");
});

test("core locales are reachable and indexable", async ({ page }) => {
  for (const locale of ["de", "uk", "fr", "es", "en"]) {
    await page.goto(`${base}/${locale}`);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots || "").not.toMatch(/noindex/i);
  }
});

test("German and Arabic tools show locale copy and CTAs", async ({ page }) => {
  await page.goto(`${base}/de/tools/word-counter`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Wörter|zählen|Wort/i);
  await expect(page.locator("#tool").getByRole("button", { name: "Wörter zählen" })).toBeVisible();
  await page.goto(`${base}/ar/tools/merge-pdf`);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("دمج");
  await expect(page.locator("#tool").getByRole("button", { name: "دمج PDF" })).toBeVisible();
});

test("word-counter empty/reset path", async ({ page }) => {
  await page.goto(`${base}/en/tools/word-counter`);
  await page.getByRole("button", { name: "New input" }).click();
  await page.getByRole("button", { name: "Count words" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible();
});

const families: { id: string; fill?: "pdf" | "image" | "images" | "none" }[] = [
  { id: "qr-generator", fill: "none" },
  { id: "hex-rgb-hsl", fill: "none" },
  { id: "length", fill: "none" },
  { id: "uuid-generator", fill: "none" },
  { id: "unix-timestamp", fill: "none" },
  { id: "ics-event", fill: "none" },
  { id: "jwt-decoder", fill: "none" },
  { id: "regex-tester", fill: "none" },
  { id: "compress-image", fill: "image" },
  { id: "resize-image", fill: "image" },
  { id: "crop-image", fill: "image" },
  { id: "convert-image", fill: "image" },
  { id: "image-to-base64", fill: "image" },
  { id: "exif-strip", fill: "image" },
  { id: "favicon-generator", fill: "image" },
  { id: "color-extract", fill: "image" },
  { id: "split-pdf", fill: "pdf" },
  { id: "rotate-pdf", fill: "pdf" },
];

for (const row of families) {
  test(`family workflow ${row.id}`, async ({ page }) => {
    const tool = toolRegistry.find((t) => t.id === row.id)!;
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    pdf.addPage();
    pdf.addPage();
    const bytes = Buffer.from(await pdf.save());
    await page.goto(`${base}/en/tools/${tool.copy.en.slug}`);
    if (row.fill === "pdf") {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "sample.pdf",
        mimeType: "application/pdf",
        buffer: bytes,
      });
    }
    if (row.fill === "image") {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "dot.png",
        mimeType: "image/png",
        buffer: png,
      });
    }
    await page.locator("#tool").getByRole("button", { name: ACTION_LABEL_EN[tool.id] }).last().click();
    await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible({ timeout: 20_000 });
  });
}

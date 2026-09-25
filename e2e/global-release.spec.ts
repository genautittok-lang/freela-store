import { test, expect } from "@playwright/test";
import { toolRegistry } from "../src/data/tools";
import { ACTION_LABEL_EN } from "../src/lib/tool-ux";

const base = "http://127.0.0.1:43173";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4jcAAAAAElFTkSuQmCC",
  "base64",
);

test("RTL Arabic home is live, dir=rtl, and noindex", async ({ page }) => {
  const res = await page.goto(`${base}/ar`);
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").toMatch(/noindex/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("RTL Hebrew home is live, dir=rtl, and noindex", async ({ page }) => {
  const res = await page.goto(`${base}/he`);
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").toMatch(/noindex/i);
});

test("sitemap stays English-only", async ({ request }) => {
  const sm = await request.get(`${base}/sitemap.xml`);
  const xml = await sm.text();
  expect(xml).toContain("/en/");
  expect(xml).not.toContain("/ar/");
  expect(xml).not.toContain("/he/");
  expect(xml).not.toContain("/uk/");
});

test("core locales are reachable and noindex except en", async ({ page }) => {
  for (const locale of ["de", "uk", "fr", "es"]) {
    await page.goto(`${base}/${locale}`);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots || "").toMatch(/noindex/i);
  }
  await page.goto(`${base}/en`);
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots || "").not.toMatch(/noindex/i);
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
      await page.locator(`#files-${tool.id}`).setInputFiles({
        name: "sample.pdf",
        mimeType: "application/pdf",
        buffer: bytes,
      });
    }
    if (row.fill === "image") {
      await page.locator(`#files-${tool.id}`).setInputFiles({
        name: "dot.png",
        mimeType: "image/png",
        buffer: png,
      });
    }
    await page.getByRole("button", { name: ACTION_LABEL_EN[tool.id] }).click();
    await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible({ timeout: 20_000 });
  });
}

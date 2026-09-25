import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const outDir = "/tmp/freela-teaser";
mkdirSync(outDir, { recursive: true });

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4jcAAAAAElFTkSuQmCC",
  "base64",
);

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:43173/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const search = page.locator("#main").getByRole("search").getByRole("textbox");
  await search.click();
  await search.fill("Compress image");
  await page.waitForTimeout(600);
  await page.locator("#main").getByRole("search").getByRole("button", { name: "Search" }).click();
  await page.waitForURL(/search/);
  await page.waitForTimeout(400);
  await page.getByRole("link", { name: /Compress image/i }).first().click();
  await page.waitForURL(/compress-image/);
  await page.waitForTimeout(400);
  await page.locator('input[type="file"]').setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: png,
  });
  await page.waitForTimeout(400);
  const quality = page.getByLabel("Quality");
  if (await quality.count()) {
    await quality.fill("0.7");
  }
  await page.getByRole("button", { name: "Compress image" }).click();
  await page.getByRole("status").filter({ hasText: "Done." }).waitFor({ timeout: 20_000 });
  await page.waitForTimeout(1200);
  await page.goto("http://127.0.0.1:43173/en");
  await page.waitForTimeout(1200);
  const video = page.video();
  await context.close();
  await browser.close();
  const webm = await video?.path();
  if (!webm) throw new Error("No video");
  const mp4 = "/workspace/public/brand/teaser.mp4";
  const conv = spawnSync("ffmpeg", ["-y", "-i", webm, "-an", "-vf", "scale=1280:720", "-c:v", "libx264", "-pix_fmt", "yuv420p", mp4], {
    encoding: "utf8",
  });
  if (conv.status !== 0) {
    console.error(conv.stderr);
    throw new Error("ffmpeg failed");
  }
  console.log("Wrote", mp4);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

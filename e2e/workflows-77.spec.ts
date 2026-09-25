import { test, expect, type Page } from "@playwright/test";
import { toolRegistry } from "../src/data/tools";
import { ACTION_LABEL_EN } from "../src/lib/tool-ux";
import type { ToolDefinition } from "../src/data/schema";

const base = "http://127.0.0.1:43173";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4jcAAAAAElFTkSuQmCC",
  "base64",
);

async function runTool(page: Page, tool: ToolDefinition, pdfBytes: Buffer) {
  await page.goto(`${base}/en/tools/${tool.copy.en.slug}`);
  const kind = tool.runtime.kind;
  const action = tool.runtime.action;
  if (kind === "pdf") {
    if (action === "images-to-pdf") {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "dot.png",
        mimeType: "image/png",
        buffer: png,
      });
    } else {
      const files =
        action === "merge"
          ? [
              { name: "a.pdf", mimeType: "application/pdf", buffer: pdfBytes },
              { name: "b.pdf", mimeType: "application/pdf", buffer: pdfBytes },
            ]
          : [{ name: "a.pdf", mimeType: "application/pdf", buffer: pdfBytes }];
      await page.locator("#tool input[type=file]").last().setInputFiles(files);
    }
  } else if (kind === "image") {
    if (action === "from-base64") {
      await page.locator("textarea").first().fill(`data:image/png;base64,${png.toString("base64")}`);
    } else {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "dot.png",
        mimeType: "image/png",
        buffer: png,
      });
    }
  }
  await page.locator("#tool").getByRole("button", { name: ACTION_LABEL_EN[tool.id] }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Done." })).toBeVisible({ timeout: 20_000 });
}

test("77 published tools complete a primary action", async ({ page }) => {
  test.setTimeout(12 * 60_000);
  const published = toolRegistry.filter((t) => t.status === "published");
  expect(published).toHaveLength(77);
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage();
  pdfDoc.addPage();
  const pdfBytes = Buffer.from(await pdfDoc.save());
  const failures: string[] = [];

  for (const tool of published) {
    try {
      await runTool(page, tool, pdfBytes);
    } catch {
      try {
        await runTool(page, tool, pdfBytes);
      } catch (err) {
        failures.push(`${tool.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
});

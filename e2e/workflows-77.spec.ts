import { test, expect, type Page } from "@playwright/test";
import { toolRegistry } from "../src/data/tools";
import { ACTION_LABEL_EN } from "../src/lib/tool-ux";
import type { ToolDefinition } from "../src/data/schema";

const base = "http://127.0.0.1:43173";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4jcAAAAAElFTkSuQmCC",
  "base64",
);

function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Buffer }[]) {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const crc = crc32(file.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(file.data.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const head = Buffer.concat([local, name, file.data]);
    chunks.push(head);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(file.data.length, 20);
    cen.writeUInt32LE(file.data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([cen, name]));
    offset += head.length;
  }
  const dir = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, dir, end]);
}

function minimalDocx() {
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello Freela</w:t></w:r></w:p></w:body></w:document>`;
  const types = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  return zipStore([
    { name: "[Content_Types].xml", data: Buffer.from(types) },
    { name: "_rels/.rels", data: Buffer.from(rels) },
    { name: "word/document.xml", data: Buffer.from(doc) },
  ]);
}

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
  } else if (kind === "pack" && tool.inputTypes.includes("file") && tool.id !== "pdf-password" && tool.id !== "convert-video") {
    if (tool.supportedFormats.includes("pdf")) {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "a.pdf",
        mimeType: "application/pdf",
        buffer: pdfBytes,
      });
    } else if (tool.supportedFormats.includes("docx")) {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "note.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: minimalDocx(),
      });
    } else if (tool.supportedFormats.includes("csv") || tool.supportedFormats.includes("xlsx")) {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "t.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("a,b\n1,2\n"),
      });
    } else if (tool.id === "qr-reader") {
      const QRCode = await import("qrcode");
      const url = await QRCode.toDataURL("https://freela.store/en/", { margin: 1, width: 128 });
      const buf = Buffer.from(url.split(",")[1], "base64");
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "qr.png",
        mimeType: "image/png",
        buffer: buf,
      });
    } else {
      await page.locator("#tool input[type=file]").last().setInputFiles({
        name: "dot.png",
        mimeType: "image/png",
        buffer: png,
      });
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

test("published tools complete a primary action", async ({ page }) => {
  test.setTimeout(12 * 60_000);
  const published = toolRegistry.filter((t) => t.status === "published");
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

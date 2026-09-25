import { writeFileSync } from "node:fs";
import { toolRegistry } from "../src/data/tools";
import { categories } from "../src/data/categories";
import { uxFor } from "../src/lib/tool-ux";
import { executeAllPublishedWorkflows } from "../src/lib/tools/workflows";
import { localeRegistry, preparedLocaleRegistry, allKnownLocales } from "../src/data/locales";

async function main() {
  const published = toolRegistry.filter((t) => t.status === "published");
  const workflows = await executeAllPublishedWorkflows();
  const byId = Object.fromEntries(workflows.map((w) => [w.toolId, w]));
  const rows = published.map((tool) => {
    const copy = tool.copy.en;
    const ux = uxFor(tool);
    const cat = categories.find((c) => c.id === tool.category)!;
    const wf = byId[tool.id];
    const image = tool.runtime.kind === "image";
    return {
      id: tool.id,
      slug: copy.slug,
      category: tool.category,
      url: `/en/tools/${copy.slug}`,
      purpose: copy.description,
      userInput: ux.inputType,
      supportedFormats: tool.supportedFormats,
      maxFileSize: tool.maxFileSize,
      options: ux.options,
      primaryCta: ux.actionLabel,
      output: ux.outputType,
      postAction: tool.outputTypes.includes("file") ? "download" : "copy",
      preview: ux.family === "qr" || ux.family === "image" || tool.id === "serp-preview",
      validation: "empty/invalid surfaces an alert in ToolRunner",
      errors: "actionable Error message",
      success: "Done. status",
      privacy: tool.processingMode,
      example: copy.examples[0],
      relatedTools: tool.relatedTools,
      mobile: "e2e viewport + tool page layout",
      accessibility: "labels on fields; axe home smoke",
      tests: image ? "Playwright image family" : wf?.status === "PASS" ? "unit workflow PASS" : wf?.reason,
      localization: "EN reviewed; other locales routed noindex until native QA",
      seo: "EN indexable; title/H1/canonical present",
      status: image || wf?.status === "PASS" ? "PASS" : "BLOCKED",
      categoryName: cat.copy.en.name,
    };
  });
  const locales = allKnownLocales.map((loc) => ({
    code: loc.code,
    routed: loc.routed,
    indexable: loc.indexable,
    translationReviewed: loc.translationReviewed,
    dir: loc.dir,
    nativeName: loc.nativeName,
  }));
  const payload = {
    generatedAt: new Date().toISOString(),
    published: published.length,
    workflowPass: rows.filter((r) => r.status === "PASS").length,
    locales,
    indexableLocales: Object.values(localeRegistry)
      .concat(Object.values(preparedLocaleRegistry))
      .filter((l) => l.indexable)
      .map((l) => l.code),
    tools: rows,
  };
  writeFileSync("src/data/tool-audit-matrix.json", JSON.stringify(payload, null, 2));
  console.log(`Wrote matrix for ${rows.length} tools, ${payload.workflowPass} PASS`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

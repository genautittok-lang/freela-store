import { toolRegistry } from "../src/data/tools";
import { validateCatalog } from "../src/data/schema";
import { INITIAL_LOCALES, localeRegistry, PREPARED_LOCALES, ROUTED_LOCALES, getLocale } from "@/data/locales";
import { messages } from "../src/i18n/messages";
import { extras } from "../src/i18n/extras";
import { uxChrome } from "../src/i18n/ux";
import { sitemapEntries, languageAlternates, indexableLocales } from "../src/lib/seo";
import { LEGAL_SLUGS } from "../src/data/legal-slugs";
import { legalBody } from "../src/i18n/legal";
import { categories } from "../src/data/categories";
import { absoluteUrl } from "../src/lib/site";
import { preparedUi, assertPreparedUi } from "../src/i18n/prepared-ui";
import { assertToolUx, ACTION_LABEL_EN } from "../src/lib/tool-ux";
import { ACTION_LABELS } from "../src/lib/action-labels";
import { seoOverlay } from "../src/data/tools/seo-overlay";

const errors: string[] = [];
function fail(msg: string) {
  errors.push(msg);
}

validateCatalog(toolRegistry);
assertToolUx(toolRegistry);

const published = toolRegistry.filter((t) => t.status === "published");
if (!published.length) fail("No published tools");

const requiredUi = Object.keys(messages.en);
const requiredExtra = Object.keys(extras.en);
for (const locale of INITIAL_LOCALES) {
  for (const key of requiredUi) {
    if (!(key in messages[locale])) fail(`Missing UI key ${key} in ${locale}`);
  }
  for (const key of requiredExtra) {
    if (!(key in extras[locale])) fail(`Missing extra key ${key} in ${locale}`);
  }
  for (const key of Object.keys(uxChrome.en)) {
    if (!(key in uxChrome[locale])) fail(`Missing UX chrome key ${key} in ${locale}`);
  }
  for (const cat of categories) {
    if (!cat.copy[locale]) fail(`Category ${cat.id} missing ${locale}`);
  }
}

for (const tool of published) {
  if (!tool.copy.en?.title || !tool.copy.en.description || !tool.copy.en.h1) {
    fail(`Published ${tool.id} missing English SEO`);
  }
  if (!tool.processingMode) fail(`${tool.id} missing processingMode`);
  if (tool.status === "published" && !tool.tested) fail(`${tool.id} published but not marked tested`);
  for (const related of tool.relatedTools) {
    if (!toolRegistry.some((t) => t.id === related)) fail(`${tool.id} related missing: ${related}`);
  }
  for (const locale of INITIAL_LOCALES) {
    if (!tool.copy[locale]) fail(`${tool.id} missing copy for ${locale}`);
    if (!ACTION_LABELS[locale][tool.id]) fail(`${tool.id} missing CTA for ${locale}`);
  }
  if (!ACTION_LABEL_EN[tool.id]) fail(`${tool.id} missing EN CTA`);
  if (!seoOverlay[tool.id]?.en) fail(`${tool.id} missing SEO overlay`);
  if (tool.processingMode !== "LOCAL_ONLY" && tool.status === "published") {
    fail(`${tool.id} published with non-local processing`);
  }
}

const slugs = new Set<string>();
for (const tool of published) {
  for (const locale of Object.keys(tool.copy)) {
    const key = `${locale}:${tool.copy[locale].slug}`;
    if (slugs.has(key)) fail(`Duplicate slug ${key}`);
    slugs.add(key);
  }
}

for (const locale of INITIAL_LOCALES) {
  const catSlugs = categories.map((c) => c.copy[locale].slug);
  if (new Set(catSlugs).size !== catSlugs.length) fail(`Duplicate category slug in ${locale}`);
}

const urls = sitemapEntries();
if (urls.some((u) => u.url.includes("/admin") || u.url.includes("/search") || u.url.includes("/api"))) {
  fail("Sitemap includes excluded paths");
}
for (const entry of urls) {
  if (!entry.url.startsWith("http")) fail(`Sitemap URL not absolute: ${entry.url}`);
}

const indexed = indexableLocales();
if (indexed.length !== INITIAL_LOCALES.length) {
  fail(`Expected ${INITIAL_LOCALES.length} indexable locales, got ${indexed.join(",")}`);
}
for (const locale of INITIAL_LOCALES) {
  if (!localeRegistry[locale].indexable) fail(`${locale} should be indexable`);
  if (!localeRegistry[locale].translationReviewed) fail(`${locale} should be translationReviewed`);
  if (!urls.some((u) => u.url.includes(`/${locale}`))) fail(`Sitemap missing locale ${locale}`);
}

const sample = languageAlternates("", indexed);
if (!sample.en || !sample["x-default"] || !sample.de || !sample.ar || !sample.he) {
  fail("hreflang sample incomplete for indexable locales");
}
// Sitemap XML is slim (no xhtml alternates); hreflang reciprocity is enforced via HTML metadata helpers.
for (const locale of INITIAL_LOCALES) {
  const home = languageAlternates("", indexed);
  if (!home[locale]?.includes(`/${locale}`)) fail(`hreflang missing ${locale}`);
}

assertPreparedUi();
if ("ja" in preparedUi || "ar" in preparedUi) fail("ja/ar must not remain in preparedUi");
if (ROUTED_LOCALES.length !== INITIAL_LOCALES.length) fail(`Routed locale count ${ROUTED_LOCALES.length}`);
if (!getLocale("ar")?.indexable || !getLocale("he")?.indexable) fail("RTL locales should be indexable after translation packs");
if (!getLocale("ar")?.routed || !getLocale("he")?.routed) fail("RTL locales must be routed");
if (PREPARED_LOCALES.includes("ar" as never)) fail("ar should not be prepared");

for (const slug of LEGAL_SLUGS) {
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`Bad legal slug ${slug}`);
  const en = legalBody(slug, "en").join("\n");
  if (!en.includes("tools@freela.store")) fail(`EN ${slug} missing tools@freela.store`);
  if (/hello@|abuse@|legal@|privacy@|copyright@|security@/.test(en)) fail(`EN ${slug} still uses a non-primary mailbox`);
  for (const locale of INITIAL_LOCALES) {
    const body = legalBody(slug, locale);
    if (!body.length) fail(`Empty legal body ${slug} ${locale}`);
    const joined = body.join("\n");
    if (locale !== "en" && joined === en) fail(`Legal ${slug} leftover English in ${locale}`);
    if (!joined.includes("tools@freela.store")) fail(`Legal ${slug} ${locale} missing tools@freela.store`);
  }
}

const expectedMin = INITIAL_LOCALES.length * (1 + LEGAL_SLUGS.length + published.length);
if (urls.length < expectedMin) fail(`Sitemap too small: ${urls.length} < ${expectedMin}`);

for (const tool of published) {
  for (const locale of INITIAL_LOCALES) {
    if (locale === "en") continue;
    const how = tool.copy[locale].howTo.join(" ");
    if (how.includes("Add your input") || how.includes("Run the primary action")) {
      fail(`${tool.id} ${locale} how-to still English`);
    }
    const examples = tool.copy[locale].examples.join(" ");
    if (examples.includes("Try the main task") || examples.includes("Try empty or invalid")) {
      fail(`${tool.id} ${locale} examples still English`);
    }
  }
}

const images = categories.find((c) => c.id === "images");
if (!images) fail("images category missing");
else {
  const deUrl = absoluteUrl(`/de/tools/${images.copy.de.slug}`);
  const entry = urls.find((u) => u.url === deUrl);
  if (!entry) fail("German images category missing from sitemap");
  const catHreflang: Record<string, string> = {
    "x-default": absoluteUrl(`/en/tools/${images.copy.en.slug}`),
  };
  for (const code of indexed) {
    catHreflang[code] = absoluteUrl(`/${code}/tools/${images.copy[code].slug}`);
  }
  if (!catHreflang.pl?.endsWith("/pl/tools/obrazy")) {
    fail(`Category hreflang slug mismatch: ${catHreflang.pl}`);
  }
  if (!catHreflang["x-default"]?.endsWith("/en/tools/images")) {
    fail("Category x-default should use the English images slug");
  }
}

// Slim sitemap has no embedded alternates; HTML head still exposes full hreflang via languageAlternates.
{
  const langs = languageAlternates("/tools/merge-pdf", indexed);
  if (!langs["x-default"]) fail("Tool hreflang missing x-default");
  for (const locale of INITIAL_LOCALES) {
    if (!langs[locale]) fail(`Tool hreflang missing ${locale}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `QA OK: ${toolRegistry.length} tools, ${published.length} published, ${urls.length} sitemap URLs, ${ROUTED_LOCALES.length} routed locales, ${PREPARED_LOCALES.length} prepared, indexable=${indexed.join(",")}`,
);

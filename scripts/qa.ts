import { toolRegistry } from "../src/data/tools";
import { validateCatalog } from "../src/data/schema";
import { INITIAL_LOCALES, localeRegistry, PREPARED_LOCALES, ROUTED_LOCALES, getLocale } from "@/data/locales";
import { messages } from "../src/i18n/messages";
import { extras } from "../src/i18n/extras";
import { sitemapEntries, languageAlternates } from "../src/lib/seo";
import { LEGAL_SLUGS } from "../src/data/legal-slugs";
import { categories } from "../src/data/categories";
import { preparedUi, assertPreparedUi } from "../src/i18n/prepared-ui";
import { assertToolUx } from "../src/lib/tool-ux";

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
  const langs = entry.alternates.languages;
  if (!langs["x-default"]) fail(`Missing x-default for ${entry.url}`);
  for (const [code, href] of Object.entries(langs)) {
    if (code === "x-default") continue;
    if (!href.startsWith("http")) fail(`hreflang ${code} not absolute`);
  }
}

const sample = languageAlternates("", ["en"]);
if (!sample.en || !sample["x-default"]) fail("hreflang sample incomplete");
if (urls.some((u) => /\/(uk|de|fr|es)\//.test(u.url) || /\/(uk|de)$/.test(u.url))) {
  fail("Sitemap includes a non-indexable locale");
}
for (const entry of urls) {
  const codes = Object.keys(entry.alternates.languages).filter((c) => c !== "x-default");
  if (codes.some((c) => c !== "en")) fail(`Sitemap hreflang includes unpublished locale: ${codes.join(",")}`);
}

if (PREPARED_LOCALES.includes("ar" as never) && localeRegistry.en.dir !== "ltr") fail("EN should be LTR");
assertPreparedUi();
if (!preparedUi.ar.tagline || !preparedUi.he.tagline) fail("RTL prepared chrome missing");
if (ROUTED_LOCALES.length !== 12) fail(`Expected 12 routed locales, got ${ROUTED_LOCALES.length}`);
if (getLocale("ar")?.indexable || getLocale("he")?.indexable) fail("RTL locales must stay noindex until native QA");
if (!getLocale("ar")?.routed || !getLocale("he")?.routed) fail("RTL locales must be routed");

for (const slug of LEGAL_SLUGS) {
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`Bad legal slug ${slug}`);
}

const indexable = INITIAL_LOCALES.filter((c) => localeRegistry[c].indexable);
if (indexable.length !== 1 || indexable[0] !== "en") {
  fail("Only English should be indexable until translation QA");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `QA OK: ${toolRegistry.length} tools, ${published.length} published, ${urls.length} sitemap URLs, ${ROUTED_LOCALES.length} routed locales, ${PREPARED_LOCALES.length} prepared`,
);

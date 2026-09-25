import { englishTools } from "./english";
import { moreEnglishTools } from "./english-images";
import { textDevSeoTools } from "./english-text-dev";
import { calcRestTools } from "./english-calc";
import { addendumTools } from "./english-addendum";
import { packTools } from "./english-pack";
import { improveTools } from "./english-improve";
import { waveTools } from "./english-wave";
import { privacyFiles, privacyText } from "./define";
import type { Locale } from "../locales";
import { INITIAL_LOCALES, SOURCE_LOCALE } from "../locales";
import type { ToolDefinition } from "../schema";
import { validateCatalog } from "../schema";
import { packs } from "./locale-packs";
import { packsMore } from "./locale-packs-more";
import { packsRtl } from "./locale-packs-rtl";
import { seoOverlay } from "./seo-overlay";

const englishCatalog = [
  ...englishTools,
  ...moreEnglishTools,
  ...textDevSeoTools,
  ...calcRestTools,
  ...addendumTools,
  ...packTools,
  ...improveTools,
  ...waveTools,
];

export type EnglishTool = (typeof englishCatalog)[number];

function privacyFor(tool: EnglishTool, locale: Locale): string {
  if (tool.inputTypes.includes("file")) return privacyFiles[locale];
  return privacyText[locale];
}

function clamp(text: string, min: number, max: number) {
  const trimmed = text.trim();
  if (trimmed.length < min) return `${trimmed} ${".".repeat(min - trimmed.length)}`.slice(0, max);
  if (trimmed.length > max) return trimmed.slice(0, max - 1).trimEnd() + "…";
  return trimmed;
}

function ensureMin(text: string, min: number) {
  let t = text.trim();
  while (t.length < min) t = `${t} — Freela`;
  return t;
}

function copyFor(tool: EnglishTool, locale: Locale): ToolDefinition["copy"][string] | null {
  const seo = seoOverlay[tool.id]?.[locale];
  if (locale === SOURCE_LOCALE) {
    const faq = [
      ...(seo?.faq ?? []),
      ...tool.copyEn.faq,
    ].filter((item, i, arr) => arr.findIndex((x) => x.question === item.question) === i)
      .slice(0, 8);
    return {
      ...tool.copyEn,
      slug: tool.id,
      name: seo?.name ?? tool.copyEn.name,
      title: seo?.title ?? tool.copyEn.title,
      description: seo?.description ?? tool.copyEn.description,
      h1: seo?.h1 ?? tool.copyEn.h1,
      intro: seo?.intro ?? tool.copyEn.intro,
      faq,
    };
  }
  const pack = packs[locale]?.[tool.id] ?? packsMore[locale]?.[tool.id] ?? packsRtl[locale]?.[tool.id];
  if (!pack && !seo) return null;
  const faq = [
    ...(seo?.faq ?? []),
    ...((pack?.faq ?? []).map((item) => ({
      question: ensureMin(item.question, 8),
      answer: ensureMin(item.answer, 8),
    }))),
  ]
    .filter((item, i, arr) => arr.findIndex((x) => x.question === item.question) === i)
    .slice(0, 8);
  const howTo = (pack?.howTo?.length ? pack.howTo : ["Add your input.", "Run the primary action.", "Copy or download the result."]).map(
    (step) => ensureMin(step, 8),
  );
  const examples = (pack?.examples?.length ? pack.examples : ["Try the main task for this tool.", "Try empty or invalid input."]).map((ex) =>
    ensureMin(ex, 8),
  );
  return {
    name: seo?.name ?? ensureMin(pack?.name ?? tool.copyEn.name, 2),
    slug: tool.id,
    title: clamp(seo?.title ?? pack?.title ?? tool.copyEn.title, 10, 70),
    description: clamp(seo?.description ?? pack?.description ?? tool.copyEn.description, 40, 170),
    h1: clamp(seo?.h1 ?? pack?.h1 ?? tool.copyEn.h1, 4, 80),
    intro: ensureMin(
      seo?.intro ?? (pack && pack.intro.length >= 40 ? pack.intro : `${pack?.intro ?? ""} ${pack?.description ?? tool.copyEn.description}`),
      40,
    ),
    howTo,
    faq: faq.length >= 2 ? faq : [
      { question: ensureMin("Does this upload files?", 8), answer: ensureMin("No. LOCAL_ONLY in the browser.", 8) },
      { question: ensureMin("Is this professional advice?", 8), answer: ensureMin("No. Check important results yourself.", 8) },
    ],
    privacy: pack?.privacy ?? privacyFor(tool, locale),
    formats: ensureMin(pack?.formats ?? "Input and output stay in this browser tab.", 8),
    examples,
  };
}

function assemble(): ToolDefinition[] {
  const tools: ToolDefinition[] = englishCatalog.map((tool) => {
    const copy = {} as ToolDefinition["copy"];
    for (const locale of INITIAL_LOCALES) {
      const localized = copyFor(tool, locale);
      if (localized) copy[locale] = localized;
    }
    const { copyEn: _copyEn, ...meta } = tool;
    return { ...meta, copy };
  });
  return validateCatalog(tools);
}

export const toolRegistry: ToolDefinition[] = assemble();

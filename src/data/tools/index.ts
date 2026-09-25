import { englishTools } from "./english";
import { moreEnglishTools } from "./english-images";
import { textDevSeoTools } from "./english-text-dev";
import { calcRestTools } from "./english-calc";
import { addendumTools } from "./english-addendum";
import { privacyFiles, privacyText } from "./define";
import type { Locale } from "../locales";
import { INITIAL_LOCALES, SOURCE_LOCALE } from "../locales";
import type { ToolDefinition } from "../schema";
import { validateCatalog } from "../schema";
import { packs } from "./locale-packs";
import { packsMore } from "./locale-packs-more";
import { packsRtl } from "./locale-packs-rtl";

const englishCatalog = [
  ...englishTools,
  ...moreEnglishTools,
  ...textDevSeoTools,
  ...calcRestTools,
  ...addendumTools,
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
  if (locale === SOURCE_LOCALE) {
    return { ...tool.copyEn, slug: tool.id };
  }
  const pack = packs[locale]?.[tool.id] ?? packsMore[locale]?.[tool.id] ?? packsRtl[locale]?.[tool.id];
  if (!pack) return null;
  return {
    name: ensureMin(pack.name, 2),
    slug: tool.id,
    title: clamp(pack.title, 10, 70),
    description: clamp(pack.description, 40, 170),
    h1: clamp(pack.h1, 4, 80),
    intro: ensureMin(pack.intro.length >= 40 ? pack.intro : `${pack.intro} ${pack.description}`, 40),
    howTo: pack.howTo.map((step) => ensureMin(step, 8)),
    faq: pack.faq.map((item) => ({
      question: ensureMin(item.question, 8),
      answer: ensureMin(item.answer, 8),
    })),
    privacy: pack.privacy ?? privacyFor(tool, locale),
    formats: ensureMin(pack.formats, 8),
    examples: pack.examples.map((ex) => ensureMin(ex, 8)),
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

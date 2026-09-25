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

function copyFor(tool: EnglishTool, locale: Locale): ToolDefinition["copy"][string] | null {
  if (locale === SOURCE_LOCALE) {
    return { ...tool.copyEn, slug: tool.id };
  }
  const pack = packs[locale]?.[tool.id];
  if (!pack) return null;
  return {
    name: pack.name,
    slug: tool.id,
    title: clamp(pack.title, 10, 70),
    description: clamp(pack.description, 40, 170),
    h1: pack.h1.slice(0, 80),
    intro: pack.intro.length >= 40 ? pack.intro : `${pack.intro} ${pack.description}`,
    howTo: pack.howTo,
    faq: pack.faq,
    privacy: pack.privacy ?? privacyFor(tool, locale),
    formats: pack.formats,
    examples: pack.examples,
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

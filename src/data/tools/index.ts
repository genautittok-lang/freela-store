import { englishTools } from "./english";
import { moreEnglishTools } from "./english-images";
import { textDevSeoTools } from "./english-text-dev";
import { calcRestTools } from "./english-calc";
import { addendumTools } from "./english-addendum";
import { packTools } from "./english-pack";
import { improveTools } from "./english-improve";
import { waveTools } from "./english-wave";
import { wave2Tools } from "./english-wave2";
import { wave3Tools } from "./english-wave3";
import { mediaTools } from "./english-media";
import { privacyFiles, privacyText } from "./define";
import type { Locale } from "../locales";
import { INITIAL_LOCALES, SOURCE_LOCALE } from "../locales";
import type { ToolDefinition } from "../schema";
import { validateCatalog } from "../schema";
import { packs } from "./locale-packs";
import { packsMore } from "./locale-packs-more";
import { packsRtl } from "./locale-packs-rtl";
import { seoOverlay } from "./seo-overlay";
import { fallbackExamples, fallbackFaq, fallbackFormats, fallbackHowTo } from "@/i18n/tool-fallbacks";
import { isNewLocale, synthesizeToolCopy } from "@/i18n/locale8";
import { isEuLocale, synthesizeToolCopyEu } from "@/i18n/locale-eu";
import { composeTop20Copy } from "@/i18n/top20-landing";

const englishCatalog = [
  ...englishTools,
  ...moreEnglishTools,
  ...textDevSeoTools,
  ...calcRestTools,
  ...addendumTools,
  ...packTools,
  ...improveTools,
  ...waveTools,
  ...wave2Tools,
  ...wave3Tools,
  ...mediaTools,
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

const SHELL: Partial<Record<Locale, (name: string) => { title: string; description: string; h1: string; intro: string }>> = {
  de: (name) => ({
    title: `${name} im Browser`,
    description: `${name} läuft in diesem Tab. Freela lädt die Eingabe nicht hoch.`,
    h1: name,
    intro: `${name} bleibt auf diesem Gerät. Das ist ein Hilfsmittel, keine Steuer-, Medizin- oder Rechtsberatung.`,
  }),
  uk: (name) => ({
    title: `${name} у браузері`,
    description: `${name} працює в цій вкладці. Freela не завантажує введені дані.`,
    h1: name,
    intro: `${name} лишається на цьому пристрої. Це утиліта, а не податкова, медична чи юридична порада.`,
  }),
  pl: (name) => ({
    title: `${name} w przeglądarce`,
    description: `${name} działa w tej karcie. Freela nie wysyła wprowadzonych danych.`,
    h1: name,
    intro: `${name} zostaje na tym urządzeniu. To narzędzie, a nie porada podatkowa, medyczna ani prawna.`,
  }),
  fr: (name) => ({
    title: `${name} dans le navigateur`,
    description: `${name} s’exécute dans cet onglet. Freela n’envoie pas la saisie.`,
    h1: name,
    intro: `${name} reste sur cet appareil. C’est un utilitaire, pas un conseil fiscal, médical ou juridique.`,
  }),
  es: (name) => ({
    title: `${name} en el navegador`,
    description: `${name} se ejecuta en esta pestaña. Freela no sube la entrada.`,
    h1: name,
    intro: `${name} permanece en este dispositivo. Es una utilidad, no asesoramiento fiscal, médico o legal.`,
  }),
  it: (name) => ({
    title: `${name} nel browser`,
    description: `${name} viene eseguito in questa scheda. Freela non carica l’input.`,
    h1: name,
    intro: `${name} resta su questo dispositivo. È un’utilità, non un parere fiscale, medico o legale.`,
  }),
  pt: (name) => ({
    title: `${name} no navegador`,
    description: `${name} corre neste separador. A Freela não envia a entrada.`,
    h1: name,
    intro: `${name} fica neste dispositivo. É um utilitário, não aconselhamento fiscal, médico ou jurídico.`,
  }),
  nl: (name) => ({
    title: `${name} in de browser`,
    description: `${name} draait in dit tabblad. Freela uploadt de invoer niet.`,
    h1: name,
    intro: `${name} blijft op dit apparaat. Dit is een hulpmiddel, geen fiscaal, medisch of juridisch advies.`,
  }),
  tr: (name) => ({
    title: `${name} tarayıcıda`,
    description: `${name} bu sekmede çalışır. Freela girdiyi yüklemez.`,
    h1: name,
    intro: `${name} bu cihazda kalır. Bu bir araçtır; vergi, tıbbi veya hukuki tavsiye değildir.`,
  }),
  ar: (name) => ({
    title: `${name} في المتصفح`,
    description: `${name} يعمل في هذا التبويب. Freela لا ترفع المُدخل.`,
    h1: name,
    intro: `${name} يبقى على هذا الجهاز. هذه أداة وليست استشارة ضريبية أو طبية أو قانونية.`,
  }),
  he: (name) => ({
    title: `${name} בדפדפן`,
    description: `${name} רץ בלשונית הזו. Freela לא מעלה את הקלט.`,
    h1: name,
    intro: `${name} נשאר במכשיר הזה. זה כלי עזר ולא ייעוץ מס, רפואי או משפטי.`,
  }),
};

function shellCopy(tool: EnglishTool, locale: Locale): ToolDefinition["copy"][string] {
  const name = tool.copyEn.name;
  const shell = SHELL[locale]?.(name);
  const title = clamp(shell?.title ?? tool.copyEn.title, 10, 70);
  const description = clamp(shell?.description ?? tool.copyEn.description, 40, 170);
  return {
    name,
    slug: tool.id,
    title,
    description,
    h1: clamp(shell?.h1 ?? name, 4, 80),
    intro: ensureMin(shell?.intro ?? tool.copyEn.intro, 40),
    howTo: fallbackHowTo(locale, name).map((step) => ensureMin(step, 8)),
    faq: fallbackFaq(locale),
    privacy: privacyFor(tool, locale),
    formats: ensureMin(fallbackFormats(locale), 8),
    examples: fallbackExamples(locale, name).map((ex) => ensureMin(ex, 8)),
  };
}

function copyFor(tool: EnglishTool, locale: Locale): ToolDefinition["copy"][string] | null {
  if (isNewLocale(locale) || isEuLocale(locale)) {
    const curated = composeTop20Copy(tool.id, locale, tool.inputTypes);
    const base = isNewLocale(locale) ? synthesizeToolCopy(tool, locale) : synthesizeToolCopyEu(tool, locale);
    if (!curated) return base;
    return {
      ...base,
      name: curated.name,
      title: curated.title,
      description: curated.description,
      h1: curated.h1,
      intro: curated.intro,
    };
  }
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
  if (!pack && !seo) return shellCopy(tool, locale);
  const faq = [
    ...(seo?.faq ?? []),
    ...((pack?.faq ?? []).map((item) => ({
      question: ensureMin(item.question, 8),
      answer: ensureMin(item.answer, 8),
    }))),
  ]
    .filter((item, i, arr) => arr.findIndex((x) => x.question === item.question) === i)
    .slice(0, 8);
  const name = seo?.name ?? ensureMin(pack?.name ?? tool.copyEn.name, 2);
  const howTo = (pack?.howTo?.length ? pack.howTo : fallbackHowTo(locale, name)).map((step) => ensureMin(step, 8));
  const examples = (pack?.examples?.length ? pack.examples : fallbackExamples(locale, name)).map((ex) =>
    ensureMin(ex, 8),
  );
  return {
    name,
    slug: tool.id,
    title: clamp(seo?.title ?? pack?.title ?? tool.copyEn.title, 10, 70),
    description: clamp(seo?.description ?? pack?.description ?? tool.copyEn.description, 40, 170),
    h1: clamp(seo?.h1 ?? pack?.h1 ?? tool.copyEn.h1, 4, 80),
    intro: ensureMin(
      seo?.intro ?? (pack && pack.intro.length >= 40 ? pack.intro : `${pack?.intro ?? ""} ${pack?.description ?? tool.copyEn.description}`),
      40,
    ),
    howTo,
    faq: faq.length >= 2 ? faq : fallbackFaq(locale),
    privacy: pack?.privacy ?? privacyFor(tool, locale),
    formats: ensureMin(pack?.formats ?? fallbackFormats(locale), 8),
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

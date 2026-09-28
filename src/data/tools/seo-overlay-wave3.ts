import type { Locale } from "../locales";
import type { SeoOverlay } from "./seo-overlay";
import { wave3Tools } from "./english-wave3";

function en(name: string, blurb: string): SeoOverlay {
  const title = `${name} online — free, no upload`.slice(0, 70);
  const description = `${name}. ${blurb} Free. Files and text stay on your device — Freela does not upload them.`.slice(0, 170);
  return {
    name,
    title,
    description,
    h1: name,
    intro: `${blurb} Runs in this browser tab. Files and text stay on your device — Freela does not upload them. This is a utility, not professional, legal, tax or medical advice.`,
    faq: [
      { question: "Does this tool upload my files?", answer: "No. Published Freela tools in this release are LOCAL_ONLY and run in the browser." },
      { question: "Is it free to use?", answer: "Yes. There is no paywall on this page and we do not invent reviews or star ratings." },
      { question: `What does ${name} do?`, answer: blurb },
    ],
  };
}

export const wave3Seo: Record<string, Partial<Record<Locale, SeoOverlay>>> = Object.fromEntries(
  wave3Tools.map((tool) => [tool.id, { en: en(tool.copyEn.name, tool.copyEn.intro) }]),
);

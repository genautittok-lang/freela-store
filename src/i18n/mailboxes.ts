import type { Locale } from "@/data/locales";
import { isLocale } from "@/data/locales";
import { mail8 } from "@/i18n/locale8";

export type MailRoles = {
  tools: string;
  partner: string;
  info: string;
  creator: string;
};

const roles: Record<Locale, MailRoles> = {
  en: { tools: "Tools and questions", partner: "Advertising and partnerships", info: "General information", creator: "Creators and content partners" },
  de: { tools: "Werkzeuge und Fragen", partner: "Werbung und Partnerschaften", info: "Allgemeine Auskünfte", creator: "Creator und Inhaltspartner" },
  uk: { tools: "Інструменти й запитання", partner: "Реклама й партнерства", info: "Загальна інформація", creator: "Автори та контент-партнери" },
  pl: { tools: "Narzędzia i pytania", partner: "Reklama i partnerstwa", info: "Informacje ogólne", creator: "Twórcy i partnerzy treści" },
  fr: { tools: "Outils et questions", partner: "Publicité et partenariats", info: "Informations générales", creator: "Créateurs et partenaires de contenu" },
  es: { tools: "Herramientas y preguntas", partner: "Publicidad y alianzas", info: "Información general", creator: "Creadores y socios de contenido" },
  it: { tools: "Strumenti e domande", partner: "Pubblicità e partnership", info: "Informazioni generali", creator: "Creator e partner di contenuto" },
  pt: { tools: "Ferramentas e perguntas", partner: "Publicidade e parcerias", info: "Informação geral", creator: "Criadores e parceiros de conteúdo" },
  nl: { tools: "Tools en vragen", partner: "Adverteren en partnerschappen", info: "Algemene informatie", creator: "Makers en contentpartners" },
  tr: { tools: "Araçlar ve sorular", partner: "Reklam ve ortaklıklar", info: "Genel bilgi", creator: "İçerik üreticileri ve ortaklar" },
  ar: { tools: "الأدوات والأسئلة", partner: "الإعلان والشراكات", info: "معلومات عامة", creator: "صنّاع المحتوى وشركاؤه" },
  he: { tools: "כלים ושאלות", partner: "פרסום ושותפויות", info: "מידע כללי", creator: "יוצרים ושותפי תוכן" },
  ...mail8,
};

export function mailRoles(locale: string): MailRoles {
  return roles[isLocale(locale) ? locale : "en"];
}

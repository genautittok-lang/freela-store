import type { Locale } from "../locales";
import { INITIAL_LOCALES } from "../locales";
import { extraPrivacy, isNewLocale } from "@/i18n/locale8";
import type { CategoryId } from "../categories";
import type { ToolDefinition } from "../schema";

export function l(strings: TemplateStringsArray): Record<Locale, string> {
  const parts = strings[0]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const core = INITIAL_LOCALES.filter((locale) => !isNewLocale(locale));
  if (parts.length !== core.length && parts.length !== INITIAL_LOCALES.length) {
    throw new Error(`Expected ${core.length} or ${INITIAL_LOCALES.length} lines, got ${parts.length}: ${parts[0]}`);
  }
  return Object.fromEntries(
    INITIAL_LOCALES.map((locale, i) => [
      locale,
      parts[i] ?? (isNewLocale(locale) ? extraPrivacy(parts[0], locale) : parts[0]),
    ]),
  ) as Record<Locale, string>;
}

export function ls(rows: TemplateStringsArray): Record<Locale, string[]> {
  const lines = rows[0]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const perLocale = INITIAL_LOCALES.length;
  if (lines.length % perLocale !== 0) {
    throw new Error(`ls() lines must be a multiple of ${perLocale}, got ${lines.length}`);
  }
  const count = lines.length / perLocale;
  const out = Object.fromEntries(INITIAL_LOCALES.map((locale) => [locale, [] as string[]])) as Record<
    Locale,
    string[]
  >;
  for (let step = 0; step < count; step++) {
    INITIAL_LOCALES.forEach((locale, i) => {
      out[locale].push(lines[step * perLocale + i]);
    });
  }
  return out;
}

type CopyInput = {
  name: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  h1: Record<Locale, string>;
  intro: Record<Locale, string>;
  howTo: Record<Locale, string[]>;
  faq: { q: Record<Locale, string>; a: Record<Locale, string> }[];
  privacy: Record<Locale, string>;
  formats: Record<Locale, string>;
  examples: Record<Locale, string[]>;
};

export function defineTool(
  meta: Omit<ToolDefinition, "copy" | "eventName" | "toolVersion" | "adSlots" | "deletion"> & {
    copy: CopyInput;
  },
): ToolDefinition {
  const copy = {} as ToolDefinition["copy"];
  for (const locale of INITIAL_LOCALES) {
    copy[locale] = {
      name: meta.copy.name[locale],
      slug: meta.id,
      title: meta.copy.title[locale],
      description: meta.copy.description[locale],
      h1: meta.copy.h1[locale],
      intro: meta.copy.intro[locale],
      howTo: meta.copy.howTo[locale],
      faq: meta.copy.faq.map((item) => ({
        question: item.q[locale],
        answer: item.a[locale],
      })),
      privacy: meta.copy.privacy[locale],
      formats: meta.copy.formats[locale],
      examples: meta.copy.examples[locale],
    };
  }
  return {
    ...meta,
    eventName: `tool_${meta.id.replace(/-/g, "_")}`,
    toolVersion: "1.0.0",
    adSlots: ["after-result"],
    deletion:
      "Files never leave this device. Object URLs are revoked when you leave the page or pick a new file.",
    copy,
  };
}

export const privacyFiles = l`
This tool runs entirely in your browser. Files are not uploaded to Freela servers and are discarded when you close the tab.
Dieses Werkzeug läuft vollständig im Browser. Dateien werden nicht auf Freela-Server hochgeladen und beim Schließen des Tabs verworfen.
Цей інструмент працює повністю у браузері. Файли не завантажуються на сервери Freela і скидаються після закриття вкладки.
To narzędzie działa w całości w przeglądarce. Pliki nie są wysyłane na serwery Freela i są usuwane po zamknięciu karty.
Cet outil s’exécute entièrement dans votre navigateur. Les fichiers ne sont pas envoyés aux serveurs Freela et sont jetés à la fermeture de l’onglet.
Esta herramienta se ejecuta por completo en el navegador. Los archivos no se suben a servidores de Freela y se descartan al cerrar la pestaña.
Questo strumento viene eseguito interamente nel browser. I file non vengono caricati sui server Freela e vengono scartati alla chiusura della scheda.
Esta ferramenta corre inteiramente no navegador. Os ficheiros não são enviados para servidores Freela e são descartados ao fechar o separador.
Deze tool draait volledig in je browser. Bestanden worden niet naar Freela-servers geüpload en verdwijnen als je het tabblad sluit.
Bu araç tamamen tarayıcınızda çalışır. Dosyalar Freela sunucularına yüklenmez ve sekmeyi kapattığınızda silinir.
تعمل هذه الأداة بالكامل في المتصفح. لا تُرفع الملفات إلى خوادم Freela وتُحذف عند إغلاق التبويب.
הכלי רץ כולו בדפדפן. קבצים לא מועלים לשרתי Freela ונמחקים בסגירת הלשונית.
`;

export const privacyText = l`
All text stays in your browser. Freela does not receive, store or train on the content you paste.
Der gesamte Text bleibt im Browser. Freela empfängt, speichert oder trainiert nicht mit Ihren Inhalten.
Увесь текст лишається у браузері. Freela не отримує, не зберігає і не навчається на вставленому вмісті.
Cały tekst zostaje w przeglądarce. Freela nie odbiera, nie przechowuje i nie trenuje na wklejonej treści.
Tout le texte reste dans votre navigateur. Freela ne reçoit, ne stocke ni n’entraîne de modèles sur le contenu collé.
Todo el texto permanece en el navegador. Freela no recibe, almacena ni entrena con el contenido que pegas.
Tutto il testo resta nel browser. Freela non riceve, non memorizza e non addestra modelli sul contenuto incollato.
Todo o texto fica no navegador. A Freela não recebe, guarda nem treina modelos com o conteúdo colado.
Alle tekst blijft in je browser. Freela ontvangt, bewaart of traint niet op de inhoud die je plakt.
Tüm metin tarayıcınızda kalır. Freela yapıştırdığınız içeriği almaz, saklamaz ve onunla model eğitmez.
يبقى كل النص في المتصفح. Freela لا تستلم المحتوى ولا تخزّنه ولا تتدرب عليه.
כל הטקסט נשאר בדפדפן. Freela לא מקבלת, לא שומרת ולא מאמנת מודלים על התוכן שהדבקתם.
`;

export const baseMeta = {
  status: "published" as const,
  processingMode: "LOCAL_ONLY" as const,
  clientOnly: true,
  retention: "none",
  tested: true,
  translationReviewed: true,
  seoReviewed: true,
  lastReviewedAt: "2026-09-24",
  lastModified: "2026-09-24",
};

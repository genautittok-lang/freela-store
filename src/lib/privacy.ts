import type { Locale } from "@/data/locales";
import type { ToolDefinition } from "@/data/schema";

export type ProcessingMode = ToolDefinition["processingMode"];

const notices: Record<ProcessingMode, Record<"en" | "uk", string> & Partial<Record<Locale, string>>> = {
  LOCAL_ONLY: {
    en: "Processed locally in your browser. Files and pasted text are not uploaded to Freela.",
    uk: "Оброблено локально у браузері. Файли й вставлений текст не надсилаються на Freela.",
    de: "Lokal im Browser verarbeitet. Dateien und eingefügter Text werden nicht zu Freela hochgeladen.",
    pl: "Przetwarzane lokalnie w przeglądarce. Pliki i wklejony tekst nie są wysyłane do Freela.",
    fr: "Traité localement dans le navigateur. Fichiers et texte collé ne sont pas envoyés à Freela.",
    es: "Procesado en local en el navegador. Los archivos y el texto pegado no se suben a Freela.",
    it: "Elaborato in locale nel browser. File e testo incollato non vengono inviati a Freela.",
    pt: "Processado localmente no browser. Ficheiros e texto colado não são enviados para a Freela.",
    nl: "Lokaal in de browser verwerkt. Bestanden en geplakte tekst gaan niet naar Freela.",
    tr: "Tarayıcınızda yerel işlenir. Dosyalar ve yapıştırılan metin Freela’ya yüklenmez.",
  },
  SERVER_PROCESSING: {
    en: "This file is uploaded to Freela for processing, then deleted. It is not kept as a history.",
    uk: "Файл завантажується на Freela для обробки, потім видаляється. Історія файлів не зберігається.",
    de: "Die Datei wird zur Verarbeitung an Freela gesendet und anschließend gelöscht.",
    pl: "Plik jest przesyłany do Freela, a następnie usuwany. Nie prowadzimy historii plików.",
    fr: "Le fichier est envoyé à Freela pour traitement, puis supprimé. Pas d’historique.",
    es: "El archivo se sube a Freela para procesarlo y luego se elimina. No hay historial.",
    it: "Il file viene caricato su Freela, elaborato e poi eliminato. Nessuno storico.",
    pt: "O ficheiro é enviado à Freela, processado e apagado. Sem histórico.",
    nl: "Het bestand gaat naar Freela, wordt verwerkt en daarna verwijderd.",
    tr: "Dosya işlenmek üzere Freela’ya yüklenir, ardından silinir. Geçmiş tutulmaz.",
  },
  THIRD_PARTY_PROCESSING: {
    en: "This file is sent to a named third-party processor. See the vendor list and privacy policy.",
    uk: "Файл надсилається названому сторонньому обробнику. Див. список постачальників і політику.",
    de: "Die Datei geht an einen benannten Drittanbieter. Siehe Vendor-Liste und Datenschutzerklärung.",
    pl: "Plik trafia do nazwanego procesora zewnętrznego. Zobacz listę dostawców i politykę.",
    fr: "Le fichier est envoyé à un sous-traitant nommé. Voir la liste des prestataires.",
    es: "El archivo se envía a un encargado identificado. Consulta la lista de proveedores.",
    it: "Il file è inviato a un responsabile nominato. Vedi l’elenco fornitori.",
    pt: "O ficheiro vai para um subcontratante identificado. Ver lista de fornecedores.",
    nl: "Het bestand gaat naar een benoemde derde. Zie de leverancierslijst.",
    tr: "Dosya adlı bir üçüncü taraf işlemciye gönderilir. Satıcı listesine bakın.",
  },
};

export function privacyNotice(mode: ProcessingMode, locale: Locale) {
  return notices[mode][locale] || notices[mode].en;
}

export function privacyLabel(mode: ProcessingMode, locale: Locale) {
  if (mode === "LOCAL_ONLY") {
    return locale === "uk" ? "Лише на пристрої" : locale === "de" ? "Nur lokal" : "Local only";
  }
  if (mode === "SERVER_PROCESSING") {
    return locale === "uk" ? "Сервер Freela" : "Freela server";
  }
  return locale === "uk" ? "Сторонній сервіс" : "Third party";
}

import type { Locale } from "@/data/locales";

const IMPROVE_EN: Record<string, string> = {
  "text-to-pdf": "Create PDF",
  "markdown-to-pdf": "Create PDF",
  "extract-pdf-text": "Extract text",
  "delete-pdf-pages": "Delete pages",
  "rotate-image": "Rotate image",
  "flip-image": "Flip image",
  "utm-builder": "Build UTM URL",
  "random-number": "Generate numbers",
};

const IMPROVE_DE: Record<string, string> = {
  "text-to-pdf": "PDF erzeugen",
  "markdown-to-pdf": "PDF erzeugen",
  "extract-pdf-text": "Text extrahieren",
  "delete-pdf-pages": "Seiten löschen",
  "rotate-image": "Bild drehen",
  "flip-image": "Bild spiegeln",
  "utm-builder": "UTM-URL bauen",
  "random-number": "Zahlen erzeugen",
};

const IMPROVE_UK: Record<string, string> = {
  "text-to-pdf": "Створити PDF",
  "markdown-to-pdf": "Створити PDF",
  "extract-pdf-text": "Витягти текст",
  "delete-pdf-pages": "Видалити сторінки",
  "rotate-image": "Повернути зображення",
  "flip-image": "Віддзеркалити",
  "utm-builder": "Зібрати UTM",
  "random-number": "Згенерувати числа",
};

const IMPROVE_PL: Record<string, string> = {
  "text-to-pdf": "Utwórz PDF",
  "markdown-to-pdf": "Utwórz PDF",
  "extract-pdf-text": "Wyodrębnij tekst",
  "delete-pdf-pages": "Usuń strony",
  "rotate-image": "Obróć obraz",
  "flip-image": "Odbij obraz",
  "utm-builder": "Zbuduj UTM",
  "random-number": "Generuj liczby",
};

const IMPROVE_FR: Record<string, string> = {
  "text-to-pdf": "Créer le PDF",
  "markdown-to-pdf": "Créer le PDF",
  "extract-pdf-text": "Extraire le texte",
  "delete-pdf-pages": "Supprimer des pages",
  "rotate-image": "Pivoter l’image",
  "flip-image": "Retourner l’image",
  "utm-builder": "Construire l’UTM",
  "random-number": "Générer des nombres",
};

const IMPROVE_ES: Record<string, string> = {
  "text-to-pdf": "Crear PDF",
  "markdown-to-pdf": "Crear PDF",
  "extract-pdf-text": "Extraer texto",
  "delete-pdf-pages": "Borrar páginas",
  "rotate-image": "Rotar imagen",
  "flip-image": "Voltear imagen",
  "utm-builder": "Crear URL UTM",
  "random-number": "Generar números",
};

const IMPROVE_IT: Record<string, string> = {
  "text-to-pdf": "Crea PDF",
  "markdown-to-pdf": "Crea PDF",
  "extract-pdf-text": "Estrai testo",
  "delete-pdf-pages": "Elimina pagine",
  "rotate-image": "Ruota immagine",
  "flip-image": "Capovolgi immagine",
  "utm-builder": "Crea URL UTM",
  "random-number": "Genera numeri",
};

const IMPROVE_PT: Record<string, string> = {
  "text-to-pdf": "Criar PDF",
  "markdown-to-pdf": "Criar PDF",
  "extract-pdf-text": "Extrair texto",
  "delete-pdf-pages": "Apagar páginas",
  "rotate-image": "Rodar imagem",
  "flip-image": "Inverter imagem",
  "utm-builder": "Criar URL UTM",
  "random-number": "Gerar números",
};

const IMPROVE_NL: Record<string, string> = {
  "text-to-pdf": "PDF maken",
  "markdown-to-pdf": "PDF maken",
  "extract-pdf-text": "Tekst extraheren",
  "delete-pdf-pages": "Pagina's verwijderen",
  "rotate-image": "Afbeelding draaien",
  "flip-image": "Afbeelding spiegelen",
  "utm-builder": "UTM-URL bouwen",
  "random-number": "Getallen genereren",
};

const IMPROVE_TR: Record<string, string> = {
  "text-to-pdf": "PDF oluştur",
  "markdown-to-pdf": "PDF oluştur",
  "extract-pdf-text": "Metni çıkar",
  "delete-pdf-pages": "Sayfaları sil",
  "rotate-image": "Görseli döndür",
  "flip-image": "Görseli çevir",
  "utm-builder": "UTM URL oluştur",
  "random-number": "Sayı üret",
};

const IMPROVE_AR: Record<string, string> = {
  "text-to-pdf": "إنشاء PDF",
  "markdown-to-pdf": "إنشاء PDF",
  "extract-pdf-text": "استخراج النص",
  "delete-pdf-pages": "حذف الصفحات",
  "rotate-image": "تدوير الصورة",
  "flip-image": "عكس الصورة",
  "utm-builder": "بناء رابط UTM",
  "random-number": "توليد أرقام",
};

const IMPROVE_HE: Record<string, string> = {
  "text-to-pdf": "צור PDF",
  "markdown-to-pdf": "צור PDF",
  "extract-pdf-text": "חלץ טקסט",
  "delete-pdf-pages": "מחק עמודים",
  "rotate-image": "סובב תמונה",
  "flip-image": "הפוך תמונה",
  "utm-builder": "בנה כתובת UTM",
  "random-number": "צור מספרים",
};

export const IMPROVE_LABELS: Record<Locale, Record<string, string>> = {
  en: IMPROVE_EN,
  de: IMPROVE_DE,
  uk: IMPROVE_UK,
  pl: IMPROVE_PL,
  fr: IMPROVE_FR,
  es: IMPROVE_ES,
  it: IMPROVE_IT,
  pt: IMPROVE_PT,
  nl: IMPROVE_NL,
  tr: IMPROVE_TR,
  ar: IMPROVE_AR,
  he: IMPROVE_HE,
};

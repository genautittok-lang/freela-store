import type { Locale } from "./locales";

export const CATEGORY_IDS = [
  "pdf-documents",
  "images",
  "text",
  "developer",
  "seo",
  "calculators",
  "converters",
  "color",
  "generators",
  "date-time",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type CategoryCopy = {
  name: string;
  slug: string;
  description: string;
  h1: string;
};

export type CategoryDefinition = {
  id: CategoryId;
  featured: boolean;
  copy: Record<Locale, CategoryCopy>;
};

const C = (
  id: CategoryId,
  featured: boolean,
  rows: Record<Locale, [string, string, string, string]>,
): CategoryDefinition => ({
  id,
  featured,
  copy: Object.fromEntries(
    Object.entries(rows).map(([locale, [name, slug, description, h1]]) => [
      locale,
      { name, slug, description, h1 },
    ]),
  ) as Record<Locale, CategoryCopy>,
});

export const categories: CategoryDefinition[] = [
  C("pdf-documents", true, {
    en: ["PDF & Documents", "pdf", "Merge, split, rotate and inspect PDFs in your browser.", "PDF tools"],
    de: ["PDF & Dokumente", "pdf", "PDFs im Browser zusammenführen, teilen, drehen und prüfen.", "PDF-Werkzeuge"],
    uk: ["PDF і документи", "pdf", "Об’єднуйте, діліть, обертайте та перевіряйте PDF у браузері.", "Інструменти PDF"],
    pl: ["PDF i dokumenty", "pdf", "Łącz, dziel, obracaj i sprawdzaj PDF w przeglądarce.", "Narzędzia PDF"],
    fr: ["PDF et documents", "pdf", "Fusionnez, découpez, faites pivoter et inspectez des PDF dans le navigateur.", "Outils PDF"],
    es: ["PDF y documentos", "pdf", "Une, divide, rota e inspecciona PDF en el navegador.", "Herramientas PDF"],
    it: ["PDF e documenti", "pdf", "Unisci, dividi, ruota e ispeziona PDF nel browser.", "Strumenti PDF"],
    pt: ["PDF e documentos", "pdf", "Junte, divida, rode e inspecione PDFs no navegador.", "Ferramentas PDF"],
    nl: ["PDF en documenten", "pdf", "PDF's samenvoegen, splitsen, draaien en inspecteren in de browser.", "PDF-tools"],
    tr: ["PDF ve belgeler", "pdf", "PDF dosyalarını tarayıcıda birleştirin, bölün, döndürün ve inceleyin.", "PDF araçları"],
  }),
  C("images", true, {
    en: ["Images", "images", "Compress, resize, convert and encode images locally.", "Image tools"],
    de: ["Bilder", "bilder", "Bilder lokal komprimieren, skalieren, konvertieren und kodieren.", "Bild-Werkzeuge"],
    uk: ["Зображення", "images", "Стискайте, змінюйте розмір, конвертуйте та кодуйте зображення локально.", "Інструменти зображень"],
    pl: ["Obrazy", "obrazy", "Kompresuj, skaluj, konwertuj i koduj obrazy lokalnie.", "Narzędzia obrazów"],
    fr: ["Images", "images", "Compressez, redimensionnez, convertissez et encodez des images localement.", "Outils images"],
    es: ["Imágenes", "imagenes", "Comprime, redimensiona, convierte y codifica imágenes en local.", "Herramientas de imagen"],
    it: ["Immagini", "immagini", "Comprimi, ridimensiona, converti e codifica immagini in locale.", "Strumenti immagini"],
    pt: ["Imagens", "imagens", "Comprima, redimensione, converta e codifique imagens localmente.", "Ferramentas de imagem"],
    nl: ["Afbeeldingen", "afbeeldingen", "Afbeeldingen lokaal comprimeren, schalen, converteren en encoderen.", "Afbeeldingstools"],
    tr: ["Görseller", "gorseller", "Görselleri yerelde sıkıştırın, boyutlandırın, dönüştürün ve kodlayın.", "Görsel araçları"],
  }),
  C("text", true, {
    en: ["Text", "text", "Count words, clean lists, generate slugs and inspect text stats.", "Text tools"],
    de: ["Text", "text", "Wörter zählen, Listen bereinigen, Slugs erzeugen und Textstatistiken prüfen.", "Text-Werkzeuge"],
    uk: ["Текст", "text", "Рахуйте слова, очищайте списки, створюйте slug і аналізуйте текст.", "Текстові інструменти"],
    pl: ["Tekst", "tekst", "Liczenie słów, czyszczenie list, slugi i statystyki tekstu.", "Narzędzia tekstowe"],
    fr: ["Texte", "texte", "Comptez les mots, nettoyez des listes, créez des slugs et analysez le texte.", "Outils texte"],
    es: ["Texto", "texto", "Cuenta palabras, limpia listas, genera slugs y analiza texto.", "Herramientas de texto"],
    it: ["Testo", "testo", "Conta parole, pulisci elenchi, genera slug e analizza il testo.", "Strumenti di testo"],
    pt: ["Texto", "texto", "Conte palavras, limpe listas, gere slugs e analise texto.", "Ferramentas de texto"],
    nl: ["Tekst", "tekst", "Woorden tellen, lijsten opschonen, slugs maken en tekststatistieken.", "Teksttools"],
    tr: ["Metin", "metin", "Kelime sayın, listeleri temizleyin, slug oluşturun ve metni analiz edin.", "Metin araçları"],
  }),
  C("developer", true, {
    en: ["Developer", "developer", "Format JSON, encode URLs, hash strings and decode sample JWTs.", "Developer tools"],
    de: ["Entwickler", "entwickler", "JSON formatieren, URLs kodieren, Hashes erzeugen und Beispiel-JWTs dekodieren.", "Entwickler-Werkzeuge"],
    uk: ["Розробнику", "developer", "Форматуйте JSON, кодуйте URL, хешуйте рядки та декодуйте зразки JWT.", "Інструменти розробника"],
    pl: ["Dla deweloperów", "developer", "Formatuj JSON, koduj URL, hashuj ciągi i dekoduj przykładowe JWT.", "Narzędzia deweloperskie"],
    fr: ["Développeur", "developpeur", "Formatez du JSON, encodez des URL, hachez des chaînes et décodez des JWT d’exemple.", "Outils développeur"],
    es: ["Desarrollador", "desarrollador", "Formatea JSON, codifica URL, genera hashes y decodifica JWT de ejemplo.", "Herramientas de desarrollo"],
    it: ["Sviluppatore", "sviluppatore", "Formatta JSON, codifica URL, genera hash e decodifica JWT di esempio.", "Strumenti per sviluppatori"],
    pt: ["Programador", "programador", "Formate JSON, codifique URLs, gere hashes e descodifique JWT de exemplo.", "Ferramentas de programador"],
    nl: ["Ontwikkelaar", "ontwikkelaar", "JSON formatteren, URL's encoderen, hashes maken en voorbeeld-JWTs decoderen.", "Ontwikkelaarstools"],
    tr: ["Geliştirici", "gelistirici", "JSON biçimlendirin, URL kodlayın, hash üretin ve örnek JWT çözün.", "Geliştirici araçları"],
  }),
  C("seo", true, {
    en: ["SEO", "seo", "Build meta tags, robots.txt, hreflang sets and SERP previews.", "SEO tools"],
    de: ["SEO", "seo", "Meta-Tags, robots.txt, hreflang-Sets und SERP-Vorschauen erstellen.", "SEO-Werkzeuge"],
    uk: ["SEO", "seo", "Створюйте метатеги, robots.txt, набори hreflang і прев’ю SERP.", "SEO-інструменти"],
    pl: ["SEO", "seo", "Twórz meta tagi, robots.txt, zestawy hreflang i podgląd SERP.", "Narzędzia SEO"],
    fr: ["SEO", "seo", "Créez des balises meta, robots.txt, jeux hreflang et aperçus SERP.", "Outils SEO"],
    es: ["SEO", "seo", "Crea metaetiquetas, robots.txt, conjuntos hreflang y vistas SERP.", "Herramientas SEO"],
    it: ["SEO", "seo", "Crea meta tag, robots.txt, set hreflang e anteprime SERP.", "Strumenti SEO"],
    pt: ["SEO", "seo", "Crie meta tags, robots.txt, conjuntos hreflang e pré-visualizações SERP.", "Ferramentas SEO"],
    nl: ["SEO", "seo", "Meta-tags, robots.txt, hreflang-sets en SERP-previews maken.", "SEO-tools"],
    tr: ["SEO", "seo", "Meta etiketleri, robots.txt, hreflang kümeleri ve SERP önizlemeleri oluşturun.", "SEO araçları"],
  }),
  C("calculators", true, {
    en: ["Calculators", "calculators", "Percentage, VAT, discount, margin, BMI and date math.", "Calculators"],
    de: ["Rechner", "rechner", "Prozent, MwSt., Rabatt, Marge, BMI und Datumsdifferenzen.", "Rechner"],
    uk: ["Калькулятори", "calculators", "Відсотки, ПДВ, знижки, маржа, ІМТ і різниця дат.", "Калькулятори"],
    pl: ["Kalkulatory", "kalkulatory", "Procent, VAT, rabat, marża, BMI i różnica dat.", "Kalkulatory"],
    fr: ["Calculateurs", "calculateurs", "Pourcentage, TVA, remise, marge, IMC et écart de dates.", "Calculateurs"],
    es: ["Calculadoras", "calculadoras", "Porcentaje, IVA, descuento, margen, IMC y diferencia de fechas.", "Calculadoras"],
    it: ["Calcolatrici", "calcolatrici", "Percentuale, IVA, sconto, margine, BMI e differenza date.", "Calcolatrici"],
    pt: ["Calculadoras", "calculadoras", "Percentagem, IVA, desconto, margem, IMC e diferença de datas.", "Calculadoras"],
    nl: ["Rekenmachines", "rekenmachines", "Percentage, btw, korting, marge, BMI en datumverschil.", "Rekenmachines"],
    tr: ["Hesaplayıcılar", "hesaplayicilar", "Yüzde, KDV, indirim, marj, BMI ve tarih farkı.", "Hesaplayıcılar"],
  }),
  C("converters", true, {
    en: ["Converters", "converters", "Convert length, weight, temperature and data sizes with locale-aware units.", "Unit converters"],
    de: ["Umrechner", "umrechner", "Länge, Gewicht, Temperatur und Datengrößen lokalisiert umrechnen.", "Einheitenumrechner"],
    uk: ["Конвертери", "converters", "Конвертуйте довжину, вагу, температуру та розмір даних.", "Конвертери одиниць"],
    pl: ["Konwertery", "konwertery", "Przeliczaj długość, wagę, temperaturę i rozmiar danych.", "Konwertery jednostek"],
    fr: ["Convertisseurs", "convertisseurs", "Convertissez longueur, poids, température et tailles de données.", "Convertisseurs d’unités"],
    es: ["Convertidores", "convertidores", "Convierte longitud, peso, temperatura y tamaño de datos.", "Convertidores de unidades"],
    it: ["Convertitori", "convertitori", "Converti lunghezza, peso, temperatura e dimensioni dei dati.", "Convertitori di unità"],
    pt: ["Conversores", "conversores", "Converta comprimento, peso, temperatura e tamanho de dados.", "Conversores de unidades"],
    nl: ["Converters", "converters", "Lengte, gewicht, temperatuur en datagrootte omrekenen.", "Eenhedenconverters"],
    tr: ["Dönüştürücüler", "donusturuculer", "Uzunluk, ağırlık, sıcaklık ve veri boyutunu dönüştürün.", "Birim dönüştürücüler"],
  }),
  C("color", false, {
    en: ["Color", "color", "Convert HEX/RGB/HSL, check contrast and build palettes.", "Color tools"],
    de: ["Farbe", "farbe", "HEX/RGB/HSL umwandeln, Kontrast prüfen und Paletten erzeugen.", "Farb-Werkzeuge"],
    uk: ["Колір", "color", "Конвертуйте HEX/RGB/HSL, перевіряйте контраст і створюйте палітри.", "Інструменти кольору"],
    pl: ["Kolor", "kolor", "Konwersja HEX/RGB/HSL, kontrast i palety.", "Narzędzia kolorów"],
    fr: ["Couleur", "couleur", "Convertissez HEX/RVB/HSL, vérifiez le contraste et créez des palettes.", "Outils couleur"],
    es: ["Color", "color", "Convierte HEX/RGB/HSL, comprueba contraste y crea paletas.", "Herramientas de color"],
    it: ["Colore", "colore", "Converti HEX/RGB/HSL, verifica il contrasto e crea palette.", "Strumenti colore"],
    pt: ["Cor", "cor", "Converta HEX/RGB/HSL, verifique contraste e crie paletas.", "Ferramentas de cor"],
    nl: ["Kleur", "kleur", "HEX/RGB/HSL omzetten, contrast controleren en paletten maken.", "Kleurtools"],
    tr: ["Renk", "renk", "HEX/RGB/HSL dönüştürün, kontrast kontrol edin ve palet oluşturun.", "Renk araçları"],
  }),
  C("generators", false, {
    en: ["Generators", "generators", "Create passwords, QR codes and random strings on-device.", "Generators"],
    de: ["Generatoren", "generatoren", "Passwörter, QR-Codes und Zufallsstrings lokal erzeugen.", "Generatoren"],
    uk: ["Генератори", "generators", "Створюйте паролі, QR-коди та випадкові рядки на пристрої.", "Генератори"],
    pl: ["Generatory", "generatory", "Twórz hasła, kody QR i losowe ciągi na urządzeniu.", "Generatory"],
    fr: ["Générateurs", "generateurs", "Créez mots de passe, QR codes et chaînes aléatoires sur l’appareil.", "Générateurs"],
    es: ["Generadores", "generadores", "Crea contraseñas, códigos QR y cadenas aleatorias en el dispositivo.", "Generadores"],
    it: ["Generatori", "generatori", "Crea password, QR code e stringhe casuali sul dispositivo.", "Generatori"],
    pt: ["Geradores", "geradores", "Crie palavras-passe, códigos QR e cadeias aleatórias no dispositivo.", "Geradores"],
    nl: ["Generatoren", "generatoren", "Wachtwoorden, QR-codes en willekeurige strings op het apparaat maken.", "Generatoren"],
    tr: ["Üreticiler", "ureticiler", "Cihazda parola, QR kodu ve rastgele dizeler oluşturun.", "Üreticiler"],
  }),
  C("date-time", false, {
    en: ["Date & Time", "date-time", "Unix timestamps and timezone conversion without sending data away.", "Date & time tools"],
    de: ["Datum & Zeit", "datum-zeit", "Unix-Zeitstempel und Zeitzonen lokal umrechnen.", "Datum- und Zeit-Werkzeuge"],
    uk: ["Дата і час", "date-time", "Unix-мітки та часові пояси без надсилання даних.", "Інструменти дати й часу"],
    pl: ["Data i czas", "data-czas", "Znaczniki Unix i strefy czasowe bez wysyłania danych.", "Narzędzia daty i czasu"],
    fr: ["Date et heure", "date-heure", "Horodatage Unix et fuseaux horaires sans envoyer de données.", "Outils date et heure"],
    es: ["Fecha y hora", "fecha-hora", "Marcas Unix y zonas horarias sin enviar datos.", "Herramientas de fecha y hora"],
    it: ["Data e ora", "data-ora", "Timestamp Unix e fusi orari senza inviare dati.", "Strumenti data e ora"],
    pt: ["Data e hora", "data-hora", "Carimbos Unix e fusos horários sem enviar dados.", "Ferramentas de data e hora"],
    nl: ["Datum en tijd", "datum-tijd", "Unix-tijdstempels en tijdzones zonder data te versturen.", "Datum- en tijdtools"],
    tr: ["Tarih ve saat", "tarih-saat", "Veri göndermeden Unix zaman damgası ve saat dilimi dönüştürme.", "Tarih ve saat araçları"],
  }),
];

export function categoryById(id: string) {
  return categories.find((c) => c.id === id);
}

export function categoryBySlug(locale: Locale, slug: string) {
  return categories.find((c) => c.copy[locale].slug === slug);
}

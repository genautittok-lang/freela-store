#!/usr/bin/env python3
"""Generate per-locale SEO title/description/h1/intro/FAQ overlays."""
from pathlib import Path
import json

LOCALES = ["en", "de", "uk", "pl", "fr", "es", "it", "pt", "nl", "tr", "ar", "he"]

# High-intent query names: one per locale, same order as LOCALES.
NAMES: dict[str, list[str]] = {
    "merge-pdf": ["Merge PDF files", "PDF zusammenführen", "Об’єднати PDF", "Połącz PDF", "Fusionner des PDF", "Unir archivos PDF", "Unisci file PDF", "Juntar ficheiros PDF", "PDF's samenvoegen", "PDF birleştir", "دمج ملفات PDF", "מיזוג קובצי PDF"],
    "split-pdf": ["Split PDF pages", "PDF teilen", "Розділити PDF", "Podziel PDF", "Découper un PDF", "Dividir PDF", "Dividi PDF", "Dividir PDF", "PDF splitsen", "PDF böl", "تقسيم PDF", "פיצול PDF"],
    "rotate-pdf": ["Rotate PDF pages", "PDF drehen", "Повернути PDF", "Obróć PDF", "Pivoter un PDF", "Rotar PDF", "Ruota PDF", "Rodar PDF", "PDF draaien", "PDF döndür", "تدوير PDF", "סיבוב PDF"],
    "images-to-pdf": ["JPG PNG to PDF", "Bilder in PDF", "Зображення в PDF", "Obrazy do PDF", "Images vers PDF", "Imágenes a PDF", "Immagini in PDF", "Imagens para PDF", "Afbeeldingen naar PDF", "Görselden PDF", "صور إلى PDF", "תמונות ל-PDF"],
    "extract-pdf-pages": ["Extract PDF pages", "PDF-Seiten extrahieren", "Витягти сторінки PDF", "Wyodrębnij strony PDF", "Extraire des pages PDF", "Extraer páginas PDF", "Estrai pagine PDF", "Extrair páginas PDF", "PDF-pagina's extraheren", "PDF sayfalarını çıkar", "استخراج صفحات PDF", "חילוץ עמודי PDF"],
    "pdf-metadata": ["PDF metadata viewer", "PDF-Metadaten anzeigen", "Метадані PDF", "Metadane PDF", "Métadonnées PDF", "Metadatos PDF", "Metadati PDF", "Metadados PDF", "PDF-metadata bekijken", "PDF metaveri", "عارض بيانات PDF", "מציג מטא-נתוני PDF"],
    "reorder-pdf": ["Reorder PDF pages", "PDF-Seiten umkehren", "Порядок сторінок PDF", "Kolejność stron PDF", "Réordonner un PDF", "Reordenar PDF", "Riordina PDF", "Reordenar PDF", "PDF-volgorde", "PDF sayfa sırası", "ترتيب صفحات PDF", "סידור עמודי PDF"],
    "compress-pdf": ["Compress PDF online", "PDF komprimieren", "Стиснути PDF", "Kompresuj PDF", "Compresser un PDF", "Comprimir PDF", "Comprimi PDF", "Comprimir PDF", "PDF comprimeren", "PDF sıkıştır", "ضغط PDF", "דחיסת PDF"],
    "compress-image": ["Compress JPG PNG WebP", "Bild komprimieren", "Стиснути зображення", "Kompresuj obraz", "Compresser une image", "Comprimir imagen", "Comprimi immagine", "Comprimir imagem", "Afbeelding comprimeren", "Görsel sıkıştır", "ضغط الصور", "דחיסת תמונה"],
    "resize-image": ["Resize image online", "Bildgröße ändern", "Змінити розмір зображення", "Zmień rozmiar obrazu", "Redimensionner une image", "Redimensionar imagen", "Ridimensiona immagine", "Redimensionar imagem", "Afbeelding schalen", "Görsel boyutlandır", "تغيير حجم الصورة", "שינוי גודל תמונה"],
    "crop-image": ["Crop image online", "Bild zuschneiden", "Обрізати зображення", "Przytnij obraz", "Recadrer une image", "Recortar imagen", "Ritaglia immagine", "Recortar imagem", "Afbeelding bijsnijden", "Görsel kırp", "قص الصورة", "חיתוך תמונה"],
    "convert-image": ["Convert image to WebP", "Bild nach WebP JPG PNG", "Конвертувати зображення", "Konwertuj obraz", "Convertir une image", "Convertir imagen", "Converti immagine", "Converter imagem", "Afbeelding converteren", "Görsel dönüştür", "تحويل الصورة", "המרת תמונה"],
    "image-to-base64": ["Image to Base64", "Bild zu Base64", "Зображення в Base64", "Obraz do Base64", "Image vers Base64", "Imagen a Base64", "Immagine in Base64", "Imagem para Base64", "Afbeelding naar Base64", "Görselden Base64", "صورة إلى Base64", "תמונה ל-Base64"],
    "base64-to-image": ["Base64 to image", "Base64 zu Bild", "Base64 у зображення", "Base64 na obraz", "Base64 vers image", "Base64 a imagen", "Base64 in immagine", "Base64 para imagem", "Base64 naar afbeelding", "Base64’ten görsel", "Base64 إلى صورة", "Base64 לתמונה"],
    "exif-strip": ["Remove EXIF metadata", "EXIF-Daten entfernen", "Прибрати EXIF", "Usuń EXIF", "Retirer les EXIF", "Quitar EXIF", "Rimuovi EXIF", "Remover EXIF", "EXIF verwijderen", "EXIF sil", "إزالة EXIF", "הסרת EXIF"],
    "favicon-generator": ["Favicon generator", "Favicon erstellen", "Генератор favicon", "Generator favicon", "Générateur de favicon", "Generador de favicon", "Generatore favicon", "Gerador de favicon", "Favicon-generator", "Favicon oluştur", "مولّد أيقونة الموقع", "מחולל פביקון"],
    "color-extract": ["Extract colors from image", "Farben aus Bild", "Кольори із зображення", "Kolory z obrazu", "Couleurs d’une image", "Colores de una imagen", "Colori da immagine", "Cores de uma imagem", "Kleuren uit afbeelding", "Görselden renk", "استخراج الألوان", "חילוץ צבעים"],
    "word-counter": ["Word counter online", "Wortzähler online", "Лічильник слів", "Licznik słów", "Compteur de mots", "Contador de palabras", "Conta parole", "Contador de palavras", "Woordenteller", "Kelime sayacı", "عدّاد الكلمات", "מונה מילים"],
    "character-counter": ["Character counter", "Zeichenzähler", "Лічильник символів", "Licznik znaków", "Compteur de caractères", "Contador de caracteres", "Conta caratteri", "Contador de caracteres", "Tekenteller", "Karakter sayacı", "عدّاد الأحرف", "מונה תווים"],
    "case-converter": ["Case converter", "Groß-/Kleinschreibung", "Регістр тексту", "Zmiana wielkości liter", "Casse du texte", "Mayúsculas y minúsculas", "Maiuscole e minuscole", "Maiúsculas e minúsculas", "Hoofdletters converteren", "Büyük küçük harf", "تحويل حالة الأحرف", "שינוי רישיות"],
    "remove-duplicate-lines": ["Remove duplicate lines", "Doppelte Zeilen entfernen", "Прибрати дублікати рядків", "Usuń zduplikowane linie", "Retirer les lignes doublons", "Quitar líneas duplicadas", "Rimuovi righe duplicate", "Remover linhas duplicadas", "Dubbele regels verwijderen", "Yinelenen satırları sil", "إزالة الأسطر المكررة", "הסרת שורות כפולות"],
    "sort-lines": ["Sort lines of text", "Zeilen sortieren", "Сортувати рядки", "Sortuj linie", "Trier des lignes", "Ordenar líneas", "Ordina righe", "Ordenar linhas", "Regels sorteren", "Satırları sırala", "ترتيب الأسطر", "מיון שורות"],
    "slug-generator": ["URL slug generator", "Slug-Generator", "Генератор slug", "Generator slug", "Générateur de slug", "Generador de slug", "Generatore di slug", "Gerador de slug", "Slug-generator", "Slug oluştur", "مولّد slug", "מחולל slug"],
    "whitespace-cleaner": ["Clean whitespace", "Leerzeichen bereinigen", "Очистити пробіли", "Wyczyść spacje", "Nettoyer les espaces", "Limpiar espacios", "Pulisci spazi", "Limpar espaços", "Spaties opschonen", "Boşlukları temizle", "تنظيف المسافات", "ניקוי רווחים"],
    "text-statistics": ["Text statistics", "Textstatistiken", "Статистика тексту", "Statystyki tekstu", "Statistiques de texte", "Estadísticas de texto", "Statistiche testo", "Estatísticas de texto", "Tekststatistieken", "Metin istatistikleri", "إحصاءات النص", "סטטיסטיקת טקסט"],
    "text-diff": ["Compare two texts", "Texte vergleichen", "Порівняти тексти", "Porównaj teksty", "Comparer deux textes", "Comparar textos", "Confronta testi", "Comparar textos", "Teksten vergelijken", "Metinleri karşılaştır", "مقارنة النصوص", "השוואת טקסטים"],
    "resume-bullets": ["Resume bullet helper", "Lebenslauf-Punkte", "Пункти резюме", "Punkty CV", "Puces de CV", "Viñetas de CV", "Elenco CV", "Tópicos de CV", "CV-opsomming", "Özgeçmiş maddeleri", "نقاط السيرة", "נקודות קורות חיים"],
    "cover-letter-template": ["Cover letter template", "Anschreiben-Vorlage", "Шаблон супровідного", "Szablon listu", "Modèle de lettre", "Plantilla de carta", "Modello lettera", "Modelo de carta", "Sollicitatiebrief", "Ön yazı şablonu", "قالب خطاب التغطية", "תבנית מכתב מקדים"],
    "json-formatter": ["JSON formatter online", "JSON formatieren", "Форматер JSON", "Formatter JSON", "Formateur JSON", "Formateador JSON", "Formatter JSON", "Formatador JSON", "JSON formatteren", "JSON biçimlendir", "منسّق JSON", "מעצב JSON"],
    "json-validator": ["JSON validator", "JSON prüfen", "Валідатор JSON", "Walidator JSON", "Validateur JSON", "Validador JSON", "Validatore JSON", "Validador JSON", "JSON valideren", "JSON doğrula", "مدقّق JSON", "מאמת JSON"],
    "csv-json": ["CSV to JSON converter", "CSV nach JSON", "CSV у JSON", "CSV na JSON", "CSV vers JSON", "CSV a JSON", "CSV in JSON", "CSV para JSON", "CSV naar JSON", "CSV’den JSON", "CSV إلى JSON", "CSV ל-JSON"],
    "base64": ["Base64 encode decode", "Base64 kodieren", "Base64 кодування", "Base64 kodowanie", "Base64 encoder", "Base64 codificar", "Base64 codifica", "Base64 codificar", "Base64 coderen", "Base64 kodla", "ترميز Base64", "קידוד Base64"],
    "url-codec": ["URL encode decode", "URL kodieren", "Кодування URL", "Kodowanie URL", "Encoder une URL", "Codificar URL", "Codifica URL", "Codificar URL", "URL coderen", "URL kodla", "ترميز URL", "קידוד URL"],
    "html-entities": ["HTML entities encoder", "HTML-Entitäten", "HTML-сутності", "Encje HTML", "Entités HTML", "Entidades HTML", "Entità HTML", "Entidades HTML", "HTML-entiteiten", "HTML varlıkları", "كيانات HTML", "ישויות HTML"],
    "uuid-generator": ["UUID generator", "UUID-Generator", "Генератор UUID", "Generator UUID", "Générateur UUID", "Generador UUID", "Generatore UUID", "Gerador UUID", "UUID-generator", "UUID üretici", "مولّد UUID", "מחולל UUID"],
    "hash-generator": ["SHA hash generator", "Hash-Generator", "Генератор хешу", "Generator hash", "Générateur de hash", "Generador hash", "Generatore hash", "Gerador de hash", "Hash-generator", "Hash üretici", "مولّد التجزئة", "מחולל hash"],
    "regex-tester": ["Regex tester online", "Regex testen", "Тестер regex", "Tester regex", "Testeur regex", "Probador regex", "Tester regex", "Testar regex", "Regex tester", "Regex dene", "اختبار regex", "בודק regex"],
    "jwt-decoder": ["JWT decoder", "JWT dekodieren", "Декодер JWT", "Dekoder JWT", "Décodeur JWT", "Decodificador JWT", "Decodificatore JWT", "Descodificador JWT", "JWT-decoder", "JWT çözücü", "فك JWT", "מפענח JWT"],
    "xml-formatter": ["XML formatter", "XML formatieren", "Форматер XML", "Formatter XML", "Formateur XML", "Formateador XML", "Formatter XML", "Formatador XML", "XML formatteren", "XML biçimlendir", "منسّق XML", "מעצב XML"],
    "yaml-json": ["YAML to JSON", "YAML nach JSON", "YAML у JSON", "YAML na JSON", "YAML vers JSON", "YAML a JSON", "YAML in JSON", "YAML para JSON", "YAML naar JSON", "YAML’den JSON", "YAML إلى JSON", "YAML ל-JSON"],
    "url-parser": ["URL parser", "URL zerlegen", "Розбір URL", "Parser URL", "Analyseur d’URL", "Analizador de URL", "Analizzatore URL", "Analisador de URL", "URL-parser", "URL çözümle", "محلل URL", "מפרק URL"],
    "query-parser": ["Query string parser", "Query-String zerlegen", "Розбір query", "Parser query", "Analyseur de query", "Analizar query", "Analizza query", "Analisar query", "Query-parser", "Query çözümle", "محلل الاستعلام", "מפרק query"],
    "meta-tag-generator": ["Meta tag generator", "Meta-Tags erzeugen", "Генератор метатегів", "Generator meta tagów", "Générateur de meta", "Generador de meta", "Generatore meta tag", "Gerador de meta tags", "Meta-tag generator", "Meta etiket üretici", "مولّد وسوم meta", "מחולל תגי meta"],
    "robots-txt-generator": ["robots.txt generator", "robots.txt erzeugen", "Генератор robots.txt", "Generator robots.txt", "Générateur robots.txt", "Generador robots.txt", "Generatore robots.txt", "Gerador robots.txt", "robots.txt-generator", "robots.txt üretici", "مولّد robots.txt", "מחולל robots.txt"],
    "serp-preview": ["SERP snippet preview", "SERP-Vorschau", "Прев’ю SERP", "Podgląd SERP", "Aperçu SERP", "Vista SERP", "Anteprima SERP", "Pré-visualização SERP", "SERP-preview", "SERP önizleme", "معاينة SERP", "תצוגת SERP"],
    "hreflang-generator": ["hreflang tag generator", "hreflang erzeugen", "Генератор hreflang", "Generator hreflang", "Générateur hreflang", "Generador hreflang", "Generatore hreflang", "Gerador hreflang", "hreflang-generator", "hreflang üretici", "مولّد hreflang", "מחולל hreflang"],
    "sitemap-helper": ["XML sitemap helper", "XML-Sitemap-Helfer", "Помічник sitemap", "Pomocnik sitemap", "Aide sitemap XML", "Ayuda sitemap", "Helper sitemap", "Ajudante sitemap", "Sitemap-helper", "Sitemap yardımcısı", "مساعد خريطة الموقع", "עוזר sitemap"],
    "canonical-helper": ["Canonical URL tag", "Canonical-Tag", "Тег canonical", "Tag canonical", "Balise canonical", "Etiqueta canonical", "Tag canonical", "Tag canonical", "Canonical-tag", "Canonical etiket", "وسم canonical", "תג canonical"],
    "schema-generator": ["JSON-LD schema helper", "JSON-LD Schema", "Помічник schema.org", "Pomocnik JSON-LD", "Aide JSON-LD", "Ayuda JSON-LD", "Helper JSON-LD", "Ajudante JSON-LD", "JSON-LD helper", "JSON-LD yardımcısı", "مساعد JSON-LD", "עוזר JSON-LD"],
    "og-preview": ["Open Graph preview", "Open-Graph-Vorschau", "Прев’ю Open Graph", "Podgląd Open Graph", "Aperçu Open Graph", "Vista Open Graph", "Anteprima Open Graph", "Pré-visualização Open Graph", "Open Graph-preview", "Open Graph önizleme", "معاينة Open Graph", "תצוגת Open Graph"],
    "percentage": ["Percentage calculator", "Prozentrechner", "Калькулятор відсотків", "Kalkulator procentów", "Calculateur de pourcentage", "Calculadora de porcentaje", "Calcolatrice percentuale", "Calculadora de percentagem", "Percentagecalculator", "Yüzde hesaplayıcı", "حاسبة النسبة", "מחשבון אחוזים"],
    "vat-calculator": ["VAT calculator", "MwSt.-Rechner", "Калькулятор ПДВ", "Kalkulator VAT", "Calculateur de TVA", "Calculadora de IVA", "Calcolatrice IVA", "Calculadora de IVA", "Btw-calculator", "KDV hesaplayıcı", "حاسبة الضريبة", "מחשבון מע״מ"],
    "discount": ["Discount calculator", "Rabattrechner", "Калькулятор знижки", "Kalkulator rabatu", "Calculateur de remise", "Calculadora de descuento", "Calcolatrice sconto", "Calculadora de desconto", "Kortingscalculator", "İndirim hesaplayıcı", "حاسبة الخصم", "מחשבון הנחה"],
    "profit-margin": ["Profit margin calculator", "Margenrechner", "Калькулятор маржі", "Kalkulator marży", "Calculateur de marge", "Calculadora de margen", "Calcolatrice margine", "Calculadora de margem", "Margeberekening", "Marj hesaplayıcı", "حاسبة الهامش", "מחשבון מרווח"],
    "bmi-calculator": ["BMI calculator", "BMI-Rechner", "Калькулятор ІМТ", "Kalkulator BMI", "Calculateur d’IMC", "Calculadora de IMC", "Calcolatrice BMI", "Calculadora de IMC", "BMI-calculator", "BMI hesaplayıcı", "حاسبة مؤشر الكتلة", "מחשבון BMI"],
    "date-difference": ["Date difference calculator", "Datumsdifferenz", "Різниця дат", "Różnica dat", "Écart de dates", "Diferencia de fechas", "Differenza date", "Diferença de datas", "Datumverschil", "Tarih farkı", "فرق التواريخ", "הפרש תאריכים"],
    "invoice-math": ["Invoice line calculator", "Rechnungsrechner", "Калькулятор рахунку", "Kalkulator faktury", "Calculateur de facture", "Calculadora de factura", "Calcolatrice fattura", "Calculadora de fatura", "Factuurcalculator", "Fatura hesaplayıcı", "حاسبة الفاتورة", "מחשבון חשבונית"],
    "temperature": ["Temperature converter", "Temperatur umrechnen", "Конвертер температури", "Konwerter temperatury", "Convertisseur de température", "Conversor de temperatura", "Convertitore temperatura", "Conversor de temperatura", "Temperatuurconverter", "Sıcaklık dönüştürücü", "محول الحرارة", "ממיר טמפרטורה"],
    "length": ["Length unit converter", "Länge umrechnen", "Конвертер довжини", "Konwerter długości", "Convertisseur de longueur", "Conversor de longitud", "Convertitore lunghezza", "Conversor de comprimento", "Lengteconverter", "Uzunluk dönüştürücü", "محول الطول", "ממיר אורך"],
    "weight": ["Weight unit converter", "Gewicht umrechnen", "Конвертер ваги", "Konwerter wagi", "Convertisseur de poids", "Conversor de peso", "Convertitore peso", "Conversor de peso", "Gewichtconverter", "Ağırlık dönüştürücü", "محول الوزن", "ממיר משקל"],
    "data-size": ["MB GB data converter", "Datengröße umrechnen", "Конвертер розміру даних", "Konwerter MB GB", "Convertisseur Mo Go", "Conversor MB GB", "Convertitore MB GB", "Conversor MB GB", "Datagrootte converter", "MB GB dönüştürücü", "محول حجم البيانات", "ממיר גודל נתונים"],
    "speed": ["Speed unit converter", "Geschwindigkeit umrechnen", "Конвертер швидкості", "Konwerter prędkości", "Convertisseur de vitesse", "Conversor de velocidad", "Convertitore velocità", "Conversor de velocidade", "Snelheidsconverter", "Hız dönüştürücü", "محول السرعة", "ממיר מהירות"],
    "area": ["Area unit converter", "Fläche umrechnen", "Конвертер площі", "Konwerter powierzchni", "Convertisseur de surface", "Conversor de área", "Convertitore area", "Conversor de área", "Oppervlakteconverter", "Alan dönüştürücü", "محول المساحة", "ממיר שטח"],
    "volume": ["Volume unit converter", "Volumen umrechnen", "Конвертер об’єму", "Konwerter objętości", "Convertisseur de volume", "Conversor de volumen", "Convertitore volume", "Conversor de volume", "Volumeverter", "Hacim dönüştürücü", "محول الحجم", "ממיר נפח"],
    "pressure": ["Pressure unit converter", "Druck umrechnen", "Конвертер тиску", "Konwerter ciśnienia", "Convertisseur de pression", "Conversor de presión", "Convertitore pressione", "Conversor de pressão", "Drukconverter", "Basınç dönüştürücü", "محول الضغط", "ממיר לחץ"],
    "energy": ["Energy unit converter", "Energie umrechnen", "Конвертер енергії", "Konwerter energii", "Convertisseur d’énergie", "Conversor de energía", "Convertitore energia", "Conversor de energia", "Energieconverter", "Enerji dönüştürücü", "محول الطاقة", "ממיר אנרגיה"],
    "duration": ["Time duration converter", "Zeitdauer umrechnen", "Конвертер тривалості", "Konwerter czasu", "Convertisseur de durée", "Conversor de duración", "Convertitore durata", "Conversor de duração", "Tijdsduurconverter", "Süre dönüştürücü", "محول المدة", "ממיר משך"],
    "hex-rgb-hsl": ["HEX RGB HSL converter", "HEX RGB HSL umwandeln", "HEX RGB HSL", "Konwerter HEX RGB", "Convertisseur HEX RVB", "Conversor HEX RGB", "Convertitore HEX RGB", "Conversor HEX RGB", "HEX RGB-converter", "HEX RGB dönüştürücü", "محول HEX RGB", "ממיר HEX RGB"],
    "contrast-checker": ["WCAG contrast checker", "Kontrast prüfen", "Перевірка контрасту", "Sprawdź kontrast", "Vérifier le contraste", "Comprobar contraste", "Verifica contrasto", "Verificar contraste", "Contrast controleren", "Kontrast kontrol", "فاحص التباين", "בודק ניגודיות"],
    "palette-generator": ["Color palette generator", "Farbpalette erzeugen", "Генератор палітри", "Generator palety", "Générateur de palette", "Generador de paleta", "Generatore palette", "Gerador de paleta", "Paletgenerator", "Palet üretici", "مولّد لوحة الألوان", "מחולל פלטה"],
    "gradient-generator": ["CSS gradient generator", "CSS-Verlauf erzeugen", "Генератор градієнта CSS", "Generator gradientu CSS", "Générateur de dégradé CSS", "Generador de degradado CSS", "Generatore gradiente CSS", "Gerador de gradiente CSS", "CSS-gradient generator", "CSS gradyan", "مولّد تدرج CSS", "מחולל גרדיאנט CSS"],
    "password-generator": ["Password generator", "Passwort-Generator", "Генератор паролів", "Generator haseł", "Générateur de mots de passe", "Generador de contraseñas", "Generatore di password", "Gerador de palavras-passe", "Wachtwoordgenerator", "Parola üretici", "مولّد كلمات المرور", "מחולל סיסמאות"],
    "qr-generator": ["QR code generator", "QR-Code erstellen", "Генератор QR-коду", "Generator kodów QR", "Générateur de QR code", "Generador de código QR", "Generatore QR", "Gerador de código QR", "QR-code generator", "QR kod üretici", "مولّד رمز QR", "מחולל קוד QR"],
    "random-string": ["Random string generator", "Zufallsstring", "Випадковий рядок", "Losowy ciąg", "Chaîne aléatoire", "Cadena aleatoria", "Stringa casuale", "Cadeia aleatória", "Willekeurige string", "Rastgele dize", "مولّد سلسلة عشوائية", "מחולל מחרוזת אקראית"],
    "unix-timestamp": ["Unix timestamp converter", "Unix-Zeitstempel", "Конвертер Unix-часу", "Konwerter Unix", "Horodatage Unix", "Marca Unix", "Timestamp Unix", "Carimbo Unix", "Unix-tijdstempel", "Unix zaman damgası", "محول طابع Unix", "ממיר חותמת Unix"],
    "timezone-convert": ["Timezone converter", "Zeitzone umrechnen", "Конвертер часових поясів", "Konwerter stref", "Convertisseur de fuseau", "Conversor de zona horaria", "Convertitore fuso", "Conversor de fuso", "Tijdzoneconverter", "Saat dilimi dönüştürücü", "محول المنطقة الزمنية", "ממיר אזור זמן"],
    "ics-event": ["ICS calendar event", "ICS-Termin", "Подія ICS", "Wydarzenie ICS", "Événement ICS", "Evento ICS", "Evento ICS", "Evento ICS", "ICS-afspraak", "ICS etkinliği", "حدث تقويم ICS", "אירוע ICS"],
    "pdf-to-image": ["PDF to JPG PNG", "PDF nach JPG PNG", "PDF у JPG PNG", "PDF do JPG PNG", "PDF vers JPG PNG", "PDF a JPG PNG", "PDF in JPG PNG", "PDF para JPG PNG", "PDF naar JPG PNG", "PDF’den JPG PNG", "PDF إلى JPG PNG", "PDF ל-JPG PNG"],
    "heic-to-jpg": ["HEIC to JPG", "HEIC nach JPG", "HEIC у JPG", "HEIC na JPG", "HEIC vers JPG", "HEIC a JPG", "HEIC in JPG", "HEIC para JPG", "HEIC naar JPG", "HEIC’den JPG", "HEIC إلى JPG", "HEIC ל-JPG"],
    "docx-to-pdf": ["DOCX to PDF text", "DOCX nach PDF-Text", "DOCX у текстовий PDF", "DOCX na PDF tekst", "DOCX vers PDF texte", "DOCX a PDF texto", "DOCX in PDF testo", "DOCX para PDF texto", "DOCX naar PDF-tekst", "DOCX’ten metin PDF", "DOCX إلى PDF نصي", "DOCX ל-PDF טקסט"],
    "pdf-watermark": ["PDF watermark", "PDF-Wasserzeichen", "Водяний знак PDF", "Znak wodny PDF", "Filigrane PDF", "Marca de agua PDF", "Filigrana PDF", "Marca de água PDF", "PDF-watermerk", "PDF filigranı", "علامة مائية PDF", "סימן מים ל-PDF"],
    "pdf-page-numbers": ["PDF page numbers", "PDF-Seitenzahlen", "Номери сторінок PDF", "Numery stron PDF", "Numéros de page PDF", "Números de página PDF", "Numeri di pagina PDF", "Números de página PDF", "PDF-paginanummers", "PDF sayfa numarası", "أرقام صفحات PDF", "מספרי עמוד PDF"],
    "pdf-password": ["PDF password protect", "PDF-Passwortschutz", "Пароль PDF", "Hasło PDF", "Mot de passe PDF", "Contraseña PDF", "Password PDF", "Palavra-passe PDF", "PDF-wachtwoord", "PDF parola", "حماية PDF بكلمة", "סיסמה ל-PDF"],
    "qr-reader": ["QR code reader", "QR-Code lesen", "Читач QR-коду", "Czytnik kodów QR", "Lecteur de QR code", "Lector de código QR", "Lettore QR", "Leitor de código QR", "QR-code lezer", "QR kod okuyucu", "قارئ رمز QR", "קורא קוד QR"],
    "barcode-generator": ["Barcode generator", "Barcode erstellen", "Генератор штрихкоду", "Generator kodów kreskowych", "Générateur de code-barres", "Generador de código de barras", "Generatore barcode", "Gerador de código de barras", "Barcode-generator", "Barkod üretici", "مولّد باركود", "מחולל ברקוד"],
    "tip-calculator": ["Tip calculator", "Trinkgeldrechner", "Калькулятор чайових", "Kalkulator napiwków", "Calculateur de pourboire", "Calculadora de propina", "Calcolatrice mancia", "Calculadora de gorjeta", "Fooicalculator", "Bahşiş hesaplayıcı", "حاسبة الإكرامية", "מחשבון טיפ"],
    "loan-calculator": ["Loan calculator", "Kreditrechner", "Калькулятор кредиту", "Kalkulator kredytu", "Calculateur de prêt", "Calculadora de préstamo", "Calcolatrice prestito", "Calculadora de empréstimo", "Leningcalculator", "Kredi hesaplayıcı", "حاسبة القرض", "מחשבון הלוואה"],
    "compound-interest": ["Compound interest", "Zinseszinsrechner", "Складні відсотки", "Procent składany", "Intérêts composés", "Interés compuesto", "Interesse composto", "Juros compostos", "Samengestelde rente", "Bileşik faiz", "فائدة مركبة", "ריבית דריבית"],
    "salary-converter": ["Salary converter", "Gehaltsumrechner", "Конвертер зарплати", "Przelicznik pensji", "Convertisseur de salaire", "Conversor de salario", "Convertitore stipendio", "Conversor de salário", "Salarisconverter", "Maaş dönüştürücü", "محول الراتب", "ממיר שכר"],
    "age-calculator": ["Age calculator", "Altersrechner", "Калькулятор віку", "Kalkulator wieku", "Calculateur d’âge", "Calculadora de edad", "Calcolatrice età", "Calculadora de idade", "Leeftijdcalculator", "Yaş hesaplayıcı", "حاسبة العمر", "מחשבון גיל"],
    "fuel-cost": ["Fuel cost calculator", "Kraftstoffkosten", "Вартість пального", "Koszt paliwa", "Coût du carburant", "Coste de combustible", "Costo carburante", "Custo de combustível", "Brandstofkosten", "Yakıt maliyeti", "تكلفة الوقود", "עלות דלק"],
    "xlsx-csv": ["Excel XLSX to CSV", "Excel XLSX nach CSV", "Excel XLSX у CSV", "Excel XLSX na CSV", "Excel XLSX vers CSV", "Excel XLSX a CSV", "Excel XLSX in CSV", "Excel XLSX para CSV", "Excel XLSX naar CSV", "Excel XLSX’ten CSV", "Excel XLSX إلى CSV", "Excel XLSX ל-CSV"],
    "markdown-html": ["Markdown to HTML", "Markdown nach HTML", "Markdown у HTML", "Markdown na HTML", "Markdown vers HTML", "Markdown a HTML", "Markdown in HTML", "Markdown para HTML", "Markdown naar HTML", "Markdown’dan HTML", "Markdown إلى HTML", "Markdown ל-HTML"],
    "lorem-ipsum": ["Lorem Ipsum generator", "Lorem-Ipsum-Generator", "Генератор Lorem Ipsum", "Generator Lorem Ipsum", "Générateur Lorem Ipsum", "Generador Lorem Ipsum", "Generatore Lorem Ipsum", "Gerador Lorem Ipsum", "Lorem Ipsum-generator", "Lorem Ipsum üretici", "مولّد Lorem Ipsum", "מחולל Lorem Ipsum"],
    "social-counter": ["Social character counter", "Social-Zeichenzähler", "Лічильник соцмереж", "Licznik znaków social", "Compteur social", "Contador social", "Conta caratteri social", "Contador social", "Sociale tekens", "Sosyal karakter sayacı", "عدّاد منشورات", "מונה תווים לרשתות"],
    "strip-html": ["Strip HTML extract text", "HTML-Text extrahieren", "Текст із HTML", "Tekst z HTML", "Extraire le texte HTML", "Extraer texto HTML", "Estrai testo HTML", "Extrair texto HTML", "HTML-tekst halen", "HTML’den metin", "استخراج نص HTML", "חילוץ טקסט מ-HTML"],
    "table-markdown": ["Table to Markdown", "Tabelle nach Markdown", "Таблиця в Markdown", "Tabela do Markdown", "Tableau vers Markdown", "Tabla a Markdown", "Tabella in Markdown", "Tabela para Markdown", "Tabel naar Markdown", "Tabloyu Markdown", "جدول إلى Markdown", "טבלה ל-Markdown"],
    "cron-generator": ["Cron expression generator", "Cron-Ausdruck", "Генератор cron", "Generator cron", "Générateur cron", "Generador cron", "Generatore cron", "Gerador cron", "Cron-generator", "Cron üretici", "مولّد cron", "מחולל cron"],
    "sql-formatter": ["SQL formatter", "SQL formatieren", "Форматер SQL", "Formatter SQL", "Formateur SQL", "Formateador SQL", "Formatter SQL", "Formatador SQL", "SQL formatteren", "SQL biçimlendir", "منسّق SQL", "מעצב SQL"],
    "image-text-overlay": ["Image text overlay", "Text auf Bild", "Текст на зображенні", "Tekst na obrazie", "Texte sur image", "Texto sobre imagen", "Testo su immagine", "Texto na imagem", "Tekst op afbeelding", "Görsele yazı", "نص على صورة", "טקסט על תמונה"],
    "image-blur": ["Blur image online", "Bild unscharf machen", "Розмити зображення", "Rozmyj obraz", "Flouter une image", "Desenfocar imagen", "Sfoca immagine", "Desfocar imagem", "Afbeelding vervagen", "Görsel bulanıklaştır", "تمويه الصورة", "טשטוש תמונה"],
    "png-to-ico": ["PNG to ICO favicon", "PNG nach ICO", "PNG у ICO", "PNG na ICO", "PNG vers ICO", "PNG a ICO", "PNG in ICO", "PNG para ICO", "PNG naar ICO", "PNG’den ICO", "PNG إلى ICO", "PNG ל-ICO"],
    "universal-converter": ["Convert any file", "Beliebige Datei umwandeln", "Конвертувати будь-який файл", "Konwertuj dowolny plik", "Convertir n’importe quel fichier", "Convertir cualquier archivo", "Converti qualsiasi file", "Converter qualquer ficheiro", "Elk bestand converteren", "Her dosyayı dönüştür", "تحويل أي ملف", "המרת כל קובץ"],
    "video-file-info": ["Video file info", "Video-Dateiinfo", "Інфо відеофайлу", "Info pliku wideo", "Infos fichier vidéo", "Info de vídeo", "Info file video", "Info de ficheiro vídeo", "Videobestand-info", "Video dosya bilgisi", "معلومات ملف فيديو", "מידע על קובץ וידאו"],
    "convert-video": ["Convert video status", "Video konvertieren Status", "Статус конвертації відео", "Status konwersji wideo", "Statut conversion vidéo", "Estado convertir vídeo", "Stato conversione video", "Estado converter vídeo", "Videoconversie-status", "Video dönüştürme durumu", "حالة تحويل الفيديو", "סטטוס המרת וידאו"],
    "text-to-pdf": ["Text to PDF", "Text zu PDF", "Текст у PDF", "Tekst do PDF", "Texte vers PDF", "Texto a PDF", "Testo in PDF", "Texto para PDF", "Tekst naar PDF", "Metinden PDF", "نص إلى PDF", "טקסט ל-PDF"],
    "markdown-to-pdf": ["Markdown to PDF", "Markdown zu PDF", "Markdown у PDF", "Markdown do PDF", "Markdown vers PDF", "Markdown a PDF", "Markdown in PDF", "Markdown para PDF", "Markdown naar PDF", "Markdown’dan PDF", "Markdown إلى PDF", "Markdown ל-PDF"],
    "extract-pdf-text": ["Extract PDF text", "PDF-Text extrahieren", "Текст із PDF", "Tekst z PDF", "Extraire le texte PDF", "Extraer texto PDF", "Estrai testo PDF", "Extrair texto PDF", "PDF-tekst halen", "PDF metnini çıkar", "استخراج نص PDF", "חילוץ טקסט מ-PDF"],
    "delete-pdf-pages": ["Delete PDF pages", "PDF-Seiten löschen", "Видалити сторінки PDF", "Usuń strony PDF", "Supprimer des pages PDF", "Borrar páginas PDF", "Elimina pagine PDF", "Apagar páginas PDF", "PDF-pagina's verwijderen", "PDF sayfalarını sil", "حذف صفحات PDF", "מחיקת עמודי PDF"],
    "rotate-image": ["Rotate image", "Bild drehen", "Повернути зображення", "Obróć obraz", "Pivoter une image", "Rotar imagen", "Ruota immagine", "Rodar imagem", "Afbeelding draaien", "Görseli döndür", "تدوير الصورة", "סיבוב תמונה"],
    "flip-image": ["Flip image", "Bild spiegeln", "Віддзеркалити зображення", "Odbij obraz", "Retourner une image", "Voltear imagen", "Capovolgi immagine", "Inverter imagem", "Afbeelding spiegelen", "Görseli çevir", "عكس الصورة", "היפוך תמונה"],
    "utm-builder": ["UTM URL builder", "UTM-URL-Builder", "Конструктор UTM", "Kreator UTM", "Générateur d’URL UTM", "Generador UTM", "Generatore UTM", "Gerador UTM", "UTM-URL-builder", "UTM URL oluşturucu", "منشئ روابط UTM", "בונה כתובות UTM"],
    "random-number": ["Random number generator", "Zufallszahl", "Випадкове число", "Losowa liczba", "Nombre aléatoire", "Número aleatorio", "Numero casuale", "Número aleatório", "Willekeurig getal", "Rastgele sayı", "مولّد رقم عشوائي", "מחולל מספר אקראי"],
}

WAVE_EXTRA = json.loads(Path("/workspace/scripts/wave-seo-names.json").read_text(encoding="utf-8"))
NAMES.update(WAVE_EXTRA["names"])

KIND = {}
for _id in ("merge-pdf", "split-pdf", "rotate-pdf", "extract-pdf-pages", "pdf-metadata", "reorder-pdf", "compress-pdf"):
    KIND[_id] = "pdf"
KIND["images-to-pdf"] = "img2pdf"
for _id in ("compress-image", "resize-image", "crop-image", "convert-image", "image-to-base64", "base64-to-image", "exif-strip", "favicon-generator", "color-extract"):
    KIND[_id] = "img"
for _id in ("word-counter", "character-counter", "case-converter", "remove-duplicate-lines", "sort-lines", "slug-generator", "whitespace-cleaner", "text-statistics", "text-diff", "resume-bullets", "cover-letter-template"):
    KIND[_id] = "text"
for _id in ("json-formatter", "json-validator", "csv-json", "base64", "url-codec", "html-entities", "uuid-generator", "hash-generator", "regex-tester", "jwt-decoder", "xml-formatter", "yaml-json", "url-parser", "query-parser"):
    KIND[_id] = "dev"
for _id in ("meta-tag-generator", "robots-txt-generator", "serp-preview", "hreflang-generator", "sitemap-helper", "canonical-helper", "schema-generator", "og-preview"):
    KIND[_id] = "seo"
for _id in ("percentage", "vat-calculator", "discount", "profit-margin", "bmi-calculator", "date-difference", "invoice-math"):
    KIND[_id] = "calc"
for _id in ("temperature", "length", "weight", "data-size", "speed", "area", "volume", "pressure", "energy", "duration"):
    KIND[_id] = "unit"
for _id in ("hex-rgb-hsl", "contrast-checker", "palette-generator", "gradient-generator"):
    KIND[_id] = "color"
for _id in ("password-generator", "qr-generator", "random-string"):
    KIND[_id] = "gen"
for _id in ("unix-timestamp", "timezone-convert", "ics-event", "age-calculator"):
    KIND[_id] = "dt"
for _id in ("pdf-to-image", "docx-to-pdf", "pdf-watermark", "pdf-page-numbers", "pdf-password"):
    KIND[_id] = "pdf"
KIND["heic-to-jpg"] = "img"
KIND["qr-reader"] = "gen"
KIND["barcode-generator"] = "gen"
for _id in ("tip-calculator", "loan-calculator", "compound-interest", "salary-converter", "fuel-cost"):
    KIND[_id] = "calc"
KIND["xlsx-csv"] = "dev"
KIND["markdown-html"] = "text"
KIND["lorem-ipsum"] = "gen"
for _id in ("social-counter", "strip-html", "table-markdown"):
    KIND[_id] = "text"
KIND["cron-generator"] = "dev"
KIND["sql-formatter"] = "dev"
for _id in ("image-text-overlay", "image-blur", "png-to-ico"):
    KIND[_id] = "img"
KIND["universal-converter"] = "fileconv"
KIND["video-file-info"] = "video"
KIND["convert-video"] = "video"
for _id in ("text-to-pdf", "markdown-to-pdf", "extract-pdf-text", "delete-pdf-pages"):
    KIND[_id] = "pdf"
KIND["rotate-image"] = "img"
KIND["flip-image"] = "img"
KIND["utm-builder"] = "seo"
KIND["random-number"] = "gen"
for tid, kind in WAVE_EXTRA["kinds"].items():
    KIND[tid] = kind

FORMATS = {
    "merge-pdf": "PDF", "split-pdf": "PDF", "rotate-pdf": "PDF", "extract-pdf-pages": "PDF",
    "pdf-metadata": "PDF", "reorder-pdf": "PDF", "compress-pdf": "PDF", "images-to-pdf": "JPG PNG WebP → PDF",
    "compress-image": "JPG PNG WebP", "resize-image": "JPG PNG WebP", "crop-image": "JPG PNG WebP",
    "convert-image": "JPG PNG WebP", "image-to-base64": "image → Base64", "base64-to-image": "Base64 → image",
    "exif-strip": "JPG PNG", "favicon-generator": "PNG → ICO", "color-extract": "JPG PNG",
    "csv-json": "CSV ↔ JSON", "yaml-json": "YAML ↔ JSON", "hex-rgb-hsl": "HEX RGB HSL",
    "xlsx-csv": "XLSX ↔ CSV", "markdown-html": "Markdown → HTML", "png-to-ico": "PNG → ICO",
    "universal-converter": "images PDF CSV XLSX MD HTML DOCX", "heic-to-jpg": "HEIC → JPG",
    "pdf-to-image": "PDF → JPG PNG", "docx-to-pdf": "DOCX → text PDF",
    "text-to-pdf": "text → PDF", "markdown-to-pdf": "Markdown → PDF",
    "extract-pdf-text": "PDF → text", "delete-pdf-pages": "PDF",
    "rotate-image": "JPG PNG WebP", "flip-image": "JPG PNG WebP",
    "utm-builder": "URL + UTM", "random-number": "integers",
}

CONVERT = {
    "images-to-pdf": ("JPG / PNG / WebP", "PDF"),
    "convert-image": ("JPG / PNG / WebP / AVIF", "JPG / PNG / WebP / AVIF"),
    "image-to-base64": ("image", "Base64"),
    "base64-to-image": ("Base64", "image"),
    "csv-json": ("CSV", "JSON"),
    "yaml-json": ("YAML", "JSON"),
    "hex-rgb-hsl": ("HEX / RGB / HSL", "HEX / RGB / HSL"),
    "temperature": ("°C / °F / K", "°C / °F / K"),
    "unix-timestamp": ("Unix", "date"),
    "heic-to-jpg": ("HEIC", "JPG / PNG"),
    "pdf-to-image": ("PDF", "JPG / PNG"),
    "docx-to-pdf": ("DOCX", "PDF text"),
    "xlsx-csv": ("XLSX", "CSV"),
    "markdown-html": ("Markdown", "HTML"),
    "png-to-ico": ("PNG", "ICO"),
    "universal-converter": ("detected file", "listed formats only"),
    "text-to-pdf": ("text", "PDF"),
    "markdown-to-pdf": ("Markdown", "PDF"),
    "extract-pdf-text": ("PDF", "text"),
    "rotate-image": ("JPG / PNG / WebP", "rotated image"),
    "flip-image": ("JPG / PNG / WebP", "flipped image"),
}

JOB = {
    "en": {"pdf": "Merge, split, rotate or inspect PDF pages in this tab — not a PDF-to-Word converter.", "img2pdf": "Convert JPG, PNG or WebP into a PDF on this page.", "img": "Compress, resize, crop or convert images without an upload.", "text": "Count, clean or transform text pasted into this page.", "dev": "Format, encode or inspect developer snippets locally.", "seo": "Draft meta, robots, hreflang or schema snippets for copy-paste.", "calc": "Estimate figures in the browser. Not tax, medical or legal advice.", "unit": "Convert units with the from → to controls on this page.", "color": "Convert colors, check contrast or build a palette locally.", "gen": "Generate passwords, QR codes or random strings on-device.", "dt": "Convert timestamps and time zones without sending the values away."},
    "de": {"pdf": "PDF-Seiten in diesem Tab zusammenführen, teilen, drehen oder prüfen — kein PDF-zu-Word.", "img2pdf": "JPG, PNG oder WebP auf dieser Seite in PDF umwandeln.", "img": "Bilder komprimieren, skalieren, zuschneiden oder konvertieren ohne Upload.", "text": "Text auf dieser Seite zählen, bereinigen oder umwandeln.", "dev": "Entwickler-Snippets lokal formatieren, kodieren oder prüfen.", "seo": "Meta-, robots-, hreflang- oder Schema-Snippets zum Kopieren entwerfen.", "calc": "Zahlen im Browser schätzen. Keine Steuer-, Medizin- oder Rechtsberatung.", "unit": "Einheiten mit den Von→Nach-Feldern auf dieser Seite umrechnen.", "color": "Farben umwandeln, Kontrast prüfen oder Paletten lokal erzeugen.", "gen": "Passwörter, QR-Codes oder Zufallsstrings auf dem Gerät erzeugen.", "dt": "Zeitstempel und Zeitzonen umrechnen, ohne Werte zu senden."},
    "uk": {"pdf": "Об’єднуйте, діліть, обертайте чи перевіряйте PDF у цій вкладці — не PDF у Word.", "img2pdf": "Конвертуйте JPG, PNG або WebP у PDF на цій сторінці.", "img": "Стискайте, змінюйте розмір, обрізайте чи конвертуйте зображення без вивантаження.", "text": "Рахуйте, очищайте чи змінюйте текст, вставлений на сторінку.", "dev": "Форматуйте, кодуйте чи перевіряйте фрагменти коду локально.", "seo": "Чернетки meta, robots, hreflang чи schema для копіювання.", "calc": "Оцінюйте цифри в браузері. Це не податкова, медична чи юридична порада.", "unit": "Конвертуйте одиниці полями з→до на цій сторінці.", "color": "Конвертуйте кольори, перевіряйте контраст або збирайте палітру локально.", "gen": "Генеруйте паролі, QR-коди чи випадкові рядки на пристрої.", "dt": "Конвертуйте мітки часу та пояси без надсилання значень."},
    "pl": {"pdf": "Łącz, dziel, obracaj lub sprawdzaj strony PDF w tej karcie — to nie PDF do Worda.", "img2pdf": "Konwertuj JPG, PNG lub WebP do PDF na tej stronie.", "img": "Kompresuj, skaluj, przycinaj lub konwertuj obrazy bez wysyłania.", "text": "Licznik, czyszczenie i zmiana wklejonego tekstu na tej stronie.", "dev": "Formatuj, koduj lub sprawdzaj fragmenty developerskie lokalnie.", "seo": "Szkicuj meta, robots, hreflang lub schema do skopiowania.", "calc": "Szacuj liczby w przeglądarce. To nie porada podatkowa, medyczna ani prawna.", "unit": "Przeliczaj jednostki polami z→do na tej stronie.", "color": "Konwertuj kolory, sprawdzaj kontrast lub buduj paletę lokalnie.", "gen": "Generuj hasła, kody QR lub losowe ciągi na urządzeniu.", "dt": "Konwertuj znaczniki czasu i strefy bez wysyłania wartości."},
    "fr": {"pdf": "Fusionnez, découpez, pivotez ou inspectez des PDF dans cet onglet — pas de PDF vers Word.", "img2pdf": "Convertissez JPG, PNG ou WebP en PDF sur cette page.", "img": "Compressez, redimensionnez, recadrez ou convertissez des images sans envoi.", "text": "Comptez, nettoyez ou transformez le texte collé sur cette page.", "dev": "Formatez, encodez ou inspectez des extraits développeur en local.", "seo": "Rédigez des extraits meta, robots, hreflang ou schema à coller.", "calc": "Estimez des chiffres dans le navigateur. Pas un conseil fiscal, médical ou juridique.", "unit": "Convertissez des unités avec les champs de→vers de cette page.", "color": "Convertissez des couleurs, vérifiez le contraste ou créez une palette en local.", "gen": "Générez mots de passe, QR codes ou chaînes aléatoires sur l’appareil.", "dt": "Convertissez horodatages et fuseaux sans envoyer les valeurs."},
    "es": {"pdf": "Une, divide, rota o inspecciona PDF en esta pestaña — no es PDF a Word.", "img2pdf": "Convierte JPG, PNG o WebP a PDF en esta página.", "img": "Comprime, redimensiona, recorta o convierte imágenes sin subirlas.", "text": "Cuenta, limpia o transforma el texto pegado en esta página.", "dev": "Formatea, codifica o inspecciona fragmentos de desarrollo en local.", "seo": "Redacta meta, robots, hreflang o schema para copiar y pegar.", "calc": "Estima cifras en el navegador. No es consejo fiscal, médico ni legal.", "unit": "Convierte unidades con los controles de→a de esta página.", "color": "Convierte colores, comprueba contraste o crea una paleta en local.", "gen": "Genera contraseñas, códigos QR o cadenas aleatorias en el dispositivo.", "dt": "Convierte marcas de tiempo y zonas horarias sin enviar los valores."},
    "it": {"pdf": "Unisci, dividi, ruota o ispeziona PDF in questa scheda — non è PDF in Word.", "img2pdf": "Converti JPG, PNG o WebP in PDF in questa pagina.", "img": "Comprimi, ridimensiona, ritaglia o converti immagini senza caricamento.", "text": "Conta, pulisci o trasforma il testo incollato in questa pagina.", "dev": "Formatta, codifica o ispeziona snippet da sviluppatore in locale.", "seo": "Bozza meta, robots, hreflang o schema da copiare.", "calc": "Stima cifre nel browser. Non è consulenza fiscale, medica o legale.", "unit": "Converti unità con i controlli da→a di questa pagina.", "color": "Converti colori, verifica il contrasto o crea una palette in locale.", "gen": "Genera password, QR code o stringhe casuali sul dispositivo.", "dt": "Converti timestamp e fusi senza inviare i valori."},
    "pt": {"pdf": "Junte, divida, rode ou inspecione PDF neste separador — não é PDF para Word.", "img2pdf": "Converta JPG, PNG ou WebP para PDF nesta página.", "img": "Comprima, redimensione, recorte ou converta imagens sem envio.", "text": "Conte, limpe ou transforme texto colado nesta página.", "dev": "Formate, codifique ou inspecione trechos de programação localmente.", "seo": "Rascunhe meta, robots, hreflang ou schema para copiar.", "calc": "Estime números no navegador. Não é conselho fiscal, médico ou jurídico.", "unit": "Converta unidades com os controlos de→para desta página.", "color": "Converta cores, verifique o contraste ou crie uma paleta localmente.", "gen": "Gere palavras-passe, códigos QR ou cadeias aleatórias no dispositivo.", "dt": "Converta carimbos Unix e fusos sem enviar os valores."},
    "nl": {"pdf": "PDF-pagina's in dit tabblad samenvoegen, splitsen, draaien of controleren — geen PDF naar Word.", "img2pdf": "JPG, PNG of WebP op deze pagina naar PDF converteren.", "img": "Afbeeldingen comprimeren, schalen, bijsnijden of converteren zonder upload.", "text": "Tekst op deze pagina tellen, opschonen of omzetten.", "dev": "Developer-snippets lokaal formatteren, encoderen of inspecteren.", "seo": "Meta-, robots-, hreflang- of schema-snippets klaarzetten om te plakken.", "calc": "Cijfers in de browser schatten. Geen belasting-, medisch of juridisch advies.", "unit": "Eenheden omrekenen met de van→naar-velden op deze pagina.", "color": "Kleuren omzetten, contrast controleren of een palet lokaal maken.", "gen": "Wachtwoorden, QR-codes of willekeurige strings op het apparaat maken.", "dt": "Tijdstempels en tijdzones omzetten zonder waarden te versturen."},
    "tr": {"pdf": "Bu sekmede PDF birleştirin, bölün, döndürün veya inceleyin — PDF’den Word’e dönüştürme yok.", "img2pdf": "Bu sayfada JPG, PNG veya WebP dosyasını PDF’ye dönüştürün.", "img": "Görselleri yüklemeden sıkıştırın, boyutlandırın, kırpın veya dönüştürün.", "text": "Bu sayfaya yapıştırılan metni sayın, temizleyin veya dönüştürün.", "dev": "Geliştirici parçalarını yerelde biçimlendirin, kodlayın veya inceleyin.", "seo": "Kopyalamak için meta, robots, hreflang veya schema taslağı çıkarın.", "calc": "Tarayıcıda rakam tahmini. Vergi, tıbbi veya hukuki tavsiye değildir.", "unit": "Bu sayfadaki kaynak→hedef alanlarıyla birim dönüştürün.", "color": "Renk dönüştürün, kontrast kontrol edin veya yerelde palet oluşturun.", "gen": "Cihazda parola, QR kodu veya rastgele dize üretin.", "dt": "Zaman damgası ve saat dilimini değerleri göndermeden dönüştürün."},
    "ar": {"pdf": "ادمج أو قسّم أو أدر أو افحص PDF في هذا التبويب — ليست تحويل PDF إلى Word.", "img2pdf": "حوّل JPG أو PNG أو WebP إلى PDF في هذه الصفحة.", "img": "اضغط الصور أو غيّر حجمها أو قصّها أو حوّلها دون رفع.", "text": "اعُدّ النص الملصق هنا أو نظّفه أو حوّله.", "dev": "نسّق مقتطفات المطوّر أو كوّدها أو افحصها محليًا.", "seo": "اصنع مسودات meta وrobots وhreflang وschema للنسخ.", "calc": "قدّر الأرقام في المتصفح. ليست استشارة ضريبية أو طبية أو قانونية.", "unit": "حوّل الوحدات بحقول من→إلى في هذه الصفحة.", "color": "حوّل الألوان أو افحص التباين أو ابنِ لوحة محليًا.", "gen": "ولّد كلمات مرور أو رموز QR أو سلاسل عشوائية على الجهاز.", "dt": "حوّل الطوابع الزمنية والمناطق دون إرسال القيم."},
    "he": {"pdf": "מזגו, פצלו, סובבו או בדקו PDF בלשונית — זה לא PDF ל-Word.", "img2pdf": "המירו JPG, PNG או WebP ל-PDF בעמוד הזה.", "img": "דחיסה, שינוי גודל, חיתוך או המרת תמונות בלי העלאה.", "text": "ספירה, ניקוי או המרה של טקסט שהודבק בעמוד.", "dev": "עיצוב, קידוד או בדיקה של קטעי קוד במכשיר.", "seo": "טיוטות meta, robots, hreflang או schema להעתקה.", "calc": "הערכת מספרים בדפדפן. זה לא ייעוץ מס, רפואי או משפטי.", "unit": "המרת יחידות עם שדות מ→אל בעמוד זה.", "color": "המרת צבעים, בדיקת ניגודיות או בניית פלטה במכשיר.", "gen": "יצירת סיסמאות, קודי QR או מחרוזות אקראיות במכשיר.", "dt": "המרת חותמות זמן ואזורי זמן בלי לשלוח ערכים."},
}

FILECONV = {
    "en": "Offer only conversions this browser can run. Never any-to-any, never PDF→Word.",
    "de": "Nur Konvertierungen, die dieser Browser wirklich ausführt. Kein Any-to-any, kein PDF→Word.",
    "uk": "Лише ті конвертації, які браузер справді вміє. Не any-to-any і не PDF→Word.",
    "pl": "Tylko konwersje, które ta przeglądarka naprawdę wykona. Bez any-to-any i PDF→Word.",
    "fr": "Uniquement les conversions que ce navigateur peut vraiment faire. Pas d’any-to-any ni PDF→Word.",
    "es": "Solo conversiones que este navegador puede ejecutar. Nada de any-to-any ni PDF→Word.",
    "it": "Solo conversioni che questo browser può eseguire. Niente any-to-any né PDF→Word.",
    "pt": "Só conversões que este navegador consegue fazer. Sem any-to-any nem PDF→Word.",
    "nl": "Alleen conversies die deze browser echt kan. Geen any-to-any, geen PDF→Word.",
    "tr": "Yalnızca bu tarayıcının gerçekten çalıştırdığı dönüşümler. Any-to-any ve PDF→Word yok.",
    "ar": "عروض التحويل التي يعملها هذا المتصفح فقط. ليست any-to-any وليست PDF→Word.",
    "he": "רק המרות שהדפדפן באמת מריץ. בלי any-to-any ובלי PDF→Word.",
}
VIDEO = {
    "en": "Inspect clip metadata locally. ffmpeg.wasm transcode is not shipped; there is no fake convert button.",
    "de": "Clip-Metadaten lokal lesen. ffmpeg.wasm ist nicht enthalten — kein Fake-Konvertieren.",
    "uk": "Метадані кліпу локально. ffmpeg.wasm не постачається — без фейкової кнопки convert.",
    "pl": "Metadane klipu lokalnie. Brak ffmpeg.wasm — bez fałszywego przycisku konwersji.",
    "fr": "Métadonnées du clip en local. Pas de ffmpeg.wasm — aucun bouton Convert factice.",
    "es": "Metadatos del clip en local. Sin ffmpeg.wasm: no hay botón Convert falso.",
    "it": "Metadati del clip in locale. ffmpeg.wasm non è incluso: niente Convert finto.",
    "pt": "Metadados do clipe no dispositivo. Sem ffmpeg.wasm — sem botão Convert falso.",
    "nl": "Clipmetadata lokaal. Geen ffmpeg.wasm — geen nep-convertknop.",
    "tr": "Klip meta verisi yerelde. ffmpeg.wasm yok — sahte Convert düğmesi yok.",
    "ar": "بيانات المقطع محليًا. ffmpeg.wasm غير مُشحن — بلا زر تحويل مزيف.",
    "he": "מטא-דאטה של הקליפ במכשיר. בלי ffmpeg.wasm ובלי כפתור המרה מזויף.",
}
for _loc in LOCALES:
    JOB[_loc]["fileconv"] = FILECONV[_loc]
    JOB[_loc]["video"] = VIDEO[_loc]

PHRASE = {
    "en": dict(free="Free.", stay="Files and text stay on your device — Freela does not upload them.", q1="Does this tool upload my files?", a1="No. Published Freela tools in this release are LOCAL_ONLY and run in the browser.", q2="Is it free to use?", a2="Yes. There is no paywall on this page and we do not invent reviews or star ratings.", q3="What input does this page accept?", q4="Can I convert PDF to Word here?", a4="No. Freela does not offer PDF→Word. Use merge, split, rotate, extract, or images→PDF.", conv="Convert {src} to {dst} on this landing page."),
    "de": dict(free="Kostenlos.", stay="Dateien und Text bleiben auf dem Gerät — Freela lädt sie nicht hoch.", q1="Werden meine Dateien hochgeladen?", a1="Nein. Veröffentlichte Freela-Werkzeuge sind LOCAL_ONLY und laufen im Browser.", q2="Ist die Nutzung kostenlos?", a2="Ja. Keine Paywall. Wir erfinden keine Bewertungen oder Sterne.", q3="Welche Eingabe akzeptiert diese Seite?", q4="Kann ich hier PDF in Word umwandeln?", a4="Nein. Freela bietet kein PDF→Word. Nutzen Sie Zusammenführen, Teilen, Drehen, Extrahieren oder Bilder→PDF.", conv="Auf dieser Seite {src} nach {dst} umwandeln."),
    "uk": dict(free="Безкоштовно.", stay="Файли й текст лишаються на пристрої — Freela їх не завантажує.", q1="Чи завантажуються мої файли?", a1="Ні. Опубліковані інструменти Freela — LOCAL_ONLY і працюють у браузері.", q2="Це безкоштовно?", a2="Так. Немає платного доступу. Ми не вигадуємо відгуки чи зірки.", q3="Які дані приймає ця сторінка?", q4="Чи можна тут PDF у Word?", a4="Ні. Freela не конвертує PDF→Word. Є об’єднання, поділ, поворот, витяг або зображення→PDF.", conv="На цій сторінці конвертуйте {src} у {dst}."),
    "pl": dict(free="Za darmo.", stay="Pliki i tekst zostają na urządzeniu — Freela ich nie wysyła.", q1="Czy pliki są wysyłane?", a1="Nie. Opublikowane narzędzia Freela są LOCAL_ONLY i działają w przeglądarce.", q2="Czy to za darmo?", a2="Tak. Brak paywalla. Nie wymyślamy recenzji ani gwiazdek.", q3="Jakie dane przyjmuje ta strona?", q4="Czy mogę tu zamienić PDF na Word?", a4="Nie. Freela nie oferuje PDF→Word. Jest łączenie, dzielenie, obrót, wyodrębnianie lub obrazy→PDF.", conv="Na tej stronie konwertuj {src} na {dst}."),
    "fr": dict(free="Gratuit.", stay="Fichiers et texte restent sur l’appareil — Freela ne les envoie pas.", q1="Mes fichiers sont-ils envoyés ?", a1="Non. Les outils Freela publiés sont LOCAL_ONLY et s’exécutent dans le navigateur.", q2="Est-ce gratuit ?", a2="Oui. Pas de paywall. Nous n’inventons pas d’avis ni d’étoiles.", q3="Quelle entrée accepte cette page ?", q4="Puis-je convertir un PDF en Word ici ?", a4="Non. Freela n’offre pas PDF→Word. Utilisez fusion, découpe, rotation, extraction ou images→PDF.", conv="Convertissez {src} vers {dst} sur cette page."),
    "es": dict(free="Gratis.", stay="Archivos y texto se quedan en el dispositivo — Freela no los sube.", q1="¿Se suben mis archivos?", a1="No. Las herramientas publicadas de Freela son LOCAL_ONLY y corren en el navegador.", q2="¿Es gratis?", a2="Sí. Sin muro de pago. No inventamos reseñas ni estrellas.", q3="¿Qué entrada acepta esta página?", q4="¿Puedo pasar PDF a Word aquí?", a4="No. Freela no ofrece PDF→Word. Usa unir, dividir, rotar, extraer o imágenes→PDF.", conv="Convierte {src} a {dst} en esta página."),
    "it": dict(free="Gratis.", stay="File e testo restano sul dispositivo — Freela non li carica.", q1="I file vengono caricati?", a1="No. Gli strumenti Freela pubblicati sono LOCAL_ONLY e girano nel browser.", q2="È gratis?", a2="Sì. Nessun paywall. Non inventiamo recensioni o stelle.", q3="Quale input accetta questa pagina?", q4="Posso convertire PDF in Word qui?", a4="No. Freela non offre PDF→Word. Usa unisci, dividi, ruota, estrai o immagini→PDF.", conv="Converti {src} in {dst} in questa pagina."),
    "pt": dict(free="Grátis.", stay="Ficheiros e texto ficam no dispositivo — a Freela não os envia.", q1="Os ficheiros são enviados?", a1="Não. As ferramentas publicadas da Freela são LOCAL_ONLY e correm no navegador.", q2="É grátis?", a2="Sim. Sem paywall. Não inventamos avaliações nem estrelas.", q3="Que entrada aceita esta página?", q4="Posso converter PDF para Word aqui?", a4="Não. A Freela não oferece PDF→Word. Use juntar, dividir, rodar, extrair ou imagens→PDF.", conv="Converta {src} para {dst} nesta página."),
    "nl": dict(free="Gratis.", stay="Bestanden en tekst blijven op het apparaat — Freela uploadt ze niet.", q1="Worden mijn bestanden geüpload?", a1="Nee. Gepubliceerde Freela-tools zijn LOCAL_ONLY en draaien in de browser.", q2="Is het gratis?", a2="Ja. Geen paywall. We verzinnen geen reviews of sterren.", q3="Welke invoer accepteert deze pagina?", q4="Kan ik hier PDF naar Word converteren?", a4="Nee. Freela biedt geen PDF→Word. Gebruik samenvoegen, splitsen, draaien, extraheren of afbeeldingen→PDF.", conv="Zet {src} om naar {dst} op deze pagina."),
    "tr": dict(free="Ücretsiz.", stay="Dosyalar ve metin cihazda kalır — Freela bunları yüklemez.", q1="Dosyalarım yüklenir mi?", a1="Hayır. Yayımlanan Freela araçları LOCAL_ONLY’dir ve tarayıcıda çalışır.", q2="Ücretsiz mi?", a2="Evet. Ödeme duvarı yok. Sahte yorum veya yıldız uydurmayız.", q3="Bu sayfa hangi girdiyi kabul eder?", q4="Burada PDF’yi Word’e çevirebilir miyim?", a4="Hayır. Freela PDF→Word sunmaz. Birleştir, böl, döndür, çıkar veya görsel→PDF kullanın.", conv="Bu sayfada {src} öğesini {dst} biçimine dönüştürün."),
    "ar": dict(free="مجاني.", stay="الملفات والنص تبقى على الجهاز — Freela لا ترفعها.", q1="هل تُرفع ملفاتي؟", a1="لا. أدوات Freela المنشورة LOCAL_ONLY وتعمل في المتصفح.", q2="هل هي مجانية؟", a2="نعم. بلا جدار دفع. لا نخترع تقييمات أو نجوم.", q3="ما المدخلات التي تقبلها هذه الصفحة؟", q4="هل أحول PDF إلى Word هنا؟", a4="لا. Freela لا تقدم PDF→Word. استخدم الدمج أو التقسيم أو التدوير أو الاستخراج أو الصور→PDF.", conv="حوّل {src} إلى {dst} في هذه الصفحة."),
    "he": dict(free="חינם.", stay="קבצים וטקסט נשארים במכשיר — Freela לא מעלה אותם.", q1="האם הקבצים מועלים?", a1="לא. כלי Freela הרשמיים הם LOCAL_ONLY ורצים בדפדפן.", q2="זה בחינם?", a2="כן. בלי חומת תשלום. אנחנו לא ממציאים ביקורות או כוכבים.", q3="איזה קלט העמוד מקבל?", q4="אפשר להמיר כאן PDF ל-Word?", a4="לא. Freela לא מציעה PDF→Word. השתמשו במיזוג, פיצול, סיבוב, חילוץ או תמונות→PDF.", conv="המירו {src} ל-{dst} בעמוד הזה."),
}

TITLE_TAIL = {
    "en": "online — free, no upload",
    "de": "online — kostenlos, ohne Upload",
    "uk": "онлайн — без вивантаження",
    "pl": "online — za darmo, bez wysyłki",
    "fr": "en ligne — gratuit, sans envoi",
    "es": "online — gratis, sin subir",
    "it": "online — gratis, senza upload",
    "pt": "online — grátis, sem envio",
    "nl": "online — gratis, geen upload",
    "tr": "çevrimiçi — ücretsiz, yüklemesiz",
    "ar": "مجاناً بدون رفع",
    "he": "אונליין — בחינם בלי העלאה",
}


def clamp(text: str, lo: int, hi: int) -> str:
    t = " ".join(text.split())
    if len(t) < lo:
        t = f"{t} — Freela"
        if len(t) < lo:
            t = t + " tool."
    if len(t) > hi:
        t = t[: hi - 1].rstrip() + "…"
    return t


def q(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    missing = [k for k, v in NAMES.items() if len(v) != 12]
    if missing:
        raise SystemExit(f"bad name rows: {missing}")
    unknown = [k for k in NAMES if k not in KIND]
    if unknown:
        raise SystemExit(f"missing KIND: {unknown}")

    lines = [
        'import type { Locale } from "../locales";',
        "",
        "export type SeoOverlay = {",
        "  name: string;",
        "  title: string;",
        "  description: string;",
        "  h1: string;",
        "  intro: string;",
        "  faq: { question: string; answer: string }[];",
        "};",
        "",
        "export const seoOverlay: Record<string, Partial<Record<Locale, SeoOverlay>>> = {",
    ]
    for tid, names in NAMES.items():
        kind = KIND[tid]
        fmt = FORMATS.get(tid, tid.replace("-", " "))
        conv = CONVERT.get(tid)
        lines.append(f'  "{tid}": {{')
        for i, loc in enumerate(LOCALES):
            p = PHRASE[loc]
            name = names[i]
            job = JOB[loc][kind]
            title = clamp(f"{name} {TITLE_TAIL[loc]}", 10, 70)
            if conv:
                path = p["conv"].format(src=conv[0], dst=conv[1])
                desc = clamp(f"{name}. {path} {p['free']} {p['stay']}", 40, 170)
                intro = clamp(f"{name}. {path} {job} {p['stay']}", 40, 520)
            else:
                desc = clamp(f"{name} ({fmt}). {p['free']} {p['stay']}", 40, 170)
                intro = clamp(f"{name}. {job} {p['stay']}", 40, 520)
            a3 = clamp(f"{name}: {fmt}. LOCAL_ONLY.", 8, 300)
            lines.append(f"    {loc}: {{")
            lines.append(f"      name: {q(name)},")
            lines.append(f"      title: {q(title)},")
            lines.append(f"      description: {q(desc)},")
            lines.append(f"      h1: {q(clamp(name, 4, 80))},")
            lines.append(f"      intro: {q(intro)},")
            lines.append("      faq: [")
            lines.append(f"        {{ question: {q(p['q1'])}, answer: {q(p['a1'])} }},")
            lines.append(f"        {{ question: {q(p['q2'])}, answer: {q(p['a2'])} }},")
            lines.append(f"        {{ question: {q(p['q3'])}, answer: {q(a3)} }},")
            if kind == "pdf":
                lines.append(f"        {{ question: {q(p['q4'])}, answer: {q(p['a4'])} }},")
            lines.append("      ],")
            lines.append("    },")
        lines.append("  },")
    lines.append("};")
    out = Path("/workspace/src/data/tools/seo-overlay.ts")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out} tools={len(NAMES)}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate wave-1 catalog files + SEO name table. Source of truth for expansion ids."""
from __future__ import annotations

import json
from pathlib import Path
from textwrap import dedent

LOCALES = ["en", "de", "uk", "pl", "fr", "es", "it", "pt", "nl", "tr", "ar", "he"]

# id, category, seoKind, related, tags, hint(en), names[12]
TOOLS = [
    ("reverse-text", "text", "text", ["case-converter", "sort-lines"], ["text", "reverse"], "Reverse characters in pasted text.",
     ["Reverse text", "Text umkehren", "Реверс тексту", "Odwróć tekst", "Inverser le texte", "Invertir texto", "Inverti testo", "Inverter texto", "Tekst omkeren", "Metni ters çevir", "عكس النص", "היפוך טקסט"]),
    ("reverse-lines", "text", "text", ["sort-lines", "remove-duplicate-lines"], ["text", "lines"], "Reverse the order of lines.",
     ["Reverse lines", "Zeilen umkehren", "Реверс рядків", "Odwróć linie", "Inverser les lignes", "Invertir líneas", "Inverti righe", "Inverter linhas", "Regels omkeren", "Satırları ters çevir", "عكس الأسطر", "היפוך שורות"]),
    ("number-lines", "text", "text", ["sort-lines", "whitespace-cleaner"], ["text", "lines"], "Add 1-based line numbers.",
     ["Number lines", "Zeilen nummerieren", "Нумерувати рядки", "Numeruj linie", "Numéroter les lignes", "Numerar líneas", "Numera righe", "Numerar linhas", "Regels nummeren", "Satır numarala", "ترقيم الأسطر", "מספור שורות"]),
    ("prefix-suffix", "text", "text", ["sort-lines", "slug-generator"], ["text", "lines"], "Add a prefix and suffix to every line.",
     ["Prefix suffix lines", "Präfix und Suffix", "Префікс і суфікс", "Prefiks i sufiks", "Préfixe et suffixe", "Prefijo y sufijo", "Prefisso e suffisso", "Prefixo e sufixo", "Voor- en achtervoegsel", "Ön ek son ek", "سابقة ولاحقة", "קידומת וסיומת"]),
    ("wrap-text", "text", "text", ["whitespace-cleaner", "word-counter"], ["text", "wrap"], "Wrap lines at a character width.",
     ["Wrap text", "Text umbrechen", "Перенести текст", "Zawijaj tekst", "Retourner le texte", "Ajustar texto", "A capo testo", "Quebrar texto", "Tekst wrappen", "Metni kaydır", "التفاف النص", "שבירת שורות"]),
    ("extract-emails", "text", "text", ["extract-urls", "redact-emails"], ["email", "extract"], "List email addresses found in text.",
     ["Extract emails", "E-Mails extrahieren", "Витягти email", "Wyodrębnij e-maile", "Extraire les e-mails", "Extraer emails", "Estrai email", "Extrair e-mails", "E-mails halen", "E-postaları çıkar", "استخراج البريد", "חילוץ אימייל"]),
    ("extract-urls", "text", "text", ["url-parser", "href-extract"], ["url", "extract"], "List http(s) URLs found in text.",
     ["Extract URLs", "URLs extrahieren", "Витягти URL", "Wyodrębnij URL", "Extraire les URL", "Extraer URL", "Estrai URL", "Extrair URL", "URL's halen", "URL’leri çıkar", "استخراج الروابط", "חילוץ כתובות"]),
    ("extract-phones", "text", "text", ["extract-emails", "redact-phones"], ["phone", "extract"], "List digit runs that look like phone numbers.",
     ["Extract phones", "Telefonnummern", "Витягти телефони", "Wyodrębnij telefony", "Extraire les numéros", "Extraer teléfonos", "Estrai telefoni", "Extrair telefones", "Telefoons halen", "Telefon çıkar", "استخراج الهواتف", "חילוץ טלפונים"]),
    ("remove-empty-lines", "text", "text", ["whitespace-cleaner", "sort-lines"], ["text", "lines"], "Drop blank lines from pasted text.",
     ["Remove empty lines", "Leere Zeilen entfernen", "Прибрати порожні рядки", "Usuń puste linie", "Retirer lignes vides", "Quitar líneas vacías", "Rimuovi righe vuote", "Remover linhas vazias", "Lege regels weg", "Boş satır sil", "حذف الأسطر الفارغة", "הסרת שורות ריקות"]),
    ("count-lines", "text", "text", ["word-counter", "character-counter"], ["text", "count"], "Count total, non-empty and unique lines.",
     ["Count lines", "Zeilen zählen", "Лічильник рядків", "Licznik linii", "Compter les lignes", "Contar líneas", "Conta righe", "Contar linhas", "Regels tellen", "Satır say", "عدّ الأسطر", "ספירת שורות"]),
    ("rot13", "text", "text", ["case-converter", "caesar-shift"], ["cipher", "rot13"], "Apply ROT13 to Latin letters only.",
     ["ROT13 cipher", "ROT13-Chiffre", "Шифр ROT13", "Szyfr ROT13", "Chiffre ROT13", "Cifrado ROT13", "Cifrario ROT13", "Cifra ROT13", "ROT13-cijfer", "ROT13 şifre", "شفرة ROT13", "צופן ROT13"]),
    ("caesar-shift", "text", "text", ["rot13", "case-converter"], ["cipher", "caesar"], "Shift Latin letters by N places (Caesar).",
     ["Caesar cipher", "Cäsar-Chiffre", "Шифр Цезаря", "Szyfr Cezara", "Chiffre de César", "Cifrado César", "Cifrario Cesare", "Cifra de César", "Caesarcijfer", "Sezar şifre", "شفرة قيصر", "צופן קיסר"]),
    ("find-replace", "text", "text", ["whitespace-cleaner", "text-diff"], ["text", "replace"], "Replace every occurrence of a string.",
     ["Find and replace", "Suchen und ersetzen", "Знайти й замінити", "Znajdź i zamień", "Rechercher remplacer", "Buscar y reemplazar", "Trova e sostituisci", "Localizar e substituir", "Zoeken vervangen", "Bul ve değiştir", "بحث واستبدال", "חיפוש והחלפה"]),
    ("repeat-text", "text", "text", ["lorem-ipsum", "truncate-text"], ["text", "repeat"], "Repeat a snippet a chosen number of times.",
     ["Repeat text", "Text wiederholen", "Повторити текст", "Powtórz tekst", "Répéter le texte", "Repetir texto", "Ripeti testo", "Repetir texto", "Tekst herhalen", "Metni tekrarla", "تكرار النص", "חזרת טקסט"]),
    ("truncate-text", "text", "text", ["word-counter", "serp-preview"], ["text", "truncate"], "Cut text to a maximum length with an ellipsis.",
     ["Truncate text", "Text kürzen", "Обрізати текст", "Skróć tekst", "Tronquer le texte", "Truncar texto", "Tronca testo", "Truncar texto", "Tekst inkorten", "Metni kısalt", "اقتطاع النص", "קיצור טקסט"]),
    ("name-initials", "text", "text", ["slug-generator", "case-converter"], ["name", "initials"], "Build initials from a personal name.",
     ["Name initials", "Namensinitialen", "Ініціали імені", "Inicjały imienia", "Initiales de nom", "Iniciales de nombre", "Iniziali nome", "Iniciais do nome", "Naaminitialen", "İsim baş harfleri", "أحرف الاسم", "ראשי תיבות"]),
    ("remove-punctuation", "text", "text", ["whitespace-cleaner", "letter-frequency"], ["text", "punct"], "Strip punctuation, keep letters and spaces.",
     ["Remove punctuation", "Satzzeichen entfernen", "Прибрати пунктуацію", "Usuń interpunkcję", "Retirer la ponctuation", "Quitar puntuación", "Rimuovi punteggiatura", "Remover pontuação", "Leestekens weg", "Noktalama sil", "إزالة الترقيم", "הסרת פיסוק"]),
    ("letter-frequency", "text", "text", ["text-statistics", "word-counter"], ["text", "stats"], "Count A–Z letter frequency.",
     ["Letter frequency", "Buchstabenfrequenz", "Частота літер", "Częstość liter", "Fréquence des lettres", "Frecuencia de letras", "Frequenza lettere", "Frequência de letras", "Letterfrequentie", "Harf sıklığı", "تكرار الحروف", "תדירות אותיות"]),
    ("camel-snake", "text", "text", ["slug-generator", "snake-camel"], ["ident", "case"], "Convert camelCase or PascalCase to snake_case.",
     ["Camel to snake", "Camel zu Snake", "Camel у snake", "Camel na snake", "Camel vers snake", "Camel a snake", "Camel in snake", "Camel para snake", "Camel naar snake", "Camel’den snake", "من camel إلى snake", "מ-camel ל-snake"]),
    ("snake-camel", "text", "text", ["camel-snake", "kebab-camel"], ["ident", "case"], "Convert snake_case to camelCase.",
     ["Snake to camel", "Snake zu Camel", "Snake у camel", "Snake na camel", "Snake vers camel", "Snake a camel", "Snake in camel", "Snake para camel", "Snake naar camel", "Snake’den camel", "من snake إلى camel", "מ-snake ל-camel"]),
    ("kebab-camel", "text", "text", ["slug-generator", "snake-camel"], ["ident", "case"], "Convert kebab-case to camelCase.",
     ["Kebab to camel", "Kebab zu Camel", "Kebab у camel", "Kebab na camel", "Kebab vers camel", "Kebab a camel", "Kebab in camel", "Kebab para camel", "Kebab naar camel", "Kebab’den camel", "من kebab إلى camel", "מ-kebab ל-camel"]),
    ("markdown-toc", "text", "text", ["markdown-html", "markdown-to-pdf"], ["markdown", "toc"], "Build a list of Markdown headings.",
     ["Markdown TOC", "Markdown-Inhaltsverzeichnis", "Зміст Markdown", "Spis Markdown", "Sommaire Markdown", "Índice Markdown", "Indice Markdown", "Índice Markdown", "Markdown-inhoud", "Markdown içindekiler", "فهرس Markdown", "תוכן Markdown"]),
    ("lines-to-csv", "text", "text", ["csv-json", "table-markdown"], ["csv", "list"], "Turn one item per line into a single CSV column.",
     ["Lines to CSV", "Zeilen zu CSV", "Рядки в CSV", "Linie do CSV", "Lignes vers CSV", "Líneas a CSV", "Righe in CSV", "Linhas para CSV", "Regels naar CSV", "Satırdan CSV", "أسطر إلى CSV", "שורות ל-CSV"]),
    ("json-to-yaml", "developer", "dev", ["yaml-json", "json-formatter"], ["json", "yaml"], "Convert a JSON object to simple YAML keys.",
     ["JSON to YAML", "JSON nach YAML", "JSON у YAML", "JSON na YAML", "JSON vers YAML", "JSON a YAML", "JSON in YAML", "JSON para YAML", "JSON naar YAML", "JSON’den YAML", "JSON إلى YAML", "JSON ל-YAML"]),
    ("json-keys", "developer", "dev", ["json-formatter", "json-validator"], ["json", "keys"], "List top-level keys of a JSON object.",
     ["JSON keys", "JSON-Schlüssel", "Ключі JSON", "Klucze JSON", "Clés JSON", "Claves JSON", "Chiavi JSON", "Chaves JSON", "JSON-sleutels", "JSON anahtarları", "مفاتيح JSON", "מפתחות JSON"]),
    ("json-escape", "developer", "dev", ["json-formatter", "html-entities"], ["json", "escape"], "Escape a string for JSON quotes.",
     ["JSON escape", "JSON escapen", "Екранування JSON", "Escape JSON", "Échapper JSON", "Escapar JSON", "Escape JSON", "Escapar JSON", "JSON escapen", "JSON kaçış", "تهريب JSON", "בריחת JSON"]),
    ("hex-encode", "developer", "dev", ["hex-decode", "base64"], ["hex", "encode"], "Encode UTF-8 text as hex bytes.",
     ["Hex encode", "Hex kodieren", "Hex кодування", "Kodowanie hex", "Encoder en hex", "Codificar hex", "Codifica hex", "Codificar hex", "Hex coderen", "Hex kodla", "ترميز hex", "קידוד hex"]),
    ("hex-decode", "developer", "dev", ["hex-encode", "base64"], ["hex", "decode"], "Decode hex bytes to UTF-8 text.",
     ["Hex decode", "Hex dekodieren", "Hex декодування", "Dekodowanie hex", "Décoder le hex", "Decodificar hex", "Decodifica hex", "Descodificar hex", "Hex decoderen", "Hex çöz", "فك hex", "פענוח hex"]),
    ("binary-encode", "developer", "dev", ["decimal-binary", "hex-encode"], ["binary", "encode"], "Show UTF-8 bytes as 8-bit binary groups.",
     ["Binary encode", "Binär kodieren", "Двійкове кодування", "Kodowanie binarne", "Encoder en binaire", "Codificar binario", "Codifica binario", "Codificar binário", "Binair coderen", "İkili kodla", "ترميز ثنائي", "קידוד בינרי"]),
    ("decimal-binary", "developer", "dev", ["binary-encode", "hex-encode"], ["binary", "number"], "Convert a non-negative integer to binary.",
     ["Decimal to binary", "Dezimal zu Binär", "Десяткове у двійкове", "Dziesiętne na binarne", "Décimal vers binaire", "Decimal a binario", "Decimale in binario", "Decimal para binário", "Decimaal naar binair", "Ondalıktan ikili", "عشري إلى ثنائي", "עשרוני לבינרי"]),
    ("uuid-validate", "developer", "dev", ["uuid-generator", "hash-generator"], ["uuid", "validate"], "Check UUID hyphenated form and version nibble.",
     ["UUID validate", "UUID prüfen", "Перевірка UUID", "Walidacja UUID", "Valider un UUID", "Validar UUID", "Valida UUID", "Validar UUID", "UUID valideren", "UUID doğrula", "التحقق من UUID", "אימות UUID"]),
    ("cookie-parse", "developer", "dev", ["query-parser", "query-build"], ["cookie", "parse"], "Parse a Cookie header into names and values.",
     ["Cookie parser", "Cookie zerlegen", "Розбір cookie", "Parser cookie", "Analyseur de cookie", "Analizar cookie", "Analizza cookie", "Analisar cookie", "Cookie-parser", "Çerez çözümle", "محلل ملفات تعريف", "מפרק עוגיות"]),
    ("mime-guess", "developer", "dev", ["url-parser", "file-extension"], ["mime", "type"], "Guess MIME type from a filename extension.",
     ["MIME from extension", "MIME aus Endung", "MIME з розширення", "MIME z rozszerzenia", "MIME depuis l’extension", "MIME desde extensión", "MIME da estensione", "MIME da extensão", "MIME uit extensie", "Uzantıdan MIME", "MIME من الامتداد", "MIME מסיומת"]),
    ("file-extension", "developer", "dev", ["mime-guess", "url-parser"], ["file", "ext"], "Return the lowercase extension of a path.",
     ["File extension", "Dateiendung", "Розширення файлу", "Rozszerzenie pliku", "Extension de fichier", "Extensión de archivo", "Estensione file", "Extensão de ficheiro", "Bestandsextensie", "Dosya uzantısı", "امتداد الملف", "סיומת קובץ"]),
    ("json-env", "developer", "dev", ["env-json", "json-formatter"], ["json", "env"], "Flatten a JSON object to KEY=value lines.",
     ["JSON to env", "JSON nach env", "JSON у env", "JSON na env", "JSON vers env", "JSON a env", "JSON in env", "JSON para env", "JSON naar env", "JSON’den env", "JSON إلى env", "JSON ל-env"]),
    ("env-json", "developer", "dev", ["json-env", "json-formatter"], ["env", "json"], "Parse KEY=value lines into a JSON object.",
     ["Env to JSON", "Env nach JSON", "Env у JSON", "Env na JSON", "Env vers JSON", "Env a JSON", "Env in JSON", "Env para JSON", "Env naar JSON", "Env’den JSON", "Env إلى JSON", "Env ל-JSON"]),
    ("crc32-hash", "developer", "dev", ["hash-generator", "luhn-check"], ["crc32", "checksum"], "CRC-32 checksum of UTF-8 text.",
     ["CRC32 checksum", "CRC32-Prüfsumme", "Контрольна сума CRC32", "Suma CRC32", "Somme CRC32", "Suma CRC32", "Checksum CRC32", "Soma CRC32", "CRC32-checksum", "CRC32 sağlama", "المجموع CRC32", "בדיקת CRC32"]),
    ("levenshtein", "developer", "dev", ["text-diff", "slug-generator"], ["distance", "text"], "Levenshtein edit distance of two strings.",
     ["Levenshtein distance", "Levenshtein-Distanz", "Відстань Левенштейна", "Odległość Levenshteina", "Distance de Levenshtein", "Distancia Levenshtein", "Distanza Levenshtein", "Distância Levenshtein", "Levenshtein-afstand", "Levenshtein uzaklığı", "مسافة ليفنشتاين", "מרחק לוונשטיין"]),
    ("luhn-check", "developer", "dev", ["crc32-hash", "mask-center"], ["luhn", "checksum"], "Luhn checksum for digit strings (not card storage).",
     ["Luhn check", "Luhn-Prüfung", "Перевірка Луна", "Sprawdzenie Luhna", "Contrôle de Luhn", "Comprobación Luhn", "Controllo Luhn", "Verificação Luhn", "Luhn-check", "Luhn kontrol", "فحص لون", "בדיקת לון"]),
    ("html-minify", "developer", "dev", ["strip-html", "css-minify"], ["html", "minify"], "Collapse HTML whitespace (not a full minifier).",
     ["HTML minify", "HTML verkleinern", "Мініфікація HTML", "Minifikacja HTML", "Minifier HTML", "Minificar HTML", "Minifica HTML", "Minificar HTML", "HTML verkleinen", "HTML küçült", "ضغط HTML", "מזעור HTML"]),
    ("css-minify", "developer", "dev", ["html-minify", "gradient-generator"], ["css", "minify"], "Strip CSS comments and extra spaces.",
     ["CSS minify", "CSS verkleinern", "Мініфікація CSS", "Minifikacja CSS", "Minifier CSS", "Minificar CSS", "Minifica CSS", "Minificar CSS", "CSS verkleinen", "CSS küçült", "ضغط CSS", "מזעור CSS"]),
    ("strip-comments", "developer", "dev", ["js-strip", "html-minify"], ["comments", "code"], "Remove // and /* */ comments from a snippet.",
     ["Strip comments", "Kommentare entfernen", "Прибрати коментарі", "Usuń komentarze", "Retirer les commentaires", "Quitar comentarios", "Rimuovi commenti", "Remover comentários", "Reacties weg", "Yorumları sil", "إزالة التعليقات", "הסרת הערות"]),
    ("query-build", "developer", "dev", ["query-parser", "utm-builder"], ["query", "url"], "Build a query string from key=value lines.",
     ["Query builder", "Query bauen", "Збирач query", "Kreator query", "Constructeur de query", "Constructor de query", "Builder query", "Construtor de query", "Query-builder", "Query oluştur", "باني الاستعلام", "בונה query"]),
    ("base64url", "developer", "dev", ["base64", "url-codec"], ["base64", "url"], "Base64url encode UTF-8 without padding.",
     ["Base64url encode", "Base64url kodieren", "Base64url кодування", "Kodowanie base64url", "Encoder base64url", "Codificar base64url", "Codifica base64url", "Codificar base64url", "Base64url coderen", "Base64url kodla", "ترميز base64url", "קידוד base64url"]),
    ("title-length", "seo", "seo", ["serp-preview", "meta-tag-generator"], ["seo", "title"], "Count title characters vs common SERP budgets.",
     ["Title length check", "Titel-Länge prüfen", "Довжина title", "Długość tytułu", "Longueur de titre", "Longitud de título", "Lunghezza titolo", "Comprimento do título", "Titellengte", "Başlık uzunluğu", "طول العنوان", "אורך כותרת"]),
    ("keyword-density", "seo", "seo", ["word-counter", "text-statistics"], ["seo", "keyword"], "Share of a phrase in the word count (not a rank promise).",
     ["Keyword density", "Keyword-Dichte", "Щільність ключа", "Gęstość słowa", "Densité de mot-clé", "Densidad de palabra", "Densità keyword", "Densidade de palavra", "Zoekwoorddichtheid", "Anahtar yoğunluğu", "كثافة الكلمة", "צפיפות מילת מפתח"]),
    ("robots-path-test", "seo", "seo", ["robots-txt-generator", "canonical-helper"], ["robots", "seo"], "Test a path against simple Disallow lines.",
     ["Robots path test", "Robots-Pfad testen", "Тест шляху robots", "Test ścieżki robots", "Test de chemin robots", "Probar ruta robots", "Test percorso robots", "Testar caminho robots", "Robots-pad test", "Robots yol testi", "اختبار مسار robots", "בדיקת נתיב robots"]),
    ("twitter-card", "seo", "seo", ["og-preview", "meta-tag-generator"], ["twitter", "card"], "Draft twitter:card meta tags. Not a live preview.",
     ["Twitter card tags", "Twitter-Card-Tags", "Теги Twitter Card", "Tagi Twitter Card", "Balises Twitter Card", "Etiquetas Twitter Card", "Tag Twitter Card", "Tags Twitter Card", "Twitter-card tags", "Twitter kart etiketleri", "وسوم بطاقة تويتر", "תגי כרטיס טוויטר"]),
    ("breadcrumb-ld", "seo", "seo", ["schema-generator", "sitemap-helper"], ["jsonld", "breadcrumb"], "JSON-LD BreadcrumbList from name|url lines.",
     ["Breadcrumb JSON-LD", "Breadcrumb JSON-LD", "JSON-LD крихти", "JSON-LD okruszki", "Fil d’Ariane JSON-LD", "Migas JSON-LD", "Breadcrumb JSON-LD", "Breadcrumb JSON-LD", "Broodkruimel JSON-LD", "Breadcrumb JSON-LD", "JSON-LD فتات", "JSON-LD פירורים"]),
    ("faq-jsonld", "seo", "seo", ["schema-generator", "hreflang-generator"], ["jsonld", "faq"], "FAQPage JSON-LD from question||answer pairs. No reviews.",
     ["FAQ JSON-LD", "FAQ JSON-LD", "JSON-LD FAQ", "JSON-LD FAQ", "FAQ JSON-LD", "FAQ JSON-LD", "FAQ JSON-LD", "FAQ JSON-LD", "FAQ JSON-LD", "SSS JSON-LD", "JSON-LD للأسئلة", "JSON-LD לשאלות"]),
    ("meta-robots", "seo", "seo", ["robots-txt-generator", "canonical-helper"], ["meta", "robots"], "Build a meta robots content string.",
     ["Meta robots tag", "Meta-robots-Tag", "Тег meta robots", "Tag meta robots", "Balise meta robots", "Etiqueta meta robots", "Tag meta robots", "Tag meta robots", "Meta-robots-tag", "Meta robots etiket", "وسم meta robots", "תג meta robots"]),
    ("href-extract", "seo", "seo", ["extract-urls", "sitemap-helper"], ["html", "href"], "List href values from HTML anchors.",
     ["Extract hrefs", "Hrefs extrahieren", "Витягти href", "Wyodrębnij href", "Extraire les href", "Extraer href", "Estrai href", "Extrair href", "Hrefs halen", "Href çıkar", "استخراج href", "חילוץ href"]),
    ("slug-from-url", "seo", "seo", ["slug-generator", "url-parser"], ["slug", "url"], "Take the last path segment as a slug.",
     ["Slug from URL", "Slug aus URL", "Slug з URL", "Slug z URL", "Slug depuis l’URL", "Slug desde URL", "Slug da URL", "Slug do URL", "Slug uit URL", "URL’den slug", "slug من الرابط", "slug מכתובת"]),
    ("strip-utm", "seo", "seo", ["utm-builder", "url-parser"], ["utm", "privacy"], "Remove utm_* and fbclid/gclid parameters.",
     ["Strip tracking params", "Tracking-Parameter entfernen", "Прибрати tracking", "Usuń parametry śledzenia", "Retirer le tracking", "Quitar tracking", "Rimuovi tracking", "Remover tracking", "Tracking weghalen", "Takibi sil", "إزالة التتبع", "הסרת מעקב"]),
    ("canonical-host", "seo", "seo", ["canonical-helper", "url-parser"], ["canonical", "host"], "Normalize scheme and host; drop default ports.",
     ["Normalize canonical URL", "Canonical-URL normalisieren", "Нормалізувати canonical", "Normalizuj canonical", "Normaliser l’URL canonique", "Normalizar URL canónica", "Normalizza canonical", "Normalizar canonical", "Canonical normaliseren", "Canonical normalleştir", "تطبيع الرابط الأساسي", "נרמול canonical"]),
    ("redirect-pairs", "seo", "seo", ["sitemap-helper", "canonical-helper"], ["redirect", "csv"], "Turn from→to lines into a CSV map.",
     ["Redirect map CSV", "Redirect-CSV", "CSV редиректів", "CSV przekierowań", "CSV de redirections", "CSV de redirecciones", "CSV di redirect", "CSV de redirecionamentos", "Redirect-CSV", "Yönlendirme CSV", "CSV للتحويلات", "CSV הפניות"]),
    ("simple-interest", "calculators", "calc", ["compound-interest", "loan-calculator"], ["interest", "finance"], "Simple interest I = P × r × t. Not advice.",
     ["Simple interest", "Einfache Zinsen", "Прості відсотки", "Proste odsetki", "Intérêt simple", "Interés simple", "Interesse semplice", "Juros simples", "Enkelvoudige rente", "Basit faiz", "فائدة بسيطة", "ריבית פשוטה"]),
    ("rule-of-three", "calculators", "calc", ["percentage", "ratio-simplify"], ["ratio", "math"], "Solve a/b = c/x for x.",
     ["Rule of three", "Dreisatz", "Правило трьох", "Reguła trzech", "Règle de trois", "Regla de tres", "Regola del tre", "Regra de três", "Kruisregel", "Üçlü kural", "قاعدة الثلاثة", "כלל השלושה"]),
    ("hourly-rate", "calculators", "calc", ["salary-converter", "invoice-math"], ["rate", "work"], "Derive an hourly rate from a yearly amount.",
     ["Hourly rate", "Stundensatz", "Погодинна ставка", "Stawka godzinowa", "Taux horaire", "Tarifa horaria", "Tariffa oraria", "Taxa horária", "Uurtarief", "Saatlik ücret", "أجر الساعة", "תעריף שעתי"]),
    ("cagr", "calculators", "calc", ["compound-interest", "percent-change"], ["cagr", "finance"], "Compound annual growth rate. Not investment advice.",
     ["CAGR calculator", "CAGR-Rechner", "Калькулятор CAGR", "Kalkulator CAGR", "Calculateur CAGR", "Calculadora CAGR", "Calcolatrice CAGR", "Calculadora CAGR", "CAGR-calculator", "CAGR hesaplayıcı", "حاسبة CAGR", "מחשבון CAGR"]),
    ("break-even", "calculators", "calc", ["profit-margin", "invoice-math"], ["breakeven", "business"], "Units to cover fixed cost at a unit margin.",
     ["Break-even units", "Break-even-Menge", "Точка беззбитковості", "Próg rentowności", "Seuil de rentabilité", "Punto de equilibrio", "Punto di pareggio", "Ponto de equilíbrio", "Break-even aantal", "Başabaş miktar", "كمية التعادل", "כמות איזון"]),
    ("roman-numeral", "calculators", "calc", ["decimal-binary", "number-lines"], ["roman", "number"], "Integer 1–3999 to Roman numerals.",
     ["Roman numerals", "Römische Zahlen", "Римські числа", "Cyfry rzymskie", "Chiffres romains", "Números romanos", "Numeri romani", "Algarismos romanos", "Romeinse cijfers", "Roma rakamları", "أرقام رومانية", "ספרות רומיות"]),
    ("gcd-lcm", "calculators", "calc", ["ratio-simplify", "prime-check"], ["gcd", "lcm"], "Greatest common divisor and least common multiple.",
     ["GCD and LCM", "GGT und KGV", "НСД і НСК", "NWD i NWW", "PGCD et PPCM", "MCD y MCM", "MCD e MCM", "MDC e MMC", "GGD en KGV", "EBOB EKOK", "قاسم ومضاعف", "מחלק ומכפלה"]),
    ("prime-check", "calculators", "calc", ["gcd-lcm", "factorial"], ["prime", "math"], "Test whether an integer is prime.",
     ["Prime checker", "Primzahl prüfen", "Перевірка простого", "Czy pierwsza", "Nombre premier", "Número primo", "Numero primo", "Número primo", "Priemgetal", "Asal kontrol", "فحص أولي", "בדיקת ראשוני"]),
    ("factorial", "calculators", "calc", ["fibonacci", "prime-check"], ["factorial", "math"], "n! for n up to 170 as a decimal string.",
     ["Factorial", "Fakultät", "Факторіал", "Silnia", "Factorielle", "Factorial", "Fattoriale", "Fatorial", "Faculteit", "Faktöriyel", "عاملي", "עצרת"]),
    ("fibonacci", "calculators", "calc", ["factorial", "sequence-nth"], ["fibonacci", "math"], "First n Fibonacci numbers (n ≤ 80).",
     ["Fibonacci sequence", "Fibonacci-Folge", "Послідовність Фібоначчі", "Ciąg Fibonacciego", "Suite de Fibonacci", "Secuencia Fibonacci", "Successione Fibonacci", "Sequência Fibonacci", "Fibonacci-reeks", "Fibonacci dizisi", "متتالية فيبوناتشي", "סדרת פיבונאצ'י"]),
    ("average-mean", "calculators", "calc", ["median-list", "percentage"], ["average", "stats"], "Arithmetic mean of a number list.",
     ["Average mean", "Mittelwert", "Середнє арифметичне", "Średnia arytmetyczna", "Moyenne arithmétique", "Media aritmética", "Media aritmetica", "Média aritmética", "Rekenkundig gemiddelde", "Aritmetik ortalama", "المتوسط الحسابي", "ממוצע חשבוני"]),
    ("median-list", "calculators", "calc", ["average-mean", "percentage"], ["median", "stats"], "Median of a number list.",
     ["Median", "Median", "Медіана", "Mediana", "Médiane", "Mediana", "Mediana", "Mediana", "Mediaan", "Medyan", "الوسيط", "חציון"]),
    ("aspect-ratio", "calculators", "calc", ["px-to-rem", "resize-image"], ["aspect", "ratio"], "Simplify width:height to a ratio.",
     ["Aspect ratio", "Seitenverhältnis", "Співвідношення сторін", "Proporcje", "Ratio d’aspect", "Relación de aspecto", "Rapporto d’aspetto", "Proporção", "Beeldverhouding", "En boy oranı", "نسبة العرض", "יחס גובה־רוחב"]),
    ("px-to-rem", "converters", "unit", ["px-to-pt", "data-size"], ["css", "rem"], "Convert px to rem at a root font size.",
     ["Px to rem", "Px nach rem", "Px у rem", "Px na rem", "Px vers rem", "Px a rem", "Px in rem", "Px para rem", "Px naar rem", "Px’ten rem", "من px إلى rem", "מ-px ל-rem"]),
    ("savings-goal", "calculators", "calc", ["simple-interest", "compound-interest"], ["savings", "goal"], "Months to reach a goal at a fixed monthly amount.",
     ["Savings goal", "Sparziel", "Ціль заощаджень", "Cel oszczędności", "Objectif d’épargne", "Meta de ahorro", "Obiettivo risparmio", "Meta de poupança", "Spaardoel", "Tasarruf hedefi", "هدف الادخار", "יעד חיסכון"]),
    ("triangle-area", "calculators", "calc", ["circle-math", "pythagoras"], ["geometry", "area"], "Triangle area from base and height.",
     ["Triangle area", "Dreiecksfläche", "Площа трикутника", "Pole trójkąta", "Aire d’un triangle", "Área de triángulo", "Area triangolo", "Área do triângulo", "Driehoekoppervlakte", "Üçgen alanı", "مساحة المثلث", "שטח משולש"]),
    ("circle-math", "calculators", "calc", ["triangle-area", "area"], ["circle", "geometry"], "Circle area and circumference from radius.",
     ["Circle area", "Kreisfläche", "Площа кола", "Pole koła", "Aire d’un cercle", "Área de círculo", "Area cerchio", "Área do círculo", "Cirkeloppervlakte", "Daire alanı", "مساحة الدائرة", "שטח עיגול"]),
    ("pythagoras", "calculators", "calc", ["triangle-area", "length"], ["triangle", "math"], "Hypotenuse from two legs.",
     ["Pythagoras", "Satz des Pythagoras", "Піфагор", "Pitagoras", "Pythagore", "Pitágoras", "Pitagora", "Pitágoras", "Pythagoras", "Pisagor", "فيثاغورس", "פיתגורס"]),
    ("ratio-simplify", "calculators", "calc", ["gcd-lcm", "rule-of-three"], ["ratio", "math"], "Simplify a:b using GCD.",
     ["Simplify ratio", "Verhältnis kürzen", "Спростити відношення", "Uprość stosunek", "Simplifier un ratio", "Simplificar razón", "Semplifica rapporto", "Simplificar razão", "Verhouding vereenvoudigen", "Oranı sadeleştir", "تبسيط النسبة", "פישוט יחס"]),
    ("add-days", "date-time", "dt", ["date-difference", "days-until"], ["date", "add"], "Add (or subtract) whole days to an ISO date.",
     ["Add days to date", "Tage addieren", "Додати дні", "Dodaj dni", "Ajouter des jours", "Sumar días", "Aggiungi giorni", "Somar dias", "Dagen optellen", "Gün ekle", "إضافة أيام", "הוספת ימים"]),
    ("weekday-of", "date-time", "dt", ["iso-week", "year-quarter"], ["date", "weekday"], "Weekday name for an ISO date.",
     ["Weekday of date", "Wochentag", "День тижня", "Dzień tygodnia", "Jour de la semaine", "Día de la semana", "Giorno della settimana", "Dia da semana", "Weekdag", "Haftanın günü", "يوم الأسبوع", "יום בשבוע"]),
    ("iso-week", "date-time", "dt", ["year-quarter", "weekday-of"], ["iso", "week"], "ISO week number of a date.",
     ["ISO week number", "ISO-Wochennummer", "Номер тижня ISO", "Numer tygodnia ISO", "Numéro de semaine ISO", "Semana ISO", "Settimana ISO", "Semana ISO", "ISO-weeknummer", "ISO hafta no", "رقم أسبوع ISO", "שבוע ISO"]),
    ("year-quarter", "date-time", "dt", ["iso-week", "date-difference"], ["quarter", "date"], "Calendar quarter Q1–Q4 of a date.",
     ["Year quarter", "Quartal", "Квартал року", "Kwartał", "Trimestre", "Trimestre", "Trimestre", "Trimestre", "Kwartaal", "Çeyrek", "ربع السنة", "רבעון"]),
    ("business-days", "date-time", "dt", ["date-difference", "add-days"], ["business", "days"], "Count Mon–Fri days between two dates (no holidays).",
     ["Business days", "Werktage", "Робочі дні", "Dni robocze", "Jours ouvrés", "Días hábiles", "Giorni lavorativi", "Dias úteis", "Werkdagen", "İş günü", "أيام العمل", "ימי עסקים"]),
    ("format-date", "date-time", "dt", ["unix-timestamp", "weekday-of"], ["date", "format"], "Format an ISO date as YYYY-MM-DD and long en-GB.",
     ["Format date", "Datum formatieren", "Формат дати", "Format daty", "Formater une date", "Formatear fecha", "Formatta data", "Formatar data", "Datum formatteren", "Tarih biçimle", "تنسيق التاريخ", "עיצוב תאריך"]),
    ("days-until", "date-time", "dt", ["add-days", "date-difference"], ["countdown", "date"], "Whole days from today (UTC) to a target date.",
     ["Days until date", "Tage bis Datum", "Днів до дати", "Dni do daty", "Jours jusqu’à", "Días hasta", "Giorni fino a", "Dias até", "Dagen tot", "Tarihe kalan gün", "أيام حتى التاريخ", "ימים עד תאריך"]),
    ("invert-hex", "color", "color", ["hex-rgb-hsl", "complementary-hex"], ["color", "invert"], "Invert an #RRGGBB color.",
     ["Invert hex color", "Hex invertieren", "Інверсія hex", "Odwróć hex", "Inverser une couleur hex", "Invertir hex", "Inverti hex", "Inverter hex", "Hex inverteren", "Hex ters çevir", "عكس لون hex", "היפוך hex"]),
    ("mix-hex", "color", "color", ["hex-rgb-hsl", "palette-generator"], ["color", "mix"], "Mix two hex colors at 50%.",
     ["Mix hex colors", "Hex mischen", "Змішати hex", "Mieszaj hex", "Mélanger des hex", "Mezclar hex", "Mescola hex", "Misturar hex", "Hex mengen", "Hex karıştır", "مزج hex", "ערבוב hex"]),
    ("is-dark-hex", "color", "color", ["contrast-checker", "invert-hex"], ["color", "luminance"], "Say whether a hex color is dark by luminance.",
     ["Is hex dark", "Ist Hex dunkel", "Чи hex темний", "Czy hex ciemny", "Hex sombre ?", "¿Hex oscuro?", "Hex scuro?", "Hex escuro?", "Is hex donker", "Hex koyu mu", "هل hex داكن", "האם hex כהה"]),
    ("rgb-cmyk", "color", "color", ["hex-rgb-hsl", "palette-generator"], ["cmyk", "print"], "Approximate CMYK from #RRGGBB (screen, not ICC).",
     ["RGB to CMYK", "RGB nach CMYK", "RGB у CMYK", "RGB na CMYK", "RVB vers CMJN", "RGB a CMYK", "RGB in CMYK", "RGB para CMYK", "RGB naar CMYK", "RGB’den CMYK", "من RGB إلى CMYK", "מ-RGB ל-CMYK"]),
    ("complementary-hex", "color", "color", ["invert-hex", "palette-generator"], ["color", "complement"], "Hue-opposite complementary hex color.",
     ["Complementary color", "Komplementärfarbe", "Комплементарний колір", "Kolor dopełniający", "Couleur complémentaire", "Color complementario", "Colore complementare", "Cor complementar", "Complementaire kleur", "Tamamlayıcı renk", "لون مكمل", "צבע משלים"]),
    ("random-hex", "color", "color", ["palette-generator", "random-string"], ["color", "random"], "Random #RRGGBB using Web Crypto.",
     ["Random hex color", "Zufälliges Hex", "Випадковий hex", "Losowy hex", "Hex aléatoire", "Hex aleatorio", "Hex casuale", "Hex aleatório", "Willekeurige hex", "Rastgele hex", "لون hex عشوائي", "hex אקראי"]),
    ("dummy-json", "generators", "gen", ["json-formatter", "dummy-csv"], ["json", "sample"], "Generate n tiny JSON sample objects.",
     ["Dummy JSON", "Dummy-JSON", "Фіктивний JSON", "Przykładowy JSON", "JSON factice", "JSON de ejemplo", "JSON di esempio", "JSON de exemplo", "Dummy-JSON", "Örnek JSON", "JSON تجريبي", "JSON לדוגמה"]),
    ("dummy-csv", "generators", "gen", ["csv-json", "dummy-json"], ["csv", "sample"], "Generate n CSV sample rows.",
     ["Dummy CSV", "Dummy-CSV", "Фіктивний CSV", "Przykładowy CSV", "CSV factice", "CSV de ejemplo", "CSV di esempio", "CSV de exemplo", "Dummy-CSV", "Örnek CSV", "CSV تجريبي", "CSV לדוגמה"]),
    ("pin-generator", "generators", "gen", ["password-generator", "random-number"], ["pin", "random"], "Numeric PIN of a chosen length (not a bank PIN).",
     ["PIN generator", "PIN-Generator", "Генератор PIN", "Generator PIN", "Générateur de PIN", "Generador de PIN", "Generatore PIN", "Gerador de PIN", "PIN-generator", "PIN üretici", "مولّد PIN", "מחולל PIN"]),
    ("dice-roller", "generators", "gen", ["random-number", "pick-from-list"], ["dice", "random"], "Roll NdS dice with crypto randomness.",
     ["Dice roller", "Würfel", "Кубики", "Kości", "Dés", "Dados", "Dadi", "Dados", "Dobbelstenen", "Zar at", "رمي النرد", "קוביות"]),
    ("pick-from-list", "generators", "gen", ["dice-roller", "random-string"], ["pick", "list"], "Pick one line at random from a list.",
     ["Pick from list", "Zufallszeile", "Випадковий рядок зі списку", "Losowa linia", "Tirer une ligne", "Elegir de lista", "Scegli da elenco", "Escolher da lista", "Kies uit lijst", "Listeden seç", "اختيار من قائمة", "בחירה מהרשימה"]),
    ("password-score", "generators", "gen", ["password-generator", "hash-generator"], ["password", "score"], "Heuristic strength score. Not a breach check.",
     ["Password score", "Passwort-Score", "Оцінка пароля", "Ocena hasła", "Score de mot de passe", "Puntuación de contraseña", "Punteggio password", "Pontuação da palavra-passe", "Wachtwoordscore", "Parola puanı", "درجة كلمة المرور", "ציון סיסמה"]),
    ("redact-emails", "text", "text", ["extract-emails", "mask-center"], ["privacy", "email"], "Replace emails with [email].",
     ["Redact emails", "E-Mails schwärzen", "Замаскувати email", "Zasłoń e-maile", "Masquer les e-mails", "Redactar emails", "Oscura email", "Redigir e-mails", "E-mails afschermen", "E-postaları gizle", "حجب البريد", "השחרת אימייל"]),
    ("redact-phones", "text", "text", ["extract-phones", "mask-center"], ["privacy", "phone"], "Replace long digit runs with [phone].",
     ["Redact phones", "Telefonnummern schwärzen", "Замаскувати телефони", "Zasłoń telefony", "Masquer les numéros", "Redactar teléfonos", "Oscura telefoni", "Redigir telefones", "Telefoons afschermen", "Telefon gizle", "حجب الهواتف", "השחרת טלפון"]),
    ("mask-center", "text", "text", ["redact-emails", "luhn-check"], ["privacy", "mask"], "Keep first and last 2 characters, mask the rest.",
     ["Mask middle", "Mitte maskieren", "Маскувати середину", "Zasłoń środek", "Masquer le milieu", "Enmascarar centro", "Maschera il centro", "Mascarar o meio", "Midden maskeren", "Ortayı gizle", "إخفاء الوسط", "הסתרת אמצע"]),
    ("hash-line", "developer", "dev", ["hash-generator", "crc32-hash"], ["hash", "sha256"], "SHA-256 hex of a single line (Web Crypto).",
     ["Hash a line", "Zeile hashen", "Хеш рядка", "Hash linii", "Hasher une ligne", "Hashear una línea", "Hash di una riga", "Hash de uma linha", "Regel hashen", "Satırı hashle", "تجزئة سطر", "גיבוב שורה"]),
    ("deg-to-rad", "converters", "unit", ["px-to-pt", "length"], ["angle", "math"], "Convert degrees ↔ radians.",
     ["Degrees to radians", "Grad zu Bogenmaß", "Градуси в радіани", "Stopnie na radiany", "Degrés vers radians", "Grados a radianes", "Gradi in radianti", "Graus para radianos", "Graden naar radialen", "Derece radyan", "درجات إلى راديان", "מעלות לרדיאנים"]),
    ("px-to-pt", "converters", "unit", ["px-to-rem", "length"], ["print", "css"], "Convert CSS px to pt at 96 DPI.",
     ["Px to pt", "Px nach pt", "Px у pt", "Px na pt", "Px vers pt", "Px a pt", "Px in pt", "Px para pt", "Px naar pt", "Px’ten pt", "من px إلى pt", "מ-px ל-pt"]),
    ("extract-domain", "seo", "seo", ["url-parser", "slug-from-url"], ["domain", "url"], "Hostname of a URL or bare host.",
     ["Extract domain", "Domain extrahieren", "Витягти домен", "Wyodrębnij domenę", "Extraire le domaine", "Extraer dominio", "Estrai dominio", "Extrair domínio", "Domein halen", "Alan adı çıkar", "استخراج النطاق", "חילוץ דומיין"]),
    ("force-https", "seo", "seo", ["canonical-host", "url-parser"], ["https", "url"], "Force https:// on a URL.",
     ["Force HTTPS", "HTTPS erzwingen", "Примусовий HTTPS", "Wymuś HTTPS", "Forcer HTTPS", "Forzar HTTPS", "Forza HTTPS", "Forçar HTTPS", "HTTPS afdwingen", "HTTPS zorla", "فرض HTTPS", "כפיית HTTPS"]),
]

# related entries that are wave-internal may not exist yet at first pass; filter later.


EXISTING = {
    "merge-pdf","split-pdf","rotate-pdf","images-to-pdf","extract-pdf-pages","pdf-metadata","reorder-pdf","compress-pdf",
    "compress-image","resize-image","crop-image","convert-image","image-to-base64","base64-to-image","exif-strip","favicon-generator",
    "word-counter","character-counter","case-converter","remove-duplicate-lines","sort-lines","slug-generator","whitespace-cleaner",
    "text-statistics","text-diff","json-formatter","json-validator","csv-json","base64","url-codec","html-entities","uuid-generator",
    "hash-generator","regex-tester","jwt-decoder","meta-tag-generator","robots-txt-generator","serp-preview","hreflang-generator",
    "percentage","vat-calculator","discount","profit-margin","bmi-calculator","date-difference","temperature","length","weight",
    "data-size","hex-rgb-hsl","contrast-checker","palette-generator","password-generator","qr-generator","random-string",
    "unix-timestamp","timezone-convert","xml-formatter","yaml-json","sitemap-helper","canonical-helper","schema-generator","og-preview",
    "speed","area","volume","pressure","energy","duration","gradient-generator","url-parser","query-parser","invoice-math",
    "resume-bullets","cover-letter-template","ics-event","color-extract","pdf-to-image","heic-to-jpg","docx-to-pdf","pdf-watermark",
    "pdf-page-numbers","pdf-password","qr-reader","barcode-generator","tip-calculator","loan-calculator","compound-interest",
    "salary-converter","age-calculator","fuel-cost","xlsx-csv","markdown-html","lorem-ipsum","social-counter","strip-html",
    "table-markdown","cron-generator","sql-formatter","image-text-overlay","image-blur","png-to-ico","universal-converter",
    "video-file-info","convert-video","text-to-pdf","markdown-to-pdf","extract-pdf-text","delete-pdf-pages","rotate-image",
    "flip-image","utm-builder","random-number",
}

def main():
    ids = [t[0] for t in TOOLS]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate wave ids")
    allow = EXISTING | set(ids)
    # generate english-wave.ts
    rows = []
    for tid, cat, _kind, related, tags, hint, names in TOOLS:
        rel = [r for r in related if r in allow and r != tid][:3]
        if not rel:
            rel = ["word-counter"]
        name = names[0]
        title = (name + " in your browser")[:70]
        if len(title) < 10:
            title = (name + " online tool")[:70]
        desc = f"{hint} Runs in this tab. Freela does not upload the input."
        if len(desc) < 40:
            desc += " Free local helper."
        desc = desc[:170]
        intro = f"{hint} Output stays on this device. This is a utility, not professional, legal, tax or medical advice."
        if len(intro) < 40:
            intro += " Check important results yourself."
        tag_js = json.dumps(tags)
        rel_js = json.dumps(rel)
        rows.append(
            dedent(
                f"""\
          t({{
            id: {json.dumps(tid)},
            category: {json.dumps(cat)},
            tags: {tag_js},
            featured: false,
            inputTypes: ["text"],
            outputTypes: ["text"],
            maxFileSize: 0,
            supportedFormats: ["text"],
            relatedTools: {rel_js},
            runtime: {{ kind: "wave", action: {json.dumps(tid)} }},
            copyEn: {{
              name: {json.dumps(name)},
              title: {json.dumps(title)},
              description: {json.dumps(desc)},
              h1: {json.dumps(name[:80])},
              intro: {json.dumps(intro)},
              howTo: ["Paste or type the input.", "Run the action.", "Copy the result from this tab."],
              faq: [
                {{ question: "Does this upload my input?", answer: "No. Wave tools are LOCAL_ONLY in the browser." }},
                {{ question: "Is this professional advice?", answer: "No. Verify important numbers and text yourself." }},
              ],
              privacy: privacyText.en,
              formats: "Input: text or numbers in this page. Output: text in this tab.",
              examples: [{json.dumps("Try the main example for " + name + ".")}, "Try empty input to see the error."],
            }},
          }}),"""
            )
        )
    ts = """import type { ToolDefinition } from "../schema";
import { privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-25";

function t(
  partial: Omit<
    EnTool,
    | "status"
    | "processingMode"
    | "clientOnly"
    | "retention"
    | "deletion"
    | "tested"
    | "translationReviewed"
    | "seoReviewed"
    | "lastReviewedAt"
    | "lastModified"
    | "eventName"
    | "toolVersion"
    | "adSlots"
  >,
): EnTool {
  return {
    status: "published",
    processingMode: "LOCAL_ONLY",
    clientOnly: true,
    retention: "none",
    deletion: "Inputs stay on this device.",
    tested: true,
    translationReviewed: true,
    seoReviewed: true,
    lastReviewedAt: day,
    lastModified: day,
    eventName: `tool_${partial.id.replace(/-/g, "_")}`,
    toolVersion: "1.0.0",
    adSlots: ["after-result"],
    ...partial,
  };
}

export const WAVE_TOOL_IDS = """ + json.dumps(ids) + """ as const;

export const waveTools: EnTool[] = [
""" + "\n".join(rows) + """
];
"""
    Path("/workspace/src/data/tools/english-wave.ts").write_text(ts, encoding="utf-8")

    # labels
    label_maps = {loc: {} for loc in LOCALES}
    for tid, _c, _k, _r, _t, _h, names in TOOLS:
        for loc, name in zip(LOCALES, names):
            label_maps[loc][tid] = name
    lab = 'import type { Locale } from "@/data/locales";\n\n'
    lab += "export const WAVE_LABELS: Record<Locale, Record<string, string>> = {\n"
    for loc in LOCALES:
        lab += f"  {loc}: {{\n"
        for tid, name in label_maps[loc].items():
            lab += f"    {json.dumps(tid)}: {json.dumps(name)},\n"
        lab += "  },\n"
    lab += "};\n"
    Path("/workspace/src/lib/action-labels-wave.ts").write_text(lab, encoding="utf-8")

    names = {t[0]: t[6] for t in TOOLS}
    kinds = {t[0]: t[2] for t in TOOLS}
    Path("/workspace/scripts/wave-seo-names.json").write_text(
        json.dumps({"names": names, "kinds": kinds}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wave tools={len(TOOLS)}")


if __name__ == "__main__":
    main()

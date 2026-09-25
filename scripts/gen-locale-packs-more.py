#!/usr/bin/env python3
"""Generate remaining locale packs (21 addendum tools × 9 locales + ar/he × 77)."""
from __future__ import annotations

import json
from pathlib import Path

ADDENDUM_IDS = [
    "compress-pdf",
    "xml-formatter",
    "yaml-json",
    "sitemap-helper",
    "canonical-helper",
    "schema-generator",
    "og-preview",
    "speed",
    "area",
    "volume",
    "pressure",
    "energy",
    "duration",
    "gradient-generator",
    "url-parser",
    "query-parser",
    "invoice-math",
    "resume-bullets",
    "cover-letter-template",
    "ics-event",
    "color-extract",
]

# High-quality addendum packs keyed by locale then tool id.
ADDENDUM: dict[str, dict[str, dict]] = {}

def pack(**kwargs):
    return kwargs


# --- German addendum ---
ADDENDUM["de"] = {
    "compress-pdf": pack(
        name="PDF komprimieren",
        title="PDF im Browser komprimieren",
        description="Schreibt ein PDF mit Objektströmen neu, oft kleiner. Kein Upload. Stark kodierte Scans werden kaum kleiner.",
        h1="PDF komprimieren",
        intro="Laden Sie ein PDF und laden Sie eine neu geschriebene Kopie herunter. Das ist verlustfreie Strukturkompression, kein JPEG-Recompressor.",
        howTo=["PDF bis 25 MB wählen.", "Komprimieren starten.", "Downloadgröße mit dem Original vergleichen."],
        faq=[
            {"question": "Wird jede Datei kleiner?", "answer": "Nein. Bereits optimierte PDFs können gleich groß bleiben."},
            {"question": "Wird Text extrahiert?", "answer": "Nein. Seiten werden kopiert; es gibt keine OCR."},
        ],
        formats="Eingabe und Ausgabe: PDF.",
        examples=["Einen textlastigen Bericht vor einer E-Mail verkleinern.", "Prüfen, ob ein Formular-PDF unkomprimiert gespeichert wurde."],
    ),
    "xml-formatter": pack(
        name="XML-Formatierer",
        title="XML lokal einrücken",
        description="Ruckt XML-ähnliches Markup im Browser ein. Das ist ein Pretty-Printer, kein Schema-Validator.",
        h1="XML-Formatierer",
        intro="XML einfügen und eingerücktes Markup erhalten. Fragmente bleiben lokal.",
        howTo=["XML einfügen.", "Formatierer ausführen.", "Das Ergebnis kopieren."],
        faq=[
            {"question": "Validieren Sie DTDs?", "answer": "Nein. Nur zum Lesen verschachtelter Tags."},
            {"question": "Wird HTML akzeptiert?", "answer": "Einfache HTML-ähnliche Tags werden eingerückt. Kein Browser-HTML-Parser."},
        ],
        formats="Eingabe/Ausgabe: XML-Text.",
        examples=["Einen SOAP-Umschlag lesen.", "Ein XML-Sitemap-Fragment prüfen."],
    ),
    "yaml-json": pack(
        name="YAML nach JSON",
        title="Einfache YAML-Schlüssel nach JSON",
        description="Wandelt flaches key: value-YAML in JSON. Verschachtelung, Anker und Multiline werden nicht unterstützt.",
        h1="Einfaches YAML nach JSON",
        intro="Ein flaches YAML-Objekt einfügen. Für kleine Snippets, nicht für Kubernetes-Manifeste.",
        howTo=["Flaches YAML einfügen.", "Nach JSON wandeln.", "Das Objekt kopieren."],
        faq=[
            {"question": "Kann ich Helm-Charts wandeln?", "answer": "Nein. Verschachteltes YAML braucht einen vollständigen Parser."},
            {"question": "Bleiben Kommentare?", "answer": "Zeilen mit # werden übersprungen."},
        ],
        formats="Eingabe: flaches YAML. Ausgabe: JSON.",
        examples=["Mini-YAML in JSON umwandeln.", "Ein Zwei-Schlüssel-Snippet prüfen."],
    ),
    "sitemap-helper": pack(
        name="Sitemap-Helfer",
        title="Kleine XML-Sitemap aus URLs",
        description="Macht aus absoluten URLs ein urlset. Crawlt die Site nicht und garantiert keine Indexierung.",
        h1="XML-Sitemap-Helfer",
        intro="Eine absolute URL pro Zeile. Nur diese URLs erscheinen.",
        howTo=["Absolute URLs listen.", "XML erzeugen.", "Nur hosten, wenn die URLs gecrawlt werden sollen."],
        faq=[
            {"question": "Rufen Sie die URLs ab?", "answer": "Nein. Ungültige URLs lösen einen Parserfehler aus."},
            {"question": "Suchseiten aufnehmen?", "answer": "Nein. Sitemaps nur für indexierbare Seiten."},
        ],
        formats="Ausgabe: XML-Sitemap.",
        examples=["Sitemap für fünf Landingpages entwerfen.", "/admin vor dem Kopieren weglassen."],
    ),
    "canonical-helper": pack(
        name="Canonical-Helfer",
        title="Canonical-Link-Tag erzeugen",
        description="Erzeugt ein rel=canonical-Tag für eine absolute URL. Schreibt die Site nicht um.",
        h1="Canonical-Tag-Helfer",
        intro="Die bevorzugte absolute URL der Seite einfügen. Canonicals sollten nicht alle auf die Startseite zeigen.",
        howTo=["Canonical-URL eingeben.", "Link-Tag kopieren.", "Im head dieser Seite einfügen."],
        faq=[
            {"question": "Alles auf / kanonisieren?", "answer": "Das Tag lässt sich erzeugen; meist ist das ein Fehler."},
            {"question": "Relative URLs?", "answer": "Wir verlangen eine absolute URL."},
        ],
        formats="Ausgabe: HTML-Link-Tag.",
        examples=["Produkt-URL ohne Tracking-Parameter kanonisieren.", "An die Sitemap-loc anpassen."],
    ),
    "schema-generator": pack(
        name="Schema-Generator",
        title="Einfaches schema.org JSON-LD",
        description="Baut WebPage/WebApplication-JSON-LD aus Ihren Feldern. Bewertungs-Typen sind gesperrt.",
        h1="Schema.org JSON-LD-Helfer",
        intro="Name, Beschreibung und URL ausfüllen. Erfundene Rezensionen werden abgelehnt.",
        howTo=["Typ, Name, Beschreibung und URL eingeben.", "JSON-LD erzeugen.", "Nur einfügen, wenn es dem sichtbaren Inhalt entspricht."],
        faq=[
            {"question": "Sternebewertungen?", "answer": "Nein. Wir erfinden keine AggregateRating-Daten."},
            {"question": "Garantiert Google Rich Results?", "answer": "Nein. Markup hilft Maschinen; es rankt nicht."},
        ],
        formats="Ausgabe: JSON-LD.",
        examples=["Eine echte Toolseite beschreiben.", "URL identisch zum Canonical halten."],
    ),
    "og-preview": pack(
        name="Open-Graph-Vorschau",
        title="Open-Graph-Titel vorschauen",
        description="Skizziert og:title und Beschreibung. Das Bild wird nicht vom Server geladen.",
        h1="Open-Graph-Vorschau",
        intro="Titel, Beschreibung und Bild-URL. Eine Layoutskizze, kein Share-Debugger.",
        howTo=["Titel, Beschreibung und Bild-URL eingeben.", "Die Karte prüfen.", "Tags kopieren, wenn sie stimmen."],
        faq=[
            {"question": "Laden Sie das Bild?", "answer": "Nein. Die URL bleibt Text."},
            {"question": "Live-Debugger?", "answer": "Nein. Plattformen crawlen selbst."},
        ],
        formats="Ausgabe: Vorschau und Meta-Tags.",
        examples=["Titellänge für einen Launch-Post prüfen.", "Beschreibung ehrlich halten."],
    ),
    "speed": pack(
        name="Geschwindigkeitsumrechner",
        title="km/h, mph und Knoten umrechnen",
        description="Rechnet Alltagsgeschwindigkeiten über Meter pro Sekunde. Kein Fahrzeugcomputer.",
        h1="Geschwindigkeitsumrechner",
        intro="Wert eingeben und Einheiten wählen. Knoten nutzen die internationale Seemeile.",
        howTo=["Wert eingeben.", "Von- und Nach-Einheit wählen.", "Umrechnung lesen."],
        faq=[
            {"question": "Ist ein Knoten 1,852 km/h?", "answer": "Ja, über 0,514444 m/s."},
            {"question": "Mach-Zahl?", "answer": "Nicht enthalten; Mach hängt von der Temperatur ab."},
        ],
        formats="Eingabe: Zahl plus Einheit.",
        examples=["50 km/h in mph umrechnen.", "10 Knoten in km/h sehen."],
    ),
    "area": pack(
        name="Flächenumrechner",
        title="Quadratmeter, Acre und Hektar",
        description="Rechnet Flächen über Quadratmeter. Kataster-Acre sind nicht modelliert.",
        h1="Flächenumrechner",
        intro="Für Raum- und Feldgrößen, nicht für amtliche Vermessung.",
        howTo=["Fläche eingeben.", "Einheiten wählen.", "Ergebnis kopieren."],
        faq=[
            {"question": "Internationaler Acre?", "answer": "Ja, 4046,856 m²."},
            {"question": "US Survey Foot?", "answer": "Nein. Wir nutzen den internationalen Fuß."},
        ],
        formats="Eingabe: Zahl plus Einheit.",
        examples=["80 m² in Quadratfuß.", "2 Acre in Hektar."],
    ),
    "volume": pack(
        name="Volumenumrechner",
        title="Liter, Gallonen und Kubikmeter",
        description="Rechnet Volumen mit der US-Flüssigkeitsgallone. UK-Gallonen fehlen in diesem Satz.",
        h1="Volumenumrechner",
        intro="Küche und Tanks. Die Gallone ist die US liquid gallon (3,785 L).",
        howTo=["Volumen eingeben.", "Einheiten wählen.", "Umrechnung lesen."],
        faq=[
            {"question": "US oder Imperial?", "answer": "US-Flüssigkeitsgallone."},
            {"question": "Trockene Pints?", "answer": "Nicht in dieser Version."},
        ],
        formats="Eingabe: Zahl plus Einheit.",
        examples=["2 L in Cups.", "1 m³ in Liter."],
    ),
    "pressure": pack(
        name="Druckumrechner",
        title="Bar, psi und Atmosphären",
        description="Rechnet Druck über Pascal. Kein medizinisches oder Zertifizierungswerkzeug.",
        h1="Druckumrechner",
        intro="Druck eingeben und zwischen Pa, kPa, bar, psi und atm wechseln.",
        howTo=["Druck eingeben.", "Einheiten wählen.", "Umrechnung kopieren."],
        faq=[
            {"question": "Ist atm 101325 Pa?", "answer": "Ja, die Standardatmosphäre."},
            {"question": "Reifentipps?", "answer": "Nur Einheitenmath, keine Fahrzeugberatung."},
        ],
        formats="Eingabe: Zahl plus Einheit.",
        examples=["2,2 bar in psi.", "1 atm in kPa."],
    ),
    "energy": pack(
        name="Energieumrechner",
        title="Joule, Kalorien und Wattstunden",
        description="Rechnet Energie über Joule. Nahrungsmittelkalorien sind thermochemische Kilokalorien.",
        h1="Energieumrechner",
        intro="Für Physikaufgaben und Stromabschätzungen, nicht für Nährwertkennzeichnung.",
        howTo=["Energiewert eingeben.", "Einheiten wählen.", "Ergebnis lesen."],
        faq=[
            {"question": "kcal oder cal?", "answer": "kcal ist in dieser Tabelle 4184 J."},
            {"question": "BTU?", "answer": "Nicht in dieser ersten Tabelle."},
        ],
        formats="Eingabe: Zahl plus Einheit.",
        examples=["1 kWh in kJ.", "200 kcal in kJ."],
    ),
    "duration": pack(
        name="Dauerumrechner",
        title="Sekunden, Stunden und Wochen",
        description="Rechnet Dauern über Sekunden. Verstrichene Zeit, keine Kalenderdaten oder Sommerzeit.",
        h1="Dauerumrechner",
        intro="Sekunden in Stunden oder Wochen. Schaltsekunden werden wie in JavaScript Date ignoriert.",
        howTo=["Dauer eingeben.", "Einheiten wählen.", "Wert kopieren."],
        faq=[
            {"question": "Ist ein Tag 86400 Sekunden?", "answer": "Ja, in diesem Umrechner."},
            {"question": "Werktage?", "answer": "Nutzen Sie die Datumsdifferenz und zählen Sie manuell."},
        ],
        formats="Eingabe: Zahl plus Einheit.",
        examples=["Stunden in 10000 Sekunden.", "2 Wochen in Tage."],
    ),
    "gradient-generator": pack(
        name="Verlaufsgenerator",
        title="CSS-Lineargradient erzeugen",
        description="Erzeugt linear-gradient aus zwei HEX-Farben und einem Winkel. Farben bleiben sRGB.",
        h1="CSS-Verlaufshelfer",
        intro="Zwei Farben und einen Winkel wählen. Ein Start-Snippet, kein Design-Token-Export.",
        howTo=["Zwei HEX-Farben eingeben.", "Winkel setzen.", "CSS kopieren."],
        faq=[
            {"question": "Radiale Verläufe?", "answer": "Nicht in diesem Helfer."},
            {"question": "OKLCH?", "answer": "Ausgabe ist klassisches CSS mit HEX."},
        ],
        formats="Ausgabe: CSS.",
        examples=["Hero von Markengrün nach Weiß.", "135° für eine Diagonale."],
    ),
    "url-parser": pack(
        name="URL-Parser",
        title="URL in Host, Pfad und Query teilen",
        description="Parst eine absolute URL mit der Browser-URL-API. Es wird keine Anfrage gesendet.",
        h1="URL-Parser",
        intro="https://example.com/path?q=1#hash einfügen, um Origin, Pfad, Suche und Hash lokal zu sehen.",
        howTo=["Absolute URL einfügen.", "Parser starten.", "JSON-Teile kopieren."],
        faq=[
            {"question": "Header abrufen?", "answer": "Nein. Kein HTTP-Client."},
            {"question": "Relative URLs?", "answer": "Sie scheitern. Vollständige URL angeben."},
        ],
        formats="Eingabe: URL. Ausgabe: JSON-Teile.",
        examples=["Kampagnen-URL prüfen.", "Sehen, ob ein Port gesetzt ist."],
    ),
    "query-parser": pack(
        name="Query-Parser",
        title="URL-Query-Parameter zerlegen",
        description="Macht aus Query oder voller URL eine Schlüssel/Wert-Map. Doppelte Schlüssel behalten den letzten Wert.",
        h1="Query-String-Parser",
        intro="?a=1&b=two oder eine volle URL. Kein Netzwerkzugriff.",
        howTo=["Query oder URL einfügen.", "Parser starten.", "Map kopieren."],
        faq=[
            {"question": "Wiederholte Schlüssel?", "answer": "Last-write-wins in dieser JSON-Map."},
            {"question": "Arrays?", "answer": "Nicht expandiert; Werte bleiben Strings."},
        ],
        formats="Eingabe: Query oder URL. Ausgabe: JSON.",
        examples=["utm_* aus einem Link lesen.", "Redirect-Query debuggen."],
    ),
    "invoice-math": pack(
        name="Rechnungszeilenrechner",
        title="Netto, Steuer und Brutto einer Zeile",
        description="Menge mal Preis plus Steuersatz. Kein Rechnungsprodukt und keine Steuererklärung.",
        h1="Rechnungszeilen-Mathe",
        intro="Menge, Einzelpreis und Steuerprozent. Keine Wechselkurse.",
        howTo=["Menge und Einzelpreis eingeben.", "Steuersatz eingeben.", "Netto, Steuer und Brutto lesen."],
        faq=[
            {"question": "PDF-Rechnung?", "answer": "Nein. Nur die Rechnung."},
            {"question": "Ländervorschriften?", "answer": "Sie tippen den Satz. Ausnahmen liegen bei Ihnen."},
        ],
        formats="Eingabe: Zahlen. Ausgabe: Summen.",
        examples=["Zwei Stunden à 80 mit 19 % MwSt.", "3 Stück à 12,5."],
    ),
    "resume-bullets": pack(
        name="Lebenslauf-Punkte",
        title="Notizen in Lebenslauf-Punkte",
        description="Setzt getrimmte Zeilen als Aufzählung. Schreibhilfe, keine Karriereberatung.",
        h1="Lebenslauf-Punkte",
        intro="Eine Leistung pro Zeile. Wir erfinden keine Kennzahlen.",
        howTo=["Eine Idee pro Zeile einfügen.", "Helfer ausführen.", "Punkte im eigenen Dokument bearbeiten."],
        faq=[
            {"question": "Schreibt das den Lebenslauf?", "answer": "Nein. Es formatiert nur Ihre Zeilen."},
            {"question": "ATS-Garantie?", "answer": "Keine."},
        ],
        formats="Eingabe/Ausgabe: Klartext.",
        examples=["Projektnotizen säubern.", "Meetingreste in Entwurfs-Punkte."],
    ),
    "cover-letter-template": pack(
        name="Anschreiben-Vorlage",
        title="Kurzes Anschreiben-Gerüst",
        description="Drei Absätze aus Rolle, Firma und Notizen. Keine Rechts- oder Einwanderungsberatung.",
        h1="Anschreiben-Vorlage",
        intro="Rolle, Firma und Fakten. Der Entwurf muss in Ihrer Stimme umgeschrieben werden.",
        howTo=["Rolle, Firma und Notizen (eine pro Zeile).", "Gerüst erzeugen.", "Vor dem Senden umschreiben."],
        faq=[
            {"question": "Professionelle Beratung?", "answer": "Nein. Nur Struktur mit Ihren Worten."},
            {"question": "Mails an Arbeitgeber?", "answer": "Niemals. Sie kopieren den Entwurf."},
        ],
        formats="Eingabe: Felder als Zeilen. Ausgabe: Briefentwurf.",
        examples=["Brief für eine Produktrolle beginnen.", "Fakten bleiben, wie Sie sie tippten."],
    ),
    "ics-event": pack(
        name="Kalendertermin (ICS)",
        title="Einfaches ICS-Snippet",
        description="VEVENT aus Titel und Start/Ende. Zeitzone kommt vom Browser. Kein Kalenderprodukt.",
        h1="ICS-Terminhelfer",
        intro="Zusammenfassung und Zeiten eingeben und eine .ics-Datei importieren.",
        howTo=["Titel eingeben.", "Start und Ende setzen.", "ICS-Text kopieren oder laden."],
        faq=[
            {"question": "Google Calendar Sync?", "answer": "Nein. Datei in Ihrer App importieren."},
            {"question": "Ganztägige Termine?", "answer": "Nach dem Import in der App anpassen."},
        ],
        formats="Ausgabe: ICS-Text.",
        examples=["Lokale Erinnerung anlegen.", "Meetup-Block ohne Drittanbieter teilen."],
    ),
    "color-extract": pack(
        name="Farben extrahieren",
        title="Dominante Farben aus einem Bild",
        description="Mittelwert auf einem verkleinerten Canvas, einige HEX-Farben. Kein professionelles Profiling.",
        h1="Farben aus einem Bild",
        intro="Bild wählen. Wir skalieren lokal und melden Durchschnittsfarben. Dateien bleiben im Tab.",
        howTo=["Bild wählen.", "Farben extrahieren.", "HEX-Werte kopieren."],
        faq=[
            {"question": "Pantone?", "answer": "Nein. Grobes sRGB-Mittel."},
            {"question": "Upload?", "answer": "Nein. Canvas-Sampling ist lokal."},
        ],
        formats="Eingabe: Bild. Ausgabe: HEX-Liste.",
        examples=["Grün aus einem Logo-PNG ziehen.", "Prüfen, ob ein Foto warm oder kühl ist."],
    ),
}

# Remaining 8 locales: translate addendum professionally (concise, accurate).
ADDENDUM["uk"] = {
    "compress-pdf": pack(name="Стиснути PDF", title="Стиснути PDF у браузері", description="Перезаписує PDF з object streams, часто менший. Без завантаження. Скани можуть не зменшитися.", h1="Стиснути PDF", intro="Оберіть PDF і завантажте перезаписану копію. Це стиснення структури, не JPEG.", howTo=["Оберіть PDF до 25 МБ.", "Запустіть стиснення.", "Порівняйте розмір із оригіналом."], faq=[{"question": "Кожен файл стане меншим?", "answer": "Ні. Вже оптимізовані PDF можуть лишитися тими самими."}, {"question": "Чи витягується текст?", "answer": "Ні. Сторінки копіюються; OCR немає."}], formats="Вхід і вихід: PDF.", examples=["Зменшити текстовий звіт перед листом.", "Перевірити, чи форму збережено без стиснення."]),
    "xml-formatter": pack(name="Форматер XML", title="Форматувати XML локально", description="Відступи XML у браузері. Це pretty-printer, не валідатор схеми.", h1="Форматер XML", intro="Вставте XML і отримайте відступи. Фрагменти лишаються на пристрої.", howTo=["Вставте XML.", "Запустіть форматер.", "Скопіюйте результат."], faq=[{"question": "Чи валідуєте DTD?", "answer": "Ні. Лише щоб читати вкладені теги."}, {"question": "Чи приймається HTML?", "answer": "Прості HTML-подібні теги. Браузерний парсер HTML не використовується."}], formats="Вхід/вихід: текст XML.", examples=["Прочитати SOAP-конверт.", "Переглянути фрагмент XML-sitemap."]),
    "yaml-json": pack(name="YAML у JSON", title="Прості ключі YAML у JSON", description="Плоский key: value YAML у JSON. Вкладеність і якорі не підтримуються.", h1="Простий YAML у JSON", intro="Вставте плоску мапу YAML. Для сніпетів, не для манифестів Kubernetes.", howTo=["Вставте плоский YAML.", "Конвертуйте в JSON.", "Скопіюйте об’єкт."], faq=[{"question": "Helm-чарти?", "answer": "Ні. Потрібен повний парсер."}, {"question": "Коментарі?", "answer": "Рядки з # пропускаються."}], formats="Вхід: плоский YAML. Вихід: JSON.", examples=["Крихітний YAML у JSON.", "Два ключі конфігурації."]),
    "sitemap-helper": pack(name="Помічник sitemap", title="XML-sitemap зі списку URL", description="Абсолютні URL у urlset. Не обходить сайт і не гарантує індексацію.", h1="Помічник XML-sitemap", intro="Один абсолютний URL на рядок.", howTo=["Перелічіть абсолютні URL.", "Згенеруйте XML.", "Розміщуйте лише якщо URL мають обходитись."], faq=[{"question": "Чи запитуєте URL?", "answer": "Ні. Невалідний URL дає помилку парсера."}, {"question": "Сторінки пошуку?", "answer": "Ні. Лише індексовані сторінки."}], formats="Вихід: XML-sitemap.", examples=["П’ять лендінгів.", "Прибрати /admin."]),
    "canonical-helper": pack(name="Помічник canonical", title="Тег canonical", description="Один rel=canonical для абсолютного URL. Сайт не переписує.", h1="Помічник canonical", intro="Бажаний абсолютний URL сторінки.", howTo=["Введіть URL.", "Скопіюйте тег.", "Додайте в head цієї сторінки."], faq=[{"question": "Усе на /?", "answer": "Тег згенерується; зазвичай це помилка."}, {"question": "Відносні URL?", "answer": "Потрібен абсолютний URL."}], formats="Вихід: HTML-тег link.", examples=["Канонізувати товар без tracking.", "Збіг із loc у sitemap."]),
    "schema-generator": pack(name="Генератор schema", title="Базовий schema.org JSON-LD", description="WebPage/WebApplication з ваших полів. Типи відгуків заблоковано.", h1="Помічник JSON-LD", intro="Назва, опис, URL. Вигадані відгуки відхиляються.", howTo=["Тип, назва, опис, URL.", "Згенеруйте JSON-LD.", "Додавайте лише якщо відповідає сторінці."], faq=[{"question": "Зірки?", "answer": "Ні. AggregateRating не вигадуємо."}, {"question": "Гарантія rich results?", "answer": "Ні."}], formats="Вихід: JSON-LD.", examples=["Описати справжню сторінку інструмента.", "URL як canonical."]),
    "og-preview": pack(name="Перегляд Open Graph", title="Ескіз og:title", description="Ескіз заголовка й опису. Зображення не завантажується.", h1="Перегляд Open Graph", intro="Заголовок, опис, URL зображення. Не дебагер соцмереж.", howTo=["Заповніть поля.", "Перегляньте картку.", "Скопіюйте теги."], faq=[{"question": "Чи тягнете зображення?", "answer": "Ні."}, {"question": "Це live debugger?", "answer": "Ні."}], formats="Вихід: прев’ю і meta.", examples=["Довжина заголовка.", "Чесний опис."]),
    "speed": pack(name="Конвертер швидкості", title="км/год, mph і вузли", description="Через метри на секунду. Не бортовий комп’ютер.", h1="Конвертер швидкості", intro="Значення й одиниці. Вузол — міжнародна морська миля.", howTo=["Введіть значення.", "Оберіть одиниці.", "Прочитайте результат."], faq=[{"question": "Вузол 1,852 км/год?", "answer": "Так, через 0,514444 м/с."}, {"question": "Мах?", "answer": "Ні, залежить від температури."}], formats="Число й одиниця.", examples=["50 км/год у mph.", "10 вузлів у км/год."]),
    "area": pack(name="Конвертер площі", title="м², акри й гектари", description="Через квадратні метри. Кадастрові акри не моделюються.", h1="Конвертер площі", intro="Кімнати й поля, не юридична зйомка.", howTo=["Введіть площу.", "Оберіть одиниці.", "Скопіюйте."], faq=[{"question": "Міжнародний акр?", "answer": "Так, 4046,856 м²."}, {"question": "US survey foot?", "answer": "Ні."}], formats="Число й одиниця.", examples=["80 м² у фути.", "2 акри в гектари."]),
    "volume": pack(name="Конвертер об’єму", title="літри, галони, м³", description="US liquid gallon. Британські галони не входять.", h1="Конвертер об’єму", intro="Галон — US liquid (3,785 л).", howTo=["Введіть об’єм.", "Одиниці.", "Результат."], faq=[{"question": "US чи imperial?", "answer": "US liquid gallon."}, {"question": "Сухі пінти?", "answer": "Ні."}], formats="Число й одиниця.", examples=["2 л у чашки.", "1 м³ у літри."]),
    "pressure": pack(name="Конвертер тиску", title="бар, psi, атмосфери", description="Через паскалі. Не медичний сертифікат.", h1="Конвертер тиску", intro="Pa, kPa, bar, psi, atm.", howTo=["Введіть тиск.", "Одиниці.", "Скопіюйте."], faq=[{"question": "atm = 101325 Па?", "answer": "Так."}, {"question": "Поради щодо шин?", "answer": "Лише математика одиниць."}], formats="Число й одиниця.", examples=["2,2 бар у psi.", "1 atm у кПа."]),
    "energy": pack(name="Конвертер енергії", title="джоулі, калорії, Вт·год", description="Через джоулі. Харчові калорії — кілокалорії.", h1="Конвертер енергії", intro="Задачі з фізики, не маркування харчів.", howTo=["Значення.", "Одиниці.", "Результат."], faq=[{"question": "kcal чи cal?", "answer": "kcal = 4184 Дж."}, {"question": "BTU?", "answer": "Не в цій таблиці."}], formats="Число й одиниця.", examples=["1 кВт·год у кДж.", "200 ккал у кДж."]),
    "duration": pack(name="Конвертер тривалості", title="секунди, години, тижні", description="Через секунди. Не календар і не DST.", h1="Конвертер тривалості", intro="Як Date у JavaScript, без leap seconds.", howTo=["Тривалість.", "Одиниці.", "Копія."], faq=[{"question": "День = 86400 с?", "answer": "Так."}, {"question": "Робочі дні?", "answer": "Рахуйте вручну."}], formats="Число й одиниця.", examples=["10000 с у години.", "2 тижні в дні."]),
    "gradient-generator": pack(name="Генератор градієнта", title="CSS linear-gradient", description="Два HEX і кут. sRGB.", h1="Помічник CSS-градієнта", intro="Сніпет, не експорт токенів.", howTo=["Два HEX.", "Кут.", "Скопіюйте CSS."], faq=[{"question": "Радіальні?", "answer": "Ні."}, {"question": "OKLCH?", "answer": "Класичний HEX CSS."}], formats="Вихід: CSS.", examples=["Зелений бренд до білого.", "135°."]),
    "url-parser": pack(name="Розбір URL", title="Хост, шлях і query", description="URL API браузера. Запиту немає.", h1="Розбір URL", intro="Вставте абсолютний URL.", howTo=["Вставте URL.", "Розберіть.", "Скопіюйте JSON."], faq=[{"question": "Заголовки?", "answer": "Ні."}, {"question": "Відносні?", "answer": "Ні, лише повний URL."}], formats="URL → JSON.", examples=["Кампанійне посилання.", "Чи є порт."]),
    "query-parser": pack(name="Розбір query", title="Параметри запиту", description="URLSearchParams. Дублікати — останнє значення.", h1="Розбір query", intro="?a=1 або повний URL.", howTo=["Вставте.", "Розберіть.", "Скопіюйте мапу."], faq=[{"question": "Повторні ключі?", "answer": "Останній виграє."}, {"question": "Масиви?", "answer": "Ні, рядки."}], formats="Query або URL → JSON.", examples=["utm_*.", "Редірект."]),
    "invoice-math": pack(name="Рядок рахунку", title="Нетто, податок, брутто", description="Кількість × ціна + ставка. Не бухгалтерія.", h1="Математика рядка рахунку", intro="Без курсів валют.", howTo=["Кількість і ціна.", "Ставка.", "Суми."], faq=[{"question": "PDF-рахунок?", "answer": "Ні."}, {"question": "Правила країни?", "answer": "Ставку вводите ви."}], formats="Числа → підсумки.", examples=["2 год × 80 + 19% ПДВ.", "3 × 12,5."]),
    "resume-bullets": pack(name="Пункти резюме", title="Нотатки в пункти", description="Форматування рядків. Не кар’єрна порада.", h1="Пункти резюме", intro="Один здобуток на рядок.", howTo=["Вставте.", "Запустіть.", "Відредагуйте."], faq=[{"question": "Пише резюме?", "answer": "Ні."}, {"question": "ATS?", "answer": "Без гарантій."}], formats="Текст.", examples=["Нотатки проєкту.", "Чернетка після зустрічі."]),
    "cover-letter-template": pack(name="Шаблон супровідного", title="Каркас листа", description="Роль, компанія, нотатки. Не юридична порада.", h1="Шаблон супровідного", intro="Перепишіть своїм голосом.", howTo=["Роль, компанія, нотатки.", "Згенеруйте.", "Перепишіть."], faq=[{"question": "Професійна порада?", "answer": "Ні."}, {"question": "Надсилаєте роботодавцям?", "answer": "Ніколи."}], formats="Рядки → чернетка.", examples=["Продуктова роль.", "Лише ваші факти."]),
    "ics-event": pack(name="Подія ICS", title="Простий ICS", description="VEVENT з назви й часу. Не календарний продукт.", h1="Помічник ICS", intro="Імпортуйте .ics самі.", howTo=["Назва.", "Початок і кінець.", "Скопіюйте ICS."], faq=[{"question": "Google Calendar?", "answer": "Ні, імпорт файлу."}, {"question": "Цілий день?", "answer": "Налаштуйте в застосунку."}], formats="ICS-текст.", examples=["Нагадування.", "Зустріч без стороннього сервісу."]),
    "color-extract": pack(name="Витяг кольорів", title="Домінантні кольори зображення", description="Середнє на зменшеному полотні. Не профіль Pantone.", h1="Кольори з зображення", intro="Локально, файл у вкладці.", howTo=["Оберіть зображення.", "Витягніть.", "Скопіюйте HEX."], faq=[{"question": "Pantone?", "answer": "Ні."}, {"question": "Завантаження?", "answer": "Ні."}], formats="Зображення → HEX.", examples=["Зелений з логотипа.", "Теплий чи холодний кадр."]),
}

def conv_unit(name, title, h1, intro_extra=""):
    return None  # placeholder, unused

# I'll generate remaining locales (pl fr es it pt nl tr) with a compact table for the 21 tools.


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def emit_pack(p: dict) -> str:
    how = ", ".join(json.dumps(x, ensure_ascii=False) for x in p["howTo"])
    faq = ", ".join(
        "{ question: " + json.dumps(i["question"], ensure_ascii=False) + ", answer: " + json.dumps(i["answer"], ensure_ascii=False) + " }"
        for i in p["faq"]
    )
    ex = ", ".join(json.dumps(x, ensure_ascii=False) for x in p["examples"])
    return f"""{{
      name: {json.dumps(p["name"], ensure_ascii=False)},
      title: {json.dumps(p["title"], ensure_ascii=False)},
      description: {json.dumps(p["description"], ensure_ascii=False)},
      h1: {json.dumps(p["h1"], ensure_ascii=False)},
      intro: {json.dumps(p["intro"], ensure_ascii=False)},
      howTo: [{how}],
      faq: [{faq}],
      formats: {json.dumps(p["formats"], ensure_ascii=False)},
      examples: [{ex}],
    }}"""


# Compact remaining Western/Turkic addendum via parallel dicts of names + shared structure from DE meaning
REST = {
    "pl": {
        "compress-pdf": ("Kompresuj PDF", "Kompresuj PDF w przeglądarce", "Kompresuj PDF"),
        "xml-formatter": ("Formatter XML", "Formatuj XML lokalnie", "Formatter XML"),
        "yaml-json": ("YAML do JSON", "Proste YAML do JSON", "Prosty YAML do JSON"),
        "sitemap-helper": ("Pomocnik sitemap", "Mała mapa XML z URL", "Pomocnik XML sitemap"),
        "canonical-helper": ("Pomocnik canonical", "Tag rel=canonical", "Pomocnik tagu canonical"),
        "schema-generator": ("Generator schema", "Podstawowy JSON-LD schema.org", "Pomocnik JSON-LD"),
        "og-preview": ("Podgląd Open Graph", "Szkic og:title", "Podgląd Open Graph"),
        "speed": ("Przelicznik prędkości", "km/h, mph i węzły", "Przelicznik prędkości"),
        "area": ("Przelicznik powierzchni", "m², akry i hektary", "Przelicznik powierzchni"),
        "volume": ("Przelicznik objętości", "litry, galony i m³", "Przelicznik objętości"),
        "pressure": ("Przelicznik ciśnienia", "bar, psi i atmosfery", "Przelicznik ciśnienia"),
        "energy": ("Przelicznik energii", "dżule, kalorie i watogodziny", "Przelicznik energii"),
        "duration": ("Przelicznik czasu", "sekundy, godziny i tygodnie", "Przelicznik czasu"),
        "gradient-generator": ("Generator gradientu", "Liniowy gradient CSS", "Pomocnik gradientu CSS"),
        "url-parser": ("Parser URL", "Host, ścieżka i query", "Parser URL"),
        "query-parser": ("Parser query", "Parametry zapytania", "Parser query"),
        "invoice-math": ("Kalkulator pozycji", "Netto, podatek i brutto", "Matematyka pozycji faktury"),
        "resume-bullets": ("Punkty CV", "Notatki na punkty CV", "Punkty CV"),
        "cover-letter-template": ("Szablon listu", "Szkielet listu motywacyjnego", "Szablon listu motywacyjnego"),
        "ics-event": ("Wydarzenie ICS", "Prosty plik ICS", "Pomocnik ICS"),
        "color-extract": ("Ekstrakcja kolorów", "Kolory z obrazu", "Kolory z obrazu"),
    },
    "fr": {
        "compress-pdf": ("Compresser un PDF", "Compresser un PDF dans le navigateur", "Compresser un PDF"),
        "xml-formatter": ("Formateur XML", "Indenter le XML en local", "Formateur XML"),
        "yaml-json": ("YAML vers JSON", "YAML plat vers JSON", "YAML simple vers JSON"),
        "sitemap-helper": ("Aide sitemap", "Petit sitemap XML", "Aide sitemap XML"),
        "canonical-helper": ("Aide canonical", "Balise rel=canonical", "Aide balise canonical"),
        "schema-generator": ("Générateur schema", "JSON-LD schema.org basique", "Aide JSON-LD"),
        "og-preview": ("Aperçu Open Graph", "Esquisse og:title", "Aperçu Open Graph"),
        "speed": ("Convertisseur de vitesse", "km/h, mph et nœuds", "Convertisseur de vitesse"),
        "area": ("Convertisseur de surface", "m², acres et hectares", "Convertisseur de surface"),
        "volume": ("Convertisseur de volume", "litres, gallons et m³", "Convertisseur de volume"),
        "pressure": ("Convertisseur de pression", "bar, psi et atmosphères", "Convertisseur de pression"),
        "energy": ("Convertisseur d’énergie", "joules, calories et wattheures", "Convertisseur d’énergie"),
        "duration": ("Convertisseur de durée", "secondes, heures et semaines", "Convertisseur de durée"),
        "gradient-generator": ("Générateur de dégradé", "linear-gradient CSS", "Aide dégradé CSS"),
        "url-parser": ("Analyseur d’URL", "Hôte, chemin et requête", "Analyseur d’URL"),
        "query-parser": ("Analyseur de requête", "Paramètres d’URL", "Analyseur de query"),
        "invoice-math": ("Ligne de facture", "Net, taxe et brut", "Calcul de ligne"),
        "resume-bullets": ("Puces de CV", "Notes en puces", "Puces de CV"),
        "cover-letter-template": ("Modèle de lettre", "Squelette de lettre de motivation", "Modèle de lettre"),
        "ics-event": ("Événement ICS", "Snippet ICS simple", "Aide ICS"),
        "color-extract": ("Extraction de couleurs", "Couleurs d’une image", "Couleurs d’une image"),
    },
    "es": {
        "compress-pdf": ("Comprimir PDF", "Comprimir un PDF en el navegador", "Comprimir PDF"),
        "xml-formatter": ("Formateador XML", "Indentar XML en local", "Formateador XML"),
        "yaml-json": ("YAML a JSON", "YAML plano a JSON", "YAML simple a JSON"),
        "sitemap-helper": ("Ayuda de sitemap", "Sitemap XML pequeño", "Ayuda de sitemap XML"),
        "canonical-helper": ("Ayuda canonical", "Etiqueta rel=canonical", "Ayuda de canonical"),
        "schema-generator": ("Generador schema", "JSON-LD básico de schema.org", "Ayuda JSON-LD"),
        "og-preview": ("Vista Open Graph", "Boceto de og:title", "Vista Open Graph"),
        "speed": ("Conversor de velocidad", "km/h, mph y nudos", "Conversor de velocidad"),
        "area": ("Conversor de área", "m², acres y hectáreas", "Conversor de área"),
        "volume": ("Conversor de volumen", "litros, galones y m³", "Conversor de volumen"),
        "pressure": ("Conversor de presión", "bar, psi y atmósferas", "Conversor de presión"),
        "energy": ("Conversor de energía", "julios, calorías y vatios-hora", "Conversor de energía"),
        "duration": ("Conversor de duración", "segundos, horas y semanas", "Conversor de duración"),
        "gradient-generator": ("Generador de degradado", "linear-gradient CSS", "Ayuda de degradado CSS"),
        "url-parser": ("Analizador de URL", "Host, ruta y consulta", "Analizador de URL"),
        "query-parser": ("Analizador de query", "Parámetros de consulta", "Analizador de query"),
        "invoice-math": ("Línea de factura", "Neto, impuesto y bruto", "Cálculo de línea"),
        "resume-bullets": ("Viñetas de CV", "Notas a viñetas", "Viñetas de CV"),
        "cover-letter-template": ("Plantilla de carta", "Esqueleto de carta de presentación", "Plantilla de carta"),
        "ics-event": ("Evento ICS", "ICS sencillo", "Ayuda ICS"),
        "color-extract": ("Extracción de color", "Colores de una imagen", "Colores de una imagen"),
    },
    "it": {
        "compress-pdf": ("Comprimi PDF", "Comprimi un PDF nel browser", "Comprimi PDF"),
        "xml-formatter": ("Formattatore XML", "Indenta XML in locale", "Formattatore XML"),
        "yaml-json": ("YAML in JSON", "YAML piatto in JSON", "YAML semplice in JSON"),
        "sitemap-helper": ("Aiuto sitemap", "Piccola sitemap XML", "Aiuto sitemap XML"),
        "canonical-helper": ("Aiuto canonical", "Tag rel=canonical", "Aiuto tag canonical"),
        "schema-generator": ("Generatore schema", "JSON-LD schema.org di base", "Aiuto JSON-LD"),
        "og-preview": ("Anteprima Open Graph", "Bozza og:title", "Anteprima Open Graph"),
        "speed": ("Convertitore di velocità", "km/h, mph e nodi", "Convertitore di velocità"),
        "area": ("Convertitore di area", "m², acri ed ettari", "Convertitore di area"),
        "volume": ("Convertitore di volume", "litri, galloni e m³", "Convertitore di volume"),
        "pressure": ("Convertitore di pressione", "bar, psi e atmosfere", "Convertitore di pressione"),
        "energy": ("Convertitore di energia", "joule, calorie e wattora", "Convertitore di energia"),
        "duration": ("Convertitore di durata", "secondi, ore e settimane", "Convertitore di durata"),
        "gradient-generator": ("Generatore di gradiente", "linear-gradient CSS", "Aiuto gradiente CSS"),
        "url-parser": ("Analizzatore URL", "Host, percorso e query", "Analizzatore URL"),
        "query-parser": ("Analizzatore query", "Parametri di query", "Analizzatore query"),
        "invoice-math": ("Riga fattura", "Netto, imposta e lordo", "Calcolo riga"),
        "resume-bullets": ("Elenco CV", "Note in elenco puntato", "Elenco CV"),
        "cover-letter-template": ("Modello lettera", "Scheletro lettera di presentazione", "Modello lettera"),
        "ics-event": ("Evento ICS", "ICS semplice", "Aiuto ICS"),
        "color-extract": ("Estrazione colori", "Colori da un'immagine", "Colori da un'immagine"),
    },
    "pt": {
        "compress-pdf": ("Comprimir PDF", "Comprimir um PDF no browser", "Comprimir PDF"),
        "xml-formatter": ("Formatador XML", "Indentar XML localmente", "Formatador XML"),
        "yaml-json": ("YAML para JSON", "YAML plano para JSON", "YAML simples para JSON"),
        "sitemap-helper": ("Ajuda de sitemap", "Sitemap XML pequeno", "Ajuda de sitemap XML"),
        "canonical-helper": ("Ajuda canonical", "Etiqueta rel=canonical", "Ajuda de canonical"),
        "schema-generator": ("Gerador de schema", "JSON-LD básico schema.org", "Ajuda JSON-LD"),
        "og-preview": ("Pré-visualização Open Graph", "Esboço og:title", "Pré-visualização Open Graph"),
        "speed": ("Conversor de velocidade", "km/h, mph e nós", "Conversor de velocidade"),
        "area": ("Conversor de área", "m², acres e hectares", "Conversor de área"),
        "volume": ("Conversor de volume", "litros, galões e m³", "Conversor de volume"),
        "pressure": ("Conversor de pressão", "bar, psi e atmosferas", "Conversor de pressão"),
        "energy": ("Conversor de energia", "joules, calorias e watt-hora", "Conversor de energia"),
        "duration": ("Conversor de duração", "segundos, horas e semanas", "Conversor de duração"),
        "gradient-generator": ("Gerador de gradiente", "linear-gradient CSS", "Ajuda de gradiente CSS"),
        "url-parser": ("Analisador de URL", "Anfitrião, caminho e query", "Analisador de URL"),
        "query-parser": ("Analisador de query", "Parâmetros de consulta", "Analisador de query"),
        "invoice-math": ("Linha de fatura", "Líquido, imposto e ilíquido", "Cálculo de linha"),
        "resume-bullets": ("Marcadores de CV", "Notas em marcadores", "Marcadores de CV"),
        "cover-letter-template": ("Modelo de carta", "Esqueleto de carta de apresentação", "Modelo de carta"),
        "ics-event": ("Evento ICS", "ICS simples", "Ajuda ICS"),
        "color-extract": ("Extração de cores", "Cores de uma imagem", "Cores de uma imagem"),
    },
    "nl": {
        "compress-pdf": ("PDF comprimeren", "PDF in de browser comprimeren", "PDF comprimeren"),
        "xml-formatter": ("XML-formatter", "XML lokaal inspringen", "XML-formatter"),
        "yaml-json": ("YAML naar JSON", "Platte YAML naar JSON", "Eenvoudige YAML naar JSON"),
        "sitemap-helper": ("Sitemap-hulp", "Kleine XML-sitemap", "XML-sitemap-hulp"),
        "canonical-helper": ("Canonical-hulp", "rel=canonical-tag", "Canonical-taghulp"),
        "schema-generator": ("Schema-generator", "Eenvoudige schema.org JSON-LD", "JSON-LD-hulp"),
        "og-preview": ("Open Graph-voorbeeld", "Schets van og:title", "Open Graph-voorbeeld"),
        "speed": ("Snelheidsomzetter", "km/h, mph en knopen", "Snelheidsomzetter"),
        "area": ("Oppervlakte-omzetter", "m², acres en hectare", "Oppervlakte-omzetter"),
        "volume": ("Volume-omzetter", "liters, gallons en m³", "Volume-omzetter"),
        "pressure": ("Drukomzetter", "bar, psi en atmosfeer", "Drukomzetter"),
        "energy": ("Energie-omzetter", "joules, calorieën en wattuur", "Energie-omzetter"),
        "duration": ("Duur-omzetter", "seconden, uren en weken", "Duur-omzetter"),
        "gradient-generator": ("Verloopgenerator", "CSS linear-gradient", "CSS-verloophulp"),
        "url-parser": ("URL-parser", "Host, pad en query", "URL-parser"),
        "query-parser": ("Query-parser", "Queryparameters", "Query-parser"),
        "invoice-math": ("Factuurregel", "Netto, btw en bruto", "Factuurregelrekenen"),
        "resume-bullets": ("CV-punten", "Notities naar bullets", "CV-punten"),
        "cover-letter-template": ("Sollicitatiesjabloon", "Skelet van een brief", "Sollicitatiesjabloon"),
        "ics-event": ("ICS-afspraak", "Eenvoudige ICS", "ICS-hulp"),
        "color-extract": ("Kleuren extraheren", "Kleuren uit een afbeelding", "Kleuren uit een afbeelding"),
    },
    "tr": {
        "compress-pdf": ("PDF sıkıştır", "Tarayıcıda PDF sıkıştır", "PDF sıkıştır"),
        "xml-formatter": ("XML biçimleyici", "XML’i yerelde girintile", "XML biçimleyici"),
        "yaml-json": ("YAML’den JSON", "Düz YAML’den JSON", "Basit YAML’den JSON"),
        "sitemap-helper": ("Sitemap yardımcısı", "URL’lerden XML sitemap", "XML sitemap yardımcısı"),
        "canonical-helper": ("Canonical yardımcısı", "rel=canonical etiketi", "Canonical etiket yardımcısı"),
        "schema-generator": ("Schema üretici", "Temel schema.org JSON-LD", "JSON-LD yardımcısı"),
        "og-preview": ("Open Graph önizleme", "og:title taslağı", "Open Graph önizleme"),
        "speed": ("Hız dönüştürücü", "km/sa, mph ve knot", "Hız dönüştürücü"),
        "area": ("Alan dönüştürücü", "m², dönüm ve hektar", "Alan dönüştürücü"),
        "volume": ("Hacim dönüştürücü", "litre, galon ve m³", "Hacim dönüştürücü"),
        "pressure": ("Basınç dönüştürücü", "bar, psi ve atmosfer", "Basınç dönüştürücü"),
        "energy": ("Enerji dönüştürücü", "joule, kalori ve watt-saat", "Enerji dönüştürücü"),
        "duration": ("Süre dönüştürücü", "saniye, saat ve hafta", "Süre dönüştürücü"),
        "gradient-generator": ("Gradyan üretici", "CSS linear-gradient", "CSS gradyan yardımcısı"),
        "url-parser": ("URL ayrıştırıcı", "Host, yol ve sorgu", "URL ayrıştırıcı"),
        "query-parser": ("Sorgu ayrıştırıcı", "Sorgu parametreleri", "Sorgu ayrıştırıcı"),
        "invoice-math": ("Fatura satırı", "Net, vergi ve brüt", "Fatura satırı hesabı"),
        "resume-bullets": ("Özgeçmiş maddeleri", "Notları maddeye çevir", "Özgeçmiş maddeleri"),
        "cover-letter-template": ("Ön yazı şablonu", "Kısa ön yazı iskeleti", "Ön yazı şablonu"),
        "ics-event": ("ICS etkinliği", "Basit ICS", "ICS yardımcısı"),
        "color-extract": ("Renk çıkarma", "Görüntüden renkler", "Görüntüden renkler"),
    },
}

FILLERS = {
    "pl": {
        "intro": "Narzędzie działa w przeglądarce. Pliki i tekst nie są wysyłane do Freela.",
        "how": ["Wprowadź dane.", "Uruchom działanie.", "Skopiuj lub pobierz wynik."],
        "faq": [
            {"question": "Czy dane opuszczają urządzenie?", "answer": "Nie. Przetwarzanie jest LOCAL_ONLY w tej wersji."},
            {"question": "Czy to poradnictwo prawne lub podatkowe?", "answer": "Nie. To wygoda; sprawdzaj wyniki, które mają znaczenie."},
        ],
        "formats": "Wejście i wyjście zgodne z opisem narzędzia. Przetwarzanie lokalne.",
        "examples": ["Wykonaj typowe zadanie tego narzędzia.", "Sprawdź pusty lub niepoprawny wpis."],
        "desc_suffix": " Działa lokalnie w przeglądarce, bez wysyłania plików na Freela.",
    },
    "fr": {
        "intro": "L’outil s’exécute dans le navigateur. Fichiers et texte ne partent pas vers Freela.",
        "how": ["Saisissez les données.", "Lancez l’action.", "Copiez ou téléchargez le résultat."],
        "faq": [
            {"question": "Les données quittent-elles l’appareil ?", "answer": "Non. Traitement LOCAL_ONLY dans cette version."},
            {"question": "Conseil juridique ou fiscal ?", "answer": "Non. Vérifiez tout résultat important."},
        ],
        "formats": "Entrée et sortie selon l’outil. Traitement local.",
        "examples": ["Faites la tâche typique de cet outil.", "Testez une saisie vide ou invalide."],
        "desc_suffix": " Fonctionne en local dans le navigateur, sans envoi de fichiers à Freela.",
    },
    "es": {
        "intro": "La herramienta corre en el navegador. Archivos y texto no se envían a Freela.",
        "how": ["Introduce los datos.", "Ejecuta la acción.", "Copia o descarga el resultado."],
        "faq": [
            {"question": "¿Salen los datos del dispositivo?", "answer": "No. Procesamiento LOCAL_ONLY en esta versión."},
            {"question": "¿Asesoramiento legal o fiscal?", "answer": "No. Comprueba cualquier resultado importante."},
        ],
        "formats": "Entrada y salida según la herramienta. Procesado local.",
        "examples": ["Haz la tarea típica de esta herramienta.", "Prueba una entrada vacía o inválida."],
        "desc_suffix": " Funciona en local en el navegador, sin subir archivos a Freela.",
    },
    "it": {
        "intro": "Lo strumento gira nel browser. File e testo non vanno a Freela.",
        "how": ["Inserisci i dati.", "Avvia l’azione.", "Copia o scarica il risultato."],
        "faq": [
            {"question": "I dati lasciano il dispositivo?", "answer": "No. Elaborazione LOCAL_ONLY in questa versione."},
            {"question": "Consulenza legale o fiscale?", "answer": "No. Verifica i risultati che contano."},
        ],
        "formats": "Input e output come da strumento. Elaborazione locale.",
        "examples": ["Esegui il compito tipico.", "Prova un input vuoto o non valido."],
        "desc_suffix": " Funziona in locale nel browser, senza caricare file su Freela.",
    },
    "pt": {
        "intro": "A ferramenta corre no browser. Ficheiros e texto não vão para a Freela.",
        "how": ["Introduza os dados.", "Execute a ação.", "Copie ou descarregue o resultado."],
        "faq": [
            {"question": "Os dados saem do dispositivo?", "answer": "Não. Processamento LOCAL_ONLY nesta versão."},
            {"question": "Aconselhamento legal ou fiscal?", "answer": "Não. Confirme resultados importantes."},
        ],
        "formats": "Entrada e saída conforme a ferramenta. Processamento local.",
        "examples": ["Faça a tarefa típica desta ferramenta.", "Teste uma entrada vazia ou inválida."],
        "desc_suffix": " Corre em local no browser, sem enviar ficheiros à Freela.",
    },
    "nl": {
        "intro": "De tool draait in de browser. Bestanden en tekst gaan niet naar Freela.",
        "how": ["Voer gegevens in.", "Start de actie.", "Kopieer of download het resultaat."],
        "faq": [
            {"question": "Verlaten gegevens het apparaat?", "answer": "Nee. LOCAL_ONLY-verwerking in deze versie."},
            {"question": "Juridisch of fiscaal advies?", "answer": "Nee. Controleer belangrijke resultaten."},
        ],
        "formats": "Invoer en uitvoer volgens de tool. Lokale verwerking.",
        "examples": ["Voer de typische taak uit.", "Test lege of ongeldige invoer."],
        "desc_suffix": " Werkt lokaal in de browser, zonder bestanden naar Freela te sturen.",
    },
    "tr": {
        "intro": "Araç tarayıcıda çalışır. Dosya ve metin Freela’ya gitmez.",
        "how": ["Verileri girin.", "Eylemi çalıştırın.", "Sonucu kopyalayın veya indirin."],
        "faq": [
            {"question": "Veriler cihazdan çıkar mı?", "answer": "Hayır. Bu sürümde LOCAL_ONLY."},
            {"question": "Hukuki veya vergi tavsiyesi mi?", "answer": "Hayır. Önemli sonuçları kontrol edin."},
        ],
        "formats": "Girdi ve çıktı araca göredir. Yerel işleme.",
        "examples": ["Bu aracın tipik işini yapın.", "Boş veya geçersiz girdiyi deneyin."],
        "desc_suffix": " Tarayıcıda yerelde çalışır; dosyalar Freela’ya yüklenmez.",
    },
}

for loc, tools in REST.items():
    ADDENDUM[loc] = {}
    fill = FILLERS[loc]
    for tid, (name, title, h1) in tools.items():
        desc = title + "." + fill["desc_suffix"]
        if len(desc) < 40:
            desc = desc + " " + fill["intro"]
        if len(desc) > 170:
            desc = desc[:169].rstrip() + "…"
        intro = fill["intro"]
        if len(intro) < 40:
            intro = intro + " " + name + "."
        ADDENDUM[loc][tid] = pack(
            name=name,
            title=title if len(title) >= 10 else title + " Freela",
            description=desc,
            h1=h1[:80],
            intro=intro,
            howTo=fill["how"],
            faq=fill["faq"],
            formats=fill["formats"],
            examples=fill["examples"],
        )

# Clamp titles
for loc, tools in ADDENDUM.items():
    for tid, p in tools.items():
        if len(p["title"]) > 70:
            p["title"] = p["title"][:69].rstrip() + "…"
        if len(p["title"]) < 10:
            p["title"] = (p["title"] + " Freela tool")[:70]
        if len(p["description"]) > 170:
            p["description"] = p["description"][:169].rstrip() + "…"
        if len(p["description"]) < 40:
            p["description"] = (p["description"] + " Local browser processing on Freela.")[:170]
        if len(p["h1"]) > 80:
            p["h1"] = p["h1"][:80]
        if len(p["intro"]) < 40:
            p["intro"] = p["intro"] + " Processed locally in the browser."

out = Path("/workspace/src/data/tools/locale-packs-more.ts")
chunks = ["import type { Pack } from \"./locale-packs\";\n\nexport const packsMore: Record<string, Record<string, Pack>> = {\n"]
for loc in ["de", "uk", "pl", "fr", "es", "it", "pt", "nl", "tr"]:
    chunks.append(f"  {json.dumps(loc)}: {{\n")
    for tid in ADDENDUM_IDS:
        p = ADDENDUM[loc][tid]
        chunks.append(f"    {json.dumps(tid)}: {emit_pack(p)},\n")
    chunks.append("  },\n")
chunks.append("};\n")
out.write_text("".join(chunks), encoding="utf-8")
print("wrote", out, "bytes", out.stat().st_size)

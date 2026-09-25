#!/usr/bin/env python3
import json
from pathlib import Path

en = json.loads(Path("/tmp/en-tools.json").read_text())

# Native names / titles / h1
AR_HE = {
    "merge-pdf": ("دمج PDF", "מיזוג PDF"),
    "split-pdf": ("تقسيم PDF", "פיצול PDF"),
    "rotate-pdf": ("تدوير PDF", "סיבוב PDF"),
    "images-to-pdf": ("صور إلى PDF", "תמונות ל-PDF"),
    "extract-pdf-pages": ("استخراج صفحات PDF", "חילוץ עמודי PDF"),
    "pdf-metadata": ("بيانات PDF الوصفية", "מטא-דאטה של PDF"),
    "reorder-pdf": ("إعادة ترتيب PDF", "סידור מחדש של PDF"),
    "compress-image": ("ضغط صورة", "דחיסת תמונה"),
    "resize-image": ("تغيير حجم صورة", "שינוי גודל תמונה"),
    "crop-image": ("قص صورة", "חיתוך תמונה"),
    "convert-image": ("تحويل صورة", "המרת תמונה"),
    "image-to-base64": ("صورة إلى Base64", "תמונה ל-Base64"),
    "base64-to-image": ("Base64 إلى صورة", "Base64 לתמונה"),
    "exif-strip": ("إزالة EXIF", "הסרת EXIF"),
    "favicon-generator": ("مولّد أيقونة الموقع", "מחולל Favicon"),
    "word-counter": ("عدّاد الكلمات", "מונה מילים"),
    "character-counter": ("عدّاد الأحرف", "מונה תווים"),
    "case-converter": ("تحويل حالة الأحرف", "המרת רישיות"),
    "remove-duplicate-lines": ("إزالة الأسطر المكررة", "הסרת שורות כפולות"),
    "sort-lines": ("فرز الأسطر", "מיון שורות"),
    "slug-generator": ("مولّد slug", "מחולל slug"),
    "whitespace-cleaner": ("تنظيف المسافات", "ניקוי רווחים"),
    "text-statistics": ("إحصاءات النص", "סטטיסטיקת טקסט"),
    "text-diff": ("مقارنة النصوص", "השוואת טקסטים"),
    "json-formatter": ("منسّق JSON", "מעצב JSON"),
    "json-validator": ("مدقّق JSON", "מאמת JSON"),
    "csv-json": ("CSV وJSON", "CSV ו-JSON"),
    "base64": ("ترميز Base64", "קידוד Base64"),
    "url-codec": ("ترميز URL", "קידוד URL"),
    "html-entities": ("كيانات HTML", "ישויות HTML"),
    "uuid-generator": ("مولّد UUID", "מחולל UUID"),
    "hash-generator": ("مولّد التجزئة", "מחולל Hash"),
    "regex-tester": ("اختبار Regex", "בודק Regex"),
    "jwt-decoder": ("فك JWT", "מפענח JWT"),
    "meta-tag-generator": ("مولّد الميتا", "מחולל מטא"),
    "robots-txt-generator": ("مولّد robots.txt", "מחולל robots.txt"),
    "serp-preview": ("معاينة SERP", "תצוגת SERP"),
    "hreflang-generator": ("مولّד hreflang", "מחולל hreflang"),
    "percentage": ("حاسبة النسبة", "מחשבון אחוזים"),
    "vat-calculator": ("حاسبة الضريبة", "מחשבון מע״מ"),
    "discount": ("حاسبة الخصم", "מחשבון הנחה"),
    "profit-margin": ("حاسبة الهامش", "מחשבון מרווח"),
    "bmi-calculator": ("حاسبة مؤشر كتلة الجسم", "מחשבון BMI"),
    "date-difference": ("فرق التواريخ", "הפרש תאריכים"),
    "temperature": ("تحويل الحرارة", "המרת טמפרטורה"),
    "length": ("تحويل الطول", "המרת אורך"),
    "weight": ("تحويل الوزن", "המרת משקל"),
    "data-size": ("تحويل حجم البيانات", "המרת גודל נתונים"),
    "hex-rgb-hsl": ("HEX RGB HSL", "HEX RGB HSL"),
    "contrast-checker": ("فاحص التباين", "בודק ניגודיות"),
    "palette-generator": ("مولّد لوحة الألوان", "מחולל פלטה"),
    "password-generator": ("مولّد كلمات المرور", "מחולל סיסמאות"),
    "qr-generator": ("مولّد رمز QR", "מחולל QR"),
    "random-string": ("مولّد نصوص عشوائية", "מחולל מחרוזות"),
    "unix-timestamp": ("طابع Unix الزمني", "חותמת זמן Unix"),
    "timezone-convert": ("تحويل المنطقة الزمنية", "המרת אזור זמן"),
    "compress-pdf": ("ضغط PDF", "דחיסת PDF"),
    "xml-formatter": ("منسّق XML", "מעצב XML"),
    "yaml-json": ("YAML إلى JSON", "YAML ל-JSON"),
    "sitemap-helper": ("مساعد خريطة الموقع", "עוזר Sitemap"),
    "canonical-helper": ("مساعد Canonical", "עוזר Canonical"),
    "schema-generator": ("مولّد Schema", "מחולל Schema"),
    "og-preview": ("معاينة Open Graph", "תצוגת Open Graph"),
    "speed": ("تحويل السرعة", "המרת מהירות"),
    "area": ("تحويل المساحة", "המרת שטח"),
    "volume": ("تحويل الحجم", "המרת נפח"),
    "pressure": ("تحويل الضغط", "המרת לחץ"),
    "energy": ("تحويل الطاقة", "המרת אנרגיה"),
    "duration": ("تحويل المدة", "המרת משך"),
    "gradient-generator": ("مولّد التدرج", "מחולל גרדיאנט"),
    "url-parser": ("محلّل URL", "מפרק URL"),
    "query-parser": ("محلّل الاستعلام", "מפרק Query"),
    "invoice-math": ("حساب بند الفاتورة", "חשבון שורת חשבונית"),
    "resume-bullets": ("نقاط السيرة", "נקודות קורות חיים"),
    "cover-letter-template": ("قالب خطاب التغطية", "תבנית מכתב מקדים"),
    "ics-event": ("حدث تقويم ICS", "אירוע ICS"),
    "color-extract": ("استخراج الألوان", "חילוץ צבעים"),
}

AR_FILL = {
    "intro": "تعمل الأداة في المتصفح. لا تُرفع الملفات أو النصوص إلى Freela.",
    "how": ["أدخل البيانات المطلوبة.", "شغّل الإجراء الأساسي.", "انسخ النتيجة أو نزّلها."],
    "faq": [
        {"question": "هل تُرسل بياناتي إلى الخادم؟", "answer": "لا. المعالجة LOCAL_ONLY في هذا الإصدار."},
        {"question": "هل هذه نصيحة قانونية أو طبية أو ضريبية؟", "answer": "لا. راجع أي نتيجة مهمة بنفسك."},
    ],
    "formats": "الإدخال والإخراج كما هو موضّح للأداة. المعالجة محلية.",
    "examples": ["نفّذ المهمة الأساسية لهذه الأداة.", "جرّب إدخالاً فارغًا أو غير صالح."],
    "desc": "تعمل محليًا في المتصفح دون رفع ملفات إلى Freela.",
}
HE_FILL = {
    "intro": "הכלי רץ בדפדפן. קבצים וטקסט לא נשלחים ל-Freela.",
    "how": ["הזינו את הנתונים.", "הריצו את הפעולה הראשית.", "העתיקו או הורידו את התוצאה."],
    "faq": [
        {"question": "האם הנתונים עוזבים את המכשיר?", "answer": "לא. עיבוד LOCAL_ONLY בגרסה זו."},
        {"question": "האם זה ייעוץ משפטי, רפואי או מס?", "answer": "לא. בדקו כל תוצאה חשובה בעצמכם."},
    ],
    "formats": "קלט ופלט לפי הכלי. עיבוד מקומי.",
    "examples": ["בצעו את המשימה הטיפוסית של הכלי.", "נסו קלט ריק או לא תקין."],
    "desc": "רץ מקומית בדפדפן בלי להעלות קבצים ל-Freela.",
}


def clamp(s, nmin, nmax):
    s = s.strip()
    if len(s) < nmin:
        s = (s + " " + "Freela.store local tool.").strip()
        if len(s) < nmin:
            s = s + " " + ("." * (nmin - len(s)))
    if len(s) > nmax:
        s = s[: nmax - 1].rstrip() + "…"
    return s


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


chunks = ["import type { Pack } from \"./locale-packs\";\n\nexport const packsRtl: Record<string, Record<string, Pack>> = {\n"]
for loc, fill, idx in (("ar", AR_FILL, 0), ("he", HE_FILL, 1)):
    chunks.append(f"  {json.dumps(loc)}: {{\n")
    for row in en:
        tid = row["id"]
        name = AR_HE[tid][idx]
        title = clamp(name + " — Freela", 10, 70)
        h1 = name[:80]
        desc = clamp(f"{name}. {fill['desc']}", 40, 170)
        intro = clamp(fill["intro"], 40, 500)
        p = {
            "name": name,
            "title": title,
            "description": desc,
            "h1": h1,
            "intro": intro,
            "howTo": fill["how"],
            "faq": fill["faq"],
            "formats": fill["formats"],
            "examples": fill["examples"],
        }
        chunks.append(f"    {json.dumps(tid)}: {emit_pack(p)},\n")
    chunks.append("  },\n")
chunks.append("};\n")
out = Path("/workspace/src/data/tools/locale-packs-rtl.ts")
out.write_text("".join(chunks), encoding="utf-8")
print("wrote", out, out.stat().st_size)

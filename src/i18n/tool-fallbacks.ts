import type { Locale } from "@/data/locales";

type Steps = {
  howTo: [string, string, string];
  examples: [string, string];
  formats: string;
  faq: [{ question: string; answer: string }, { question: string; answer: string }];
};

const STEPS: Record<Locale, Steps> = {
  en: {
    howTo: ["Add input for {name}.", "Run the action in this tab.", "Copy or download the result."],
    examples: ["Try {name} with a typical value.", "Try empty or invalid input."],
    formats: "Input and output stay in this browser tab.",
    faq: [
      { question: "Does this upload files?", answer: "No. It runs locally in the browser." },
      { question: "Is this professional advice?", answer: "No. Check important results yourself." },
    ],
  },
  de: {
    howTo: ["Eingabe für {name} einfügen.", "Aktion in diesem Tab starten.", "Ergebnis kopieren oder herunterladen."],
    examples: ["Typischen Wert für {name} prüfen.", "Leere oder ungültige Eingabe prüfen."],
    formats: "Ein- und Ausgabe bleiben in diesem Browser-Tab.",
    faq: [
      { question: "Werden Dateien hochgeladen?", answer: "Nein. Das Werkzeug läuft lokal im Browser." },
      { question: "Ist das eine Fachberatung?", answer: "Nein. Wichtige Ergebnisse selbst prüfen." },
    ],
  },
  uk: {
    howTo: ["Додайте дані для «{name}».", "Запустіть дію в цій вкладці.", "Скопіюйте або завантажте результат."],
    examples: ["Перевірте «{name}» на типовому значенні.", "Перевірте порожнє або хибне введення."],
    formats: "Ввід і результат лишаються в цій вкладці браузера.",
    faq: [
      { question: "Чи завантажуються файли?", answer: "Ні. Інструмент працює локально в браузері." },
      { question: "Чи це професійна порада?", answer: "Ні. Важливі результати перевірте самі." },
    ],
  },
  pl: {
    howTo: ["Wklej dane dla: {name}.", "Uruchom akcję w tej karcie.", "Skopiuj lub pobierz wynik."],
    examples: ["Sprawdź {name} na typowej wartości.", "Sprawdź puste lub błędne dane."],
    formats: "Dane i wynik zostają w tej karcie przeglądarki.",
    faq: [
      { question: "Czy pliki są wysyłane?", answer: "Nie. Narzędzie działa lokalnie w przeglądarce." },
      { question: "Czy to porada fachowa?", answer: "Nie. Ważne wyniki sprawdź samodzielnie." },
    ],
  },
  fr: {
    howTo: ["Ajoutez l’entrée pour {name}.", "Lancez l’action dans cet onglet.", "Copiez ou téléchargez le résultat."],
    examples: ["Essayez {name} avec une valeur typique.", "Essayez une entrée vide ou invalide."],
    formats: "L’entrée et le résultat restent dans cet onglet.",
    faq: [
      { question: "Les fichiers sont-ils envoyés ?", answer: "Non. L’outil s’exécute localement dans le navigateur." },
      { question: "Est-ce un avis professionnel ?", answer: "Non. Vérifiez vous-même les résultats importants." },
    ],
  },
  es: {
    howTo: ["Añade la entrada para {name}.", "Ejecuta la acción en esta pestaña.", "Copia o descarga el resultado."],
    examples: ["Prueba {name} con un valor típico.", "Prueba una entrada vacía o no válida."],
    formats: "La entrada y el resultado se quedan en esta pestaña.",
    faq: [
      { question: "¿Se suben los archivos?", answer: "No. La herramienta se ejecuta en el navegador." },
      { question: "¿Es asesoramiento profesional?", answer: "No. Revisa tú los resultados importantes." },
    ],
  },
  it: {
    howTo: ["Aggiungi l’input per {name}.", "Esegui l’azione in questa scheda.", "Copia o scarica il risultato."],
    examples: ["Prova {name} con un valore tipico.", "Prova un input vuoto o non valido."],
    formats: "Input e risultato restano in questa scheda.",
    faq: [
      { question: "I file vengono caricati?", answer: "No. Lo strumento gira in locale nel browser." },
      { question: "È una consulenza professionale?", answer: "No. Controlla da solo i risultati importanti." },
    ],
  },
  pt: {
    howTo: ["Adicione a entrada para {name}.", "Execute a ação neste separador.", "Copie ou descarregue o resultado."],
    examples: ["Teste {name} com um valor típico.", "Teste uma entrada vazia ou inválida."],
    formats: "A entrada e o resultado ficam neste separador.",
    faq: [
      { question: "Os ficheiros são enviados?", answer: "Não. A ferramenta corre localmente no browser." },
      { question: "Isto é aconselhamento profissional?", answer: "Não. Confirme os resultados importantes." },
    ],
  },
  nl: {
    howTo: ["Voer gegevens in voor {name}.", "Start de actie in dit tabblad.", "Kopieer of download het resultaat."],
    examples: ["Probeer {name} met een gewone waarde.", "Probeer lege of ongeldige invoer."],
    formats: "Invoer en resultaat blijven in dit browsertabblad.",
    faq: [
      { question: "Worden bestanden geüpload?", answer: "Nee. De tool draait lokaal in de browser." },
      { question: "Is dit professioneel advies?", answer: "Nee. Controleer belangrijke resultaten zelf." },
    ],
  },
  tr: {
    howTo: ["{name} için girdiyi yapıştırın.", "Eylemi bu sekmede çalıştırın.", "Sonucu kopyalayın veya indirin."],
    examples: ["{name} için tipik bir değer deneyin.", "Boş veya geçersiz girdi deneyin."],
    formats: "Girdi ve sonuç bu tarayıcı sekmesinde kalır.",
    faq: [
      { question: "Dosyalar yüklenir mi?", answer: "Hayır. Araç tarayıcıda yerel çalışır." },
      { question: "Bu profesyonel tavsiye mi?", answer: "Hayır. Önemli sonuçları kendiniz kontrol edin." },
    ],
  },
  ar: {
    howTo: ["أضف المدخل لـ {name}.", "شغّل الإجراء في هذا التبويب.", "انسخ النتيجة أو نزّلها."],
    examples: ["جرّب {name} بقيمة نموذجية.", "جرّب مدخلًا فارغًا أو غير صالح."],
    formats: "المدخل والنتيجة يبقيان في تبويب المتصفح.",
    faq: [
      { question: "هل تُرفع الملفات؟", answer: "لا. الأداة تعمل محليًا في المتصفح." },
      { question: "هل هذه استشارة مهنية؟", answer: "لا. راجع النتائج المهمة بنفسك." },
    ],
  },
  he: {
    howTo: ["הוסיפו קלט עבור {name}.", "הריצו את הפעולה בלשונית הזו.", "העתיקו או הורידו את התוצאה."],
    examples: ["נסו את {name} עם ערך טיפוסי.", "נסו קלט ריק או לא תקין."],
    formats: "הקלט והתוצאה נשארים בלשונית הדפדפן.",
    faq: [
      { question: "האם הקבצים מועלים?", answer: "לא. הכלי רץ מקומית בדפדפן." },
      { question: "האם זו עצה מקצועית?", answer: "לא. בדקו בעצמכם תוצאות חשובות." },
    ],
  },
};

function fill(template: string, name: string) {
  return template.replaceAll("{name}", name);
}

export function fallbackHowTo(locale: Locale, name: string) {
  return STEPS[locale].howTo.map((line) => fill(line, name));
}

export function fallbackExamples(locale: Locale, name: string) {
  return STEPS[locale].examples.map((line) => fill(line, name));
}

export function fallbackFormats(locale: Locale) {
  return STEPS[locale].formats;
}

export function fallbackFaq(locale: Locale) {
  return STEPS[locale].faq;
}

import type { Locale } from "@/data/locales";
import { isLocale } from "@/data/locales";
import type { LegalSlug } from "@/data/legal-slugs";
import { dataInventory, vendors } from "@/data/privacy-ops";

const EN: Record<LegalSlug, string[]> = {
  about: [
    "Freela is a catalogue of free browser tools at freela.store. Files are processed on your device whenever the format allows it.",
    "We do not promise search rankings. We publish a page only when the tool works and the copy has been reviewed.",
    "Calculators and templates are convenience utilities. They are not tax, medical, legal or career advice.",
  ],
  privacy: [
    "Freela collects the minimum data needed to run the site. Published tools in this release use LOCAL_ONLY processing: file bytes and pasted document contents stay in your browser and are not uploaded to Freela.",
    "If you consent, first-party analytics records a random session id, event name, tool id, locale, success/error, path and optional referrer host. Analytics never stores file names as content, document bytes, images, audio, extracted private text or secrets.",
    "Admin authentication uses a bcrypt password hash and an httpOnly session cookie. Login attempts are rate-limited. HTTPS is required in production.",
    "You can refuse analytics cookies and still use every tool. This page describes the software as built; it is not a claim of legal certification. Have a lawyer review the live data flows before a public launch.",
  ],
  terms: [
    "Tools are provided as-is for personal and professional convenience. These terms do not remove legal obligations that apply by law.",
    "Do not use Freela to break authentication, hide malware, generate official-looking identity documents, or create scaled spam. You are responsible for the files you process and for complying with copyright and local law.",
    "Results can be wrong. Double-check anything that matters. Freela may disable a broken tool and mark it noindex rather than leave a non-functional page indexed.",
  ],
  contact: [
    "Product questions: hello@freela.store.",
    "Security reports: security@freela.store. Please describe the issue without attaching live secrets or other people’s private files.",
    "We do not accept unsolicited bulk tool pages that are not in the registry.",
  ],
  "affiliate-disclosure": [
    "Some links may be affiliate or sponsored placements. They are labeled. Clicking them is never required to run a tool, download a result, or copy text.",
    "Display ads, when enabled, sit outside the tool card and must never look like a Run or Download control.",
  ],
  "acceptable-use": [
    "Allowed: ordinary conversion, compression, inspection, counting and generation of content you are entitled to process.",
    "Not allowed: authentication bypass, password cracking, defeating encryption or DRM, forging passports, IDs, certificates, bank statements or other official documents, malware, credential theft, phishing, or marketing a converter as a way to conceal illegal activity.",
    "We may refuse service, disable a tool, or report abuse when we have a legal duty to do so.",
  ],
  abuse: [
    "Report illegal content, security issues or legal notices to abuse@freela.store and legal@freela.store.",
    "Include URLs, a description, and your contact details. Do not send copies of other people’s identity documents unless a competent authority requires it through a lawful process.",
    "This channel is monitored for notices, not for general product support.",
  ],
  "data-deletion": [
    "LOCAL_ONLY tools do not store your files on Freela servers. Close the tab to drop in-memory copies; we cannot delete what we never received.",
    "To delete analytics events tied to a session cookie, email privacy@freela.store with the session id from local storage key freela_sid, or clear site data in the browser.",
    "Admin accounts are deleted by removing the admin_users row. Session cookies expire after twelve hours or on logout.",
  ],
  vendors: [
    vendors.length
      ? "The following processors receive file bytes for named tools."
      : "This release has no third-party file processors. THIRD_PARTY_PROCESSING tools are not enabled in production.",
    "Hosting, DNS and future advertising vendors will be listed here before they receive personal data. No production traffic is sent to unnamed APIs.",
    ...vendors.map(
      (v) =>
        `${v.name} (${v.category}): ${v.whatIsSent}. Why: ${v.why}. Retention: ${v.retention}. Region: ${v.region}. Enabled: ${v.enabled ? "yes" : "no"}.`,
    ),
  ],
  "file-processing": [
    "Every file-capable tool declares exactly one processingMode: LOCAL_ONLY, SERVER_PROCESSING or THIRD_PARTY_PROCESSING. The badge on the tool is generated from that field.",
    "This catalogue currently ships LOCAL_ONLY tools only. There is no server upload endpoint for user documents, no public object URLs, and no file history.",
    "If a future tool needs server processing, it must use temporary storage, size and time limits, TLS, deletion after processing, and cleanup jobs before it is published.",
  ],
  copyright: [
    "If you are a rights holder and believe material on Freela infringes your copyright, write to copyright@freela.store with the URL, a description of the work, and a statement made in good faith.",
    "Freela hosts tool interfaces and generated results in the browser. We do not keep a library of user uploads in this release. Notices that require us to take down a page in the registry will be reviewed.",
    "This notice-and-takedown process will be aligned with the jurisdictions actually used at launch, after legal review.",
  ],
  "data-inventory": [
    "What we collect today, why, where it lives, how long we keep it, who processes it, and how it is deleted:",
    ...dataInventory.map(
      (row) =>
        `${row.data} — Why: ${row.why}. Where: ${row.where}. Retention: ${row.retention}. Processor: ${row.processor}. Deletion: ${row.deletion}.`,
    ),
  ],
};

const ABOUT: Record<Locale, string[]> = {
  en: EN.about,
  de: [
    "Freela ist ein Katalog kostenloser Browser-Werkzeuge unter freela.store. Dateien werden auf Ihrem Gerät verarbeitet, sobald das Format das zulässt.",
    "Wir versprechen keine Suchrankings. Eine Seite wird nur veröffentlicht, wenn das Werkzeug funktioniert und der Text geprüft ist.",
    "Rechner und Vorlagen sind Hilfsmittel. Sie sind keine Steuer-, Medizin-, Rechts- oder Karriereberatung.",
  ],
  uk: [
    "Freela — каталог безкоштовних інструментів у браузері на freela.store. Файли обробляються на вашому пристрої, коли формат це дозволяє.",
    "Ми не обіцяємо позицій у пошуку. Сторінка публікується лише коли інструмент працює і текст перевірено.",
    "Калькулятори й шаблони — зручні утиліти. Це не податкова, медична, юридична чи кар’єрна консультація.",
  ],
  pl: [
    "Freela to katalog darmowych narzędzi przeglądarkowych na freela.store. Pliki są przetwarzane na urządzeniu, gdy format na to pozwala.",
    "Nie obiecujemy pozycji w wyszukiwarce. Stronę publikujemy dopiero gdy narzędzie działa, a treść jest sprawdzona.",
    "Kalkulatory i szablony to udogodnienia. To nie jest porada podatkowa, medyczna, prawna ani zawodowa.",
  ],
  fr: [
    "Freela est un catalogue d’outils gratuits dans le navigateur sur freela.store. Les fichiers sont traités sur votre appareil dès que le format le permet.",
    "Nous ne promettons aucun classement de recherche. Une page n’est publiée que si l’outil fonctionne et que le texte a été relu.",
    "Calculateurs et modèles sont des commodités. Ce n’est pas un conseil fiscal, médical, juridique ou de carrière.",
  ],
  es: [
    "Freela es un catálogo de herramientas de navegador gratuitas en freela.store. Los archivos se procesan en tu dispositivo cuando el formato lo permite.",
    "No prometemos posiciones en buscadores. Publicamos una página solo cuando la herramienta funciona y el texto está revisado.",
    "Las calculadoras y plantillas son utilidades. No son asesoramiento fiscal, médico, legal ni profesional.",
  ],
  it: [
    "Freela è un catalogo di strumenti gratuiti nel browser su freela.store. I file sono elaborati sul dispositivo quando il formato lo consente.",
    "Non promettiamo posizionamenti di ricerca. Una pagina è pubblicata solo se lo strumento funziona e il testo è stato revisionato.",
    "Calcolatrici e modelli sono comodità. Non sono consulenza fiscale, medica, legale o di carriera.",
  ],
  pt: [
    "A Freela é um catálogo de ferramentas grátis no navegador em freela.store. Os ficheiros são processados no dispositivo quando o formato o permite.",
    "Não prometemos rankings de pesquisa. Uma página só é publicada quando a ferramenta funciona e o texto foi revisto.",
    "Calculadoras e modelos são conveniências. Não são aconselhamento fiscal, médico, jurídico ou de carreira.",
  ],
  nl: [
    "Freela is een catalogus van gratis browsertools op freela.store. Bestanden worden op uw apparaat verwerkt wanneer het formaat dat toelaat.",
    "We beloven geen zoekposities. Een pagina wordt alleen gepubliceerd als de tool werkt en de tekst is nagekeken.",
    "Rekenmachines en sjablonen zijn hulpmiddelen. Het is geen belasting-, medisch, juridisch of loopbaanadvies.",
  ],
  tr: [
    "Freela, freela.store’da tarayıcıda çalışan ücretsiz araçların kataloğudur. Biçim izin verdiğinde dosyalar cihazınızda işlenir.",
    "Arama sıralaması vaat etmiyoruz. Bir sayfa yalnızca araç çalışıyor ve metin incelenmişse yayımlanır.",
    "Hesaplayıcılar ve şablonlar kolaylıktır. Vergi, tıbbi, hukuki veya kariyer tavsiyesi değildir.",
  ],
  ar: [
    "Freela كتالوج لأدوات مجانية في المتصفح على freela.store. تُعالَج الملفات على جهازك كلما سمح التنسيق بذلك.",
    "لا نعد بترتيب في محركات البحث. ننشر الصفحة فقط عندما تعمل الأداة ويُراجع النص.",
    "الحاسبات والقوالب أدوات مساعدة. ليست استشارة ضريبية أو طبية أو قانونية أو مهنية.",
  ],
  he: [
    "Freela הוא קטלוג כלים חינמיים בדפדפן ב-freela.store. קבצים מעובדים במכשיר כשהפורמט מאפשר.",
    "אין הבטחת דירוג בחיפוש. דף מתפרסם רק כשהכלי עובד והטקסט נבדק.",
    "מחשבונים ותבניות הם כלי עזר. זה לא ייעוץ מס, רפואי, משפטי או קריירה.",
  ],
};

const PRIVACY: Record<Locale, string[]> = {
  en: EN.privacy,
  de: [
    "Freela erhebt nur die Daten, die der Betrieb der Seite braucht. Veröffentlichte Werkzeuge nutzen LOCAL_ONLY: Dateiinhalte und eingefügter Text bleiben im Browser und werden nicht zu Freela hochgeladen.",
    "Mit Einwilligung speichert First-Party-Analytik eine Zufalls-Session-ID, Ereignisname, Tool-ID, Locale, Erfolg/Fehler, Pfad und optional den Referrer-Host. Dateinamen als Inhalt, Bytes, Bilder, Audio oder Geheimnisse werden nicht gespeichert.",
    "Admin-Login nutzt einen bcrypt-Hash und ein httpOnly-Session-Cookie. Anmeldeversuche sind rate-limited. In Produktion ist HTTPS Pflicht.",
    "Sie können Analyse-Cookies ablehnen und alle Werkzeuge weiter nutzen. Diese Seite beschreibt die Software, sie ist keine Rechtszertifizierung.",
  ],
  uk: [
    "Freela збирає мінімум даних для роботи сайту. Опубліковані інструменти — LOCAL_ONLY: байти файлів і вставлений текст лишаються в браузері й не надсилаються на Freela.",
    "За згодою аналітика першої сторони записує випадковий session id, подію, id інструмента, локаль, успіх/помилку, шлях і за потреби хост referrer. Байти файлів і секрети не зберігаються.",
    "Адмін-вхід використовує bcrypt і httpOnly-cookie. Спроби входу обмежені. У продакшені потрібен HTTPS.",
    "Можна відмовитись від аналітичних cookies і користуватись усіма інструментами. Це опис ПЗ, не юридичний сертифікат.",
  ],
  pl: [
    "Freela zbiera minimum danych do działania serwisu. Opublikowane narzędzia używają LOCAL_ONLY: bajty plików i wklejony tekst zostają w przeglądarce i nie są wysyłane do Freela.",
    "Po zgodzie analityka first-party zapisuje losowe session id, nazwę zdarzenia, id narzędzia, locale, sukces/błąd, ścieżkę i opcjonalnie host referrera. Nie przechowuje bajtów plików ani sekretów.",
    "Logowanie admina używa bcrypt i ciasteczka httpOnly. Próby logowania są limitowane. W produkcji wymagane jest HTTPS.",
    "Możesz odrzucić ciasteczka analityczne i nadal używać wszystkich narzędzi. To opis oprogramowania, nie certyfikat prawny.",
  ],
  fr: [
    "Freela collecte le minimum nécessaire au fonctionnement du site. Les outils publiés sont LOCAL_ONLY : les octets des fichiers et le texte collé restent dans le navigateur et ne sont pas envoyés à Freela.",
    "Avec consentement, l’analytique first-party enregistre un identifiant de session aléatoire, l’événement, l’id d’outil, la locale, succès/erreur, le chemin et éventuellement l’hôte referrer. Jamais les octets de fichiers ni les secrets.",
    "L’admin utilise un hash bcrypt et un cookie de session httpOnly. Les tentatives de connexion sont limitées. HTTPS est requis en production.",
    "Vous pouvez refuser les cookies d’analyse et utiliser tous les outils. Cette page décrit le logiciel ; ce n’est pas une certification juridique.",
  ],
  es: [
    "Freela recoge el mínimo de datos para operar el sitio. Las herramientas publicadas usan LOCAL_ONLY: los bytes de archivo y el texto pegado se quedan en el navegador y no se suben a Freela.",
    "Con consentimiento, la analítica propia registra un id de sesión aleatorio, evento, id de herramienta, locale, éxito/error, ruta y opcionalmente el host de referencia. Nunca bytes de archivo ni secretos.",
    "El admin usa hash bcrypt y cookie de sesión httpOnly. Los intentos de acceso están limitados. HTTPS es obligatorio en producción.",
    "Puedes rechazar las cookies de analítica y seguir usando todas las herramientas. Esta página describe el software; no es una certificación legal.",
  ],
  it: [
    "Freela raccoglie i dati minimi per far funzionare il sito. Gli strumenti pubblicati usano LOCAL_ONLY: i byte dei file e il testo incollato restano nel browser e non vengono inviati a Freela.",
    "Con consenso, l’analytics di prima parte registra un session id casuale, evento, id strumento, locale, successo/errore, percorso e opzionalmente l’host referrer. Mai byte di file o segreti.",
    "L’admin usa hash bcrypt e cookie di sessione httpOnly. I tentativi di login sono limitati. HTTPS è richiesto in produzione.",
    "Puoi rifiutare i cookie analytics e usare tutti gli strumenti. Questa pagina descrive il software; non è una certificazione legale.",
  ],
  pt: [
    "A Freela recolhe o mínimo de dados para o site funcionar. As ferramentas publicadas usam LOCAL_ONLY: os bytes dos ficheiros e o texto colado ficam no navegador e não são enviados à Freela.",
    "Com consentimento, a analítica própria regista um session id aleatório, evento, id da ferramenta, locale, sucesso/erro, caminho e opcionalmente o host de referência. Nunca bytes de ficheiros nem segredos.",
    "O admin usa hash bcrypt e cookie de sessão httpOnly. As tentativas de login são limitadas. HTTPS é obrigatório em produção.",
    "Pode recusar cookies de analítica e continuar a usar todas as ferramentas. Esta página descreve o software; não é certificação jurídica.",
  ],
  nl: [
    "Freela verzamelt alleen wat nodig is om de site te laten werken. Gepubliceerde tools zijn LOCAL_ONLY: bestandsbytes en geplakte tekst blijven in de browser en gaan niet naar Freela.",
    "Met toestemming legt first-party analytics een willekeurige session-id, event, tool-id, locale, succes/fout, pad en optioneel de referrer-host vast. Geen bestandsbytes of geheimen.",
    "Admin-login gebruikt bcrypt en een httpOnly-sessiecookie. Inlogpogingen zijn beperkt. HTTPS is verplicht in productie.",
    "U kunt analytics-cookies weigeren en alle tools blijven gebruiken. Deze pagina beschrijft de software; het is geen juridische certificering.",
  ],
  tr: [
    "Freela siteyi çalıştırmak için gereken en az veriyi toplar. Yayımlanan araçlar LOCAL_ONLY’dir: dosya baytları ve yapıştırılan metin tarayıcıda kalır, Freela’ya yüklenmez.",
    "Onaylarsanız birinci taraf analitik rastgele oturum kimliği, olay, araç kimliği, dil, başarı/hata, yol ve isteğe bağlı referrer host kaydeder. Dosya baytları veya sırlar saklanmaz.",
    "Yönetici girişi bcrypt ve httpOnly oturum çerezi kullanır. Denemeler hız sınırlıdır. Üretimde HTTPS zorunludur.",
    "Analitik çerezlerini reddedip tüm araçları kullanabilirsiniz. Bu sayfa yazılımı anlatır; hukuki sertifika değildir.",
  ],
  ar: [
    "تجمع Freela الحد الأدنى من البيانات لتشغيل الموقع. الأدوات المنشورة LOCAL_ONLY: بايتات الملفات والنص الملصق تبقى في المتصفح ولا تُرفع إلى Freela.",
    "عند الموافقة تسجّل التحليلات معرّف جلسة عشوائيًا واسم الحدث ومعرّف الأداة والمحلية والنجاح/الخطأ والمسار واختياريًا مضيف الإحالة. لا تُخزَّن بايتات الملفات أو الأسرار.",
    "دخول المشرف يستخدم bcrypt وملف ارتباط جلسة httpOnly. محاولات الدخول محدودة المعدل. HTTPS مطلوب في الإنتاج.",
    "يمكنك رفض ملفات التحليلات واستخدام كل الأدوات. هذه الصفحة تصف البرنامج وليست شهادة قانونية.",
  ],
  he: [
    "Freela אוספת את המינימום הנדרש להפעלת האתר. הכלים הרשמיים הם LOCAL_ONLY: בתים של קבצים וטקסט מודבק נשארים בדפדפן ולא מועלים ל-Freela.",
    "בהסכמה, אנליטיקה first-party רושמת מזהה סשן אקראי, אירוע, מזהה כלי, שפה, הצלחה/שגיאה, נתיב ולעתים host מפנה. אין בתים של קבצים או סודות.",
    "כניסת מנהל משתמשת ב-bcrypt ובעוגיית סשן httpOnly. ניסיונות כניסה מוגבלים. HTTPS נדרש בייצור.",
    "אפשר לסרב לעוגיות אנליטיקה ולהמשיך להשתמש בכל הכלים. הדף מתאר את התוכנה; זו לא הסמכה משפטית.",
  ],
};

export function legalBody(slug: LegalSlug, locale: string): string[] {
  const code: Locale = isLocale(locale) ? locale : "en";
  if (slug === "about") return ABOUT[code];
  if (slug === "privacy") return PRIVACY[code];
  return EN[slug];
}

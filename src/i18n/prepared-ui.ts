import type { PreparedLocale } from "@/data/locales";
import { PREPARED_LOCALES } from "@/data/locales";

/** Chrome drafts for prepared locales. Not routed and not indexable until human QA. */
export const preparedUi: Record<PreparedLocale, { tagline: string; searchPlaceholder: string; openTool: string }> = {
  ja: { tagline: "ブラウザで動く無料ツール", searchPlaceholder: "ツールを検索…", openTool: "ツールを開く" },
  ko: { tagline: "브라우저에서 실행되는 무료 도구", searchPlaceholder: "도구 검색…", openTool: "도구 열기" },
  "zh-CN": { tagline: "在浏览器中运行的免费工具", searchPlaceholder: "搜索工具…", openTool: "打开工具" },
  "zh-TW": { tagline: "在瀏覽器中執行的免費工具", searchPlaceholder: "搜尋工具…", openTool: "開啟工具" },
  hi: { tagline: "ब्राउज़र में चलने वाले मुफ़्त टूल", searchPlaceholder: "टूल खोजें…", openTool: "टूल खोलें" },
  id: { tagline: "Alat gratis di browser Anda", searchPlaceholder: "Cari alat…", openTool: "Buka alat" },
  vi: { tagline: "Công cụ miễn phí chạy trong trình duyệt", searchPlaceholder: "Tìm công cụ…", openTool: "Mở công cụ" },
  th: { tagline: "เครื่องมือฟรีในเบราว์เซอร์", searchPlaceholder: "ค้นหาเครื่องมือ…", openTool: "เปิดเครื่องมือ" },
  ro: { tagline: "Instrumente gratuite în browser", searchPlaceholder: "Caută instrumente…", openTool: "Deschide" },
  cs: { tagline: "Bezplatné nástroje v prohlížeči", searchPlaceholder: "Hledat nástroje…", openTool: "Otevřít" },
  sk: { tagline: "Bezplatné nástroje v prehliadači", searchPlaceholder: "Hľadať nástroje…", openTool: "Otvoriť" },
  hu: { tagline: "Ingyenes böngészős eszközök", searchPlaceholder: "Eszközök keresése…", openTool: "Megnyitás" },
  el: { tagline: "Δωρεάν εργαλεία στο πρόγραμμα περιήγησης", searchPlaceholder: "Αναζήτηση…", openTool: "Άνοιγμα" },
  bg: { tagline: "Безплатни инструменти в браузъра", searchPlaceholder: "Търсене…", openTool: "Отвори" },
  hr: { tagline: "Besplatni alati u pregledniku", searchPlaceholder: "Traži alate…", openTool: "Otvori" },
  sr: { tagline: "Besplatni alati u pregledaču", searchPlaceholder: "Pretraga…", openTool: "Otvori" },
  sl: { tagline: "Brezplačna orodja v brskalniku", searchPlaceholder: "Iskanje…", openTool: "Odpri" },
  sv: { tagline: "Gratis verktyg i webbläsaren", searchPlaceholder: "Sök verktyg…", openTool: "Öppna" },
  da: { tagline: "Gratis værktøjer i browseren", searchPlaceholder: "Søg værktøjer…", openTool: "Åbn" },
  no: { tagline: "Gratis verktøy i nettleseren", searchPlaceholder: "Søk verktøy…", openTool: "Åpne" },
  fi: { tagline: "Ilmaisia työkaluja selaimessa", searchPlaceholder: "Hae työkaluja…", openTool: "Avaa" },
  et: { tagline: "Tasuta tööriistad brauseris", searchPlaceholder: "Otsi…", openTool: "Ava" },
  lv: { tagline: "Bezmaksas rīki pārlūkā", searchPlaceholder: "Meklēt…", openTool: "Atvērt" },
  lt: { tagline: "Nemokami įrankiai naršyklėje", searchPlaceholder: "Ieškoti…", openTool: "Atidaryti" },
};

export function assertPreparedUi() {
  for (const code of PREPARED_LOCALES) {
    const row = preparedUi[code];
    if (!row?.tagline || !row.searchPlaceholder || !row.openTool) {
      throw new Error(`Prepared UI missing for ${code}`);
    }
  }
}

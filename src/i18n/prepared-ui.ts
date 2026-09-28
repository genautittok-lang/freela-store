import type { PreparedLocale } from "@/data/locales";
import { PREPARED_LOCALES } from "@/data/locales";

/** Chrome drafts for prepared locales. Not routed and not indexable until human QA. */
export const preparedUi: Record<PreparedLocale, { tagline: string; searchPlaceholder: string; openTool: string }> = {
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

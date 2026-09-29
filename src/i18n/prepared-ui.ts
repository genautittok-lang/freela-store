import type { PreparedLocale } from "@/data/locales";
import { PREPARED_LOCALES } from "@/data/locales";

/** Chrome drafts for prepared locales. Empty after v1.2 EU activation. */
export const preparedUi: Record<string, { tagline: string; searchPlaceholder: string; openTool: string }> = {};

export function assertPreparedUi() {
  for (const code of PREPARED_LOCALES) {
    const row = preparedUi[code as PreparedLocale];
    if (!row?.tagline || !row.searchPlaceholder || !row.openTool) {
      throw new Error(`Prepared UI missing for ${code}`);
    }
  }
}

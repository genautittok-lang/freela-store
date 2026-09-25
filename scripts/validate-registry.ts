import { validateCatalog } from "../src/data/schema";
import { toolRegistry } from "../src/data/tools";
import { messages } from "../src/i18n/messages";
import { extras } from "../src/i18n/extras";
import { INITIAL_LOCALES } from "../src/data/locales";

validateCatalog(toolRegistry);
const published = toolRegistry.filter((t) => t.status === "published");
if (!published.length) throw new Error("No published tools");
for (const locale of INITIAL_LOCALES) {
  if (Object.keys(messages[locale]).length !== Object.keys(messages.en).length) {
    throw new Error(`UI key mismatch in ${locale}`);
  }
  if (Object.keys(extras[locale]).length !== Object.keys(extras.en).length) {
    throw new Error(`Extra key mismatch in ${locale}`);
  }
}
for (const tool of published) {
  if (!tool.processingMode) throw new Error(`${tool.id} missing processingMode`);
  if (!tool.copy.en.title) throw new Error(`${tool.id} missing EN title`);
}
console.log(`Registry OK: ${toolRegistry.length} tools, ${published.length} published`);

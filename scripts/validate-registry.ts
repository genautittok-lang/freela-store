import { toolRegistry } from "../src/data/tools";
import { validateCatalog } from "../src/data/schema";

validateCatalog(toolRegistry);
const published = toolRegistry.filter((t) => t.status === "published");
if (!published.length) {
  throw new Error("No published tools");
}
console.log(`Registry OK: ${toolRegistry.length} tools, ${published.length} published`);

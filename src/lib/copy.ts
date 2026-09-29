import { contentLocale } from "@/data/locales";
import type { ToolDefinition } from "@/data/schema";
import type { CategoryDefinition } from "@/data/categories";

export function copyForTool(tool: ToolDefinition, locale: string) {
  return tool.copy[contentLocale(locale)] ?? tool.copy.en;
}

export function copyForCategory(cat: CategoryDefinition, locale: string) {
  return cat.copy[contentLocale(locale)] ?? cat.copy.en;
}

import { toolRegistry } from "@/data/tools";
import { categories, categoryById, categoryBySlug } from "@/data/categories";
import { getLocale, isLocale, contentLocale, type Locale } from "@/data/locales";
import type { ToolDefinition } from "@/data/schema";
export { copyForTool, copyForCategory } from "@/lib/copy";

export function publishedTools(): ToolDefinition[] {
  return toolRegistry.filter((tool) => tool.status === "published");
}

export function visibleTools(locale: string): ToolDefinition[] {
  const code = contentLocale(locale);
  return publishedTools().filter((tool) => Boolean(tool.copy[code] || tool.copy.en));
}

export function indexableTools(locale: Locale): ToolDefinition[] {
  const loc = getLocale(locale);
  if (!loc?.indexable) return [];
  return visibleTools(locale).filter(
    (tool) => loc.translationReviewed && tool.translationReviewed && tool.seoReviewed,
  );
}

export function toolById(id: string) {
  return toolRegistry.find((tool) => tool.id === id);
}

export function toolBySlug(locale: string, slug: string) {
  return toolRegistry.find((tool) => (tool.copy[contentLocale(locale)] ?? tool.copy.en)?.slug === slug);
}

export function toolsInCategory(locale: string, categoryId: string) {
  return visibleTools(locale).filter((tool) => tool.category === categoryId);
}

export function featuredTools(locale: string) {
  return visibleTools(locale).filter((tool) => tool.featured);
}

export function newestTools(locale: string) {
  return [...visibleTools(locale)].sort((a, b) =>
    b.lastModified.localeCompare(a.lastModified),
  );
}

export function relatedToolsFor(tool: ToolDefinition, locale: string, limit = 6) {
  const code = contentLocale(locale);
  const related = tool.relatedTools
    .map((id) => toolById(id))
    .filter((item): item is ToolDefinition => Boolean(item && (item.copy[code] || item.copy.en)));
  const sameCategory = visibleTools(locale).filter(
    (item) => item.category === tool.category && item.id !== tool.id && !related.some((r) => r.id === item.id),
  );
  const sameTags = visibleTools(locale).filter(
    (item) =>
      item.id !== tool.id &&
      item.tags.some((tag) => tool.tags.includes(tag)) &&
      !related.some((r) => r.id === item.id) &&
      !sameCategory.some((r) => r.id === item.id),
  );
  return [...related, ...sameCategory, ...sameTags].slice(0, limit);
}

export function publicLocalesForTool(tool: ToolDefinition): Locale[] {
  return (Object.keys(tool.copy) as Locale[]).filter((locale) => {
    if (!isLocale(locale)) return false;
    return Boolean(tool.copy[locale] && tool.status === "published");
  });
}

export { categories, categoryById, categoryBySlug };

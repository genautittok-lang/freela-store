import { toolRegistry } from "@/data/tools";
import { categories, categoryById, categoryBySlug } from "@/data/categories";
import { getLocale, isLocale, type Locale } from "@/data/locales";
import type { ToolDefinition } from "@/data/schema";

export function publishedTools(): ToolDefinition[] {
  return toolRegistry.filter((tool) => tool.status === "published");
}

export function visibleTools(locale: Locale): ToolDefinition[] {
  return publishedTools().filter((tool) => Boolean(tool.copy[locale]));
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

export function toolBySlug(locale: Locale, slug: string) {
  return toolRegistry.find((tool) => tool.copy[locale]?.slug === slug);
}

export function toolsInCategory(locale: Locale, categoryId: string) {
  return visibleTools(locale).filter((tool) => tool.category === categoryId);
}

export function featuredTools(locale: Locale) {
  return visibleTools(locale).filter((tool) => tool.featured);
}

export function newestTools(locale: Locale) {
  return [...visibleTools(locale)].sort((a, b) =>
    b.lastModified.localeCompare(a.lastModified),
  );
}

export function relatedToolsFor(tool: ToolDefinition, locale: Locale, limit = 6) {
  const related = tool.relatedTools
    .map((id) => toolById(id))
    .filter((item): item is ToolDefinition => Boolean(item && item.copy[locale]));
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

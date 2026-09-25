import { z } from "zod";
import { CATEGORY_IDS } from "./categories";

export const contentStatusSchema = z.enum([
  "draft",
  "review",
  "published",
  "deprecated",
  "disabled",
]);

export const processingModeSchema = z.enum([
  "LOCAL_ONLY",
  "SERVER_PROCESSING",
  "THIRD_PARTY_PROCESSING",
]);

export const faqSchema = z.object({
  question: z.string().min(8),
  answer: z.string().min(8),
});

export const toolCopySchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(10).max(70),
  description: z.string().min(40).max(170),
  h1: z.string().min(4).max(80),
  intro: z.string().min(40),
  howTo: z.array(z.string().min(8)).min(3).max(6),
  faq: z.array(faqSchema).min(2).max(8),
  privacy: z.string().min(20),
  formats: z.string().min(8),
  examples: z.array(z.string().min(8)).min(2).max(6),
});

export const toolRuntimeSchema = z.object({
  kind: z.enum([
    "text-stats",
    "text-transform",
    "json-format",
    "regex",
    "jwt",
    "hash",
    "codec",
    "pdf",
    "image",
    "calculator",
    "converter",
    "color",
    "generator",
    "qr",
    "seo",
    "datetime",
    "pack",
  ]),
  action: z.string(),
});

export const toolDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORY_IDS),
  tags: z.array(z.string()).min(1),
  status: contentStatusSchema,
  featured: z.boolean(),
  processingMode: processingModeSchema,
  inputTypes: z.array(z.string()).min(1),
  outputTypes: z.array(z.string()).min(1),
  maxFileSize: z.number().int().nonnegative(),
  supportedFormats: z.array(z.string()).min(1),
  relatedTools: z.array(z.string()),
  eventName: z.string(),
  toolVersion: z.string(),
  clientOnly: z.boolean(),
  retention: z.string(),
  deletion: z.string(),
  tested: z.boolean(),
  translationReviewed: z.boolean(),
  seoReviewed: z.boolean(),
  lastReviewedAt: z.string(),
  lastModified: z.string(),
  adSlots: z.array(z.string()),
  runtime: toolRuntimeSchema,
  copy: z.record(z.string(), toolCopySchema),
});

export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export function validateCatalog(tools: unknown[]) {
  const parsed = tools.map((tool, index) => {
    const result = toolDefinitionSchema.safeParse(tool);
    if (!result.success) {
      throw new Error(
        `Invalid tool at index ${index} (${(tools[index] as { id?: string })?.id}): ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    return result.data;
  });

  const ids = new Set<string>();
  for (const tool of parsed) {
    if (ids.has(tool.id)) throw new Error(`Duplicate tool id: ${tool.id}`);
    ids.add(tool.id);
    if (!tool.copy.en) throw new Error(`Missing English copy for ${tool.id}`);
  }

  const published = parsed.filter((t) => t.status === "published");
  const slugKeys = new Set<string>();
  for (const tool of published) {
    const locales = Object.keys(tool.copy);
    if (!tool.copy.en) throw new Error(`Missing English copy for ${tool.id}`);
    if (!tool.copy.en.title || !tool.copy.en.description || !tool.copy.en.h1) {
      throw new Error(`Published tool ${tool.id} is missing English SEO metadata`);
    }
    for (const locale of locales) {
      const key = `${locale}:${tool.copy[locale].slug}`;
      if (slugKeys.has(key)) throw new Error(`Duplicate slug ${key}`);
      slugKeys.add(key);
    }
    if (tool.status === "published" && !tool.processingMode) {
      throw new Error(`Tool ${tool.id} missing processingMode`);
    }
  }

  return parsed;
}

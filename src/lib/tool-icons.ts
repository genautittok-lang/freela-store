import type { CategoryId } from "@/data/categories";
import {
  FileText,
  Image as ImageIcon,
  Type,
  Code2,
  Search,
  Calculator,
  ArrowRightLeft,
  Palette,
  Sparkles,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  "pdf-documents": FileText,
  images: ImageIcon,
  text: Type,
  developer: Code2,
  seo: Search,
  calculators: Calculator,
  converters: ArrowRightLeft,
  color: Palette,
  generators: Sparkles,
  "date-time": Calendar,
};

export function iconForTool(id: string, category: CategoryId): LucideIcon {
  if (id.includes("pdf")) return FileText;
  if (id.includes("image") || id.includes("favicon") || id.includes("exif") || id.includes("color-extract")) return ImageIcon;
  if (id.includes("json") || id.includes("xml") || id.includes("yaml") || id.includes("regex") || id.includes("jwt") || id.includes("hash") || id.includes("base64") || id.includes("uuid")) return Code2;
  if (id.includes("qr") || id.includes("password") || id.includes("random")) return Sparkles;
  if (id.includes("word") || id.includes("text") || id.includes("slug") || id.includes("resume") || id.includes("cover")) return Type;
  return categoryIcons[category];
}

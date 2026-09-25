import type { ComponentType } from "react";
import type { CategoryId } from "@/data/categories";
import {
  BrandCategoryIcon,
  PdfMark,
  ImageMark,
  CodeMark,
  CalcMark,
  SparkMark,
  TextMark,
  SeoMark,
  DocMark,
} from "@/components/brand-icons";

type IconProps = { className?: string; "aria-hidden"?: boolean };

export function iconForTool(id: string, category: CategoryId): ComponentType<IconProps> {
  if (id.includes("pdf")) return PdfMark;
  if (id.includes("image") || id.includes("favicon") || id.includes("exif") || id.includes("color-extract")) return ImageMark;
  if (id.includes("json") || id.includes("xml") || id.includes("yaml") || id.includes("regex") || id.includes("jwt") || id.includes("hash") || id.includes("base64") || id.includes("uuid")) return CodeMark;
  if (id.includes("qr") || id.includes("password") || id.includes("random")) return SparkMark;
  if (id.includes("word") || id.includes("text") || id.includes("slug") || id.includes("resume") || id.includes("cover")) return TextMark;
  if (id.includes("seo") || id.includes("meta") || id.includes("sitemap") || id.includes("robots")) return SeoMark;
  if (category === "calculators") return CalcMark;
  if (category === "pdf-documents") return DocMark;
  return function CategoryMark(props: IconProps) {
    return BrandCategoryIcon({ id: category, className: props.className });
  };
}

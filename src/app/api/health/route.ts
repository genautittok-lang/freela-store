import { NextResponse } from "next/server";
import { systemHealth } from "@/lib/db";
import { INITIAL_LOCALES } from "@/data/locales";
import { toolRegistry } from "@/data/tools";

export function GET() {
  const health = systemHealth();
  const published = toolRegistry.filter((t) => t.status === "published").length;
  return NextResponse.json({
    ...health,
    locales: INITIAL_LOCALES.length,
    publishedTools: published,
  });
}

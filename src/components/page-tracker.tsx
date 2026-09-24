"use client";

import { useEffect } from "react";
import { track } from "@/components/analytics-provider";

export function PageTracker({ locale, toolId }: { locale: string; toolId?: string }) {
  useEffect(() => {
    track("page_view", { locale, toolId });
    if (toolId) track("tool_open", { locale, toolId });
  }, [locale, toolId]);
  return null;
}

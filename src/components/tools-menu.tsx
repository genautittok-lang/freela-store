"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { contentLocale } from "@/data/locales";
import { categories, type CategoryId } from "@/data/categories";
import { copyForCategory, copyForTool, toolsInCategory } from "@/lib/registry";
import { t } from "@/i18n/messages";
import { BrandCategoryIcon } from "@/components/brand-icons";
import { iconForTool } from "@/lib/tool-icons";
import { createElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  return <BrandCategoryIcon id={id} className={className ?? "h-8 w-8"} />;
}

const PREVIEW_LIMIT = 8;

export function ToolsNavMenu({
  locale,
  active = "",
}: {
  locale: string;
  active?: string;
}) {
  const ui = t(locale);
  const cl = contentLocale(locale);
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<CategoryId>(
    (categories.find((c) => c.id === active)?.id as CategoryId | undefined) ?? categories[0]!.id,
  );

  const tools = useMemo(() => toolsInCategory(locale, activeCat).slice(0, PREVIEW_LIMIT), [locale, activeCat]);
  const cat = categories.find((c) => c.id === activeCat)!;
  const catCopy = copyForCategory(cat, locale);
  const toolsActive = categories.some((c) => c.id === active);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && categories.some((c) => c.id === active)) {
          setActiveCat(active as CategoryId);
        }
      }}
    >
      <DropdownMenuTrigger
        className="nav-link inline-flex items-center gap-1 bg-transparent"
        data-active={toolsActive || open ? "true" : "false"}
        aria-expanded={open}
      >
        {ui.tools}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-[min(92vw,40rem)] overflow-hidden rounded-2xl border border-border bg-popover p-0 shadow-[0_20px_50px_rgb(21_122_69_/_0.14)]"
      >
        <div className="grid sm:grid-cols-[13rem_1fr]">
          <div className="border-b border-border bg-secondary/40 p-2 sm:border-b-0 sm:border-e">
            <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {ui.categories}
            </p>
            <ul className="grid max-h-[min(70vh,28rem)] gap-0.5 overflow-y-auto">
              {categories.map((item) => {
                const on = item.id === activeCat;
                const copy = copyForCategory(item, locale);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-start text-sm ${
                        on ? "bg-accent font-semibold text-primary" : "text-foreground hover:bg-muted"
                      }`}
                      onMouseEnter={() => setActiveCat(item.id)}
                      onFocus={() => setActiveCat(item.id)}
                      onClick={() => setActiveCat(item.id)}
                    >
                      <CategoryIcon id={item.id} className="h-6 w-6" />
                      <span className="truncate">{copy.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex min-h-[16rem] flex-col p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="freela-well h-9 w-9">
                  <CategoryIcon id={cat.id} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{catCopy.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{catCopy.description}</p>
                </div>
              </div>
              <Link
                href={`/${locale}/tools/${cat.copy[cl].slug}`}
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                {ui.browseCategory}
              </Link>
            </div>
            <ul className="mt-3 grid flex-1 gap-1 overflow-y-auto">
              {tools.map((tool) => {
                const copy = copyForTool(tool, locale);
                return (
                  <li key={tool.id}>
                    <Link
                      href={`/${locale}/tools/${copy.slug}`}
                      className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted"
                      onClick={() => setOpen(false)}
                    >
                      {createElement(iconForTool(tool.id, tool.category), {
                        className: "h-8 w-8 shrink-0",
                        "aria-hidden": true,
                      })}
                      <span className="truncate font-medium">{copy.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={`/${locale}/tools/${cat.copy[cl].slug}`}
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-primary hover:border-primary"
              onClick={() => setOpen(false)}
            >
              {ui.allTools} · {catCopy.name}
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Mobile: categories first, then tools of the chosen category. */
export function ToolsCategorySheet({
  locale,
  active = "",
  onNavigate,
}: {
  locale: string;
  active?: string;
  onNavigate?: () => void;
}) {
  const ui = t(locale);
  const cl = contentLocale(locale);
  const [step, setStep] = useState<"categories" | "tools">("categories");
  const [activeCat, setActiveCat] = useState<CategoryId>(
    (categories.find((c) => c.id === active)?.id as CategoryId | undefined) ?? categories[0]!.id,
  );
  const cat = categories.find((c) => c.id === activeCat)!;
  const catCopy = copyForCategory(cat, locale);
  const tools = toolsInCategory(locale, activeCat);

  if (step === "tools") {
    return (
      <div className="grid gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 self-start rounded-lg px-1 py-1 text-sm font-medium text-primary"
          onClick={() => setStep("categories")}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {ui.categories}
        </button>
        <div className="flex items-center gap-2 px-1">
          <CategoryIcon id={cat.id} className="h-7 w-7" />
          <div>
            <p className="font-semibold">{catCopy.name}</p>
            <Link
              href={`/${locale}/tools/${cat.copy[cl].slug}`}
              className="text-xs font-semibold text-primary"
              onClick={onNavigate}
            >
              {ui.browseCategory}
            </Link>
          </div>
        </div>
        <ul className="mt-1 grid max-h-[55vh] gap-1 overflow-y-auto">
          {tools.map((tool) => {
            const copy = copyForTool(tool, locale);
            return (
              <li key={tool.id}>
                <Link
                  href={`/${locale}/tools/${copy.slug}`}
                  className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted"
                  onClick={onNavigate}
                >
                  {createElement(iconForTool(tool.id, tool.category), {
                    className: "h-8 w-8 shrink-0",
                    "aria-hidden": true,
                  })}
                  <span className="truncate">{copy.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <nav className="grid gap-1 text-sm" aria-label={ui.categories}>
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ui.categories}</p>
      {categories.map((item) => {
        const on = active === item.id;
        const copy = copyForCategory(item, locale);
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start ${
              on ? "bg-accent" : "hover:bg-muted"
            }`}
            data-active={on ? "true" : "false"}
            onClick={() => {
              setActiveCat(item.id);
              setStep("tools");
            }}
          >
            <CategoryIcon id={item.id} />
            <span className="nav-link">{copy.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

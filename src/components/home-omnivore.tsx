"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { detectFileKind, suggestToolsForFile } from "@/lib/tools/suggest-tools";
import { copyForTool, toolById } from "@/lib/registry";
import type { ToolDefinition } from "@/data/schema";

const FAV_KEY = "freela.favorites.v1";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids.slice(0, 48)));
}

export function FavoriteStar({
  toolId,
  className = "",
}: {
  toolId: string;
  className?: string;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(loadFavorites().includes(toolId));
  }, [toolId]);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={on}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/90 text-muted-foreground transition hover:text-amber-500 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = loadFavorites();
        const idx = next.indexOf(toolId);
        if (idx >= 0) next.splice(idx, 1);
        else next.unshift(toolId);
        saveFavorites(next);
        setOn(idx < 0);
      }}
    >
      <Star className={`h-4 w-4 ${on ? "fill-amber-400 text-amber-500" : ""}`} />
    </button>
  );
}

export function FavoritesRail({ locale }: { locale: string }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(loadFavorites());
    const onStorage = () => setIds(loadFavorites());
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);
  if (!ids.length) return null;
  const tools = ids.map((id) => toolById(id)).filter((t): t is ToolDefinition => Boolean(t && t.status === "published"));
  if (!tools.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">Favorites</h2>
      <p className="mt-2 text-sm text-muted-foreground">Pinned on this device with the star — stored in localStorage only.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => {
          const copy = copyForTool(tool, locale);
          return (
            <li key={tool.id}>
              <Link href={`/${locale}/tools/${copy.slug}`} className="freela-card relative block h-full p-5">
                <FavoriteStar toolId={tool.id} className="absolute right-3 top-3" />
                <p className="pr-10 font-semibold">{copy.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{copy.description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function OmnivoreDropzone({ locale }: { locale: string }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<ToolDefinition[]>([]);
  const [kind, setKind] = useState<string>("");

  const handleFiles = useCallback((list: FileList | File[] | null) => {
    const f = list?.[0];
    if (!f) return;
    setFile(f);
    setKind(detectFileKind(f));
    setSuggestions(suggestToolsForFile(f, 6));
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight">Drop any file</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Omnivore zone — we detect the type in this tab and suggest matching Freela tools. Nothing is uploaded.
      </p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("omnivore-input")?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mt-5 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed px-6 py-8 text-center transition ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-white/70"
        }`}
        onClick={() => document.getElementById("omnivore-input")?.click()}
      >
        <input
          id="omnivore-input"
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-base font-semibold text-foreground">
          {file ? file.name : "Drop a PDF, video, image, spreadsheet or archive"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {file ? `Detected: ${kind}` : "Or click to browse — suggestions stay on this page"}
        </p>
      </div>
      {suggestions.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((tool) => {
            const copy = copyForTool(tool, locale);
            return (
              <li key={tool.id}>
                <Link
                  href={`/${locale}/tools/${copy.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40"
                >
                  <span>{copy.name}</span>
                  <FavoriteStar toolId={tool.id} />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

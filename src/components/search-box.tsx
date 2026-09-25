"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/i18n/messages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { track } from "@/components/analytics-provider";

function queryFingerprint(query: string) {
  const slug = query
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug ? `q.${slug}` : "q.empty";
}

type Hit = { kind: string; id: string; label: string; href: string; description?: string; category?: string };

export function SearchBox({ locale, initial = "", large = false }: { locale: string; initial?: string; large?: boolean }) {
  const ui = t(locale);
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const tmo = setTimeout(async () => {
      if (q.trim().length < 2) {
        setHits([]);
        return;
      }
      const res = await fetch(`/api/search?locale=${locale}&q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { hits: Hit[] };
      setHits(data.hits.slice(0, 6));
    }, 180);
    return () => clearTimeout(tmo);
  }, [q, locale]);

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const hitsNow = hits.length;
        const fp = queryFingerprint(q);
        track("search_submit", {
          locale,
          result: hitsNow > 0 || q.trim().length < 2 ? "ok" : "error",
          source: hitsNow ? `hits.${Math.min(hitsNow, 99)}` : "hits.0",
          path: `/${locale}/search`,
        });
        if (q.trim().length >= 2 && hitsNow === 0) {
          track("zero_result_search", { locale, result: "error", source: fp, path: `/${locale}/search` });
        }
        router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
      }}
      role="search"
    >
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ui.searchPlaceholder}
          aria-label={ui.searchTitle}
          autoComplete="off"
          className={large ? "h-12 text-base" : undefined}
        />
        <Button type="submit" size={large ? "lg" : "default"}>{ui.searchButton}</Button>
      </div>
      {hits.length ? (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border bg-background p-1 shadow">
          {hits.map((hit) => (
            <li key={hit.href}>
              <a className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" href={hit.href}>
                <span className="font-medium">{hit.label}</span>
                {hit.description ? (
                  <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{hit.description}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

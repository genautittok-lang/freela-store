import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isRoutedLocale, contentLocale, getLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import {
  copyForCategory,
  copyForTool,
  featuredTools,
  newestTools,
  toolById,
  toolsInCategory,
  visibleTools,
} from "@/lib/registry";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { AdSlot, CategoryIcon } from "@/components/site-chrome";
import { FormatPath } from "@/components/format-badges";
import { PageTracker } from "@/components/page-tracker";
import { formatNumber } from "@/lib/format";
import { iconForTool } from "@/lib/tool-icons";

const TASK_CHIPS = [
  "merge-pdf",
  "compress-pdf",
  "resize-image",
  "json-formatter",
  "qr-generator",
  "word-counter",
  "convert-image",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isRoutedLocale(locale)) return {};
  const ui = t(locale);
  return pageMetadata({
    locale,
    title: `${ui.brand} — ${ui.tagline}`,
    description: ui.heroLead,
    pathWithoutLocale: "",
  });
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isRoutedLocale(locale)) notFound();
  const ui = t(locale);
  const cl = contentLocale(locale);
  const loc = getLocale(locale)!;
  const featured = featuredTools(cl).slice(0, 8);
  const newest = newestTools(cl).slice(0, 8);
  const count = visibleTools(cl).length;
  const chips = TASK_CHIPS.map((id) => toolById(id)).filter((tool) => tool && copyForTool(tool, cl));
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <PageTracker locale={locale} />
      <section className="grid items-center gap-6 rounded-[1.5rem] border border-border bg-card px-4 py-6 shadow-sm sm:px-8 sm:py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold text-primary">freela.store</p>
          <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">{ui.tagline}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{ui.heroLead}</p>
          <div className="mt-6 max-w-xl">
            <SearchBox locale={locale} />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{ui.popularTasks}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {chips.map((tool) => (
              <li key={tool!.id}>
                <Link className="freela-chip" href={`/${locale}/tools/${copyForTool(tool!, locale).slug}`}>
                  {copyForTool(tool!, locale).name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
          <Image
            src="/brand/hero.png"
            alt="Freela browser tools"
            width={1280}
            height={720}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{ui.convert}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{ui.howItWorksLead}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { id: "images-to-pdf", from: ["JPG", "PNG", "WebP"], to: ["PDF"] },
            { id: "convert-image", from: ["JPG", "PNG"], to: ["WebP"] },
            { id: "merge-pdf", from: ["PDF"], to: ["PDF"] },
          ].map((row) => {
            const tool = toolById(row.id);
            if (!tool) return null;
            const copy = copyForTool(tool, locale);
            return (
              <li key={row.id}>
                <Link href={`/${locale}/tools/${copy.slug}`} className="freela-card block h-full p-4">
                  <p className="font-medium">{copy.name}</p>
                  <div className="mt-3">
                    <FormatPath from={row.from} to={row.to} />
                  </div>
                  <span className="mt-3 inline-flex text-sm font-medium text-primary">{ui.openTool}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      {!loc.indexable ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{ui.noIndexNote}</p>
      ) : null}
      <ToolGrid locale={locale} title={ui.popular} tools={featured} cta={ui.openTool} />
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{ui.categories}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/${locale}/tools/${copyForCategory(cat, locale).slug}`} className="freela-card block p-3">
                <CategoryIcon id={cat.id} />
                <p className="mt-2 text-sm font-medium">{copyForCategory(cat, locale).name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 flex items-start gap-4 rounded-2xl border border-border bg-accent/70 px-5 py-5">
        <div>
          <h2 className="text-lg font-semibold">{ui.trustTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{ui.trustBody}</p>
        </div>
      </section>
      <div className="mt-10">
        <AdSlot position="home-mid" locale={locale} />
      </div>
      <section className="mt-10 max-w-xl">
        <h2 className="text-lg font-semibold">{ui.walkthroughTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{ui.walkthroughLead}</p>
        <video className="mt-3 w-full rounded-2xl border" controls muted playsInline preload="metadata" poster="/brand/hero.png">
          <source src="/brand/teaser.mp4" type="video/mp4" />
        </video>
      </section>
      <ToolGrid locale={locale} title={ui.newest} tools={newest} cta={ui.openTool} />
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{ui.popularByCategory}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {categories.slice(0, 6).map((cat) => {
            const tools = toolsInCategory(locale, cat.id).slice(0, 4);
            return (
              <div key={cat.id} className="freela-card p-4">
                <Link href={`/${locale}/tools/${copyForCategory(cat, locale).slug}`} className="flex items-center gap-2 font-medium">
                  <CategoryIcon id={cat.id} />
                  {copyForCategory(cat, locale).name}
                </Link>
                <ul className="mt-3 grid gap-1 text-sm">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/tools/${copyForTool(tool, locale).slug}`}>
                        {copyForTool(tool, locale).name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
      <p className="mt-8 text-sm text-muted-foreground">
        {formatNumber(locale, count)} {ui.allTools.toLowerCase()}
      </p>
    </div>
  );
}

function ToolGrid({
  locale,
  title,
  tools,
  cta,
}: {
  locale: string;
  title: string;
  tools: ReturnType<typeof featuredTools>;
  cta: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => {
          const Icon = iconForTool(tool.id, tool.category);
          const copy = copyForTool(tool, locale);
          return (
            <li key={tool.id}>
              <Link href={`/${locale}/tools/${copy.slug}`} className="freela-card block h-full p-4">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-2 font-medium">{copy.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{copy.description}</p>
                <span className="mt-3 inline-flex text-sm font-medium text-primary">{cta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

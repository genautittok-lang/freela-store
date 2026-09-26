import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isRoutedLocale, contentLocale, getLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { newestTools, toolById, visibleTools } from "@/lib/registry";
import { rankedInCategory, rankedTools } from "@/lib/popularity";
import { copyForCategory, copyForTool } from "@/lib/registry";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { SearchBox } from "@/components/search-box";
import { AdSlot, CategoryIcon } from "@/components/site-chrome";
import { FormatPath } from "@/components/format-badges";
import { PageTracker } from "@/components/page-tracker";
import { formatNumber } from "@/lib/format";
import { iconForTool } from "@/lib/tool-icons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isRoutedLocale(locale)) return {};
  const ui = t(locale);
  return pageMetadata({
    locale,
    title: ui.homeTitle,
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
  const featured = rankedTools(cl, { limit: 8, maxPerCategory: 3 });
  const newest = newestTools(cl).slice(0, 8);
  const count = visibleTools(cl).length;
  const chips = rankedTools(cl, { limit: 10, maxPerCategory: 2 });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <PageTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(locale, ui.heroLead)) }} />
      <section className="freela-hero grid items-center gap-8 rounded-[2rem] border border-border px-5 py-8 shadow-[0_20px_50px_rgb(21_122_69_/_0.08)] sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="inline-flex items-center rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {ui.processedLocally}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{ui.homeTitle}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{ui.heroLead}</p>
          <div className="mt-7 max-w-xl">
            <SearchBox locale={locale} large />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{ui.popularTasks}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {chips.map((tool) => (
              <li key={tool.id}>
                <Link className="freela-chip" href={`/${locale}/tools/${copyForTool(tool, locale).slug}`}>
                  {copyForTool(tool, locale).name}
                </Link>
              </li>
            ))}
          </ul>
          <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {[ui.stepFiles, ui.stepRun, ui.stepSave].map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl border border-border/80 bg-white/80 px-3 py-3 font-medium text-foreground">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-5">{step.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm">
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
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">{ui.convert}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{ui.howItWorksLead}</p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
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
                <Link href={`/${locale}/tools/${copy.slug}`} className="freela-card block h-full p-5">
                  <p className="font-semibold">{copy.name}</p>
                  <div className="mt-4">
                    <FormatPath from={row.from} to={row.to} />
                  </div>
                  <span className="mt-4 inline-flex text-sm font-semibold text-primary">{ui.openTool}</span>
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
      <p className="mt-2 text-xs text-muted-foreground">{ui.rankingNote}</p>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">{ui.categories}</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/${locale}/tools/${copyForCategory(cat, locale).slug}`} className="freela-card block p-4">
                  <span className="freela-well h-12 w-12">
                    <CategoryIcon id={cat.id} className="h-8 w-8" />
                  </span>
                <p className="mt-3 text-sm font-semibold">{copyForCategory(cat, locale).name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12 flex items-start gap-4 rounded-[1.5rem] border border-primary/15 bg-accent px-6 py-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{ui.trustTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{ui.trustBody}</p>
        </div>
      </section>
      <div className="mt-12">
        <AdSlot position="home-mid" locale={locale} />
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">{ui.walkthroughTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{ui.walkthroughLead}</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <figure>
            <video className="w-full rounded-[1.5rem] border border-border shadow-sm" controls muted playsInline preload="metadata" poster="/brand/hero.png">
              <source src="/brand/teaser.mp4" type="video/mp4" />
            </video>
            <figcaption className="mt-2 text-xs font-medium text-muted-foreground">{ui.videoPhone}</figcaption>
          </figure>
          <figure className="hidden lg:block">
            <video className="w-full rounded-[1.5rem] border border-border shadow-sm" controls muted playsInline preload="metadata" poster="/brand/hero.png">
              <source src="/brand/teaser-desktop.mp4" type="video/mp4" />
            </video>
            <figcaption className="mt-2 text-xs font-medium text-muted-foreground">{ui.videoDesktop}</figcaption>
          </figure>
        </div>
      </section>
      <ToolGrid locale={locale} title={ui.newest} tools={newest} cta={ui.openTool} />
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">{ui.popularByCategory}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {categories.slice(0, 6).map((cat) => {
            const tools = rankedInCategory(locale, cat.id, 4);
            return (
              <div key={cat.id} className="freela-card p-5">
                <Link href={`/${locale}/tools/${copyForCategory(cat, locale).slug}`} className="flex items-center gap-3 font-semibold">
                  <span className="freela-well h-12 w-12">
                    <CategoryIcon id={cat.id} className="h-8 w-8" />
                  </span>
                  {copyForCategory(cat, locale).name}
                </Link>
                <ul className="mt-4 grid gap-1.5 text-sm">
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
      <p className="mt-10 text-sm font-medium text-muted-foreground">
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
  tools: ReturnType<typeof rankedTools>;
  cta: string;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => {
          const Icon = iconForTool(tool.id, tool.category);
          const copy = copyForTool(tool, locale);
          return (
            <li key={tool.id}>
              <Link href={`/${locale}/tools/${copy.slug}`} className="freela-card block h-full p-5">
                <Icon className="freela-sticker h-12 w-12" aria-hidden />
                <p className="mt-3 font-semibold">{copy.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{copy.description}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-primary">{cta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Link from "next/link";
import { createElement } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { isRoutedLocale, ROUTED_LOCALES, contentLocale, getLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import {
  categoryBySlug,
  copyForCategory,
  copyForTool,
  relatedToolsFor,
  toolBySlug,
  toolsInCategory,
  visibleTools,
} from "@/lib/registry";
import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, pageMetadata, softwareJsonLd, toolMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { AdSlot, CategoryIcon } from "@/components/site-chrome";
import { ToolBriefing } from "@/components/tool-briefing";
import { FormatBadges } from "@/components/format-badges";
import { PageTracker } from "@/components/page-tracker";
import { absoluteUrl } from "@/lib/site";
import { formatBytes } from "@/lib/format";
import { iconForTool } from "@/lib/tool-icons";
import { privacyLabel } from "@/lib/privacy";

const ToolRunner = dynamic(() => import("@/components/tool-runner").then((m) => m.ToolRunner), {
  loading: () => <div className="h-48 animate-pulse rounded-2xl bg-muted" />,
});

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of ROUTED_LOCALES) {
    const code = contentLocale(locale);
    for (const cat of categories) {
      params.push({ locale, slug: cat.copy[code].slug });
    }
    for (const tool of visibleTools(locale)) {
      params.push({ locale, slug: copyForTool(tool, locale).slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isRoutedLocale(locale)) return {};
  const tool = toolBySlug(locale, slug);
  if (tool) return toolMetadata(tool, locale);
  const cat = categoryBySlug(locale, slug);
  if (cat) {
    const copy = copyForCategory(cat, locale);
    return pageMetadata({
      locale,
      title: copy.h1,
      description: copy.description,
      pathWithoutLocale: `/tools/${copy.slug}`,
      ogType: "website",
    });
  }
  return {};
}

export default async function ToolsSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isRoutedLocale(locale)) notFound();
  const tool = toolBySlug(locale, slug);
  if (tool) {
    if (tool.status === "draft" || tool.status === "review") notFound();
    return <ToolPage locale={locale} slug={slug} />;
  }
  const cat = categoryBySlug(locale, slug);
  if (cat) return <CategoryPage locale={locale} slug={slug} />;
  notFound();
}

async function ToolPage({ locale, slug }: { locale: string; slug: string }) {
  const tool = toolBySlug(locale, slug)!;
  const copy = copyForTool(tool, locale);
  const ui = t(locale);
  const cat = categories.find((c) => c.id === tool.category)!;
  const related = relatedToolsFor(tool, locale);
  const loc = getLocale(locale)!;
  const catCopy = copyForCategory(cat, locale);
  const crumbs = [
    { name: ui.home, url: absoluteUrl(`/${locale}`) },
    { name: catCopy.name, url: absoluteUrl(`/${locale}/tools/${catCopy.slug}`) },
    { name: copy.name, url: absoluteUrl(`/${locale}/tools/${copy.slug}`) },
  ];
  return (
    <article className="relative mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <PageTracker locale={locale} toolId={tool.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd(tool, locale)) }} />
      {copy.faq.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(copy.faq)) }} />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd(copy.h1, copy.howTo, absoluteUrl(`/${locale}/tools/${copy.slug}`))),
        }}
      />
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link href={`/${locale}`}>{ui.home}</Link>
            <span aria-hidden> / </span>
          </li>
          <li>
            <Link href={`/${locale}/tools/${catCopy.slug}`}>{catCopy.name}</Link>
            <span aria-hidden> / </span>
          </li>
          <li>{copy.name}</li>
        </ol>
      </nav>
      <div className="mt-5 flex items-start gap-3">
        <span className="freela-well mt-1 h-12 w-12">
          {createElement(iconForTool(tool.id, tool.category), {
            className: "h-6 w-6",
            "aria-hidden": true,
          })}
        </span>
        <div>
          <h1 id="tool-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {copy.h1}
          </h1>
          <p className="mt-2 text-muted-foreground">{copy.intro}</p>
        </div>
      </div>
      {!loc.indexable ? <p className="mt-3 text-sm text-amber-800">{ui.noIndexNote}</p> : null}
      <p className="mt-3 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        {privacyLabel(tool.processingMode, locale)}
      </p>
      <div className="mt-6">
        <ToolRunner tool={tool} locale={locale} />
      </div>
      <ToolBriefing tool={tool} locale={locale} />
      <p className="mt-3 text-xs text-muted-foreground">
        {ui.formats}: {copy.formats}
        {tool.maxFileSize > 0 ? ` · ${ui.sizeLimit} ${formatBytes(locale, tool.maxFileSize)}` : null}
      </p>
      <div className="mt-2">
        <FormatBadges formats={tool.supportedFormats} />
      </div>
      <section className="freela-card mt-8 p-5">
        <h2 className="text-lg font-semibold">{ui.howTo}</h2>
        <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-6">
          {copy.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="freela-card mt-4 p-5">
        <h2 className="text-lg font-semibold">{ui.examples}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6">
          {copy.examples.map((ex) => (
            <li key={ex}>{ex}</li>
          ))}
        </ul>
      </section>
      {copy.faq.length ? (
        <section className="freela-card mt-4 p-5">
          <h2 className="text-lg font-semibold">{ui.faq}</h2>
          <dl className="mt-3 grid gap-4">
            {copy.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium">{item.question}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <div className="mt-8">
        <AdSlot position="after-howto" locale={locale} />
      </div>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.related}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.id}>
              <Link className="freela-card block p-4 hover:border-primary" href={`/${locale}/tools/${copyForTool(item, locale).slug}`}>
                {copyForTool(item, locale).name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-8">
        <AdSlot position="after-related" locale={locale} />
      </div>
    </article>
  );
}

async function CategoryPage({ locale, slug }: { locale: string; slug: string }) {
  const cat = categoryBySlug(locale, slug)!;
  const ui = t(locale);
  const tools = toolsInCategory(locale, cat.id);
  const copy = copyForCategory(cat, locale);
  const crumbs = [
    { name: ui.home, url: absoluteUrl(`/${locale}`) },
    { name: copy.name, url: absoluteUrl(`/${locale}/tools/${copy.slug}`) },
  ];
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.h1,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/${locale}/tools/${copyForTool(tool, locale).slug}`),
      name: copyForTool(tool, locale).name,
    })),
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <PageTracker locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{ui.home}</Link>
        {" / "}
        <span>{copy.name}</span>
      </nav>
      <div className="mt-4 flex items-center gap-3">
        <span className="freela-well h-12 w-12">
          <CategoryIcon id={cat.id} className="h-6 w-6 text-primary" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.h1}</h1>
      </div>
      <p className="mt-4 max-w-2xl text-muted-foreground">{copy.description}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link href={`/${locale}/tools/${copyForTool(tool, locale).slug}`} className="freela-card block h-full p-5">
              <span className="freela-well">
                {createElement(iconForTool(tool.id, tool.category), {
                  className: "h-5 w-5",
                  "aria-hidden": true,
                })}
              </span>
              <p className="mt-3 font-semibold">{copyForTool(tool, locale).name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{copyForTool(tool, locale).description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-primary">{ui.openTool}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

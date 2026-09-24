import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { isLocale, localeRegistry } from "@/data/locales";
import { INITIAL_LOCALES } from "@/data/locales";
import { categories } from "@/data/categories";
import {
  categoryBySlug,
  relatedToolsFor,
  toolBySlug,
  toolsInCategory,
  visibleTools,
} from "@/lib/registry";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, softwareJsonLd, toolMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { AdSlot } from "@/components/site-chrome";
import { PageTracker } from "@/components/page-tracker";
import { absoluteUrl } from "@/lib/site";

const ToolRunner = dynamic(() => import("@/components/tool-runner").then((m) => m.ToolRunner), {
  loading: () => <div className="h-48 animate-pulse rounded-2xl bg-muted" />,
});

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of INITIAL_LOCALES) {
    for (const cat of categories) {
      params.push({ locale, slug: cat.copy[locale].slug });
    }
    for (const tool of visibleTools(locale)) {
      params.push({ locale, slug: tool.copy[locale].slug });
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
  if (!isLocale(locale)) return {};
  const tool = toolBySlug(locale, slug);
  if (tool) return toolMetadata(tool, locale);
  const cat = categoryBySlug(locale, slug);
  if (cat) {
    return pageMetadata({
      locale,
      title: cat.copy[locale].h1,
      description: cat.copy[locale].description,
      pathWithoutLocale: `/tools/${cat.copy[locale].slug}`,
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
  if (!isLocale(locale)) notFound();
  const tool = toolBySlug(locale, slug);
  if (tool) {
    if (tool.status === "draft" || tool.status === "review") notFound();
    return <ToolPage locale={locale} slug={slug} />;
  }
  const cat = categoryBySlug(locale, slug);
  if (cat) return <CategoryPage locale={locale} slug={slug} />;
  notFound();
}

async function ToolPage({ locale, slug }: { locale: import("@/data/locales").Locale; slug: string }) {
  const tool = toolBySlug(locale, slug)!;
  const copy = tool.copy[locale];
  const ui = t(locale);
  const cat = categories.find((c) => c.id === tool.category)!;
  const related = relatedToolsFor(tool, locale);
  const loc = localeRegistry[locale];
  const crumbs = [
    { name: ui.home, url: absoluteUrl(`/${locale}`) },
    { name: cat.copy[locale].name, url: absoluteUrl(`/${locale}/tools/${cat.copy[locale].slug}`) },
    { name: copy.name, url: absoluteUrl(`/${locale}/tools/${copy.slug}`) },
  ];
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <PageTracker locale={locale} toolId={tool.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd(tool, locale)) }} />
      {copy.faq.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(copy.faq)) }} />
      ) : null}
      <nav className="text-sm text-muted-foreground">
        <Link href={`/${locale}`}>{ui.home}</Link>
        {" / "}
        <Link href={`/${locale}/tools/${cat.copy[locale].slug}`}>{cat.copy[locale].name}</Link>
        {" / "}
        <span>{copy.name}</span>
      </nav>
      <h1 id="tool-heading" className="mt-3 text-3xl font-semibold tracking-tight">
        {copy.h1}
      </h1>
      <p className="mt-3 text-muted-foreground">{copy.intro}</p>
      {!loc.indexable ? <p className="mt-3 text-sm text-amber-800">{ui.noIndexNote}</p> : null}
      <div className="mt-6">
        <ToolRunner tool={tool} locale={locale} />
      </div>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.formats}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.formats}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.howTo}</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {copy.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.privacy}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.privacy}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.examples}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {copy.examples.map((ex) => (
            <li key={ex}>{ex}</li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.faq}</h2>
        <dl className="mt-3 grid gap-4">
          {copy.faq.map((item) => (
            <div key={item.question}>
              <dt className="font-medium">{item.question}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="mt-8">
        <AdSlot position="after-result" />
      </div>
      <section className="mt-8">
        <h2 className="font-semibold">{ui.related}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.id}>
              <Link className="block rounded-xl border p-3 hover:border-foreground" href={`/${locale}/tools/${item.copy[locale].slug}`}>
                {item.copy[locale].name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

async function CategoryPage({ locale, slug }: { locale: import("@/data/locales").Locale; slug: string }) {
  const cat = categoryBySlug(locale, slug)!;
  const ui = t(locale);
  const tools = toolsInCategory(locale, cat.id);
  const copy = cat.copy[locale];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTracker locale={locale} />
      <nav className="text-sm text-muted-foreground">
        <Link href={`/${locale}`}>{ui.home}</Link>
        {" / "}
        <span>{copy.name}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold">{copy.h1}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{copy.description}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link href={`/${locale}/tools/${tool.copy[locale].slug}`} className="block h-full rounded-2xl border p-4 hover:border-foreground">
              <p className="font-medium">{tool.copy[locale].name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tool.copy[locale].description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

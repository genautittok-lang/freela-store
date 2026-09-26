import Link from "next/link";
import { ROUTED_LOCALES, contentLocale, getLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { Logo } from "@/components/logo";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/site";
import { copyForTool, toolById } from "@/lib/registry";

const CONVERT_IDS = ["merge-pdf", "images-to-pdf", "convert-image", "csv-json", "yaml-json", "temperature", "hex-rgb-hsl"];

function legalLinks(locale: string) {
  const ui = t(locale);
  return [
    { href: `/${locale}/about`, label: ui.about },
    { href: `/${locale}/contact`, label: ui.contact },
    { href: `/${locale}/privacy`, label: ui.privacyPolicy },
    { href: `/${locale}/terms`, label: ui.terms },
    { href: `/${locale}/acceptable-use`, label: ui.aup },
    { href: `/${locale}/abuse`, label: ui.abuse },
    { href: `/${locale}/data-deletion`, label: ui.deletion },
    { href: `/${locale}/file-processing`, label: ui.filePolicy },
    { href: `/${locale}/vendors`, label: ui.vendors },
    { href: `/${locale}/copyright`, label: ui.copyright },
    { href: `/${locale}/data-inventory`, label: ui.inventory },
    { href: `/${locale}/affiliate-disclosure`, label: ui.affiliate },
  ];
}

export function SiteFooter({ locale }: { locale: string }) {
  const ui = t(locale);
  const cl = contentLocale(locale);
  const product = legalLinks(locale).filter((l) => /\/(about|contact)$/.test(l.href));
  const legal = legalLinks(locale).filter((l) => !/\/(about|contact)$/.test(l.href));
  const converts = CONVERT_IDS.flatMap((id) => {
    const tool = toolById(id);
    if (!tool) return [];
    return [{ id, label: copyForTool(tool, locale).name }];
  });
  return (
    <footer className="mt-auto border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo locale={locale} homeLabel={ui.home} />
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{ui.tagline}</p>
            <p className="mt-3 text-xs font-medium text-emerald-800">{ui.processedLocally}</p>
            <p className="mt-4 text-sm">
              <a className="font-semibold text-primary hover:underline" href={CONTACT_MAILTO}>
                {CONTACT_EMAIL}
              </a>
              <span className="mt-1 block text-xs text-muted-foreground">{ui.contactHint}</span>
            </p>
          </div>
          <nav aria-label={ui.tools}>
            <p className="text-sm font-semibold">{ui.tools}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/tools/${cat.copy[cl].slug}`}>
                    {cat.copy[cl].name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={ui.convert}>
            <p className="text-sm font-semibold">{ui.convert}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {converts.map((row) => (
                <li key={row.id}>
                  <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/tools/${row.id}`}>
                    {row.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-semibold">{ui.company}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {product.map((link) => (
                <li key={link.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={ui.legal}>
            <p className="text-sm font-semibold">{ui.legal}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-sm font-semibold">{ui.language}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {ROUTED_LOCALES.map((code) => {
              const rec = getLocale(code);
              return (
                <li key={code}>
                  <Link className="text-muted-foreground hover:text-foreground" href={`/${code}`} hrefLang={code}>
                    {rec?.nativeName}
                    <span className="ms-1 text-xs uppercase text-muted-foreground/80">{code}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-border bg-muted/40">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs leading-5 text-muted-foreground">
          © {new Date().getFullYear()} Freela · {ui.adDisclosure}
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ROUTED_LOCALES, contentLocale, getLocale } from "@/data/locales";
import { categories } from "@/data/categories";
import { t } from "@/i18n/messages";
import { Logo } from "@/components/logo";
import { CONTACT_EMAIL, CREATOR_EMAIL, INFO_EMAIL, PARTNER_EMAIL, APP_VERSION } from "@/lib/site";
import { DarkshareBadge } from "@/components/darkshare-badge";
import { mailRoles } from "@/i18n/mailboxes";
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

function FooterHeart() {
  return (
    <span className="footer-heart" aria-hidden="true">
      <svg viewBox="0 0 32 28" className="footer-heart-svg" role="img">
        <path
          className="footer-heart-shape"
          d="M16 26S2 16.5 2 9.2C2 5.1 5.2 2 9 2c2.4 0 4.5 1.2 5.8 3.1C16.5 3.2 18.6 2 21 2c3.8 0 7 3.1 7 7.2C28 16.5 16 26 16 26z"
        />
        <polyline
          className="footer-heart-ecg"
          points="3,14 8,14 10,8 12.5,20 15,10 17.5,16 19.5,14 29,14"
          fill="none"
        />
      </svg>
    </span>
  );
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex flex-wrap items-center gap-2">
              <Logo locale={locale} homeLabel={ui.home} />
              <span className="footer-version">v{APP_VERSION}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{ui.tagline}</p>
            <p className="mt-3 text-xs font-medium text-emerald-800">{ui.processedLocally}</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {(
                [
                  [CONTACT_EMAIL, mailRoles(locale).tools],
                  [PARTNER_EMAIL, mailRoles(locale).partner],
                  [INFO_EMAIL, mailRoles(locale).info],
                  [CREATOR_EMAIL, mailRoles(locale).creator],
                ] as const
              ).map(([email, role]) => (
                <li key={email}>
                  <a className="font-semibold text-primary hover:underline" href={`mailto:${email}`}>
                    {email}
                  </a>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{role}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{ui.contactHint}</p>
          </div>
          <nav aria-label={ui.tools}>
            <p className="text-sm font-semibold tracking-tight">{ui.tools}</p>
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
            <p className="text-sm font-semibold tracking-tight">{ui.convert}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {converts.map((row) => (
                <li key={row.id}>
                  <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/tools/${row.id}`}>
                    {row.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-semibold tracking-tight">{ui.company}</p>
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
            <p className="text-sm font-semibold tracking-tight">{ui.legal}</p>
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
          <p className="text-sm font-semibold tracking-tight">{ui.language}</p>
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
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
            <span>© {new Date().getFullYear()} Freela</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-2 font-medium text-foreground">
              {ui.madeWith}
              <FooterHeart />
            </span>
            <span aria-hidden="true">·</span>
            <span>{ui.adDisclosure}</span>
          </p>
          <DarkshareBadge />
        </div>
      </div>
    </footer>
  );
}

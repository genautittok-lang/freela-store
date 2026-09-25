import { notFound } from "next/navigation";
import { isRoutedLocale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/i18n/messages";
import { PageTracker } from "@/components/page-tracker";
import { dataInventory, vendors } from "@/data/privacy-ops";

import { type LegalSlug } from "@/data/legal-slugs";
const pages: Record<LegalSlug, { title: (locale: string) => string; body: string[] }> = {
  about: {
    title: (locale) => t(locale).about,
    body: [
      "Freela is a catalogue of free browser tools at freela.store. Files are processed on your device whenever the format allows it.",
      "We do not promise search rankings. We publish a page only when the tool works and the copy has been reviewed. Non-English locales stay noindex until translation QA.",
      "Calculators and templates are convenience utilities. They are not tax, medical, legal or career advice.",
    ],
  },
  privacy: {
    title: (locale) => t(locale).privacyPolicy,
    body: [
      "Freela collects the minimum data needed to run the site. Published tools in this release use LOCAL_ONLY processing: file bytes and pasted document contents stay in your browser and are not uploaded to Freela.",
      "If you consent, first-party analytics records a random session id, event name, tool id, locale, success/error, path and optional referrer host. Analytics never stores file names as content, document bytes, images, audio, extracted private text or secrets.",
      "Admin authentication uses a bcrypt password hash and an httpOnly session cookie. Login attempts are rate-limited. HTTPS is required in production.",
      "You can refuse analytics cookies and still use every tool. This page describes the software as built; it is not a claim of legal certification. Have a lawyer review the live data flows before a public launch.",
    ],
  },
  terms: {
    title: (locale) => t(locale).terms,
    body: [
      "Tools are provided as-is for personal and professional convenience. These terms do not remove legal obligations that apply by law.",
      "Do not use Freela to break authentication, hide malware, generate official-looking identity documents, or create scaled spam. You are responsible for the files you process and for complying with copyright and local law.",
      "Results can be wrong. Double-check anything that matters. Freela may disable a broken tool and mark it noindex rather than leave a non-functional page indexed.",
    ],
  },
  contact: {
    title: (locale) => t(locale).contact,
    body: [
      "Product questions: hello@freela.store.",
      "Security reports: security@freela.store. Please describe the issue without attaching live secrets or other people’s private files.",
      "We do not accept unsolicited bulk tool pages that are not in the registry.",
    ],
  },
  "affiliate-disclosure": {
    title: (locale) => t(locale).affiliate,
    body: [
      "Some links may be affiliate or sponsored placements. They are labeled. Clicking them is never required to run a tool, download a result, or copy text.",
      "Display ads, when enabled, sit outside the tool card and must never look like a Run or Download control.",
    ],
  },
  "acceptable-use": {
    title: (locale) => t(locale).aup,
    body: [
      "Allowed: ordinary conversion, compression, inspection, counting and generation of content you are entitled to process.",
      "Not allowed: authentication bypass, password cracking, defeating encryption or DRM, forging passports, IDs, certificates, bank statements or other official documents, malware, credential theft, phishing, or marketing a converter as a way to conceal illegal activity.",
      "We may refuse service, disable a tool, or report abuse when we have a legal duty to do so.",
    ],
  },
  abuse: {
    title: (locale) => t(locale).abuse,
    body: [
      "Report illegal content, security issues or legal notices to abuse@freela.store and legal@freela.store.",
      "Include URLs, a description, and your contact details. Do not send copies of other people’s identity documents unless a competent authority requires it through a lawful process.",
      "This channel is monitored for notices, not for general product support.",
    ],
  },
  "data-deletion": {
    title: (locale) => t(locale).deletion,
    body: [
      "LOCAL_ONLY tools do not store your files on Freela servers. Close the tab to drop in-memory copies; we cannot delete what we never received.",
      "To delete analytics events tied to a session cookie, email privacy@freela.store with the session id from local storage key freela_sid, or clear site data in the browser.",
      "Admin accounts are deleted by removing the admin_users row. Session cookies expire after twelve hours or on logout.",
    ],
  },
  vendors: {
    title: (locale) => t(locale).vendors,
    body: [
      vendors.length
        ? "The following processors receive file bytes for named tools."
        : "This release has no third-party file processors. THIRD_PARTY_PROCESSING tools are not enabled in production.",
      "Hosting, DNS and future advertising vendors will be listed here before they receive personal data. No production traffic is sent to unnamed APIs.",
      ...vendors.map(
        (v) =>
          `${v.name} (${v.category}): ${v.whatIsSent}. Why: ${v.why}. Retention: ${v.retention}. Region: ${v.region}. Enabled: ${v.enabled ? "yes" : "no"}.`,
      ),
    ],
  },
  "file-processing": {
    title: (locale) => t(locale).filePolicy,
    body: [
      "Every file-capable tool declares exactly one processingMode: LOCAL_ONLY, SERVER_PROCESSING or THIRD_PARTY_PROCESSING. The badge on the tool is generated from that field.",
      "This catalogue currently ships LOCAL_ONLY tools only. There is no server upload endpoint for user documents, no public object URLs, and no file history.",
      "If a future tool needs server processing, it must use temporary storage, size and time limits, TLS, deletion after processing, and cleanup jobs before it is published.",
    ],
  },
  copyright: {
    title: (locale) => t(locale).copyright,
    body: [
      "If you are a rights holder and believe material on Freela infringes your copyright, write to copyright@freela.store with the URL, a description of the work, and a statement made in good faith.",
      "Freela hosts tool interfaces and generated results in the browser. We do not keep a library of user uploads in this release. Notices that require us to take down a page in the registry will be reviewed.",
      "This notice-and-takedown process will be aligned with the jurisdictions actually used at launch, after legal review.",
    ],
  },
  "data-inventory": {
    title: (locale) => t(locale).inventory,
    body: [
      "What we collect today, why, where it lives, how long we keep it, who processes it, and how it is deleted:",
      ...dataInventory.map(
        (row) =>
          `${row.data} — Why: ${row.why}. Where: ${row.where}. Retention: ${row.retention}. Processor: ${row.processor}. Deletion: ${row.deletion}.`,
      ),
    ],
  },
};

export function makeLegalPage(slug: LegalSlug) {
  return {
    generateMetadata: async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      if (!isRoutedLocale(locale)) return {};
      return pageMetadata({
        locale,
        title: pages[slug].title(locale),
        description: pages[slug].body[0].slice(0, 160),
        pathWithoutLocale: `/${slug}`,
      });
    },
    Page: async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      if (!isRoutedLocale(locale)) notFound();
      return (
        <article className="mx-auto max-w-2xl px-4 py-10">
          <PageTracker locale={locale} />
          <h1 className="text-3xl font-semibold">{pages[slug].title(locale)}</h1>
          {pages[slug].body.map((para) => (
            <p key={para.slice(0, 48)} className="mt-4 leading-7 text-muted-foreground">
              {para}
            </p>
          ))}
        </article>
      );
    },
  };
}

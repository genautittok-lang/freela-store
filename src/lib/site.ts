export const SITE_NAME = "Freela";
export const SITE_TAGLINE = "Free Online Tools";
export const SITE_HOST = "freela.store";
export const APP_VERSION = "1.2.1";
/** Product help, privacy, abuse, copyright and security. Main support address. */
export const CONTACT_EMAIL = "tools@freela.store";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
/** Advertising and partnerships. */
export const PARTNER_EMAIL = "partner@freela.store";
/** General service information. */
export const INFO_EMAIL = "info@freela.store";
/** Creators and content partners. */
export const CREATOR_EMAIL = "creator@freela.store";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://freela.store").replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

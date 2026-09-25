export const SITE_NAME = "Freela";
export const SITE_TAGLINE = "Free Online Tools";
export const SITE_HOST = "freela.store";
/** Public contact for product, privacy, abuse, copyright and other questions. */
export const CONTACT_EMAIL = "tools@freela.store";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://freela.store").replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

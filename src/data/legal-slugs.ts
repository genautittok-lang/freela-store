export const LEGAL_SLUGS = [
  "about",
  "privacy",
  "terms",
  "contact",
  "affiliate-disclosure",
  "acceptable-use",
  "abuse",
  "data-deletion",
  "vendors",
  "file-processing",
  "copyright",
  "data-inventory",
] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

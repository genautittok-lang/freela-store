import type { ToolDefinition } from "../schema";
import { privacyFiles, privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-28";

function t(
  partial: Omit<
    EnTool,
    | "status"
    | "processingMode"
    | "clientOnly"
    | "retention"
    | "deletion"
    | "tested"
    | "translationReviewed"
    | "seoReviewed"
    | "lastReviewedAt"
    | "lastModified"
    | "eventName"
    | "toolVersion"
    | "adSlots"
  >,
): EnTool {
  return {
    status: "published",
    processingMode: "LOCAL_ONLY",
    clientOnly: true,
    retention: "none",
    deletion: "Inputs stay on this device.",
    tested: true,
    translationReviewed: true,
    seoReviewed: true,
    lastReviewedAt: day,
    lastModified: day,
    eventName: `tool_${partial.id.replace(/-/g, "_")}`,
    toolVersion: "1.0.0",
    adSlots: ["after-result"],
    ...partial,
  };
}

type Spec = {
  id: string;
  category: EnTool["category"];
  name: string;
  blurb: string;
  file?: boolean;
  related: [string, string];
};

const SPECS: Spec[] = [
  { id: "title-case", category: "text", name: "Title case", blurb: "Capitalize the first letter of each word.", related: ["case-converter", "slug-generator"] },
  { id: "sentence-case", category: "text", name: "Sentence case", blurb: "Capitalize the first letter of each sentence.", related: ["case-converter", "title-case"] },
  { id: "swap-case", category: "text", name: "Swap case", blurb: "Swap uppercase and lowercase letters.", related: ["case-converter", "title-case"] },
  { id: "shuffle-lines", category: "text", name: "Shuffle lines", blurb: "Reorder lines with a stable mix of the same text.", related: ["sort-lines", "reverse-lines"] },
  { id: "unique-words", category: "text", name: "Unique words", blurb: "List each word once, in first-seen order.", related: ["word-frequency", "remove-duplicate-lines"] },
  { id: "extract-numbers", category: "text", name: "Extract numbers", blurb: "Pull integers and decimals out of text.", related: ["extract-emails", "word-counter"] },
  { id: "reading-time", category: "text", name: "Reading time", blurb: "Estimate minutes at 200 words per minute.", related: ["word-counter", "speaking-pace"] },
  { id: "longest-line", category: "text", name: "Longest line", blurb: "Show the longest line in the text.", related: ["line-lengths", "count-lines"] },
  { id: "strip-emoji", category: "text", name: "Strip emoji", blurb: "Remove emoji and leave the surrounding text.", related: ["extract-emoji", "remove-diacritics"] },
  { id: "extract-emoji", category: "text", name: "Extract emoji", blurb: "List the emoji characters in the text.", related: ["strip-emoji", "extract-hashtags"] },
  { id: "strip-bom", category: "text", name: "Strip BOM", blurb: "Remove a leading byte-order mark.", related: ["normalize-newlines", "trim-each-line"] },
  { id: "center-lines", category: "text", name: "Center lines", blurb: "Pad each line so it sits in a character width.", related: ["indent-lines", "wrap-text"] },
  { id: "indent-lines", category: "text", name: "Indent lines", blurb: "Add the same number of spaces before each line.", related: ["dedent-text", "tabs-to-spaces"] },
  { id: "sort-numeric", category: "text", name: "Sort numbers", blurb: "Sort lines as numbers, not as text.", related: ["sort-lines", "extract-numbers"] },
  { id: "reverse-each-line", category: "text", name: "Reverse each line", blurb: "Reverse the characters on every line.", related: ["reverse-lines", "reverse-text"] },
  { id: "char-codes", category: "text", name: "Character codes", blurb: "Show a Unicode code point for each character.", related: ["unicode-escape", "character-counter"] },
  { id: "nfc-form", category: "text", name: "NFC normalize", blurb: "Normalize text to Unicode NFC.", related: ["remove-diacritics", "normalize-newlines"] },
  { id: "speaking-pace", category: "text", name: "Speaking time", blurb: "Estimate spoken minutes at 130 words per minute.", related: ["reading-time", "word-counter"] },
  { id: "unwrap-lines", category: "text", name: "Unwrap lines", blurb: "Join wrapped lines into paragraphs.", related: ["join-lines", "wrap-text"] },
  { id: "keep-letters", category: "text", name: "Keep letters", blurb: "Drop digits and symbols and keep letters.", related: ["remove-punctuation", "extract-numbers"] },
  { id: "line-lengths", category: "text", name: "Line lengths", blurb: "Count characters on each line.", related: ["count-lines", "longest-line"] },
  { id: "duplicate-words", category: "text", name: "Repeated words", blurb: "List words that appear more than once.", related: ["word-frequency", "unique-words"] },
  { id: "trim-each-line", category: "text", name: "Trim lines", blurb: "Trim spaces at both ends of every line.", related: ["whitespace-cleaner", "remove-empty-lines"] },
  { id: "collapse-spaces", category: "text", name: "Collapse spaces", blurb: "Turn runs of spaces into a single space.", related: ["whitespace-cleaner", "trim-each-line"] },
  { id: "base32-encode", category: "developer", name: "Base32 encode", blurb: "Encode text as RFC 4648 base32.", related: ["base64", "hex-encode"] },
  { id: "base32-decode", category: "developer", name: "Base32 decode", blurb: "Decode RFC 4648 base32 back to text.", related: ["base32-encode", "hex-decode"] },
  { id: "json-to-csv", category: "developer", name: "JSON to CSV", blurb: "Turn a JSON array of objects into CSV.", related: ["csv-json", "json-formatter"] },
  { id: "csv-to-tsv", category: "developer", name: "CSV to TSV", blurb: "Replace CSV commas with tabs.", related: ["tsv-to-csv", "lines-to-csv"] },
  { id: "html-unescape", category: "developer", name: "HTML unescape", blurb: "Turn common HTML entities back into characters.", related: ["html-entities", "xml-unescape"] },
  { id: "xml-unescape", category: "developer", name: "XML unescape", blurb: "Decode XML entities such as &lt; and &amp;.", related: ["xml-escape", "html-unescape"] },
  { id: "sql-quote", category: "developer", name: "SQL quote", blurb: "Wrap text as a single-quoted SQL string.", related: ["sql-formatter", "json-escape"] },
  { id: "utf8-bytes", category: "developer", name: "UTF-8 bytes", blurb: "Count the UTF-8 bytes in the text.", related: ["character-counter", "unicode-escape"] },
  { id: "text-data-uri", category: "developer", name: "Text data URI", blurb: "Build a text/plain data URI.", related: ["image-to-base64", "url-codec"] },
  { id: "octal-encode", category: "developer", name: "Octal encode", blurb: "Show each byte as octal.", related: ["binary-encode", "hex-encode"] },
  { id: "octal-decode", category: "developer", name: "Octal decode", blurb: "Decode space-separated octal bytes.", related: ["octal-encode", "hex-decode"] },
  { id: "string-xor", category: "developer", name: "XOR hex", blurb: "XOR the text with a key and print hex. This is not encryption.", related: ["hex-encode", "hash-line"] },
  { id: "semver-major", category: "developer", name: "Semver major", blurb: "Read the major number from a version.", related: ["semver-compare", "semver-bump"] },
  { id: "port-check", category: "developer", name: "Port class", blurb: "Say whether a port is system, registered, or ephemeral.", related: ["port-from-url", "ipv4-validate"] },
  { id: "ua-browser", category: "developer", name: "Browser from UA", blurb: "Read a common browser name from a user-agent string.", related: ["url-parser", "mime-to-ext"] },
  { id: "mime-to-ext", category: "developer", name: "MIME to extension", blurb: "Map a common MIME type to a file extension.", related: ["ext-to-mime", "mime-guess"] },
  { id: "ext-to-mime", category: "developer", name: "Extension to MIME", blurb: "Map a file extension to a common MIME type.", related: ["mime-to-ext", "file-extension"] },
  { id: "text-equal", category: "developer", name: "Compare strings", blurb: "Check whether two strings are exactly equal.", related: ["text-diff", "levenshtein"] },
  { id: "random-id", category: "generators", name: "Random id", blurb: "Build a stable id from a length and a seed.", related: ["uuid-generator", "password-generator"] },
  { id: "css-clamp", category: "developer", name: "CSS clamp", blurb: "Write a CSS clamp() from min, preferred, and max.", related: ["px-to-rem", "rem-to-px"] },
  { id: "rem-to-px", category: "converters", name: "Rem to px", blurb: "Convert rem to pixels using a root size.", related: ["px-to-rem", "px-to-pt"] },
  { id: "json-types", category: "developer", name: "JSON types", blurb: "List the JSON type of each top-level field.", related: ["json-keys", "json-validator"] },
  { id: "unique-json-array", category: "developer", name: "Unique JSON array", blurb: "Drop duplicate values from a JSON array.", related: ["json-array-length", "json-formatter"] },
  { id: "percent-change", category: "calculators", name: "Percent change", blurb: "Percent change from a start value to a new value.", related: ["percentage", "roi-calculator"] },
  { id: "percent-of", category: "calculators", name: "Percent of", blurb: "Take a percent of a number.", related: ["percentage", "percent-change"] },
  { id: "split-bill", category: "calculators", name: "Split a bill", blurb: "Divide a total by a number of people.", related: ["tip-calculator", "unit-price"] },
  { id: "margin-markup", category: "calculators", name: "Margin to markup", blurb: "Convert a margin percent into a markup percent.", related: ["profit-margin", "percentage"] },
  { id: "modulo", category: "calculators", name: "Modulo", blurb: "Remainder after division.", related: ["nth-power", "round-number"] },
  { id: "nth-power", category: "calculators", name: "Power", blurb: "Raise a number to an exponent.", related: ["square-root", "modulo"] },
  { id: "square-root", category: "calculators", name: "Square root", blurb: "Square root of a non-negative number.", related: ["nth-power", "log10"] },
  { id: "log10", category: "calculators", name: "Log10", blurb: "Base-10 logarithm.", related: ["square-root", "nth-power"] },
  { id: "run-pace", category: "calculators", name: "Run pace", blurb: "Minutes per kilometer from time and distance.", related: ["speed", "unit-price"] },
  { id: "work-hours", category: "calculators", name: "Work hours", blurb: "Hours between two clock times on the same day.", related: ["clock-difference", "add-clock"] },
  { id: "simple-inflation", category: "calculators", name: "Simple inflation", blurb: "Apply one percent change to an amount. Not a forecast.", related: ["percent-change", "roi-calculator"] },
  { id: "loan-payment", category: "calculators", name: "Loan payment", blurb: "Monthly payment from principal, annual rate, and years. Not lending advice.", related: ["loan-calculator", "compound-interest"] },
  { id: "add-weeks", category: "date-time", name: "Add weeks", blurb: "Add or subtract whole weeks from a date.", related: ["add-days", "add-months"] },
  { id: "seconds-hms", category: "date-time", name: "Seconds to H:M:S", blurb: "Turn a second count into hours, minutes, and seconds.", related: ["hms-seconds", "duration"] },
  { id: "hms-seconds", category: "date-time", name: "H:M:S to seconds", blurb: "Turn H:MM:SS into a second count.", related: ["seconds-hms", "duration"] },
  { id: "week-of-month", category: "date-time", name: "Week of month", blurb: "Which week of the month a date falls in.", related: ["iso-week", "weekday-of"] },
  { id: "unix-day", category: "date-time", name: "Unix day", blurb: "Days since 1970-01-01 for a calendar date.", related: ["unix-timestamp", "date-difference"] },
  { id: "hours-between", category: "date-time", name: "Hours between", blurb: "Hours between two date-times.", related: ["date-difference", "clock-difference"] },
  { id: "og-title-tags", category: "seo", name: "OG title tags", blurb: "Draft og:title and og:url meta tags to copy.", related: ["og-preview", "meta-tag-generator"] },
  { id: "keyword-count", category: "seo", name: "Keyword count", blurb: "Count exact copies of one keyword.", related: ["keyword-density", "word-frequency"] },
  { id: "slug-ok", category: "seo", name: "Slug check", blurb: "Check that a slug is lowercase words and hyphens.", related: ["slug-generator", "slug-from-url"] },
  { id: "robots-line", category: "seo", name: "Robots line", blurb: "Write one Allow or Disallow line.", related: ["robots-txt-generator", "robots-path-test"] },
  { id: "image-sepia", category: "images", name: "Sepia image", blurb: "Tint a PNG or JPG toward sepia in this tab.", related: ["image-grayscale", "image-invert"], file: true },
  { id: "image-invert", category: "images", name: "Invert image", blurb: "Invert the colors of a PNG or JPG in this tab.", related: ["image-sepia", "image-grayscale"], file: true },
];

export const WAVE3_TOOL_IDS = SPECS.map((spec) => spec.id);
export const WAVE3_EN_LABELS: Record<string, string> = Object.fromEntries(SPECS.map((spec) => [spec.id, spec.name]));

export const wave3Tools: EnTool[] = SPECS.map((spec) =>
  t({
    id: spec.id,
    category: spec.category,
    tags: [spec.category, spec.id.split("-")[0]],
    featured: false,
    inputTypes: spec.file ? ["file"] : ["text"],
    outputTypes: spec.file ? ["file", "text"] : ["text"],
    maxFileSize: spec.file ? 12_000_000 : 0,
    supportedFormats: spec.file ? ["png", "jpg", "webp"] : ["text"],
    relatedTools: [...spec.related],
    runtime: { kind: "wave", action: spec.id },
    copyEn: {
      name: spec.name,
      title: `${spec.name} in your browser`,
      description: `${spec.blurb} Runs in this tab. Freela does not upload the input.`,
      h1: spec.name,
      intro: `${spec.blurb} Output stays on this device. This is a utility, not professional, legal, tax or medical advice.`,
      howTo: ["Add the input or choose a file.", "Run the action.", "Copy or download the result from this tab."],
      faq: [
        { question: "Does this upload my input?", answer: "No. This tool is LOCAL_ONLY in the browser." },
        { question: "Is this professional advice?", answer: "No. Verify important numbers and text yourself." },
      ],
      privacy: spec.file ? privacyFiles.en : privacyText.en,
      formats: spec.file
        ? "PNG, JPG, or WebP stays in this tab. The download is a PNG."
        : "Input stays in this tab. Output is text you copy here.",
      examples: [`Try ${spec.name} with a typical value.`, "Try empty input to see the error."],
    },
  }),
);

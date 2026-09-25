import type { ToolDefinition } from "../schema";
import { privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-24";
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
    deletion: "Text is kept only in memory for this tab.",
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

export const textDevSeoTools: EnTool[] = [
  t({
    id: "word-counter",
    category: "text",
    tags: ["text", "count"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["character-counter", "text-statistics", "whitespace-cleaner"],
    runtime: { kind: "text-stats", action: "words" },
    copyEn: {
      name: "Word counter",
      title: "Count words and sentences in text",
      description:
        "Get a live word, sentence and paragraph count as you type. Counting uses locale-aware segmentation where the browser supports it.",
      h1: "Word counter",
      intro:
        "Paste a draft and see words, characters, sentences and reading time. Nothing is stored after you leave the page.",
      howTo: [
        "Paste or type your text.",
        "Read the counters above the editor.",
        "Copy the original text when you are done.",
      ],
      faq: [
        {
          question: "How is a word defined?",
          answer:
            "We split on Unicode letter sequences. Hyphenated compounds count as one word. This matches common writing tools, not publishing house style books.",
        },
        {
          question: "What reading speed do you assume?",
          answer: "About 200 words per minute, a common silent-reading estimate for English.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: plain text. Output: counts on screen.",
      examples: [
        "Check an essay is under a 1,500-word limit.",
        "Estimate speaking time for a short script.",
      ],
    },
  }),
  t({
    id: "character-counter",
    category: "text",
    tags: ["text", "count"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["word-counter", "slug-generator", "meta-tag-generator"],
    runtime: { kind: "text-stats", action: "chars" },
    copyEn: {
      name: "Character counter",
      title: "Count characters with and without spaces",
      description:
        "Measure characters, spaces and lines for bios, ads and SMS. Useful next to a 160-character or 70-character title limit.",
      h1: "Character counter",
      intro:
        "Type in the box to see total characters, characters without spaces, and line count. Limits are visual only; we do not post to any network.",
      howTo: [
        "Paste the snippet you need to measure.",
        "Compare with your platform’s limit.",
        "Trim in the same box until it fits.",
      ],
      faq: [
        {
          question: "Are emojis one character?",
          answer:
            "We report JavaScript string length and a separate Unicode code-point count so you can see surrogate pairs.",
        },
        {
          question: "Do you count HTML tags?",
          answer: "Yes, as characters. Strip tags first if you need visible-text length only.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: plain text. Output: counts.",
      examples: [
        "Fit a meta description under 160 characters.",
        "Keep a social bio inside a 160-character cap.",
      ],
    },
  }),
  t({
    id: "case-converter",
    category: "text",
    tags: ["text", "case"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["slug-generator", "whitespace-cleaner", "word-counter"],
    runtime: { kind: "text-transform", action: "case" },
    copyEn: {
      name: "Case converter",
      title: "Convert text to upper, lower and title case",
      description:
        "Switch casing without a word processor. Title case uses simple English rules, not a full editorial style guide.",
      h1: "Case converter",
      intro:
        "Paste text and choose UPPER, lower, Title Case, Sentence case or invert. Conversion is instant and local.",
      howTo: [
        "Paste the text.",
        "Pick a casing mode.",
        "Copy the converted result.",
      ],
      faq: [
        {
          question: "Does title case skip small words?",
          answer:
            "A short English stop-word list is skipped in the middle of a phrase. Other languages should use lower/upper instead.",
        },
        {
          question: "Will Turkish dotted I be handled?",
          answer:
            "We use locale-aware toLocaleUpperCase when your selected Freela language is Turkish.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: plain text.",
      examples: [
        "Normalize a shouty pasted heading.",
        "Build title case for an English blog H1.",
      ],
    },
  }),
  t({
    id: "remove-duplicate-lines",
    category: "text",
    tags: ["text", "dedupe"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt", "csv"],
    relatedTools: ["sort-lines", "whitespace-cleaner", "text-statistics"],
    runtime: { kind: "text-transform", action: "dedupe-lines" },
    copyEn: {
      name: "Remove duplicate lines",
      title: "Delete duplicate lines from a list",
      description:
        "Keep the first occurrence of each line. Optional case-insensitive mode helps clean mixed exports.",
      h1: "Remove duplicate lines",
      intro:
        "Paste logs, emails or SKU lists. Duplicates are dropped in order so the first copy wins.",
      howTo: [
        "Paste one item per line.",
        "Toggle case-insensitive matching if needed.",
        "Copy the unique list.",
      ],
      faq: [
        {
          question: "Are blank lines removed?",
          answer: "Consecutive blanks collapse to one. Fully empty lists stay empty.",
        },
        {
          question: "Is trimming applied?",
          answer: "Trailing spaces are ignored when comparing so 'alpha ' matches 'alpha'.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: newline-separated text.",
      examples: [
        "Unique a newsletter email dump.",
        "Clean duplicate SKUs from a supplier CSV column.",
      ],
    },
  }),
  t({
    id: "sort-lines",
    category: "text",
    tags: ["text", "sort"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["remove-duplicate-lines", "whitespace-cleaner"],
    runtime: { kind: "text-transform", action: "sort-lines" },
    copyEn: {
      name: "Sort lines",
      title: "Sort lines alphabetically or numerically",
      description:
        "Order lists with locale collation. Choose A–Z, Z–A or numeric sort for version-looking strings.",
      h1: "Sort lines",
      intro:
        "Sorting uses Intl.Collator for the active Freela language so accented letters follow local expectations.",
      howTo: [
        "Paste the list.",
        "Choose ascending, descending or numeric.",
        "Copy the sorted output.",
      ],
      faq: [
        {
          question: "Is sort stable?",
          answer: "Equal lines keep their original relative order.",
        },
        {
          question: "How does numeric sort work?",
          answer:
            "Lines are compared by the first number we find. Lines without digits fall back to collation.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: newline-separated text.",
      examples: [
        "Alphabetize a glossary.",
        "Order issue IDs that look like 12, 3, 100.",
      ],
    },
  }),
  t({
    id: "slug-generator",
    category: "text",
    tags: ["text", "slug", "seo"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["case-converter", "whitespace-cleaner", "meta-tag-generator"],
    runtime: { kind: "text-transform", action: "slug" },
    copyEn: {
      name: "Slug generator",
      title: "Generate URL slugs from titles",
      description:
        "Turn a heading into a lowercase hyphenated slug. Accents are folded; punctuation is stripped.",
      h1: "URL slug generator",
      intro:
        "Paste a title to get a web-safe slug. This is for your own sites — it does not check whether the slug is already taken.",
      howTo: [
        "Enter the page title.",
        "Review the generated slug.",
        "Copy it into your CMS.",
      ],
      faq: [
        {
          question: "Do you transliterate every language?",
          answer:
            "Latin accents fold. Other scripts are omitted rather than guessed, so you can add a manual Latin slug.",
        },
        {
          question: "Can slugs start with numbers?",
          answer: "Yes. We do not force a letter prefix.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: title text. Output: kebab-case slug.",
      examples: [
        "Slug a blog title before publishing.",
        "Normalize imported product names for paths.",
      ],
    },
  }),
  t({
    id: "whitespace-cleaner",
    category: "text",
    tags: ["text", "clean"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["remove-duplicate-lines", "case-converter", "json-formatter"],
    runtime: { kind: "text-transform", action: "whitespace" },
    copyEn: {
      name: "Whitespace cleaner",
      title: "Trim and collapse extra whitespace",
      description:
        "Remove extra spaces, tabs and blank lines from pasted text. Handy after copying from PDFs or slides.",
      h1: "Whitespace cleaner",
      intro:
        "PDF copies often arrive with broken line wraps. This cleaner trims edges, squeezes inner spaces and optional blank lines.",
      howTo: [
        "Paste messy text.",
        "Choose whether to drop blank lines.",
        "Copy the cleaned version.",
      ],
      faq: [
        {
          question: "Do you join hyphenated line breaks?",
          answer:
            "Not automatically. We only normalize whitespace; hyphen repair would risk changing meaning.",
        },
        {
          question: "Are non-breaking spaces removed?",
          answer: "Yes. NBSP and other Unicode spaces become a normal space, then collapse.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: plain text.",
      examples: [
        "Clean a paragraph copied from a slide.",
        "Normalize whitespace in a CSV cell dump.",
      ],
    },
  }),
  t({
    id: "text-statistics",
    category: "text",
    tags: ["text", "stats"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["word-counter", "character-counter", "text-diff"],
    runtime: { kind: "text-stats", action: "full" },
    copyEn: {
      name: "Text statistics",
      title: "Text statistics and reading time",
      description:
        "See words, unique words, average word length and estimated reading time for a passage.",
      h1: "Text statistics",
      intro:
        "A compact dashboard for drafts. Unique-word count uses case-insensitive tokens and is meant as a writing aid, not linguistics research.",
      howTo: [
        "Paste the passage.",
        "Read the statistic cards.",
        "Edit the text to watch numbers update.",
      ],
      faq: [
        {
          question: "Do you compute readability grades?",
          answer:
            "Not in this version. Grade formulas are language-specific and easy to misread as quality scores.",
        },
        {
          question: "What is a token?",
          answer: "A run of letters or digits. Punctuation is a separator.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: plain text. Output: statistics.",
      examples: [
        "Compare two intro drafts by length and variety.",
        "Estimate how long a newsletter will take to read.",
      ],
    },
  }),
  t({
    id: "text-diff",
    category: "text",
    tags: ["text", "diff"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["whitespace-cleaner", "json-formatter", "sort-lines"],
    runtime: { kind: "text-transform", action: "diff" },
    copyEn: {
      name: "Text diff",
      title: "Compare two texts line by line",
      description:
        "Highlight lines that were added, removed or changed. The diff runs locally with a simple LCS algorithm.",
      h1: "Compare two texts",
      intro:
        "Paste an original and a revised version. Matching lines stay quiet; additions and deletions are marked. This is not a git replacement.",
      howTo: [
        "Paste the original text on the left.",
        "Paste the new text on the right.",
        "Review added and removed lines.",
      ],
      faq: [
        {
          question: "Is this a word-level diff?",
          answer: "It is line-based. Change one word and the whole line is marked as changed.",
        },
        {
          question: "How large can the inputs be?",
          answer:
            "Very large pastes may feel slow because the algorithm is quadratic. Keep samples under a few thousand lines.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: two plain texts. Output: annotated diff.",
      examples: [
        "Check what a colleague changed in a policy paragraph.",
        "Compare two JSON files after pretty-printing them.",
      ],
    },
  }),
  t({
    id: "json-formatter",
    category: "developer",
    tags: ["json", "format"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["json"],
    relatedTools: ["json-validator", "csv-json", "whitespace-cleaner"],
    runtime: { kind: "json-format", action: "format" },
    copyEn: {
      name: "JSON formatter",
      title: "Format and minify JSON in the browser",
      description:
        "Pretty-print or compact JSON with a syntax check. Invalid documents show the parser message, not a stack trace.",
      h1: "JSON formatter",
      intro:
        "Paste JSON from an API. Choose 2-space formatting or a minified line. Parsing uses JSON.parse in your browser.",
      howTo: [
        "Paste JSON.",
        "Click Format or Minify.",
        "Copy the result or fix the reported error.",
      ],
      faq: [
        {
          question: "Do you support JSON5?",
          answer: "No. Comments and trailing commas are rejected because JSON.parse does not allow them.",
        },
        {
          question: "Are keys sorted?",
          answer: "Not by default, so diffs stay stable. Sorting would hide the original key order.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: JSON text.",
      examples: [
        "Pretty-print a webhook body before filing a bug.",
        "Minify a JSON fixture for a size-sensitive embed.",
      ],
    },
  }),
  t({
    id: "json-validator",
    category: "developer",
    tags: ["json", "validate"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["json"],
    relatedTools: ["json-formatter", "csv-json", "jwt-decoder"],
    runtime: { kind: "json-format", action: "validate" },
    copyEn: {
      name: "JSON validator",
      title: "Validate JSON syntax locally",
      description:
        "Check whether a string is valid JSON. Errors mention the parser’s message without sending the payload away.",
      h1: "JSON validator",
      intro:
        "Use this when a client claims a body is JSON and a server disagrees. Success means JSON.parse accepted the text.",
      howTo: [
        "Paste the candidate string.",
        "Run Validate.",
        "Read the success state or the parser error.",
      ],
      faq: [
        {
          question: "Do you validate against a schema?",
          answer:
            "No. This is syntax only. Schema validation would need a schema you provide and is a later tool.",
        },
        {
          question: "Is a JSON number like 01 valid?",
          answer: "No. JSON does not allow leading zeros. The validator will fail.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: text. Output: valid/invalid plus message.",
      examples: [
        "Sanity-check a .json config before deploy.",
        "See why a copy-pasted object failed in a console.",
      ],
    },
  }),
  t({
    id: "csv-json",
    category: "developer",
    tags: ["csv", "json"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["csv", "json"],
    relatedTools: ["json-formatter", "sort-lines", "remove-duplicate-lines"],
    runtime: { kind: "codec", action: "csv-json" },
    copyEn: {
      name: "CSV to JSON",
      title: "Convert CSV to JSON and back",
      description:
        "Turn CSV tables into arrays of objects, or flatten JSON arrays to CSV. Parsing understands quoted commas.",
      h1: "CSV ↔ JSON converter",
      intro:
        "Paste CSV with a header row or a JSON array of objects. The converter stays in the tab and does not infer types beyond strings and numbers.",
      howTo: [
        "Paste CSV or JSON.",
        "Choose the target format.",
        "Copy the converted text.",
      ],
      faq: [
        {
          question: "Are nested objects supported?",
          answer:
            "CSV export flattens one level. Deep trees should be handled in code, not in this helper.",
        },
        {
          question: "What delimiter is used?",
          answer: "Comma. Semicolon-separated European exports should be replaced first.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input/output: CSV or JSON text.",
      examples: [
        "Turn a spreadsheet export into JSON for a prototype.",
        "Flatten a small JSON array for a colleague who wants CSV.",
      ],
    },
  }),
  t({
    id: "base64",
    category: "developer",
    tags: ["base64", "codec"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["url-codec", "image-to-base64", "hash-generator"],
    runtime: { kind: "codec", action: "base64" },
    copyEn: {
      name: "Base64 encode & decode",
      title: "Base64 encode and decode text",
      description:
        "Encode UTF-8 text to Base64 or decode it back. Invalid payloads show an error instead of mojibake.",
      h1: "Base64 encoder",
      intro:
        "Uses the browser’s encoding APIs. This is for text snippets, not for wrapping secrets into emails.",
      howTo: [
        "Paste the source text or Base64.",
        "Choose encode or decode.",
        "Copy the output.",
      ],
      faq: [
        {
          question: "Is this encryption?",
          answer:
            "No. Base64 is an encoding. Anyone can decode it. Do not treat it as a confidentiality control.",
        },
        {
          question: "Do you support URL-safe Base64?",
          answer: "Decoding accepts - and _. Encoding uses the standard alphabet with padding.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: text.",
      examples: [
        "Decode a Basic auth demo string in a tutorial.",
        "Encode a UTF-8 snippet for a data attribute.",
      ],
    },
  }),
  t({
    id: "url-codec",
    category: "developer",
    tags: ["url", "encode"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["base64", "html-entities", "slug-generator"],
    runtime: { kind: "codec", action: "url" },
    copyEn: {
      name: "URL encode & decode",
      title: "URL-encode and decode query strings",
      description:
        "Apply encodeURIComponent or decodeURIComponent to a string. Handy when a parameter contains spaces or Unicode.",
      h1: "URL encoder",
      intro:
        "Encode a value before placing it in a query string, or decode a copied parameter. This does not fetch the URL.",
      howTo: [
        "Paste the value or encoded token.",
        "Choose encode or decode.",
        "Copy the result into your request.",
      ],
      faq: [
        {
          question: "Is this encodeURI or encodeURIComponent?",
          answer:
            "encodeURIComponent, which also encodes &, ?, and = so values are safe inside a query.",
        },
        {
          question: "Will you request the URL?",
          answer: "Never. There is no HTTP client in this tool.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: text.",
      examples: [
        "Encode a search term that contains ampersands.",
        "Decode a copied utm_campaign value.",
      ],
    },
  }),
  t({
    id: "html-entities",
    category: "developer",
    tags: ["html", "entities"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["html", "txt"],
    relatedTools: ["url-codec", "whitespace-cleaner"],
    runtime: { kind: "codec", action: "html-entities" },
    copyEn: {
      name: "HTML entities",
      title: "Encode and decode HTML entities",
      description:
        "Escape <, > and & for safe HTML text nodes, or decode entities back to characters.",
      h1: "HTML entity encoder",
      intro:
        "Use encode when you need to show markup as text. Decoding uses the browser’s HTML parser on a detached element.",
      howTo: [
        "Paste the text or entity string.",
        "Choose encode or decode.",
        "Copy the transformed text.",
      ],
      faq: [
        {
          question: "Does this sanitize scripts?",
          answer:
            "Encoding makes tags visible as text. It is not a full HTML sanitizer for untrusted rich content.",
        },
        {
          question: "Are numeric entities supported?",
          answer: "Decoding understands named and numeric entities that the browser understands.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input and output: text.",
      examples: [
        "Escape a snippet before putting it in a blog as code.",
        "Decode an RSS title that still contains &amp;.",
      ],
    },
  }),
  t({
    id: "uuid-generator",
    category: "developer",
    tags: ["uuid", "generator"],
    featured: true,
    inputTypes: ["none"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["password-generator", "random-string", "hash-generator"],
    runtime: { kind: "generator", action: "uuid" },
    copyEn: {
      name: "UUID generator",
      title: "Generate UUID version 4 identifiers",
      description:
        "Create RFC 4122 version 4 UUIDs with crypto.getRandomValues. Nothing is logged.",
      h1: "UUID generator",
      intro:
        "Click to mint one or many v4 UUIDs. These are random IDs, not sequential database keys and not a proof of identity.",
      howTo: [
        "Choose how many IDs you need.",
        "Generate the list.",
        "Copy them into your fixture or form.",
      ],
      faq: [
        {
          question: "Is this UUID v1?",
          answer: "No. Only version 4 random UUIDs, which do not embed a MAC address.",
        },
        {
          question: "Can collisions happen?",
          answer:
            "They are astronomically unlikely for typical app volumes. Still, treat uniqueness as a probability, not a law of physics.",
        },
      ],
      privacy: privacyText.en,
      formats: "Output: hyphenated UUID strings.",
      examples: [
        "Fill test databases with primary keys.",
        "Mint a request ID for a local mock server.",
      ],
    },
  }),
  t({
    id: "hash-generator",
    category: "developer",
    tags: ["hash", "sha"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["base64", "jwt-decoder", "password-generator"],
    runtime: { kind: "hash", action: "digest" },
    copyEn: {
      name: "Hash generator",
      title: "SHA-256 and SHA-1 hashes in the browser",
      description:
        "Hash text with Web Crypto. Use it for checksums, not for storing passwords — that needs a slow salted KDF.",
      h1: "Hash generator",
      intro:
        "Paste text to get hexadecimal SHA-256, SHA-384, SHA-512 or SHA-1. SHA-1 is provided only for legacy checksums.",
      howTo: [
        "Enter the text to hash.",
        "Select an algorithm.",
        "Copy the hex digest.",
      ],
      faq: [
        {
          question: "Do you hash files?",
          answer: "This version hashes UTF-8 text. File checksums can follow without uploading bytes.",
        },
        {
          question: "Is SHA-1 safe?",
          answer:
            "No for signatures or passwords. It remains useful to compare with old published checksums.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: text. Output: hex digest.",
      examples: [
        "Compare a published SHA-256 checksum for a snippet.",
        "Build a cache key from a canonical string.",
      ],
    },
  }),
  t({
    id: "regex-tester",
    category: "developer",
    tags: ["regex"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["text-diff", "slug-generator", "json-validator"],
    runtime: { kind: "regex", action: "test" },
    copyEn: {
      name: "Regex tester",
      title: "Test JavaScript regular expressions",
      description:
        "Run a pattern against sample text and see matches. Invalid patterns fail with the engine’s error message.",
      h1: "Regular expression tester",
      intro:
        "Uses the JavaScript RegExp engine in your browser. There is no server-side PCRE and no catastrophic-backtracking protection beyond a match cap.",
      howTo: [
        "Enter a pattern and optional flags.",
        "Paste sample text.",
        "Inspect matches and capture groups.",
      ],
      faq: [
        {
          question: "Are lookbehinds supported?",
          answer: "If your browser’s JS engine supports them. We do not polyfill older engines.",
        },
        {
          question: "Can a regex freeze the tab?",
          answer:
            "Pathological patterns can. We stop after a bounded number of matches; we cannot fully sandbox the engine.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: pattern plus text. Output: match list.",
      examples: [
        "Debug an email-like pattern before putting it in a form.",
        "Extract issue IDs from a paste of commit messages.",
      ],
    },
  }),
  t({
    id: "jwt-decoder",
    category: "developer",
    tags: ["jwt"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["jwt", "txt"],
    relatedTools: ["base64", "json-formatter", "hash-generator"],
    runtime: { kind: "jwt", action: "decode" },
    copyEn: {
      name: "JWT decoder",
      title: "Decode JWT header and payload locally",
      description:
        "Inspect non-secret sample JWTs. Signatures are displayed, not verified, and tokens are never sent to Freela.",
      h1: "JWT decoder",
      intro:
        "Paste a three-part token from a tutorial or a staging app. We Base64-decode header and payload only. Do not paste production secrets.",
      howTo: [
        "Paste a JWT with three segments.",
        "Read the JSON header and payload.",
        "Treat the signature as opaque bytes.",
      ],
      faq: [
        {
          question: "Do you verify signatures?",
          answer:
            "No. Verification would need keys we should not collect. Use this only to inspect claims on sample tokens.",
        },
        {
          question: "What if the payload is encrypted?",
          answer: "JWE is not supported. Only compact JWS-style three-part tokens are decoded.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: JWT string. Output: JSON header and payload.",
      examples: [
        "Inspect exp and sub on a documentation example token.",
        "See whether a staging token still uses HS256.",
      ],
    },
  }),
  t({
    id: "meta-tag-generator",
    category: "seo",
    tags: ["seo", "meta"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["html"],
    relatedTools: ["serp-preview", "robots-txt-generator", "hreflang-generator"],
    runtime: { kind: "seo", action: "meta" },
    copyEn: {
      name: "Meta tag generator",
      title: "Generate title and Open Graph meta tags",
      description:
        "Build title, description and basic Open Graph tags from fields you type. It does not fetch or rewrite live pages.",
      h1: "Meta tag generator",
      intro:
        "Fill title, description and canonical URL to copy a snippet. Character counts are guidance, not a ranking promise.",
      howTo: [
        "Enter title, description and URL.",
        "Copy the generated HTML tags.",
        "Paste them into your document head.",
      ],
      faq: [
        {
          question: "Will this rank my page?",
          answer:
            "No. Tags help crawlers understand a URL. Rankings depend on the page and on search systems we do not control.",
        },
        {
          question: "Do you include fake ratings?",
          answer: "Never. Structured data for reviews is omitted unless you have real reviews.",
        },
      ],
      privacy: privacyText.en,
      formats: "Output: HTML meta tags.",
      examples: [
        "Draft tags for a new landing page.",
        "Keep title length visible while you write.",
      ],
    },
  }),
  t({
    id: "robots-txt-generator",
    category: "seo",
    tags: ["seo", "robots"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["meta-tag-generator", "hreflang-generator", "serp-preview"],
    runtime: { kind: "seo", action: "robots" },
    copyEn: {
      name: "robots.txt generator",
      title: "Create a simple robots.txt file",
      description:
        "Emit a robots.txt with allow/disallow paths you list. It does not crawl your site or prove what Google will fetch.",
      h1: "robots.txt generator",
      intro:
        "Add a sitemap URL and paths to keep out of crawls, such as /admin. Review the file; a mistake can hide the whole site.",
      howTo: [
        "List paths to disallow.",
        "Optionally add a sitemap URL.",
        "Download robots.txt and host it at the site root.",
      ],
      faq: [
        {
          question: "Does robots.txt hide a URL from search?",
          answer:
            "It asks crawlers not to fetch. URLs can still appear without a snippet. Use authentication for private content.",
        },
        {
          question: "Should I disallow everything in staging?",
          answer:
            "Often yes, plus HTTP auth. This tool only writes the file; it does not deploy it.",
        },
      ],
      privacy: privacyText.en,
      formats: "Output: robots.txt text.",
      examples: [
        "Block /admin and /api on a public marketing site.",
        "Add a sitemap line for a newly launched locale.",
      ],
    },
  }),
  t({
    id: "serp-preview",
    category: "seo",
    tags: ["seo", "serp"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["meta-tag-generator", "character-counter", "slug-generator"],
    runtime: { kind: "seo", action: "serp" },
    copyEn: {
      name: "SERP snippet preview",
      title: "Preview a search snippet layout",
      description:
        "See how a title, URL and description might wrap in a generic results layout. This is not a live SERP from Google.",
      h1: "SERP snippet preview",
      intro:
        "Type a title and description to judge length and wrap. Pixel widths vary by device and search engine, so treat this as a sketch.",
      howTo: [
        "Enter title, display URL and description.",
        "Watch the preview wrap.",
        "Shorten fields that look cramped.",
      ],
      faq: [
        {
          question: "Is this what Google will show?",
          answer:
            "No. Engines rewrite titles and pick snippets. We only help you see approximate length.",
        },
        {
          question: "Do you pull live rankings?",
          answer: "No. Automated ranking scrapes are out of scope and against typical engine terms.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: title fields. Output: on-screen preview.",
      examples: [
        "Check a 60-character title still reads well.",
        "See whether a description is cut mid-sentence.",
      ],
    },
  }),
  t({
    id: "hreflang-generator",
    category: "seo",
    tags: ["seo", "hreflang"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["html"],
    relatedTools: ["meta-tag-generator", "robots-txt-generator"],
    runtime: { kind: "seo", action: "hreflang" },
    copyEn: {
      name: "hreflang generator",
      title: "Generate reciprocal hreflang link tags",
      description:
        "Build link rel=alternate hreflang tags plus x-default from a list of locale URLs you provide.",
      h1: "hreflang tag generator",
      intro:
        "Enter each language and its absolute URL. The output repeats the full set on every URL so relationships can stay reciprocal.",
      howTo: [
        "Add locale codes and absolute URLs.",
        "Mark one URL as x-default if you have a fallback.",
        "Copy the link tags into each page head.",
      ],
      faq: [
        {
          question: "Do you validate live pages?",
          answer:
            "No. Reciprocity still requires you to publish the same set on every alternate. We only format the tags.",
        },
        {
          question: "Should codes be en or en-US?",
          answer:
            "Use the code that matches the page language. Region variants are optional when content is identical.",
        },
      ],
      privacy: privacyText.en,
      formats: "Output: HTML link tags.",
      examples: [
        "Draft tags for English and German product pages.",
        "Include an x-default pointing at /en/.",
      ],
    },
  }),
];

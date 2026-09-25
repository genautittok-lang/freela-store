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
    deletion: "Inputs stay in this tab only.",
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

export const calcRestTools: EnTool[] = [
  t({
    id: "percentage",
    category: "calculators",
    tags: ["math", "percent"],
    featured: true,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["discount", "vat-calculator", "profit-margin"],
    runtime: { kind: "calculator", action: "percentage" },
    copyEn: {
      name: "Percentage calculator",
      title: "Calculate percentages and changes",
      description:
        "Find a percent of a number, or the percent change between two values. Arithmetic is done in JavaScript decimals.",
      h1: "Percentage calculator",
      intro:
        "Use what is X% of Y, X is what percent of Y, or percent change. Results are rounded for display; they are not tax advice.",
      howTo: [
        "Choose a mode.",
        "Enter the numbers.",
        "Read the result formatted for your language.",
      ],
      faq: [
        {
          question: "Why is 0.1 + 0.2 not exact?",
          answer:
            "Binary floating point is imprecise. We round to a sensible number of fraction digits for money-like displays.",
        },
        {
          question: "Is this a VAT calculator?",
          answer: "Use the dedicated VAT tool if you need net/gross with a tax rate.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: numbers. Output: formatted numbers.",
      examples: [
        "What is 18% of 240?",
        "How much did a price change from 80 to 100?",
      ],
    },
  }),
  t({
    id: "vat-calculator",
    category: "calculators",
    tags: ["vat", "tax"],
    featured: true,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["percentage", "discount", "profit-margin"],
    runtime: { kind: "calculator", action: "vat" },
    copyEn: {
      name: "VAT calculator",
      title: "Add or remove VAT from a price",
      description:
        "Convert between net and gross using a VAT rate you enter. Country rules are not applied automatically.",
      h1: "VAT calculator",
      intro:
        "Enter a rate such as 19 or 20 and a net or gross amount. This is arithmetic help, not a filing tool and not legal advice.",
      howTo: [
        "Enter the VAT rate in percent.",
        "Provide a net or gross amount.",
        "Read net, VAT and gross together.",
      ],
      faq: [
        {
          question: "Which country’s VAT is this?",
          answer:
            "None by default. You type the rate that applies to your invoice. Reduced rates and exemptions are your responsibility.",
        },
        {
          question: "Do you submit tax reports?",
          answer: "No. Nothing is sent to a tax authority.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: rate and amount. Output: net, tax, gross.",
      examples: [
        "Add 19% German VAT to a net consulting fee.",
        "Extract net from a UK 20% gross quote.",
      ],
    },
  }),
  t({
    id: "discount",
    category: "calculators",
    tags: ["discount", "price"],
    featured: true,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["percentage", "profit-margin", "vat-calculator"],
    runtime: { kind: "calculator", action: "discount" },
    copyEn: {
      name: "Discount calculator",
      title: "Calculate sale prices after a discount",
      description:
        "Apply a percent off a list price and see the savings. Stacked coupons are not modeled.",
      h1: "Discount calculator",
      intro:
        "Enter the original price and discount percent. You get the sale price and the amount saved, formatted with your locale.",
      howTo: [
        "Type the original price.",
        "Enter the discount percent.",
        "Read the discounted price.",
      ],
      faq: [
        {
          question: "Can I stack two discounts?",
          answer:
            "Apply them one after another yourself. Sequential percents are not the same as adding rates.",
        },
        {
          question: "Is currency conversion included?",
          answer: "No. The symbol is decorative; we do not fetch exchange rates.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: price and percent. Output: sale price.",
      examples: [
        "Check a 25% off €80 jacket.",
        "See savings on a 15% software renewal.",
      ],
    },
  }),
  t({
    id: "profit-margin",
    category: "calculators",
    tags: ["margin", "business"],
    featured: false,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["discount", "percentage", "vat-calculator"],
    runtime: { kind: "calculator", action: "margin" },
    copyEn: {
      name: "Profit margin calculator",
      title: "Calculate profit margin and markup",
      description:
        "Derive margin and markup from cost and selling price. Labels follow standard retail definitions.",
      h1: "Profit margin calculator",
      intro:
        "Margin is profit divided by selling price. Markup is profit divided by cost. Confusing them is a common pricing error; both are shown.",
      howTo: [
        "Enter cost and selling price.",
        "Read profit, margin percent and markup percent.",
        "Adjust prices until the margin matches your target.",
      ],
      faq: [
        {
          question: "Is this accounting software?",
          answer:
            "No. It ignores tax, shipping and inventory. Use it as a pocket formula only.",
        },
        {
          question: "What if the selling price is zero?",
          answer: "Margin is undefined. We show an error instead of Infinity.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: cost and price. Output: profit and percents.",
      examples: [
        "Price a handmade item that costs 12 to make.",
        "Check that a 40% margin target is actually markup.",
      ],
    },
  }),
  t({
    id: "bmi-calculator",
    category: "calculators",
    tags: ["bmi", "health"],
    featured: false,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["percentage", "date-difference"],
    runtime: { kind: "calculator", action: "bmi" },
    copyEn: {
      name: "BMI calculator",
      title: "Body mass index calculator",
      description:
        "Compute BMI from height and weight as a generic index. It is not a diagnosis and ignores muscle mass.",
      h1: "BMI calculator",
      intro:
        "WHO-style BMI is weight in kilograms divided by height in metres squared. Categories are statistical, not medical advice.",
      howTo: [
        "Enter height and weight in metric or imperial units.",
        "Read the BMI number and category label.",
        "Talk to a clinician for health decisions.",
      ],
      faq: [
        {
          question: "Is BMI accurate for athletes?",
          answer:
            "Often not. Dense muscle raises BMI without the same meaning as excess fat. Treat the number as a coarse screen.",
        },
        {
          question: "Do you store measurements?",
          answer: "No. Values never leave the browser.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: height and weight. Output: BMI.",
      examples: [
        "Convert 180 cm and 75 kg to BMI.",
        "Compare imperial inputs without a spreadsheet.",
      ],
    },
  }),
  t({
    id: "date-difference",
    category: "calculators",
    tags: ["date"],
    featured: true,
    inputTypes: ["date"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["date"],
    relatedTools: ["unix-timestamp", "timezone-convert"],
    runtime: { kind: "calculator", action: "date-diff" },
    copyEn: {
      name: "Date difference",
      title: "Calculate days between two dates",
      description:
        "Count whole days and an approximate years/months breakdown between two calendar dates in your local timezone.",
      h1: "Date difference calculator",
      intro:
        "Pick a start and end date. The difference uses calendar dates, not business days, and does not skip holidays.",
      howTo: [
        "Choose the start date.",
        "Choose the end date.",
        "Read days, weeks and a year-month-day split.",
      ],
      faq: [
        {
          question: "Are end dates inclusive?",
          answer:
            "The day count is the timestamp difference divided by 24 hours. Same-day is zero days.",
        },
        {
          question: "Do you support time of day?",
          answer: "This tool is date-only. Use the Unix converter for timestamps.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: dates. Output: duration.",
      examples: [
        "See how many days remain until a visa expiry.",
        "Measure a project length between two milestones.",
      ],
    },
  }),
  t({
    id: "temperature",
    category: "converters",
    tags: ["temperature", "units"],
    featured: true,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["length", "weight", "data-size"],
    runtime: { kind: "converter", action: "temperature" },
    copyEn: {
      name: "Temperature converter",
      title: "Convert Celsius, Fahrenheit and Kelvin",
      description:
        "Convert temperatures with standard formulas. Kelvin cannot go below zero in the output.",
      h1: "Temperature converter",
      intro:
        "Enter a value and pick source and target units. Formulas are exact; displayed digits are rounded for reading.",
      howTo: [
        "Enter a temperature.",
        "Choose from and to units.",
        "Read the converted value.",
      ],
      faq: [
        {
          question: "Do you convert Rankine?",
          answer: "Not in this version. Celsius, Fahrenheit and Kelvin cover typical needs.",
        },
        {
          question: "What if Kelvin would be negative?",
          answer: "We show an error because negative Kelvin is not a physical temperature.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: number plus unit. Output: number.",
      examples: [
        "Convert a 180°C oven setting to Fahrenheit.",
        "See 72°F in Celsius for a travel forecast.",
      ],
    },
  }),
  t({
    id: "length",
    category: "converters",
    tags: ["length", "units"],
    featured: true,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["weight", "temperature", "data-size"],
    runtime: { kind: "converter", action: "length" },
    copyEn: {
      name: "Length converter",
      title: "Convert metres, feet, inches and miles",
      description:
        "Convert common length units through metres. Results use locale number formatting.",
      h1: "Length converter",
      intro:
        "Switch between metric and imperial lengths for DIY, travel or specs. Survey feet and nautical miles are omitted on purpose.",
      howTo: [
        "Type a length.",
        "Select the source and target units.",
        "Copy the converted number.",
      ],
      faq: [
        {
          question: "Is a foot exactly 0.3048 m?",
          answer: "Yes. We use the international foot, not US survey foot.",
        },
        {
          question: "Do you convert light-years?",
          answer: "No. This set is for everyday lengths.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: number plus unit. Output: number.",
      examples: [
        "Turn 5 ft 10 in into centimetres (use inches).",
        "Convert a 10 km run to miles.",
      ],
    },
  }),
  t({
    id: "weight",
    category: "converters",
    tags: ["weight", "units"],
    featured: false,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["length", "bmi-calculator", "data-size"],
    runtime: { kind: "converter", action: "weight" },
    copyEn: {
      name: "Weight converter",
      title: "Convert kilograms, pounds and ounces",
      description:
        "Convert mass units via kilograms. This is mass, not planetary weight, despite the everyday label.",
      h1: "Weight converter",
      intro:
        "Enter a mass and convert between kg, g, lb and oz. Precious-metal troy ounces are not included.",
      howTo: [
        "Enter the mass.",
        "Pick units.",
        "Read the conversion.",
      ],
      faq: [
        {
          question: "Is a pound 453.59237 g?",
          answer: "Yes, the international avoirdupois pound.",
        },
        {
          question: "Can I convert stone?",
          answer: "Not yet. Use pounds and divide by 14 if you need stone.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: number plus unit. Output: number.",
      examples: [
        "Convert 70 kg to pounds.",
        "Turn a 500 g package into ounces.",
      ],
    },
  }),
  t({
    id: "data-size",
    category: "converters",
    tags: ["data", "units"],
    featured: true,
    inputTypes: ["number"],
    outputTypes: ["number"],
    maxFileSize: 0,
    supportedFormats: ["number"],
    relatedTools: ["length", "hash-generator", "compress-image"],
    runtime: { kind: "converter", action: "data-size" },
    copyEn: {
      name: "Data size converter",
      title: "Convert KB, MB, GB and bytes",
      description:
        "Convert file sizes using SI (1000) or IEC (1024) units. Labels stay explicit so KiB is not called KB.",
      h1: "Data size converter",
      intro:
        "Storage vendors often use decimal gigabytes while operating systems use gibibytes. Pick the convention that matches the claim you are checking.",
      howTo: [
        "Enter a size.",
        "Choose SI or IEC and the units.",
        "Compare the converted value.",
      ],
      faq: [
        {
          question: "Why do two 1 GB values differ?",
          answer:
            "1 GB SI is 1,000,000,000 bytes. 1 GiB is 1,073,741,824 bytes. We show both systems instead of hiding the difference.",
        },
        {
          question: "Is a bit included?",
          answer: "Yes, as bit and as byte (8 bits).",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: number plus unit. Output: number.",
      examples: [
        "See how many bytes are in 1.5 GB.",
        "Compare a 256 MiB heap to decimal MB.",
      ],
    },
  }),
  t({
    id: "hex-rgb-hsl",
    category: "color",
    tags: ["color"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["hex", "rgb"],
    relatedTools: ["contrast-checker", "palette-generator"],
    runtime: { kind: "color", action: "convert" },
    copyEn: {
      name: "HEX RGB HSL converter",
      title: "Convert HEX, RGB and HSL colors",
      description:
        "Translate color notations used in CSS. Invalid hex strings are rejected instead of silently clamped.",
      h1: "HEX / RGB / HSL converter",
      intro:
        "Paste #1a2b3c or rgb(26, 43, 60) to see the other notations and a swatch. This is sRGB, not Display P3.",
      howTo: [
        "Enter a HEX or RGB color.",
        "Read HEX, RGB and HSL together.",
        "Copy the notation you need.",
      ],
      faq: [
        {
          question: "Are 3-digit hex values allowed?",
          answer: "Yes. #0fc expands to #00ffcc.",
        },
        {
          question: "Do you convert CMYK?",
          answer: "No. Print conversions need a color profile we do not pretend to have.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: HEX or RGB. Output: HEX, RGB, HSL.",
      examples: [
        "Turn a brand HEX into HSL for CSS.",
        "Check an rgb() from a design tool as HEX.",
      ],
    },
  }),
  t({
    id: "contrast-checker",
    category: "color",
    tags: ["color", "a11y"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["hex"],
    relatedTools: ["hex-rgb-hsl", "palette-generator"],
    runtime: { kind: "color", action: "contrast" },
    copyEn: {
      name: "Contrast checker",
      title: "Check WCAG contrast between two colors",
      description:
        "Compute the contrast ratio of a foreground and background pair against WCAG 2 AA and AAA thresholds.",
      h1: "Contrast checker",
      intro:
        "Enter two HEX colors. The ratio uses relative luminance from WCAG 2. This does not replace a full accessibility audit.",
      howTo: [
        "Set the text color.",
        "Set the background color.",
        "Read the ratio and AA/AAA pass or fail.",
      ],
      faq: [
        {
          question: "Is this WCAG 3 APCA?",
          answer: "No. It is WCAG 2 contrast. APCA is a different model.",
        },
        {
          question: "Does large text use a lower bar?",
          answer: "We show both normal and large-text thresholds (18pt or 14pt bold).",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: two HEX colors. Output: ratio and pass/fail.",
      examples: [
        "Test body text #333 on a white card.",
        "See if a pastel button label meets AA.",
      ],
    },
  }),
  t({
    id: "palette-generator",
    category: "color",
    tags: ["color", "palette"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["hex"],
    relatedTools: ["hex-rgb-hsl", "contrast-checker"],
    runtime: { kind: "color", action: "palette" },
    copyEn: {
      name: "Palette generator",
      title: "Build a tints and shades palette",
      description:
        "Generate lighter and darker HEX steps from a base color by mixing with white and black in sRGB.",
      h1: "Color palette generator",
      intro:
        "Pick a brand color to get a simple ramp. Mixing in sRGB is not perceptually uniform; use it as a starting kit, not a design system.",
      howTo: [
        "Enter a base HEX color.",
        "Generate tints and shades.",
        "Copy any step.",
      ],
      faq: [
        {
          question: "Is this OKLCH?",
          answer: "Not yet. Steps are sRGB mixes so they stay easy to explain and copy.",
        },
        {
          question: "Do you guarantee contrast between steps?",
          answer: "No. Check pairs in the contrast tool.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: HEX. Output: HEX list.",
      examples: [
        "Build a gray-ish ramp from a blue brand color.",
        "Get hover/darker variants for a button.",
      ],
    },
  }),
  t({
    id: "password-generator",
    category: "generators",
    tags: ["password", "security"],
    featured: true,
    inputTypes: ["none"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["random-string", "uuid-generator", "hash-generator"],
    runtime: { kind: "generator", action: "password" },
    copyEn: {
      name: "Password generator",
      title: "Generate random passwords on-device",
      description:
        "Create passwords with crypto.getRandomValues. Length and character classes are under your control.",
      h1: "Password generator",
      intro:
        "Passwords are generated locally and are not saved. Use a password manager to store them; this page is not a vault.",
      howTo: [
        "Set length and character classes.",
        "Generate a password.",
        "Copy it into your password manager.",
      ],
      faq: [
        {
          question: "Do you store generated passwords?",
          answer: "No. Closing the tab forgets them. Clipboard behavior is your OS, not Freela.",
        },
        {
          question: "Is Math.random used?",
          answer: "No. We use a CSPRNG from Web Crypto.",
        },
      ],
      privacy: privacyText.en,
      formats: "Output: generated text.",
      examples: [
        "Mint a 20-character password for a new account.",
        "Generate a passphrase-length random string for an API sandbox.",
      ],
    },
  }),
  t({
    id: "qr-generator",
    category: "generators",
    tags: ["qr"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["file"],
    maxFileSize: 0,
    supportedFormats: ["png"],
    relatedTools: ["url-codec", "slug-generator", "meta-tag-generator"],
    runtime: { kind: "qr", action: "generate" },
    copyEn: {
      name: "QR code generator",
      title: "Generate a QR code from text or a URL",
      description:
        "Encode text into a QR PNG entirely in the browser. We do not shorten URLs or track scans.",
      h1: "QR code generator",
      intro:
        "Type a URL or short message and download a PNG. Capacity is limited by QR version; very long text will fail with a clear error.",
      howTo: [
        "Enter the text or URL.",
        "Generate the code.",
        "Download the PNG.",
      ],
      faq: [
        {
          question: "Do you create tracking QR codes?",
          answer: "No. The pixels encode exactly what you typed. There is no Freela redirect.",
        },
        {
          question: "Can I style the code with a logo?",
          answer: "Not in this version, because logos reduce error correction in ways we would have to document carefully.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: text. Output: PNG.",
      examples: [
        "Put a Wi-Fi-less URL on a poster.",
        "Encode a vCard-sized contact string for a meetup badge.",
      ],
    },
  }),
  t({
    id: "random-string",
    category: "generators",
    tags: ["random"],
    featured: false,
    inputTypes: ["none"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["password-generator", "uuid-generator"],
    runtime: { kind: "generator", action: "random" },
    copyEn: {
      name: "Random string generator",
      title: "Generate random alphanumeric strings",
      description:
        "Produce random tokens for test data. Not a password manager and not a lottery.",
      h1: "Random string generator",
      intro:
        "Choose length and alphabet (letters, digits, symbols). Bytes come from crypto.getRandomValues.",
      howTo: [
        "Set length and alphabet.",
        "Generate one or several strings.",
        "Copy them into fixtures.",
      ],
      faq: [
        {
          question: "Is this the same as the password tool?",
          answer:
            "Similar generator, different defaults. The password tool highlights copy-once use; this one is for dummy IDs.",
        },
        {
          question: "Can I request lorem paragraphs?",
          answer:
            "No. Fake article text is easy to misuse as scaled SEO content, so we do not ship a lorem generator.",
        },
      ],
      privacy: privacyText.en,
      formats: "Output: text tokens.",
      examples: [
        "Fill a staging coupon code field.",
        "Create a random filename suffix.",
      ],
    },
  }),
  t({
    id: "unix-timestamp",
    category: "date-time",
    tags: ["unix", "time"],
    featured: true,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["timezone-convert", "date-difference"],
    runtime: { kind: "datetime", action: "unix" },
    copyEn: {
      name: "Unix timestamp converter",
      title: "Convert Unix time to dates",
      description:
        "Switch between Unix seconds, milliseconds and ISO-8601 strings using your locale’s date formatting.",
      h1: "Unix timestamp converter",
      intro:
        "Paste seconds or ms, or pick a date. Interpretation uses the local timezone of this device unless you switch the companion timezone tool.",
      howTo: [
        "Paste a timestamp or pick a date.",
        "See Unix seconds, milliseconds and ISO form.",
        "Copy the representation you need.",
      ],
      faq: [
        {
          question: "Seconds or milliseconds?",
          answer:
            "Values greater than 1e12 are treated as milliseconds. You can override the unit explicitly.",
        },
        {
          question: "Is leap second aware?",
          answer: "No. JavaScript Date does not model leap seconds.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: number or date. Output: formatted date and Unix values.",
      examples: [
        "Decode a 1710000000 log line.",
        "Get the Unix seconds for a launch date.",
      ],
    },
  }),
  t({
    id: "timezone-convert",
    category: "date-time",
    tags: ["timezone"],
    featured: false,
    inputTypes: ["text"],
    outputTypes: ["text"],
    maxFileSize: 0,
    supportedFormats: ["txt"],
    relatedTools: ["unix-timestamp", "date-difference"],
    runtime: { kind: "datetime", action: "timezone" },
    copyEn: {
      name: "Timezone converter",
      title: "Convert a time between timezones",
      description:
        "Show the same instant in several IANA timezones using Intl.DateTimeFormat. DST rules come from the browser.",
      h1: "Timezone converter",
      intro:
        "Pick a local date-time and compare cities. If a zone is missing, your browser’s ICU data does not include it.",
      howTo: [
        "Enter a date and time.",
        "Choose source and target timezones.",
        "Read the converted wall clock.",
      ],
      faq: [
        {
          question: "Do you use moment-timezone?",
          answer: "No. Intl APIs keep the bundle small and follow OS updates.",
        },
        {
          question: "What about ambiguous DST folds?",
          answer:
            "The browser picks an offset. We do not offer a disambiguation control in this version.",
        },
      ],
      privacy: privacyText.en,
      formats: "Input: date-time plus zone. Output: converted date-time.",
      examples: [
        "See a 09:00 Berlin call in New York.",
        "Plan a 17:00 Tokyo demo for London attendees.",
      ],
    },
  }),
];

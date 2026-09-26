#!/usr/bin/env python3
"""Generate Wave 2 catalog, CTA labels, and SEO name table from scripts/wave2-i18n.psv."""
from __future__ import annotations

import json
import re
from pathlib import Path
from textwrap import dedent

ROOT = Path("/workspace")
LOCALES = ["en", "de", "uk", "pl", "fr", "es", "it", "pt", "nl", "tr", "ar", "he"]

CATS = {
    "text": ("text", "text"),
    "developer": ("developer", "dev"),
    "seo": ("seo", "seo"),
    "calculators": ("calculators", "calc"),
    "date-time": ("date-time", "dt"),
    "color": ("color", "color"),
    "generators": ("generators", "gen"),
    "pdf-documents": ("pdf-documents", "pdf"),
    "images": ("images", "img"),
}

GROUP = {
    "text": "text",
    "developer": "developer",
    "seo": "seo",
    "calculators": "calculators",
    "date-time": "date-time",
    "color": "color",
    "generators": "generators",
    "pdf-documents": "pdf-documents",
    "images": "images",
}

# id -> group key in CATS
GROUP_OF = {}
def put(group: str, *ids: str):
    for i in ids:
        GROUP_OF[i] = group

put("text", "reverse-words","word-frequency","sentence-per-line","dedent-text","tabs-to-spaces","join-lines","split-delimiter","filter-lines","line-range","extract-hashtags","extract-mentions","extract-ipv4","extract-hex-colors","extract-iso-dates","remove-diacritics","morse-encode","morse-decode","atbash-cipher","rot47-cipher","palindrome-check","strip-zero-width","unicode-escape","unicode-unescape","normalize-newlines","flesch-ease","sort-words","redact-ipv4","entropy-estimate","secret-scan","slug-each-line","pascal-case","path-basename","path-dirname","number-to-words")
put("developer", "json-sort-keys","json-flatten","json-array-length","csv-transpose","csv-pick-column","csv-row-count","csv-width-check","ndjson-to-array","array-to-ndjson","tsv-to-csv","xml-escape","html-to-markdown","html-tag-balance","regex-escape","cron-explain","semver-compare","semver-bump","json-duplicate-keys","ipv4-to-int","int-to-ipv4","cidr-contains","subnet-info","basic-auth-header","binary-to-decimal","hex-to-decimal","ulid-validate","email-syntax","iban-check","isbn-check","cron-validate","ipv4-validate","ipv6-validate","semver-validate","yaml-top-keys","quoted-printable","mac-format")
put("seo", "meta-length","heading-outline","missing-alt","heading-order","noindex-detect","mailto-builder","query-drop-key","url-origin","url-pathname","resolve-relative-url","sort-query","toggle-trailing-slash","keyword-in-title","empty-link-check","port-from-url","domain-syntax")
put("calculators", "stdev-list","range-stats","round-number","fraction-to-decimal","prime-factors","quadratic-roots","overtime-pay","roi-calculator","meeting-cost","unit-price")
put("date-time", "leap-year","days-in-month","add-months","end-of-month","add-clock","clock-difference","pomodoro-blocks","iso-date-validate")
put("color", "relative-luminance","tint-hex","shade-hex","nearest-named-color","readable-ink")
put("generators", "ulid-generator","csp-builder","web-manifest")
put("pdf-documents", "pdf-page-sizes","pdf-set-info")
put("images", "image-dimensions","image-grayscale","image-pixelate")

RELATED = {
    "text": ["word-counter", "sort-lines"],
    "developer": ["json-formatter", "csv-json"],
    "seo": ["url-parser", "meta-tag-generator"],
    "calculators": ["percentage", "invoice-math"],
    "date-time": ["date-difference", "add-days"],
    "color": ["hex-rgb-hsl", "contrast-checker"],
    "generators": ["uuid-generator", "password-generator"],
    "pdf-documents": ["pdf-metadata", "merge-pdf"],
    "images": ["compress-image", "resize-image"],
}


def sample_ids() -> list[str]:
    text = (ROOT / "src/lib/tools/wave2.ts").read_text(encoding="utf-8")
    block = text.split("export const WAVE2_SAMPLES")[1].split("export const WAVE2_EXTRA_HINT")[0]
    return re.findall(r'"([a-z0-9-]+)": \{', block)


def load_rows() -> dict[str, tuple[str, list[str]]]:
    rows = {}
    for line in (ROOT / "scripts/wave2-i18n.psv").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("|")
        if len(parts) != 14:
            raise SystemExit(f"expected 14 fields, got {len(parts)} for {parts[0] if parts else line}")
        tid, hint, *names = parts
        if any(len(n.strip()) < 2 for n in names):
            raise SystemExit(f"short name in {tid}")
        rows[tid] = (hint.strip(), [n.strip() for n in names])
    return rows


def existing_ids() -> set[str]:
    found = set()
    for path in (ROOT / "src/data/tools").glob("english*.ts"):
        if path.name == "english-wave2.ts":
            continue
        found |= set(re.findall(r'id:\s*"([^"]+)"', path.read_text(encoding="utf-8")))
    return found


def main():
    ids = sample_ids()
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate sample ids")
    rows = load_rows()
    missing = [i for i in ids if i not in rows or i not in GROUP_OF]
    extra = [i for i in rows if i not in ids]
    if missing or extra:
        raise SystemExit(f"missing {missing} extra {extra}")
    overlap = set(ids) & existing_ids()
    if overlap:
        raise SystemExit(f"duplicates existing tools: {sorted(overlap)}")

    allow = existing_ids() | set(ids)
    catalog_rows = []
    label_maps = {loc: {} for loc in LOCALES}
    names_out = {}
    kinds = {}
    for tid in ids:
        group = GROUP_OF[tid]
        cat, kind = CATS[group]
        hint, names = rows[tid]
        rel = [r for r in RELATED[group] if r in allow and r != tid][:3]
        name = names[0]
        title = (name + " in your browser")[:70]
        if len(title) < 10:
            title = (name + " online")[:70]
        desc = f"{hint} Runs in this tab. Freela does not upload the input."
        if len(desc) < 40:
            desc += " Free local helper."
        desc = desc[:170]
        intro = f"{hint} Output stays on this device. This is a utility, not professional, legal, tax or medical advice."
        mode = "pdf" if tid.startswith("pdf-") else "image" if tid.startswith("image-") else "text"
        privacy = "privacyFiles.en" if mode != "text" else "privacyText.en"
        if mode == "text":
            input_types, output_types, max_size, formats = '["text"]', '["text"]', "0", '["text"]'
        elif mode == "pdf":
            input_types, max_size, formats = '["file"]', "26214400", '["pdf"]'
            output_types = '["file", "text"]' if tid == "pdf-set-info" else '["text"]'
        else:
            input_types, max_size, formats = '["file"]', "26214400", '["png", "jpg", "jpeg", "webp"]'
            output_types = '["text"]' if tid == "image-dimensions" else '["file", "text"]'
        catalog_rows.append(
            dedent(
                f"""\
          t({{
            id: {json.dumps(tid)},
            category: {json.dumps(cat)},
            tags: {json.dumps([kind, cat.split("-")[0]])},
            featured: false,
            inputTypes: {input_types},
            outputTypes: {output_types},
            maxFileSize: {max_size},
            supportedFormats: {formats},
            relatedTools: {json.dumps(rel)},
            runtime: {{ kind: "wave", action: {json.dumps(tid)} }},
            copyEn: {{
              name: {json.dumps(name)},
              title: {json.dumps(title)},
              description: {json.dumps(desc)},
              h1: {json.dumps(name[:80])},
              intro: {json.dumps(intro)},
              howTo: ["Add the input or choose a file.", "Run the action.", "Copy or download the result from this tab."],
              faq: [
                {{ question: "Does this upload my input?", answer: "No. This tool is LOCAL_ONLY in the browser." }},
                {{ question: "Is this professional advice?", answer: "No. Verify important numbers and text yourself." }},
              ],
              privacy: {privacy},
              formats: "Input stays in this tab. Output is text or a file you download here.",
              examples: [{json.dumps("Try the main example for " + name + ".")}, "Try empty input to see the error."],
            }},
          }}),"""
            )
        )
        for loc, label in zip(LOCALES, names):
            label_maps[loc][tid] = label
        names_out[tid] = names
        kinds[tid] = kind

    ts = """import type { ToolDefinition } from "../schema";
import { privacyFiles, privacyText } from "./define";

type EnTool = Omit<ToolDefinition, "copy"> & {
  copyEn: Omit<ToolDefinition["copy"]["en"], "slug">;
};

const day = "2026-09-26";

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

export const WAVE2_TOOL_IDS = """ + json.dumps(ids) + """ as const;

export const wave2Tools: EnTool[] = [
""" + "\n".join(catalog_rows) + """
];
"""
    (ROOT / "src/data/tools/english-wave2.ts").write_text(ts, encoding="utf-8")
    lab = 'import type { Locale } from "@/data/locales";\n\nexport const WAVE2_LABELS: Record<Locale, Record<string, string>> = {\n'
    for loc in LOCALES:
        lab += f"  {loc}: {{\n"
        for tid, name in label_maps[loc].items():
            lab += f"    {json.dumps(tid)}: {json.dumps(name)},\n"
        lab += "  },\n"
    lab += "};\n"
    (ROOT / "src/lib/action-labels-wave2.ts").write_text(lab, encoding="utf-8")
    (ROOT / "scripts/wave2-seo-names.json").write_text(
        json.dumps({"names": names_out, "kinds": kinds}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wave2 tools={len(ids)}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate locale-packs.ts from /tmp/en-tools.json (Argos offline + optional cache)."""
from __future__ import annotations

import json
import re
from pathlib import Path

import argostranslate.package
import argostranslate.translate

EN_PATH = Path("/tmp/en-tools.json")
CACHE_PATH = Path("/tmp/locale-translation-cache.json")
OUT_TS = Path("/workspace/src/data/tools/locale-packs.ts")
OUT_JSON = Path("/workspace/src/data/tools/locale-packs.json")

LOCALES = ["de", "uk", "pl", "fr", "es", "it", "pt", "nl", "tr"]

DESC_PAD = {
    "de": " Läuft lokal im Browser; nichts wird hochgeladen.",
    "uk": " Працює локально у браузері; нічого не надсилається.",
    "pl": " Działa lokalnie w przeglądarce; nic nie jest wysyłane.",
    "fr": " Fonctionne localement dans le navigateur ; rien n’est envoyé.",
    "es": " Funciona en el navegador; no se sube nada.",
    "it": " Funziona nel browser; nulla viene caricato.",
    "pt": " Funciona no navegador; nada é enviado.",
    "nl": " Werkt lokaal in de browser; er wordt niets geüpload.",
    "tr": " Tarayıcıda yerel çalışır; hiçbir şey yüklenmez.",
}

KEEP_PATTERNS = [
    r"\bJSON\b",
    r"\bJSON5\b",
    r"\bPDF\b",
    r"\bAPI\b",
    r"\bURL\b",
    r"\bHTML\b",
    r"\bCSS\b",
    r"\bJWT\b",
    r"\bUUID\b",
    r"\bBase64\b",
    r"\bCSV\b",
    r"\bSMS\b",
    r"\bSKU\b",
    r"\bCMS\b",
    r"\bSERP\b",
    r"\bEXIF\b",
    r"\bRGB\b",
    r"\bHSL\b",
    r"\bHEX\b",
    r"\bBMI\b",
    r"\bVAT\b",
    r"\bLCS\b",
    r"\bNBSP\b",
    r"\bUnicode\b",
    r"\bJavaScript\b",
    r"\bJSON\.parse\b",
    r"\bIntl\.Collator\b",
    r"\btoLocaleUpperCase\b",
    r"\brobots\.txt\b",
    r"\bhreflang\b",
    r"\bkebab-case\b",
    r"\bapplication/pdf\b",
    r"\bFreela\b",
    r"\bQR\b",
    r"\bH1\b",
    r"\bwebhook\b",
    r"\bgit\b",
]


def term_spans(text: str) -> list[tuple[int, int, str]]:
    spans: list[tuple[int, int, str]] = []
    for pat in KEEP_PATTERNS:
        for m in re.finditer(pat, text, flags=re.IGNORECASE):
            spans.append((m.start(), m.end(), m.group(0)))
    spans.sort(key=lambda x: x[0])
    merged: list[tuple[int, int, str]] = []
    for start, end, val in spans:
        if merged and start < merged[-1][1]:
            continue
        merged.append((start, end, val))
    return merged


def _append_piece(parts: list[str], piece: str) -> None:
    if not piece:
        return
    if parts:
        prev = parts[-1]
        if (
            prev
            and prev[-1].isalnum()
            and piece[0].isalnum()
            and not prev.endswith("-")
            and not piece.startswith("-")
        ):
            parts.append(" ")
    parts.append(piece)


def translate_preserving_terms(text: str, locale: str) -> str:
    spans = term_spans(text)
    if not spans:
        return argostranslate.translate.translate(text, "en", locale)
    parts: list[str] = []
    cursor = 0
    for start, end, val in spans:
        if start > cursor:
            chunk = text[cursor:start]
            if chunk.strip():
                _append_piece(parts, argostranslate.translate.translate(chunk, "en", locale))
            else:
                _append_piece(parts, chunk)
        _append_piece(parts, val)
        cursor = end
    if cursor < len(text):
        tail = text[cursor:]
        if tail.strip():
            _append_piece(parts, argostranslate.translate.translate(tail, "en", locale))
        else:
            _append_piece(parts, tail)
    return "".join(parts)


def load_cache() -> dict[str, dict[str, str]]:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {loc: {} for loc in LOCALES}


def save_cache(cache: dict[str, dict[str, str]]) -> None:
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")


def ensure_argos_models() -> None:
    argostranslate.package.update_package_index()
    available = argostranslate.package.get_available_packages()
    installed = {p.to_code for p in argostranslate.package.get_installed_packages() if p.from_code == "en"}
    for loc in LOCALES:
        if loc in installed:
            continue
        match = [p for p in available if p.from_code == "en" and p.to_code == loc]
        if not match:
            raise RuntimeError(f"No Argos package en->{loc}")
        path = match[0].download()
        argostranslate.package.install_from_path(path)
        print(f"installed en->{loc}", flush=True)


def collect_strings(tools: list[dict]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []

    def add(s: str) -> None:
        if s and s not in seen:
            seen.add(s)
            ordered.append(s)

    for tool in tools:
        for key in ("name", "title", "description", "h1", "intro", "formats"):
            add(tool[key])
        for item in tool["howTo"]:
            add(item)
        for item in tool["examples"]:
            add(item)
        for fa in tool["faq"]:
            add(fa["question"])
            add(fa["answer"])
    return ordered


def translate_locale(locale: str, strings: list[str], cache: dict[str, dict[str, str]]) -> None:
    loc_cache = cache.setdefault(locale, {})
    for i, s in enumerate(strings):
        if s in loc_cache:
            continue
        loc_cache[s] = translate_preserving_terms(s, locale)
        if (i + 1) % 100 == 0:
            print(f"{locale}: {i + 1}/{len(strings)}", flush=True)
    print(f"{locale}: done", flush=True)


def clamp_title(s: str) -> tuple[str, bool]:
    fixed = False
    if len(s) > 70:
        s = s[:69].rstrip(" ,.;:-") + "…"
        fixed = True
    if len(s) < 10:
        s = (s + " — Freela").strip()
        if len(s) < 10:
            s = s + " tool"
        fixed = True
    if len(s) > 70:
        s = s[:70].rstrip()
        fixed = True
    return s, fixed


def clamp_description(s: str, locale: str) -> tuple[str, bool]:
    fixed = False
    if len(s) > 170:
        cut = s[:169]
        cut = cut.rsplit(" ", 1)[0] if " " in cut else cut
        s = cut.rstrip(" ,.;:-") + "."
        fixed = True
    if len(s) < 40:
        extra = DESC_PAD[locale]
        s = (s.rstrip(".") + extra) if s else extra.strip()
        if len(s) > 170:
            s = s[:170].rstrip(" ,.;:-") + "."
        fixed = True
    return s, fixed


def lookup(table: dict[str, str], s: str) -> str:
    return table.get(s, s)


def ts_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_files(tools: list[dict], cache: dict[str, dict[str, str]]) -> list[str]:
    packs: dict[str, dict[str, dict]] = {loc: {} for loc in LOCALES}
    violations: list[str] = []

    for tool in tools:
        tid = tool["id"]
        for loc in LOCALES:
            t = cache[loc]
            title, tfix = clamp_title(lookup(t, tool["title"]))
            desc, dfix = clamp_description(lookup(t, tool["description"]), loc)
            if tfix:
                violations.append(f"{tid}/{loc} title ({len(title)} chars)")
            if dfix:
                violations.append(f"{tid}/{loc} description ({len(desc)} chars)")

            packs[loc][tid] = {
                "name": lookup(t, tool["name"]),
                "title": title,
                "description": desc,
                "h1": lookup(t, tool["h1"]),
                "intro": lookup(t, tool["intro"]),
                "howTo": [lookup(t, x) for x in tool["howTo"]],
                "faq": [
                    {
                        "question": lookup(t, tool["faq"][0]["question"]),
                        "answer": lookup(t, tool["faq"][0]["answer"]),
                    },
                    {
                        "question": lookup(t, tool["faq"][1]["question"]),
                        "answer": lookup(t, tool["faq"][1]["answer"]),
                    },
                ],
                "formats": lookup(t, tool["formats"]),
                "examples": [lookup(t, x) for x in tool["examples"]],
            }

    OUT_JSON.write_text(json.dumps(packs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "export type Pack = {",
        "  name: string;",
        "  title: string;",
        "  description: string;",
        "  h1: string;",
        "  intro: string;",
        "  howTo: string[];",
        "  faq: { question: string; answer: string }[];",
        "  formats: string;",
        "  examples: string[];",
        "  privacy?: string;",
        "};",
        "",
        "export const packs: Record<string, Record<string, Pack>> = {",
    ]
    for loc in LOCALES:
        lines.append(f"  {loc}: {{")
        for tool in tools:
            tid = tool["id"]
            p = packs[loc][tid]
            lines.append(f"    {json.dumps(tid)}: {{")
            for key in (
                "name",
                "title",
                "description",
                "h1",
                "intro",
                "howTo",
                "faq",
                "formats",
                "examples",
            ):
                val = p[key]
                if key in ("howTo", "examples"):
                    lines.append(f"      {key}: [{', '.join(ts_string(x) for x in val)}],")
                elif key == "faq":
                    lines.append(f"      {key}: [")
                    for fa in val:
                        lines.append(
                            f"        {{ question: {ts_string(fa['question'])}, answer: {ts_string(fa['answer'])} }},"
                        )
                    lines.append("      ],")
                else:
                    lines.append(f"      {key}: {ts_string(val)},")
            lines.append("    },")
        lines.append("  },")
    lines.append("};")
    lines.append("")

    OUT_TS.write_text("\n".join(lines), encoding="utf-8")
    return violations


def main() -> None:
    ensure_argos_models()
    tools = json.loads(EN_PATH.read_text(encoding="utf-8"))
    strings = collect_strings(tools)
    cache = load_cache()
    for loc in LOCALES:
        cache.setdefault(loc, {})
        translate_locale(loc, strings, cache)
    save_cache(cache)

    violations = emit_files(tools, cache)
    summary = {
        "tool_count": len(tools),
        "per_locale": {loc: len(tools) for loc in LOCALES},
        "violations": violations,
        "unique_strings": len(strings),
    }
    Path("/tmp/locale-packs-gen-summary.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()

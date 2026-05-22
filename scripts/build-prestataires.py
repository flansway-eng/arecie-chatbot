#!/usr/bin/env python3
"""
Génère public/prestataires.json depuis FICHIER MED'INOVA.pdf (réseau ASMAR/WTW).
Source : archive WhatsApp « ASMAR INFORMATIONS G1 » — liste officielle ~811 prestataires.
"""

from __future__ import annotations

import json
import os
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / "public" / "prestataires.json"
DATA_PDF = ROOT / "data" / "FICHIER MEDINOVA.pdf"
DEFAULT_ZIP = Path(
    "/mnt/c/Users/DELL USER/Downloads/Discussion WhatsApp avec ASMAR INFORMATIONS G1.zip"
)

TYPE_MAP = [
    ("RADIOLOGIE/LABORATOIRE", "LABORATOIRE"),
    ("CENTRE DE SOINS", "CENTRE DE SOINS"),
    ("CABINET DENTAIRE", "CENTRE DE SOINS"),
    ("CARDIOLOGIE", "CENTRE DE SOINS"),
    ("RHUMATOLOGIE", "CENTRE DE SOINS"),
    ("LABORATOIRE", "LABORATOIRE"),
    ("PHARMACIE", "PHARMACIE"),
    ("OPTIQUE", "OPTIQUE"),
]

ALLOWED = {"CENTRE DE SOINS", "PHARMACIE", "LABORATOIRE", "OPTIQUE"}
TYPE_PATTERN = "|".join(re.escape(p) for p, _ in TYPE_MAP)
TYPE_TO_MAPPED = {p: m for p, m in TYPE_MAP}

ENTRY_RE = re.compile(
    rf"(.+?)\s+({TYPE_PATTERN})\s+"
    rf"([A-ZÉÈÊÎÏÔÙÄÀÂÇ][A-ZÉÈÊÎÏÔÙÄÀÂÇ0-9\-/'\.\s]*?)"
    rf"(?=\s+(?:{TYPE_PATTERN})\s+|$)",
    re.IGNORECASE,
)

OUI_RE = re.compile(
    r"(CLINIQUE[\w\s\-'/\.]+?|CABINET[\w\s\-'/\.]+?|CENTRE[\w\s\-'/\.]+?|"
    r"NOUVELLE PHARMACIE[\w\s\-'/\.]+?|PHARMACIE[\w\s\-'/\.]+?|"
    r"ESPACE[\w\s\-'/\.]+?|KINE[\w\s\-'/\.]+?|LABORATOIRE[\w\s\-'/\.]+?|"
    r"ATLANTIQUE[\w\s\-'/\.]+?|OCEAN[\w\s\-'/\.]+?|ONO[\w\s\-'/\.]+?|"
    r"OPTIC[\w\s\-'/\.]+?|VOIR[\w\s\-'/\.]+?|VISEO[\w\s\-'/\.]+?|"
    r"REEL[\w\s\-'/\.]+?|CENTRAL PHARMA[\w\s\-'/\.]+?|LÈ[\w\s\-'/\.]+?)"
    r"\s+OUI\s+"
    r"([A-Z0-9ÉÈÊÎÏÔÙÄ\-/'\. ]+?)"
    r"(?=\s+(?:CLINIQUE|CABINET|CENTRE|PHARMACIE|NOUVELLE|ESPACE|KINE|LABORATOIRE|"
    r"ATLANTIQUE|OCEAN|ONO|OPTIC|VOIR|VISEO|REEL|CENTRAL|LÈ)\s|\s*$)",
    re.IGNORECASE,
)


def extract_pdf(zip_path: Path | None) -> str:
    import pypdf

    pdf_path = DATA_PDF
    if zip_path and zip_path.exists():
        DATA_PDF.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_path) as zf:
            for name in zf.namelist():
                if "MED" in name.upper() and name.lower().endswith(".pdf"):
                    pdf_path.write_bytes(zf.read(name))
                    break

    if not pdf_path.exists():
        raise FileNotFoundError(
            f"PDF introuvable : {pdf_path}. Copier FICHIER MED'INOVA.pdf dans data/ "
            f"ou définir ASMAR_ZIP vers l'archive WhatsApp."
        )

    reader = pypdf.PdfReader(str(pdf_path))
    return "".join(page.extract_text() or "" for page in reader.pages)


def infer_type_from_name(nom: str) -> str:
    u = nom.upper()
    if "PHARMACIE" in u:
        return "PHARMACIE"
    if "OPTIQUE" in u or "VISION" in u or "LUNET" in u:
        return "OPTIQUE"
    if "LABORATOIRE" in u or "BIOLOGI" in u:
        return "LABORATOIRE"
    return "CENTRE DE SOINS"


def map_type(raw: str) -> str:
    return TYPE_TO_MAPPED.get(raw.upper(), infer_type_from_name(raw))


def is_valid_nom(nom: str) -> bool:
    if len(nom) < 4:
        return False
    if nom in {"/", "&", "-"}:
        return False
    if re.fullmatch(r"[\d\sE]+", nom):
        return False
    if nom.startswith("/") and len(nom) < 20:
        return False
    if re.fullmatch(r"[A-Z]{1,5}", nom) and "PHARMACIE" not in nom and "CLINIQUE" not in nom:
        return False
    return True


def parse_typed_line(line: str) -> list[dict[str, str]]:
    entries = []
    for nom, raw_type, commune in ENTRY_RE.findall(line):
        nom = re.sub(r"\s+", " ", nom.strip())
        commune = re.sub(r"\s+", " ", commune.strip())
        if commune.upper().startswith("OUI "):
            commune = commune[4:].strip()
        if not is_valid_nom(nom):
            continue
        entries.append(
            {
                "nom": nom.upper(),
                "type": map_type(raw_type),
                "commune": commune.upper(),
            }
        )
    return entries


def parse_oui_line(line: str) -> list[dict[str, str]]:
    entries = []
    for m in OUI_RE.finditer(line):
        nom = m.group(1).strip()
        commune = m.group(2).strip()
        if any(p in nom.upper() for p, _ in TYPE_MAP):
            continue
        if not is_valid_nom(nom):
            continue
        entries.append(
            {
                "nom": nom.upper(),
                "type": infer_type_from_name(nom),
                "commune": commune.upper(),
            }
        )
    return entries


def normalize_line(line: str) -> str:
    """Corrige les lignes fusionnées par l'extraction PDF."""
    line = line.replace(
        "COCODYIRIS OPTIQUE ABIDJAN",
        "COCODY IRIS OPTIQUE ABIDJAN",
    )
    line = re.sub(r"\s+OUI\s+OUI\s+", " OUI ", line)
    return line


def build_prestataires(text: str) -> list[dict[str, str]]:
    lines = [
        normalize_line(ln.strip())
        for ln in text.splitlines()
        if ln.strip() and not ln.strip().startswith("LES CENTRES")
    ]

    all_entries: list[dict[str, str]] = []
    has_type = lambda ln: bool(re.search(TYPE_PATTERN, ln, re.IGNORECASE))

    for line in lines:
        if has_type(line):
            all_entries.extend(parse_typed_line(line))
        elif " OUI " in line:
            all_entries.extend(parse_oui_line(line))

    # Lignes mixtes : compléter avec entrées OUI si présentes
    for line in lines:
        if has_type(line) and " OUI " in line:
            all_entries.extend(parse_oui_line(line))

    seen: set[tuple[str, str, str]] = set()
    unique: list[dict[str, str]] = []
    for p in all_entries:
        if p["type"] not in ALLOWED:
            continue
        key = (p["nom"], p["type"], p["commune"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(p)

    unique.sort(key=lambda x: x["nom"])
    return unique


def main() -> None:
    zip_path = Path(os.environ.get("ASMAR_ZIP", str(DEFAULT_ZIP)))
    text = extract_pdf(zip_path if zip_path.exists() else None)
    prestataires = build_prestataires(text)

    OUT_PATH.write_text(
        json.dumps(prestataires, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"✅ {len(prestataires)} prestataires → {OUT_PATH}")


if __name__ == "__main__":
    main()

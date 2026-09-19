#!/usr/bin/env python3
"""Convert a Scopus CSV export into data/publications.json for this website.

Usage (needs only Python 3, no extra packages):
    python3 tools/scopus_to_json.py path/to/scopus_export.csv
    python3 tools/scopus_to_json.py export.csv --out data/publications.json --updated 2026-09-15

In Scopus: tick your documents, choose Export, CSV, and include at least the citation
information (authors, title, year, source title, volume, issue, pages, cited by) and the
bibliographical information (DOI, document type, publication stage). Abstract and author
keywords are optional; they are used when the export has them.

Papers that are already in the output file keep what you edited by hand (areas, featured,
pdf, url, abstract, keywords). New papers are added and filed under a research theme
with the keyword rules below. Edit the rules to change how papers are filed, then run again
with --reclassify to file every paper with the new rules.
"""
import argparse, csv, json, re, sys
from datetime import date
from pathlib import Path

# ---- How papers are filed under research themes: a paper gets every theme whose pattern
# ---- matches its TITLE. The theme ids must exist in data/research-areas.json.
THEME_RULES = {
    "intelligent-control": [
        r"fuzzy", r"neural", r"neuro", r"learning", r"reinforcement", r"\bdrl\b", r"madrl", r"intelligen", r"artificial",
        r"swarm", r"particle", r"\bpso", r"genetic", r"\bga\b", r"optimi[sz]", r"autotun", r"auto-adjust", r"self-tuning",
        r"data-driven", r"\bslp\b", r"type-[23]", r"\brbf\b",
    ],
    "networked-systems": [
        r"(?<!neural )network", r"multi-?agent systems?", r"consensus", r"formation", r"\bleader\b", r"topolog",
        r"event-(?:trigger|based)", r"event trigger", r"sampled-data", r"latency", r"wide-area", r"platoon", r"packet",
        r"communication", r"denial-of-service", r"\bdos\b",
    ],
    "cyber-physical-systems": [
        r"attack", r"denial-of-service", r"\bdos\b", r"cyber(?!netic)", r"secur", r"resilien", r"fault", r"platoon",
        r"vehicle", r"autonomous", r"wide-area", r"latency",
    ],
}
TYPE_MAP = {"article": "journal", "review": "journal", "letter": "journal", "note": "journal", "editorial": "journal",
            "short survey": "journal", "data paper": "journal", "conference paper": "conference",
            "conference review": "conference", "book chapter": "book-chapter", "book": "book-chapter"}
SKIP_TYPES = {"erratum", "retracted"}
KEEP_FROM_OLD = ("areas", "featured", "pdf", "url", "abstract", "keywords")


def clean(s):
    return re.sub(r"\s+", " ", (s or "").replace("\u00a0", " ")).strip()


def initials(given):
    out = []
    for token in clean(given).split(" "):
        parts = [p for p in token.split("-") if p]
        if parts:
            out.append("-".join(p[0].upper() + "." for p in parts))
    return " ".join(out)


def author_from_full(entry):
    """'Wang, Haoping (57223721530)' -> 'H. Wang'"""
    entry = re.sub(r"\s*\(\d+\)\s*$", "", clean(entry))
    if "," not in entry:
        return entry
    surname, given = entry.split(",", 1)
    ini = initials(given)
    return f"{ini} {clean(surname)}".strip()


def author_from_short(entry):
    """'Wang H.' -> 'H. Wang'"""
    m = re.match(r"^(.*?)\s+((?:[A-Z]\.?-?)+)$", clean(entry))
    if not m:
        return clean(entry)
    ini = " ".join(re.findall(r"[A-Z]\.?(?:-[A-Z]\.?)?", m.group(2))).replace("..", ".")
    ini = re.sub(r"([A-Z])(?!\.)", r"\1.", ini)
    return f"{ini} {m.group(1)}"


def authors_of(row):
    full = [a for a in (row.get("Author full names") or "").split(";") if clean(a)]
    if full:
        return [author_from_full(a) for a in full]
    return [author_from_short(a) for a in (row.get("Authors") or "").split(";") if clean(a)]


def sentence_case_if_shouting(title):
    letters = [c for c in title if c.isalpha()]
    if len(letters) > 12 and sum(c.isupper() for c in letters) / len(letters) > 0.9:
        t = title.lower()
        return t[:1].upper() + t[1:]
    return title


def clean_abstract(s):
    s = clean(s)
    if not s or s.lower().startswith("[no abstract"):
        return ""
    s = re.sub(r"^(?:©|Copyright ©?)\s*\d{4}[^.]{0,120}\.\s+", "", s)
    return re.sub(r"\s*(?:©|Copyright ©?)\s*\d{4}[^.]{0,120}\.?$", "", s).strip()


def themes_of(title):
    return [t for t, pats in THEME_RULES.items() if any(re.search(p, title, re.I) for p in pats)]


def record(row):
    dtype = clean(row.get("Document Type")).lower()
    if dtype in SKIP_TYPES:
        return None, dtype
    title = sentence_case_if_shouting(clean(row.get("Title")))
    eid = clean(row.get("EID")).split("-")[-1]
    doi = clean(row.get("DOI"))
    scopus = clean(row.get("Link")).split("?")[0]
    start, end = clean(row.get("Page start")), clean(row.get("Page end"))
    rec = {
        "id": f"s2-{eid}" if eid else "doi-" + re.sub(r"\W+", "-", doi or title)[:40],
        "year": int(float(row.get("Year") or 0)),
        "type": TYPE_MAP.get(dtype, "journal"),
        "areas": themes_of(title),
        "title": title,
        "authors": authors_of(row),
        "venue": clean(row.get("Source title")),
    }
    for key, col in (("volume", "Volume"), ("issue", "Issue")):
        v = clean(row.get(col))
        if v:
            rec[key] = re.sub(r"\.0$", "", v)
    if start and end and start != end:
        rec["pages"] = f"{start}\u2013{end}"
    elif start:
        rec["pages"] = start
    if clean(row.get("Art. No.")):
        rec["article"] = clean(row.get("Art. No."))
    if clean(row.get("Publication Stage")).lower() not in ("", "final"):
        rec["status"] = "In press"
    rec["citations"] = int(float(row.get("Cited by") or 0))
    rec["doi"] = doi
    rec["url"] = "" if doi else scopus
    if scopus:
        rec["scopus"] = scopus
    rec["pdf"] = ""
    abstract = clean_abstract(row.get("Abstract"))
    if abstract:
        rec["abstract"] = abstract
    kws = [clean(k) for k in re.split(r";", row.get("Author Keywords") or "") if clean(k)]
    if kws:
        rec["keywords"] = kws
    return rec, dtype


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", help="Scopus CSV export")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parent.parent / "data" / "publications.json"))
    ap.add_argument("--reclassify", action="store_true", help="file every paper again with the current rules (discards hand-edited areas)")
    ap.add_argument("--updated", help="date of the export, YYYY-MM-DD (default: read from the file name, else today)")
    args = ap.parse_args()
    csv.field_size_limit(10 ** 7)
    with open(args.csv, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows or "Title" not in rows[0]:
        sys.exit("This does not look like a Scopus CSV export (no 'Title' column).")

    out = Path(args.out)
    old = {}
    if out.exists():
        try:
            old = {p["id"]: p for p in json.loads(out.read_text(encoding="utf-8")).get("publications", [])}
        except Exception:
            old = {}
    recs, skipped, unknown = [], [], set()
    for r in rows:
        rec, dtype = record(r)
        if rec is None:
            skipped.append(clean(r.get("Title"))[:70]); continue
        if dtype not in TYPE_MAP:
            unknown.add(dtype)
        if rec["id"] in old:
            for k in (k for k in KEEP_FROM_OLD if not (args.reclassify and k == "areas")):
                if old[rec["id"]].get(k) not in (None, "", []):
                    rec[k] = old[rec["id"]][k]
        recs.append(rec)
    recs.sort(key=lambda p: (-p["year"], -p["citations"], p["title"].lower()))

    updated = args.updated
    if not updated:
        m = re.search(r"([A-Z][a-z]{2})_(\d{1,2})-(\d{4})", Path(args.csv).name)
        months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
        updated = f"{m.group(3)}-{months.index(m.group(1)) + 1:02d}-{int(m.group(2)):02d}" if m and m.group(1) in months else date.today().isoformat()
    doc = {"meta": {"source": "Scopus", "updated": updated,
                    "note": "Generated by tools/scopus_to_json.py from a Scopus export. Citation counts are as of the update date. "
                            "You can edit this file by hand: areas, featured, pdf, url, abstract and keywords are kept when you re-import."},
           "publications": recs}
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    themes = {t: sum(t in p["areas"] for p in recs) for t in THEME_RULES}
    print(f"Wrote {len(recs)} publications to {out}")
    print("  types:", {t: sum(p['type'] == t for p in recs) for t in sorted({p['type'] for p in recs})})
    print("  themes:", themes, "| filed under none:", sum(not p["areas"] for p in recs))
    if skipped: print("  skipped (errata/retractions):", skipped)
    if unknown: print("  document types not recognised, filed as journal:", sorted(unknown))


if __name__ == "__main__":
    main()

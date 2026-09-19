#!/usr/bin/env python3
"""Tell search engines that every page exists in English and in Thai.

Run it once you know the address where the site is published (needs only Python 3):

    python3 tools/add_seo.py https://your-user.github.io/your-repository/

It fills the "<!-- seo:start --> ... <!-- seo:end -->" spot in the <head> of all ten pages with a
canonical link and the English / Thai alternates (hreflang), and writes sitemap.xml. If the site sits at the
root of its own domain it also writes robots.txt. Run it again with another address to change it; nothing else
in the pages is touched. Afterwards, submit sitemap.xml in Google Search Console (and Bing Webmaster Tools).
"""
import argparse, re, sys
from pathlib import Path
from urllib.parse import urlparse
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index", "publications", "team", "students", "contact"]


def url(base, lang, page):
    """English pages are in the site root, Thai pages in th/. The home page is the folder itself."""
    return base + ("th/" if lang == "th" else "") + ("" if page == "index" else f"{page}.html")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("address", help="where the site is published, e.g. https://your-user.github.io/your-repository/")
    args = ap.parse_args()
    u = urlparse(args.address)
    if u.scheme not in ("http", "https") or not u.netloc:
        sys.exit("Please give the full address, starting with https://")
    base = args.address if args.address.endswith("/") else args.address + "/"

    for lang in ("en", "th"):
        for page in PAGES:
            f = ROOT / ("th" if lang == "th" else "") / f"{page}.html"
            html = f.read_text(encoding="utf-8")
            if "<!-- seo:start -->" not in html or "<!-- seo:end -->" not in html:
                sys.exit(f"{f} does not have the <!-- seo:start --> ... <!-- seo:end --> markers.")
            here, en, th = url(base, lang, page), url(base, "en", page), url(base, "th", page)
            block = "\n".join([
                f'<link rel="canonical" href="{here}">',
                f'<link rel="alternate" hreflang="en" href="{en}">',
                f'<link rel="alternate" hreflang="th" href="{th}">',
                f'<link rel="alternate" hreflang="x-default" href="{en}">',
                f'<meta property="og:url" content="{here}">',
            ])
            new = re.sub(r"<!-- seo:start -->.*?<!-- seo:end -->", lambda m: f"<!-- seo:start -->\n{block}\n<!-- seo:end -->", html, flags=re.S)
            f.write_text(new, encoding="utf-8")

    rows = []
    for lang in ("en", "th"):
        for page in PAGES:
            rows.append(f"  <url>\n    <loc>{escape(url(base, lang, page))}</loc>\n"
                        f'    <xhtml:link rel="alternate" hreflang="en" href="{escape(url(base, "en", page))}"/>\n'
                        f'    <xhtml:link rel="alternate" hreflang="th" href="{escape(url(base, "th", page))}"/>\n'
                        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{escape(url(base, "en", page))}"/>\n  </url>')
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
                                      'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(rows) + "\n</urlset>\n", encoding="utf-8")
    print(f"Updated the <head> of 10 pages and wrote sitemap.xml for {base}")
    if u.path in ("", "/"):
        (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
        print("Wrote robots.txt (the site is at the root of its domain).")
    else:
        print("No robots.txt written: search engines only read it at the root of a domain. Submit sitemap.xml in Search Console instead.")


if __name__ == "__main__":
    main()

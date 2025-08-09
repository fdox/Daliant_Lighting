#!/usr/bin/env python3
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] if '/tools/' in __file__.replace('\\','/') else pathlib.Path(__file__).resolve().parent
HTMLS = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts]

def depth_prefix(p: pathlib.Path) -> str:
    depth = len(p.parent.relative_to(ROOT).parts)
    return "" if depth == 0 else "../" * depth

def fix_html(src: str, prefix: str, in_fixtures: bool) -> str:
    x = src

    # 0) Collapse whitespace around attributes (no-op for content)
    # -- skipped to avoid altering formatting

    # 1) Stylesheet path
    x = re.sub(r'href="/styles_phase3\.css"', f'href="{prefix}styles_phase3.css"', x)
    x = re.sub(r'href="/Daliant_Lighting/styles_phase3\.css"', f'href="{prefix}styles_phase3.css"', x)
    x = re.sub(r'href="styles_phase3\.css"', f'href="{prefix}styles_phase3.css"', x) if (prefix and in_fixtures) else x
    # If we're in root and someone used ../styles_phase3.css, fix it
    if not prefix:
        x = x.replace('href="../styles_phase3.css"', 'href="styles_phase3.css"')

    # 2) Images under /images/
    x = re.sub(r'src="/images/', f'src="{prefix}images/', x)
    x = re.sub(r'src="/Daliant_Lighting/images/', f'src="{prefix}images/', x)

    # 3) Internal links to fixtures page
    #    a) Absolute -> doc-relative with correct prefix
    x = re.sub(r'href="/fixtures-page/', f'href="{prefix}fixtures-page/', x)
    x = re.sub(r'href="/Daliant_Lighting/fixtures-page/', f'href="{prefix}fixtures-page/', x)
    #    b) If we're inside fixtures-page already, trim any 'fixtures-page/' prefix to local file refs
    if in_fixtures:
        x = x.replace('href="fixtures-page/explore-fixtures.html"', 'href="explore-fixtures.html"')

    # 4) Contact (if present)
    x = re.sub(r'href="/contact\.html"', f'href="{prefix}contact.html"', x)
    x = re.sub(r'href="/Daliant_Lighting/contact\.html"', f'href="{prefix}contact.html"', x)

    # 5) Home/logo '/' -> index.html with correct prefix
    x = re.sub(r'href="/(#|")', lambda m: f'href="{prefix}index.html' + ('' if m.group(1)=='"' else '#') + '"', x)
    x = x.replace('href="/Daliant_Lighting/"', f'href="{prefix}index.html"')

    # 6) Clean double-prefixes if any
    x = x.replace(f'href="{prefix}{prefix}', f'href="{prefix}')
    x = x.replace(f'src="{prefix}{prefix}', f'src="{prefix}')

    return x

def main():
    changed = 0
    for p in HTMLS:
        old = p.read_text(encoding="utf-8", errors="ignore")
        prefix = depth_prefix(p)
        in_fixtures = (p.parent.name == "fixtures-page")
        new = fix_html(old, prefix, in_fixtures)
        if new != old:
            p.write_text(new, encoding="utf-8")
            changed += 1
            print(f"updated: {p.relative_to(ROOT)}")
    print(f"\nDone. Files changed: {changed}")

if __name__ == "__main__":
    main()

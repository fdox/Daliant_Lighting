#!/usr/bin/env python3
import os, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] if '/tools/' in __file__.replace('\\','/') else pathlib.Path(__file__).resolve().parent
HTMLS = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts]

def rel_prefix(p: pathlib.Path) -> str:
    depth = len(p.parent.relative_to(ROOT).parts)
    return "" if depth == 0 else "../" * depth

def fix_html(src: str, prefix: str) -> str:
    x = src
    x = re.sub(r'href="/styles_phase3\.css"', f'href="{prefix}styles_phase3.css"', x)
    x = re.sub(r'href="/Daliant_Lighting/styles_phase3\.css"', f'href="{prefix}styles_phase3.css"', x)
    x = re.sub(r'src="/images/', f'src="{prefix}images/', x)
    x = re.sub(r'src="/Daliant_Lighting/images/', f'src="{prefix}images/', x)
    x = re.sub(r'href="/fixtures-page/', f'href="{prefix}fixtures-page/', x)
    x = re.sub(r'href="/Daliant_Lighting/fixtures-page/', f'href="{prefix}fixtures-page/', x)
    x = re.sub(r'href="/contact\.html"', f'href="{prefix}contact.html"', x)
    x = re.sub(r'href="/Daliant_Lighting/contact\.html"', f'href="{prefix}contact.html"', x)
    x = re.sub(r'href="/(#|")', lambda m: f'href="{prefix}index.html' + ('' if m.group(1)=='"' else '#') + '"', x)
    x = x.replace('href="/Daliant_Lighting/"', f'href="{prefix}index.html"')
    x = x.replace(f'href="{prefix}{prefix}', f'href="{prefix}')
    x = x.replace(f'src="{prefix}{prefix}', f'src="{prefix}')
    return x

def main():
    changed = 0
    for p in HTMLS:
        old = p.read_text(encoding="utf-8", errors="ignore")
        new = fix_html(old, rel_prefix(p))
        if new != old:
            p.write_text(new, encoding="utf-8")
            changed += 1
            print(f"updated: {p.relative_to(ROOT)}")
    print(f"\nDone. Files changed: {changed}")

if __name__ == "__main__":
    main()

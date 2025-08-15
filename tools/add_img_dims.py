import os, sys, io
from bs4 import BeautifulSoup
from PIL import Image

root = os.getcwd()
html_files = [p.strip() for p in os.popen("git ls-files '*.html'").read().splitlines()]
changed = []

for path in html_files:
    full = os.path.join(root, path)
    with open(full, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'lxml')

    updated = False
    for img in soup.find_all('img'):
        src = (img.get('src') or '').strip()
        if not src or src.startswith(('http://','https://','data:')):
            continue
        img_path = os.path.normpath(os.path.join(os.path.dirname(full), src))
        if not os.path.exists(img_path):
            continue
        # skip if already has both
        if img.has_attr('width') and img.has_attr('height'):
            # still ensure lazy/async
            if not img.get('loading'): img['loading'] = 'lazy'
            if not img.get('decoding'): img['decoding'] = 'async'
            continue
        try:
            with Image.open(img_path) as im:
                w, h = im.size
            img['width'] = str(w)
            img['height'] = str(h)
            updated = True
        except Exception:
            pass
        if not img.get('loading'): img['loading'] = 'lazy'
        if not img.get('decoding'): img['decoding'] = 'async'

    if updated:
        with open(full, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        changed.append(path)

print("Updated:", len(changed), "files")
for c in changed: print(" -", c)

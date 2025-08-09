#!/usr/bin/env bash
set -euo pipefail

echo "→ Adding mobile header CSS to styles_phase3.css (if not already there)…"
if ! grep -q "Mobile Header Clean-up" styles_phase3.css; then
  cat >> styles_phase3.css <<'CSS'

/* =========================
   Mobile Header Clean-up
   ========================= */
header .nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px 20px;
}

.nav-primary ul,
.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.logo .logo-img,
.logo-align .logo-img {
  height: 34px;
  width: auto;
  display: block;
}

/* Hide large dropdown by default on touch */
.nav-primary .dropdown { display: none; }

/* --- Phones & small tablets --- */
@media (max-width: 768px) {
  header .nav-container {
    flex-direction: column;
    gap: 8px;
    padding: 10px 14px;
  }

  .logo,
  .logo-align {
    order: -1;               /* logo on top */
    margin: 0 auto;
  }

  .nav-primary ul,
  .nav-right {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    font-size: 14px;
    line-height: 1.2;
  }

  .nav-primary li { margin: 0; }
  .nav-primary .dropdown { display: none !important; } /* disable mega menu */
}

/* --- Very small phones --- */
@media (max-width: 420px) {
  .nav-primary ul,
  .nav-right { gap: 12px; font-size: 13px; }
}
CSS
else
  echo "  (CSS block already present — skipping append)"
fi

EXP="fixtures-page/explore-fixtures.html"

echo "→ Fixing Explore Fixtures nav link…"
# explore-fixtures_phase3.html → explore-fixtures.html
sed -i '' -E 's/href="explore-fixtures_phase3\.html"/href="explore-fixtures.html"/g' "$EXP"

echo "→ Fixing double-wrapped logo anchor in Explore Fixtures header…"
# Replace the nested <a>…<a>…</a></a> with a single anchor to ../index.html
perl -0777 -i -pe 's#<div class="logo logo-align">.*?</div>#<div class="logo logo-align">\n  <a href="../index.html"><img alt="Daliant Lighting Logo" class="logo-img" src="../images/daliant-logo-cropped.png"/></a>\n</div>#s' "$EXP"

echo "→ Normalizing Mira/Aven card links to same-folder paths…"
# ../fixture-mira_phase3.html → fixtures-mira.html
sed -i '' -E 's#href="\.\./fixture-mira_phase3\.html"#href="fixtures-mira.html"#g' "$EXP"
# ../fixture-aven.html → fixtures-aven.html
sed -i '' -E 's#href="\.\./fixture-aven\.html"#href="fixtures-aven.html"#g' "$EXP"

echo "→ Verifying hrefs…"
grep -nE 'href="fixtures-(mira|aven)\.html"' "$EXP" || true

echo "→ Git commit & push…"
git add styles_phase3.css "$EXP" || true
git commit -m "Mobile header cleanup + Explore page header/logo + Mira/Aven links normalized" || true
git push

echo "Done. Refresh your iPhone preview after ~60s:"
echo "https://fdox.github.io/Daliant_Lighting/index.html"

#!/usr/bin/env bash
set -euo pipefail

CSS="styles_phase3.css"
EXP="fixtures-page/explore-fixtures.html"
JS_DIR="scripts"
JS_FILE="$JS_DIR/mobile-nav.js"

echo "→ Ensure scripts directory exists…"
mkdir -p "$JS_DIR"

echo "→ Write mobile-nav.js (builds a mobile panel from existing navs)…"
cat > "$JS_FILE" <<'JS'
// Mobile nav toggle (Explore page)
(function(){
  function qs(sel, root){ return (root||document).querySelector(sel); }
  const container = qs('header .nav-container');
  if(!container) return;

  // Buttons (inserted by HTML patch)
  const burger = qs('.hamburger', container);
  const searchBtn = qs('.search-btn', container);
  let panel = qs('#mobileMenu');

  // Build panel content once from existing navs
  if(panel && !panel.dataset.built){
    const primary = qs('.nav-primary ul');
    const right = qs('.nav-right');
    const wrap = document.createElement('div');
    wrap.className = 'mobile-menu-inner';
    if(primary){
      const clonePrimary = primary.cloneNode(true);
      const h = document.createElement('h4'); h.textContent = 'Menu';
      wrap.appendChild(h);
      wrap.appendChild(clonePrimary);
    }
    if(right){
      const cloneRight = right.cloneNode(true);
      const h2 = document.createElement('h4'); h2.textContent = 'Quick Links';
      wrap.appendChild(h2);
      wrap.appendChild(cloneRight);
    }
    panel.appendChild(wrap);
    panel.dataset.built = '1';
  }

  function toggle(open){
    const isOpen = open!=null ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('no-scroll', isOpen);
  }

  if(burger){
    burger.addEventListener('click', ()=>toggle());
  }
  if(panel){
    panel.addEventListener('click', (e)=>{
      // close if you click backdrop
      if(e.target === panel) toggle(false);
    });
  }
  if(searchBtn){
    searchBtn.addEventListener('click', ()=>{ window.location.href = '#'; });
  }
})();
JS

echo "→ Update CSS: restore desktop logo size and add mobile menu styles…"
# If our previous 'Mobile Header Clean-up' block exists, adjust logo sizing and add panel styles.
# 1) Ensure desktop logo defaults to 48px (undo the global 34px)
if grep -qE 'logo(-align)? \.logo-img' "$CSS"; then
  # Replace any fixed 34px height outside media queries with 48px
  perl -0777 -i -pe 's/(\.logo(?:-align)? \.logo-img\s*\{\s*height:\s*)34px/\148px/gs' "$CSS" || true
fi

# 2) Add/append mobile panel and hamburger styles if not present
if ! grep -q '/* Mobile Nav Panel */' "$CSS"; then
cat >> "$CSS" <<'CSS'

/* Mobile Nav Panel */
.hamburger, .search-btn {
  display: none;
  border: 0;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  padding: 6px 8px;
  cursor: pointer;
}
.hamburger { margin-right: auto; }  /* sits left */
.search-btn { margin-left: auto; }  /* sits right */

@media (max-width: 768px) {
  /* Place buttons + center logo */
  .hamburger, .search-btn { display: inline-block; }
  header .nav-container {
    display: grid;
    grid-template-columns: 40px 1fr 40px;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
  }
  .logo, .logo-align { grid-column: 2; justify-self: center; }
  .logo .logo-img, .logo-align .logo-img { height: 34px; } /* smaller only on mobile */
  .nav-primary, .nav-right, .dropdown { display: none !important; }

  /* Panel overlay */
  #mobileMenu {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    opacity: 0;
    visibility: hidden;
    transition: opacity .2s ease, visibility .2s ease;
    z-index: 9999;
  }
  #mobileMenu.open { opacity: 1; visibility: visible; }
  #mobileMenu .mobile-menu-inner {
    position: absolute;
    top: 0; left: 0;
    width: min(85vw, 360px);
    height: 100%;
    background: #ffffff;
    padding: 18px 16px;
    overflow-y: auto;
    box-shadow: 2px 0 20px rgba(0,0,0,0.12);
  }
  #mobileMenu h4 { margin: 12px 0 8px; font-size: 14px; letter-spacing: .02em; color: #444; }
  #mobileMenu ul { list-style: none; margin: 0; padding: 0; }
  #mobileMenu li { margin: 0; }
  #mobileMenu a { display: block; padding: 10px 6px; text-decoration: none; color: #111; }
  #mobileMenu a:hover { background: #f3f3f3; }

  html.no-scroll, body.no-scroll { overflow: hidden; }
}
CSS
fi

echo "→ Patch Explore page header: add hamburger/search buttons and mobile panel + script link…"
# Insert hamburger + search buttons if missing
if ! grep -q 'class="hamburger"' "$EXP"; then
  # Put buttons right after opening nav container div
  perl -0777 -i -pe 's#(<div class="nav-container[^"]*">)#\1\n  <button class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">☰</button>\n#s' "$EXP"
fi
if ! grep -q 'class="search-btn"' "$EXP"; then
  perl -0777 -i -pe 's#(</div>\n</header>)#  <button class="search-btn" aria-label="Search">⌕</button>\n\1#s' "$EXP"
  # The above places it at the end of container grid; if layout differs, we can refit later.
fi

# Add panel container just after header if not present
if ! grep -q 'id="mobileMenu"' "$EXP"; then
  perl -0777 -i -pe 's#(</header>)#\1\n\n<div id="mobileMenu" aria-hidden="true"></div>\n#s' "$EXP"
fi

# Add script tag for mobile-nav.js before closing body if not present
if ! grep -q 'scripts/mobile-nav.js' "$EXP"; then
  perl -0777 -i -pe 's#(</body>)#  <script src="../scripts/mobile-nav.js" defer></script>\n\1#s' "$EXP"
fi

echo "→ Git commit & push…"
git add "$CSS" "$EXP" "$JS_FILE"
git commit -m "Mobile nav (Explore page): hamburger left + search right, desktop logo restored"
git push

echo "Done. Test on: https://fdox.github.io/Daliant_Lighting/fixtures-page/explore-fixtures.html"

#!/usr/bin/env bash
set -euo pipefail

HTML="index.html"
CSS="styles_phase3.css"
JS_DIR="scripts"
JS="$JS_DIR/mobile-nav-home.js"

echo "→ Back up homepage…"
cp "$HTML" index.backup.$(date +%s).html

echo "→ Ensure scripts directory…"
mkdir -p "$JS_DIR"

echo "→ Add a body class 'page-home' (used to scope mobile CSS to homepage only)…"
# If body has no class, add one; otherwise append page-home if missing
perl -0777 -i -pe 's#<body(?![^>]*class=)([^>]*)>#<body class="page-home"$1>#' "$HTML"
perl -0777 -i -pe 's#<body([^>]*?)class="([^"]*)"#<body$1class="$2 page-home"# if $1 !~ /page-home/;' "$HTML"

echo "→ Insert hamburger + search buttons into the header container (homepage only)…"
# Add hamburger after opening nav container
if ! grep -q 'class="hamburger"' "$HTML"; then
  perl -0777 -i -pe 's#(<div class="nav[^"]*container[^"]*"[^>]*>)#\1\n  <button class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenuHome">☰</button>#s' "$HTML"
fi
# Add search button before closing container div (keeps desktop unchanged)
if ! grep -q 'class="search-btn"' "$HTML"; then
  perl -0777 -i -pe 's#(</div>\s*</header>)#  <button class="search-btn" aria-label="Search">⌕</button>\n\1#s' "$HTML"
fi

echo "→ Add the mobile menu panel after the header…"
if ! grep -q 'id="mobileMenuHome"' "$HTML"; then
  perl -0777 -i -pe 's#(</header>)#\1\n\n<div id="mobileMenuHome" aria-hidden="true"></div>\n#s' "$HTML"
fi

echo "→ Add homepage mobile-nav script include…"
if ! grep -q 'scripts/mobile-nav-home.js' "$HTML"; then
  perl -0777 -i -pe 's#(</body>)#  <script src="scripts/mobile-nav-home.js" defer></script>\n\1#s' "$HTML"
fi

echo "→ Write scripts/mobile-nav-home.js…"
cat > "$JS" <<'JS'
// Homepage mobile menu (scoped to #mobileMenuHome)
(function(){
  function qs(sel, root){ return (root||document).querySelector(sel); }
  const container = qs('header .nav-container, header .header-flex, header .nav wrap');
  if(!container) return;

  const burger = qs('.hamburger', container);
  const searchBtn = qs('.search-btn', container);
  let panel = qs('#mobileMenuHome');
  if(!panel) return;

  if(!panel.dataset.built){
    const wrap = document.createElement('div');
    wrap.className = 'mobile-menu-inner';
    const primary = qs('.nav-primary ul');
    const right = qs('.nav-right');

    if(primary){
      const h = document.createElement('h4'); h.textContent = 'Menu';
      wrap.appendChild(h);
      wrap.appendChild(primary.cloneNode(true));
    }
    if(right){
      const h2 = document.createElement('h4'); h2.textContent = 'Quick Links';
      wrap.appendChild(h2);
      // Convert links to a vertical list
      const ul = document.createElement('ul');
      right.querySelectorAll('a').forEach(a=>{
        const li = document.createElement('li'); const c=a.cloneNode(true);
        li.appendChild(c); ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }
    panel.appendChild(wrap);
    panel.dataset.built = '1';
  }

  function toggle(open){
    const isOpen = open!=null ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', isOpen);
    burger?.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('no-scroll', isOpen);
  }

  burger?.addEventListener('click', ()=>toggle());
  panel.addEventListener('click', (e)=>{ if(e.target===panel) toggle(false); });
  searchBtn?.addEventListener('click', ()=>{ window.location.href = '#'; });
})();
JS

echo "→ Append homepage-scoped mobile CSS (desktop untouched)…"
if ! grep -q '/* Homepage Mobile Header */' "$CSS"; then
cat >> "$CSS" <<'CSS'

/* Homepage Mobile Header */
@media (max-width: 768px) {
  .page-home .hamburger,
  .page-home .search-btn {
    display: inline-block;
    border: 0;
    background: transparent;
    font-size: 26px;
    line-height: 1;
    padding: 6px 8px;
    cursor: pointer;
  }
  .page-home header .nav-container,
  .page-home header .header-flex {
    display: grid;
    grid-template-columns: 40px 1fr 40px; /* burger | logo | search */
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
  }
  .page-home .logo,
  .page-home .logo-align { grid-column: 2; justify-self: center; }
  .page-home .nav-primary,
  .page-home .nav-right,
  .page-home .dropdown { display: none !important; } /* hide big menus on mobile only */
  .page-home .logo .logo-img,
  .page-home .logo-align .logo-img { height: 34px; } /* logo size ONLY on mobile homepage */

  /* Slide-over panel */
  .page-home #mobileMenuHome {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    opacity: 0; visibility: hidden;
    transition: opacity .2s ease, visibility .2s ease;
    z-index: 9999;
  }
  .page-home #mobileMenuHome.open { opacity: 1; visibility: visible; }
  .page-home #mobileMenuHome .mobile-menu-inner {
    position: absolute; top: 0; left: 0;
    width: min(85vw, 360px); height: 100%;
    background: #fff; padding: 18px 16px; overflow-y: auto;
    box-shadow: 2px 0 20px rgba(0,0,0,0.12);
  }
  .page-home #mobileMenuHome h4 { margin: 12px 0 8px; font-size: 14px; color: #444; }
  .page-home #mobileMenuHome ul { list-style: none; margin: 0; padding: 0; }
  .page-home #mobileMenuHome li { margin: 0; }
  .page-home #mobileMenuHome a { display: block; padding: 10px 6px; text-decoration: none; color: #111; }
  .page-home #mobileMenuHome a:hover { background: #f3f3f3; }

  html.no-scroll, body.no-scroll { overflow: hidden; }
}
CSS
fi

echo "→ Commit & push…"
git add "$HTML" "$CSS" "$JS"
git commit -m "Homepage: mobile header (hamburger + centered logo + search), desktop untouched"
git push

echo "Done. Test on phone: https://fdox.github.io/Daliant_Lighting/index.html"

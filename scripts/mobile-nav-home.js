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

/* ========= A11Y PATCH: mobile menu (dialog semantics + focus trap) =========
   - Watches the hamburger's aria-expanded, so it won't conflict with existing JS
   - Applies role="dialog" aria-modal, toggles aria-hidden on the panel
   - Traps focus while open, Esc closes (by "clicking" the toggle)
   - Restores focus to the hamburger on close
   - If an overlay exists (.mobile-nav-overlay or [data-mobile-nav-overlay]), clicking it closes
============================================================================= */
(function () {
  var toggle =
    document.querySelector('[data-mobile-nav-toggle]') ||
    document.querySelector('.mobile-nav-toggle') ||
    document.querySelector('#mobileMenuButton') ||
    document.querySelector('.hamburger') ||
    document.querySelector('[aria-label*="menu" i]');

  if (!toggle) { console.warn('[mobile a11y] No mobile menu toggle found.'); return; }

  function resolvePanel() {
    var id = toggle.getAttribute('aria-controls');
    return (id && document.getElementById(id)) ||
           document.querySelector('[data-mobile-nav-panel]') ||
           document.querySelector('.mobile-nav-panel') ||
           document.querySelector('#mobileNav');
  }

  var panel = resolvePanel();
  if (!panel) { console.warn('[mobile a11y] No mobile menu panel found.'); return; }

  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden', 'true');

  if (!toggle.hasAttribute('aria-controls')) {
    if (!panel.id) panel.id = 'mobile-nav-panel';
    toggle.setAttribute('aria-controls', panel.id);
  }
  if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

  var lastFocused = null;
  var focusableSel = [
    'a[href]','area[href]','input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])','textarea:not([disabled])',
    'button:not([disabled])','[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function isOpen(){ return toggle.getAttribute('aria-expanded') === 'true'; }

  function openPanel(){
    lastFocused = document.activeElement;
    panel.setAttribute('aria-hidden', 'false');
    var f = panel.querySelectorAll(focusableSel);
    if (f.length) f[0].focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closePanel(){
    panel.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    if (typeof toggle.focus === 'function') toggle.focus();
  }

  function onKeydown(e){
    if (e.key === 'Escape' || e.key === 'Esc'){
      if (isOpen()) { e.preventDefault(); toggle.click(); }
      return;
    }
    if (e.key === 'Tab'){
      var f = panel.querySelectorAll(focusableSel);
      if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }

  var mo = new MutationObserver(function(rs){
    rs.forEach(function(r){
      if (r.attributeName === 'aria-expanded'){ isOpen() ? openPanel() : closePanel(); }
    });
  });
  mo.observe(toggle, { attributes: true });

  var overlay = document.querySelector('.mobile-nav-overlay, [data-mobile-nav-overlay]');
  if (overlay) overlay.addEventListener('click', function(){ if (isOpen()) toggle.click(); });

  var lastWidth = window.innerWidth;
  window.addEventListener('resize', function(){
    var now = window.innerWidth;
    if ((lastWidth < 1024 && now >= 1024) || (lastWidth >= 1024 && now < 1024)){
      if (isOpen()) toggle.click();
    }
    lastWidth = now;
  });
})();

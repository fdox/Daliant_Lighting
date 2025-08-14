/* =========================================================================
   Header UI (production)
   - Mobile: hamburger (left), centered logo, login icon (right).
   - Desktop: Contact sits just left of Login icon (far right).
   - Desktop Search: pill input (no icon button); expands LEFT on focus.
   - Panel menu: Explore Fixtures, About, Blog, Search, Contact
   - A11y: dialog semantics, Esc/overlay close, focus trap
   ======================================================================= */
(function () {
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function q(sel,root){ return (root||document).querySelector(sel); }
  function qa(sel,root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function norm(s){ return (s||'').toLowerCase().replace(/\s+/g,' ').trim(); }

  ready(function(){
    var d=document, b=d.body;
    var header = q('header') || b;
    var headerBox = q('.nav-container', header) || q('.header-flex', header) || header;
    var right = q('.nav-right', headerBox) || (function(){ var r=d.createElement('div'); r.className='nav-right'; headerBox.appendChild(r); return r; })();

    /* ---------- Overlay ---------- */
    var overlay = q('.mobile-nav-overlay');
    if (!overlay){ overlay = d.createElement('div'); overlay.className='mobile-nav-overlay'; overlay.setAttribute('aria-hidden','true'); b.appendChild(overlay); }

    /* ---------- Panel ---------- */
    var panel = q('[data-mobile-nav-panel]') || q('.mobile-nav-panel') || q('#mobile-nav-panel');
    if (!panel){
      panel = d.createElement('aside');
      panel.className='mobile-nav-panel'; panel.id='mobile-nav-panel';
      panel.setAttribute('data-mobile-nav-panel',''); panel.setAttribute('aria-hidden','true');
      header.parentNode.insertBefore(panel, header.nextSibling);
    }
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true');

    /* ---------- Build panel menu ---------- */
    var desired = ['Explore Fixtures','About','Blog','Search','Contact'];
    var anchors = qa('nav a, .nav-right a', header);
    function hrefFor(label){
      var L=norm(label);
      for (var i=0;i<anchors.length;i++){ if (norm(anchors[i].textContent)===L) return anchors[i].getAttribute('href')||'#'; }
      return '#';
    }
    var navWrap = q('nav', panel) || (function(){ var w=d.createElement('nav'); panel.innerHTML=''; panel.appendChild(w); return w; })();
    var ul = q('ul', navWrap); if(!ul){ ul=d.createElement('ul'); ul.style.listStyle='none'; ul.style.margin='0'; ul.style.padding='0'; navWrap.appendChild(ul); }
    ul.innerHTML='';
    desired.forEach(function(label){
      var li=d.createElement('li'), a=d.createElement('a');
      a.textContent=label; a.href=hrefFor(label); a.setAttribute('role','menuitem'); a.style.display='block'; a.style.padding='10px 6px';
      li.appendChild(a); ul.appendChild(li);
    });

    /* ---------- Desktop: Search as pill input (no magnifier) ---------- */
    // Remove any old "Search" link and/or toggle button UI
    var oldSearchLink = (function(){ var links=qa('a', right); for(var i=0;i<links.length;i++){ if(norm(links[i].textContent)==='search') return links[i]; } return null; })();
    var searchCtrl = q('.search-control', right);
    if (!searchCtrl){
      searchCtrl = d.createElement('div');
      searchCtrl.className = 'search-control';
      right.insertBefore(searchCtrl, right.firstChild);
    }
    if (oldSearchLink) oldSearchLink.remove();
    searchCtrl.innerHTML = '<input class="search-input" type="search" placeholder="Search…" aria-label="Search">';

    /* ---------- Desktop: Login icon rightmost; Contact just left of it ---------- */
    function findByText(parent, txt){
      var L=norm(txt); var links=qa('a', parent);
      for(var i=0;i<links.length;i++){ if(norm(links[i].textContent)===L) return links[i]; }
      return null;
    }
    var loginAnchor = (function(){ var links=qa('a', right); for (var i=0;i<links.length;i++){ var t=norm(links[i].textContent); if(t==='log in'||t==='login'||t==='sign in') return links[i]; } return null; })();
    var loginHref = loginAnchor ? (loginAnchor.getAttribute('href')||'#') : '#';
    var loginIcon = q('.nav-right .login-icon-btn', headerBox);
    var loginSvg = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14z"/></svg>';

    if (!loginIcon){
      if (loginAnchor){ loginAnchor.classList.add('icon-btn','login-icon-btn'); loginAnchor.setAttribute('aria-label','Log in'); loginAnchor.innerHTML=loginSvg; loginIcon=loginAnchor; }
      else { loginIcon=d.createElement('a'); loginIcon.className='icon-btn login-icon-btn'; loginIcon.href=loginHref; loginIcon.setAttribute('aria-label','Log in'); loginIcon.innerHTML=loginSvg; right.appendChild(loginIcon); }
    }
    var contactLink = findByText(right, 'contact') || findByText(header, 'contact');
    if (contactLink){ right.insertBefore(contactLink, loginIcon); right.appendChild(loginIcon); }

    // Mobile clone of login icon (top-right)
    if (!q('.login-icon-btn.login-mobile-only', headerBox)){ var m=loginIcon.cloneNode(true); m.classList.add('login-mobile-only'); headerBox.appendChild(m); }

    /* ---------- Hamburger (left, borderless) ---------- */
    var burger = q('.hamburger-btn', headerBox);
    if (!burger){
      burger = d.createElement('button');
      burger.type='button'; burger.className='hamburger-btn';
      burger.setAttribute('aria-label','Open menu'); burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-controls', panel.id||'mobile-nav-panel');
      burger.innerHTML='<span class="hamburger-lines" aria-hidden="true"><span></span><span></span><span></span></span>';
      if (getComputedStyle(headerBox).position==='static') headerBox.style.position='relative';
      headerBox.insertBefore(burger, headerBox.firstChild);
      header.classList.add('has-hamburger-injected');
    }

    /* ---------- Behavior + a11y ---------- */
    function isOpen(){ return burger.getAttribute('aria-expanded')==='true'; }
    function firstFocusable(){ return q('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', panel); }
    function trapTab(e){
      if (e.key!=='Tab') return;
      var f=qa('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', panel);
      if (!f.length) return;
      var first=f[0], last=f[f.length-1];
      if (e.shiftKey && d.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement===last){ e.preventDefault(); first.focus(); }
    }
    function open(){ burger.setAttribute('aria-expanded','true'); burger.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); overlay.classList.add('is-active'); b.classList.add('no-scroll'); var f=firstFocusable(); if(f) f.focus(); d.addEventListener('keydown', onKeydown); }
    function close(){ burger.setAttribute('aria-expanded','false'); burger.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); overlay.classList.remove('is-active'); b.classList.remove('no-scroll'); d.removeEventListener('keydown', onKeydown); if(typeof burger.focus==='function') burger.focus(); }
    function onKeydown(e){ if(e.key==='Escape'||e.key==='Esc'){ if(isOpen()){ e.preventDefault(); close(); } return; } trapTab(e); }
    burger.addEventListener('click', function(){ isOpen()? close(): open(); });
    overlay.addEventListener('click', function(){ if (isOpen()) close(); });

    // Close when switching breakpoints
    var lastW=window.innerWidth;
    window.addEventListener('resize', function(){
      var now=window.innerWidth;
      if ((lastW<1024 && now>=1024) || (lastW>=1024 && now<1024)){ if (isOpen()) close(); }
      lastW=now;
    });
  });
})();

// ---- Enhance "Explore DALI-Compatible Fixtures" image row (3:4, cropped) ----
(function(){
  function enhanceExploreSlices(){
    try {
      var heads = document.querySelectorAll('h1,h2,h3');
      var heading = null;
      heads.forEach(function(h){
        var t = (h.textContent || '').toLowerCase();
        if (t.indexOf('explore dali') !== -1 && !heading) heading = h;
      });
      if (!heading) return;

      // use the nearest section as the scope, or fallback to the heading's parent
      var scope = heading.closest('section') || heading.parentElement || document.body;

      // find candidate images *within* this section that are tall slices
      var imgs = Array.prototype.slice.call(scope.querySelectorAll('img'));
      var tall = imgs.filter(function(img){
        if (img.closest('.fixture-slice')) return false;                 // already handled
        var cls = (img.className || '');
        if (/logo|icon/i.test(cls)) return false;                         // skip logos/icons
        var w = img.naturalWidth || img.width || 0;
        var h = img.naturalHeight || img.height || 0;
        return w && h && (h / w) > 1.3;                                   // tall-ish images
      }).slice(0, 4);                                                     // take the first four

      tall.forEach(function(img){
        var wrap = document.createElement('div');
        wrap.className = 'fixture-slice';
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
        img.classList.add('fixture-slice-img');
      });
    } catch(e){ /* no-op */ }
  }
  if (document.readyState === 'complete') enhanceExploreSlices();
  window.addEventListener('load', function(){ setTimeout(enhanceExploreSlices, 50); });
})();
// ===== Daliant header scroll hook (2025-08-14) =====
(function(){
  if (window.__DALIANT_HEADER_FLOATING__) return;  // prevent double attach
  window.__DALIANT_HEADER_FLOATING__ = true;
  var d = document, w = window, body = d.body;
  function setFloating(){
    var y = w.scrollY || w.pageYOffset || d.documentElement.scrollTop || 0;
    var scrolled = y > 4; // tiny hysteresis to avoid flicker at the very top
    body.classList.toggle('is-scrolled', scrolled);
  }
  setFloating();
  w.addEventListener('scroll', setFloating, {passive:true});
  w.addEventListener('load', setFloating);
})();
// ===== /Daliant header scroll hook =====
// ===== Header height variable for fixed-on-scroll (2025-08-14) =====
(function(){
  if (window.__DALIANT_HEADER_HEIGHT_VAR__) return;
  window.__DALIANT_HEADER_HEIGHT_VAR__ = true;
  var d=document, w=window;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  function syncHeaderHeight(){
    if (!header) return;
    var h = header.offsetHeight || 0;
    d.documentElement.style.setProperty('--header-h', h + 'px');
  }
  syncHeaderHeight();
  w.addEventListener('resize', syncHeaderHeight, {passive:true});
  w.addEventListener('load', function(){ setTimeout(syncHeaderHeight, 80); });
})();
// ===== Header gap via IntersectionObserver (2025-08-14) =====
(function(){
  if (window.__DALIANT_HEADER_OBSERVER__) return;
  window.__DALIANT_HEADER_OBSERVER__ = true;

  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  // 1) Create a tiny sentinel above the header to detect "at top" vs "scrolled"
  var sentinel = d.createElement('div');
  sentinel.setAttribute('data-header-sentinel','');
  sentinel.style.cssText = 'height:1px; margin:0; padding:0;';
  header.parentNode.insertBefore(sentinel, header);

  // 2) Observer flips classes: has-gap + has-fixed-header only when scrolled
  var io = new IntersectionObserver(function(entries){
    var atTop = entries[0] && entries[0].isIntersecting;
    body.classList.toggle('has-gap', !atTop);
    body.classList.toggle('has-fixed-header', !atTop);
  }, {root: null, threshold: 0});
  io.observe(sentinel);

  // 3) Keep a CSS var with the header height for padding compensation
  function syncHeaderHeight(){
    var h = header.offsetHeight || 0;
    d.documentElement.style.setProperty('--header-h', h + 'px');
  }
  syncHeaderHeight();
  w.addEventListener('resize', syncHeaderHeight, {passive:true});
  w.addEventListener('load', function(){ setTimeout(syncHeaderHeight, 80); });
})();
// ===== /Header gap via IntersectionObserver =====

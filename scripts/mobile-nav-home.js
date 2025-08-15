// ==== Daliant: disable prior search de-dupes (flags v4) ======================
(function(){ try{
  window.__DALIANT_SEARCH_DEDUPE_FLAGS_V4__ = true;
  window.__DALIANT_SEARCH_DEDUPE_V1__ = true;
  window.__DALIANT_SEARCH_DEDUPE_V2__ = true;
  window.__DALIANT_SEARCH_DEDUPE_V3__ = true;
} catch(e){} })();
// =============================================================================
// ==== Daliant: disable old search de-dupe blocks (flags v3, 2025-08-14) ====
(function(){ try{
  window.__DALIANT_SEARCH_DEDUPE_FLAGS_V3__ = true;
  window.__DALIANT_SEARCH_DEDUPE_V1__ = true;
  window.__DALIANT_SEARCH_DEDUPE_V2__ = true;
} catch(e){} })();
// ============================================================================
// ==== Daliant: disable legacy header scroll logic & force fixed (2025-08-14) ====
(function(){
  try{
    // Stop any previously-injected header controllers from running
    var w = window;
    w.__DALIANT_HEADER_FLOATING__ = true;
    w.__DALIANT_HEADER_OBSERVER__ = true;
    w.__DALIANT_HEADER_CTRL__     = true;
    w.__DALIANT_REVEAL_V3__       = true;
    w.__DALIANT_REVEAL_UP_V4__    = true;
    w.__DALIANT_STICK_V5__        = true;

    // Force the fixed header at our desired offset from first paint
    var d = document;
    var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
    if (header){
      // Add a marker class on <html> for our CSS override
      d.documentElement.classList.add('dl-force-fixed');

      // Inline styles trump legacy CSS and prevent any flicker at top
      header.style.position   = 'fixed';
      header.style.left       = '0';
      header.style.right      = '0';
      header.style.top        = 'calc(env(safe-area-inset-top) + var(--header-gap))';
      header.style.zIndex     = '1000';
      header.style.transition = 'none';
      // width/radius/shadow stay in CSS so they’re easy to tweak
    }
  }catch(e){}
})();
// ==== /Daliant header hard-lock =================================================
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
// ===== DMF-style header controller (2025-08-14) =====
(function(){
  if (window.__DALIANT_HEADER_CTRL__) return;
  window.__DALIANT_HEADER_CTRL__ = true;

  // If older observers exist, neutralize their classes by never relying on them
  // (CSS above already ignores .has-gap/.has-fixed-header unless our .dl-* flags are set)
  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  function syncHeaderHeight(){
    var h = header.getBoundingClientRect().height || 0;
    d.documentElement.style.setProperty('--header-h', h + 'px');
  }

  function onScroll(){
    var y = w.scrollY || d.documentElement.scrollTop || 0;
    var scrolled = y > 16;                     // threshold before showing the gap
    body.classList.toggle('dl-has-gap', scrolled);
    body.classList.toggle('dl-fixed-header', scrolled);
  }

  // Init
  syncHeaderHeight();
  onScroll();
  w.addEventListener('resize', function(){ syncHeaderHeight(); onScroll(); }, {passive:true});
  w.addEventListener('load', function(){ setTimeout(function(){ syncHeaderHeight(); onScroll(); }, 80); });
  w.addEventListener('scroll', onScroll, {passive:true});
})();
// ===== /DMF-style header controller =====
// ==== DMF-style reveal controller (2025-08-14) ==============================
(function(){
  if (window.__DALIANT_REVEAL_V2__) return;
  window.__DALIANT_REVEAL_V2__ = true;

  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  // Remove older classes (from earlier experiments) so they don't interfere
  body.classList.remove('has-gap','has-fixed-header','is-scrolled','dl-has-gap','dl-fixed-header');

  // Create a sentinel immediately AFTER the header; when it goes above the viewport,
  // we know the header has fully scrolled away -> show floating pill.
  var after = d.createElement('div');
  after.setAttribute('data-header-after','');
  after.style.cssText = 'height:1px;margin:0;padding:0;';
  header.parentNode.insertBefore(after, header.nextSibling);

  function setFloat(on){ body.classList.toggle('dl-float', !!on); }

  // IntersectionObserver toggles floating state
  var prev;
  function ioHandler(entries){
    var e = entries[0]; if (!e) return;
    var on = (!e.isIntersecting && e.boundingClientRect.top < 0); // sentinel above viewport
    if (on !== prev){ prev = on; setFloat(on); }
  }
  var io = new IntersectionObserver(ioHandler, {root:null, threshold:0});
  io.observe(after);

  // Fallback + first-run (covers browsers without IO quirks and initial position)
  function check(){
    var top = after.getBoundingClientRect().top;
    setFloat(top < 0);
  }
  check();
  w.addEventListener('scroll', check, {passive:true});
  w.addEventListener('resize', check, {passive:true});
  w.addEventListener('load', function(){ setTimeout(check, 80); });
})();
// ============================================================================
// ==== Daliant header reveal controller (v3, 2025-08-14) =====================
(function(){
  if (window.__DALIANT_REVEAL_V3__) return;
  window.__DALIANT_REVEAL_V3__ = true;

  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  // Sentinel just AFTER the header marks the "bottom of header" in normal flow
  var after = d.querySelector('[data-header-after-v3]');
  if (!after){
    after = d.createElement('div');
    after.setAttribute('data-header-after-v3','');
    after.style.cssText = 'height:1px;margin:0;padding:0;';
    header.parentNode.insertBefore(after, header.nextSibling);
  }

  function scrollY(){
    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop || 0;
  }
  function sentinelDocTop(){
    var r = after.getBoundingClientRect();
    return scrollY() + r.top;
  }

  var threshold = 0;

  // Recompute threshold (using sentinel) even if header gets fixed later
  function recompute(){
    // temporarily ensure header is measured in normal flow if needed
    var wasFloating = body.classList.contains('dl-reveal');
    if (wasFloating) body.classList.remove('dl-reveal','dl-reveal-show');
    threshold = sentinelDocTop();
    if (wasFloating) body.classList.add('dl-reveal'); // restore; visibility will update below
  }

  function setReveal(on){
    if (on){
      if (!body.classList.contains('dl-reveal')){
        body.classList.add('dl-reveal');
        // start hidden, then fade to visible next frame
        body.classList.remove('dl-reveal-show');
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          body.classList.add('dl-reveal-show');
        });});
      }
    } else {
      if (body.classList.contains('dl-reveal')){
        body.classList.remove('dl-reveal-show');
        body.classList.remove('dl-reveal');
      }
    }
  }

  function onScroll(){
    setReveal(scrollY() >= threshold);
  }

  // Init
  recompute();
  onScroll();

  // Events
  w.addEventListener('scroll', onScroll, {passive:true});
  w.addEventListener('resize', function(){ recompute(); onScroll(); }, {passive:true});
  w.addEventListener('load', function(){ setTimeout(function(){ recompute(); onScroll(); }, 120); });

})();
// ===========================================================================
// ==== Header: reveal only when scrolling UP (v4, 2025-08-14) ================
(function(){
  if (window.__DALIANT_REVEAL_UP_V4__) return;
  window.__DALIANT_REVEAL_UP_V4__ = true;

  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  // Sentinel AFTER the header = bottom edge of header in normal flow
  var after = d.querySelector('[data-header-after-up]');
  if (!after){
    after = d.createElement('div');
    after.setAttribute('data-header-after-up','');
    after.style.cssText = 'height:1px;margin:0;padding:0;';
    header.parentNode.insertBefore(after, header.nextSibling);
  }

  function y(){ return w.pageYOffset || d.documentElement.scrollTop || 0; }
  function threshold(){
    var r = after.getBoundingClientRect();
    return y() + r.top;
  }

  var lastY = y(), accUp = 0, accDown = 0;
  var showAfterUp = 24;   // px scrolled UP before showing header (tune)
  var minDelta   = 2;     // ignore tiny jitter
  var t = threshold();

  function recompute(){ t = threshold(); }

  function show(){
    if (!body.classList.contains('dl-reveal-up')){
      body.classList.add('dl-reveal-up');
      requestAnimationFrame(function(){ body.classList.add('dl-show'); });
    } else {
      body.classList.add('dl-show');
    }
  }
  function hide(){ body.classList.remove('dl-show'); } // keep dl-reveal-up; it's non-interactive when hidden

  function onScroll(){
    var cur = y(), dy = cur - lastY;
    if (Math.abs(dy) < minDelta){ lastY = cur; return; }

    if (dy > 0){ accDown += dy; accUp = 0; }   // scrolling down
    else       { accUp   +=-dy; accDown = 0; } // scrolling up

    var past = cur >= t;

    if (!past){
      // Near the top: let header be in normal flow, no floating pill
      body.classList.remove('dl-show','dl-reveal-up');
      accUp = accDown = 0;
    } else {
      if (dy > 0){
        // Going down: hide (for distraction-free reading)
        hide();
      } else {
        // Going up: reveal only after a little upward travel
        if (accUp >= showAfterUp) show();
      }
    }
    lastY = cur;
  }

  // Init
  recompute(); onScroll();
  w.addEventListener('scroll', onScroll, {passive:true});
  w.addEventListener('resize', function(){ recompute(); onScroll(); }, {passive:true});
  w.addEventListener('load',  function(){ setTimeout(function(){ recompute(); onScroll(); }, 100); });
})();
// ============================================================================
// ==== Header: reveal only when scrolling UP (v4, 2025-08-14) ================
(function(){
  if (window.__DALIANT_REVEAL_UP_V4__) return;
  window.__DALIANT_REVEAL_UP_V4__ = true;

  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  // Sentinel AFTER the header = bottom edge of header in normal flow
  var after = d.querySelector('[data-header-after-up]');
  if (!after){
    after = d.createElement('div');
    after.setAttribute('data-header-after-up','');
    after.style.cssText = 'height:1px;margin:0;padding:0;';
    header.parentNode.insertBefore(after, header.nextSibling);
  }

  function y(){ return w.pageYOffset || d.documentElement.scrollTop || 0; }
  function threshold(){
    var r = after.getBoundingClientRect();
    return y() + r.top;
  }

  var lastY = y(), accUp = 0, accDown = 0;
  var showAfterUp = 24;   // px scrolled UP before showing header (tune)
  var minDelta   = 2;     // ignore tiny jitter
  var t = threshold();

  function recompute(){ t = threshold(); }

  function show(){
    if (!body.classList.contains('dl-reveal-up')){
      body.classList.add('dl-reveal-up');
      requestAnimationFrame(function(){ body.classList.add('dl-show'); });
    } else {
      body.classList.add('dl-show');
    }
  }
  function hide(){ body.classList.remove('dl-show'); } // keep dl-reveal-up; it's non-interactive when hidden

  function onScroll(){
    var cur = y(), dy = cur - lastY;
    if (Math.abs(dy) < minDelta){ lastY = cur; return; }

    if (dy > 0){ accDown += dy; accUp = 0; }   // scrolling down
    else       { accUp   +=-dy; accDown = 0; } // scrolling up

    var past = cur >= t;

    if (!past){
      // Near the top: let header be in normal flow, no floating pill
      body.classList.remove('dl-show','dl-reveal-up');
      accUp = accDown = 0;
    } else {
      if (dy > 0){
        // Going down: hide (for distraction-free reading)
        hide();
      } else {
        // Going up: reveal only after a little upward travel
        if (accUp >= showAfterUp) show();
      }
    }
    lastY = cur;
  }

  // Init
  recompute(); onScroll();
  w.addEventListener('scroll', onScroll, {passive:true});
  w.addEventListener('resize', function(){ recompute(); onScroll(); }, {passive:true});
  w.addEventListener('load',  function(){ setTimeout(function(){ recompute(); onScroll(); }, 100); });
})();
// ============================================================================
// ==== Header stick controller (v5, 2025-08-14) ==============================
(function(){
  if (window.__DALIANT_STICK_V5__) return;
  window.__DALIANT_STICK_V5__ = true;

  var d = document, w = window, body = d.body;
  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (!header) return;

  // Create a sentinel AFTER the header to know when we've scrolled past it
  var after = d.querySelector('[data-header-after-stick]');
  if (!after){
    after = d.createElement('div');
    after.setAttribute('data-header-after-stick','');
    after.style.cssText = 'height:1px;margin:0;padding:0;';
    header.parentNode.insertBefore(after, header.nextSibling);
  }

  function toggleStick(){
    var top = after.getBoundingClientRect().top;
    var past = top <= 0; // sentinel has gone above the viewport
    body.classList.toggle('dl-stick', past);
  }

  // Initialize & listen
  toggleStick();
  w.addEventListener('scroll', toggleStick, {passive:true});
  w.addEventListener('resize', toggleStick, {passive:true});
  w.addEventListener('load', function(){ setTimeout(toggleStick, 80); });
})();
/// ===========================================================================
// ==== DL search pill injector v2 (2025-08-14) ===============================
(function(){
  var d=document;
  var header=d.querySelector('body > header:first-of-type')||d.querySelector('header');
  if(!header || d.querySelector('.dl-search')) return; // already present

  // Prefer to mount before the Contact link on the right
  var contactLink = Array.from(header.querySelectorAll('a')).find(function(a){
    return /contact/i.test((a.textContent||'').trim());
  });

  var mount = contactLink ? contactLink.parentNode
             : header.querySelector('.header-right, .nav-right, nav') || header;

  var form = d.createElement('form');
  form.className = 'dl-search';
  form.setAttribute('role','search');
  form.setAttribute('autocomplete','off');
  form.setAttribute('action','/search.html'); // adjust later if you add real search

  form.innerHTML =
    '<input class="dl-search__input" type="search" name="q" placeholder="Search…" aria-label="Search">'+
    '<button class="dl-search__btn" type="submit" aria-label="Search">'+
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
        '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>'+
        '<line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'+
      '</svg>'+
    '</button>';

  if (contactLink && mount) {
    mount.insertBefore(form, contactLink);
  } else {
    mount.appendChild(form);
  }
})();
// ============================================================================ 
// ==== Daliant: de-duplicate search forms in header (2025-08-14) ============
(function(){
  if (window.__DALIANT_SEARCH_DEDUPE_V1__) return;
  window.__DALIANT_SEARCH_DEDUPE_V1__ = true;

  var d=document, header=d.querySelector('body > header:first-of-type')||d.querySelector('header');
  if(!header) return;

  // Prefer to keep the new .dl-search; otherwise keep the first found.
  function cleanup(){
    var forms = Array.from(header.querySelectorAll('form[role="search"]'));
    if (forms.length <= 1) return;
    var keep = header.querySelector('.dl-search') || forms[0];
    forms.forEach(function(f){ if (f !== keep && f.parentNode) f.parentNode.removeChild(f); });
  }

  // Also catch any non-role form that contains a search input (paranoid fallback)
  function cleanupByInput(){
    var inputs = Array.from(header.querySelectorAll('input[type="search"]'));
    inputs.forEach(function(inp){
      var f = inp.closest('form');
      if (f && !f.classList.contains('dl-search') && f.parentNode) f.parentNode.removeChild(f);
    });
  }

  cleanup(); cleanupByInput();
  // Re-run after the injector (if any) and on late DOM changes
  setTimeout(function(){ cleanup(); cleanupByInput(); }, 0);
})();
// ============================================================================
// ==== DL search de-dupe v2 (keep only left-most) — 2025-08-14 ==============
(function(){
  if (window.__DALIANT_SEARCH_DEDUPE_V2__) return;
  window.__DALIANT_SEARCH_DEDUPE_V2__ = true;

  function run(){
    var d = document;
    var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
    if (!header) return;

    // Find all elements that LOOK like search widgets (form or div) that contain a search input
    var widgets = Array.from(header.querySelectorAll('form, div, nav, section'))
      .filter(function(el){ return el.querySelector('input[type="search"]'); });

    if (widgets.length === 0) return;

    // Determine which to KEEP: prefer the one with .dl-search class; otherwise the first (left-most)
    var keep = header.querySelector('.dl-search') || widgets[0];

    // If keep is not already .dl-search but contains a search input, tag it so CSS doesn't hide it
    if (!keep.classList.contains('dl-search')) keep.classList.add('dl-search');

    // Remove every other search widget
    widgets.forEach(function(el){
      if (el !== keep && el.parentNode) el.parentNode.removeChild(el);
    });

    // Also remove any stray search inputs not inside the kept widget
    Array.from(header.querySelectorAll('input[type="search"]')).forEach(function(inp){
      if (!keep.contains(inp) && inp.parentNode) {
        var container = inp.closest('form, .search, .search-container, .search-pill, .searchPill, .header-search, .searchbar, .site-search, .header__search, label, div') || inp;
        if (container && container !== keep && container.parentNode) container.parentNode.removeChild(container);
      }
    });
  }

  // Run when DOM is ready *and* re-run after load in case late JS injects again
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ run(); setTimeout(run, 50); });
  } else {
    run(); setTimeout(run, 50);
  }
  window.addEventListener('load', function(){ setTimeout(run, 0); setTimeout(run, 200); });
})();
// ============================================================================ 
// ==== DL search de-dupe v3 (safe) — 2025-08-14 ==============================
(function(){
  if (window.__DALIANT_SEARCH_DEDUPE_V3__) return;
  window.__DALIANT_SEARCH_DEDUPE_V3__ = true;

  var d=document;
  function run(){
    var header=d.querySelector('body > header:first-of-type')||d.querySelector('header');
    if(!header) return;

    var containerSel = [
      'form[role="search"]',
      'form[class*="search" i]',
      'form[id*="search" i]',
      '.search','.search-container','.search-pill','.searchPill',
      '.header-search','.header__search','.site-search','.searchbar','.nav-search',
      '[data-search]','[data-component="search"]','[data-role="search"]',
      'label[for*="search" i]','.search-input-wrap','.search-wrapper'
    ].join(',');

    // Only consider explicit "search" wrappers; never generic div/nav that holds other content
    var candidates = Array.from(header.querySelectorAll(containerSel))
      .filter(function(el){ return el.querySelector('input[type="search"]'); });

    if (candidates.length <= 1) return;

    // Keep the .dl-search (left pill) if present; else the left-most candidate
    var keep = header.querySelector('.dl-search') || candidates[0];
    if (!keep.classList.contains('dl-search')) keep.classList.add('dl-search');

    candidates.forEach(function(el){
      if (el !== keep && el.parentNode) el.parentNode.removeChild(el);
    });

    // Remove stray inputs not inside the kept widget (closest search-y wrapper only)
    Array.from(header.querySelectorAll('input[type="search"]')).forEach(function(inp){
      if (keep.contains(inp)) return;
      var wrapper = inp.closest(containerSel) || inp.closest('form');
      if (wrapper && wrapper !== keep && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    });
  }

  if (d.readyState === 'loading'){ d.addEventListener('DOMContentLoaded', function(){ run(); setTimeout(run,50); }); }
  else { run(); setTimeout(run,50); }
  window.addEventListener('load', function(){ setTimeout(run,0); setTimeout(run,200); });
})();
// ============================================================================
// ==== DL search de-dupe v4 (keep left-most .dl-search) — 2025-08-14 =========
(function(){
  if (window.__DALIANT_SEARCH_DEDUPE_V4__) return;
  window.__DALIANT_SEARCH_DEDUPE_V4__ = true;

  var d = document;

  function isSearchy(el){
    if (!el) return false;
    if (el.classList && el.classList.contains('dl-search')) return true;

    // Must have a search input OR be clearly named as search (class/id/aria/placeholder)
    var hasInput = el.querySelector('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]');
    var name = ((el.className||'') + ' ' + (el.id||'')).toLowerCase();
    var named = /(^|\b)(search|site-search|searchbar|header-search|nav-search|searchpill|search-input)(\b|$)/i.test(name);
    var aria = (el.getAttribute && el.getAttribute('aria-label')||'').toLowerCase().includes('search');
    return !!(hasInput || named || aria);
  }

  function collectCandidates(header){
    // Only inside the header; never consider the whole <nav> unless it's explicitly search-named
    var list = Array.from(header.querySelectorAll('form, div, section, label, nav'))
      .filter(function(el){
        if (el.tagName === 'NAV' && !/search/i.test((el.className||'')+' '+(el.id||''))) return false;
        return isSearchy(el);
      });
    // De-dup containers that simply wrap the real .dl-search (keep closest container)
    return list.filter(function(el){
      var inKeep = el.querySelector('.dl-search');
      return !inKeep || el.classList.contains('dl-search');
    });
  }

  function chooseKeep(header, candidates){
    var keep = header.querySelector('.dl-search');
    if (keep) return keep;
    // Fallback: left-most candidate by DOM order
    return candidates[0] || null;
  }

  function cleanup(){
    var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
    if (!header) return;

    var candidates = collectCandidates(header);
    if (candidates.length <= 1) return;

    var keep = chooseKeep(header, candidates);
    if (!keep) return;

    // Ensure kept widget has .dl-search so future checks recognize it
    keep.classList.add('dl-search');

    candidates.forEach(function(el){
      if (el !== keep && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Remove stray inputs not inside the kept widget
    Array.from(header.querySelectorAll('input[type="search"], input[placeholder*="search" i]'))
      .forEach(function(inp){
        if (!keep.contains(inp)) {
          var wrap = inp.closest('form, .search, .search-container, .header-search, .site-search, .searchbar, .nav-search, .search-pill, label, div') || inp;
          if (wrap && wrap !== keep && wrap.parentNode) wrap.parentNode.removeChild(wrap);
        }
      });
  }

  // Run now, at DOM ready, after load, and whenever header mutates
  function runAll(){ cleanup(); setTimeout(cleanup,50); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', runAll); else runAll();
  window.addEventListener('load', function(){ setTimeout(cleanup,0); setTimeout(cleanup,200); });

  var header = d.querySelector('body > header:first-of-type') || d.querySelector('header');
  if (header && 'MutationObserver' in window){
    var mo = new MutationObserver(function(){ cleanup(); });
    mo.observe(header, {childList:true, subtree:true});
  }
})();
// =============================================================================

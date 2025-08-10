/* =========================================================================
   Header UI (production):
   - Hamburger (left, borderless) on mobile
   - Logo centered on mobile; desktop unchanged
   - Login: desktop uses icon-only (replaces "Log In" text link);
            mobile shows a separate icon at top-right
   - Slide-over panel includes: Explore Fixtures, About, Blog, Search, Contact
   - A11y: role=dialog, aria-modal, aria-hidden, Esc/overlay close, focus trap
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

    /* ---------- Overlay ---------- */
    var overlay = q('.mobile-nav-overlay');
    if (!overlay){
      overlay = d.createElement('div');
      overlay.className = 'mobile-nav-overlay';
      overlay.setAttribute('aria-hidden','true');
      b.appendChild(overlay);
    }

    /* ---------- Panel ---------- */
    var panel = q('[data-mobile-nav-panel]') || q('.mobile-nav-panel') || q('#mobile-nav-panel');
    if (!panel){
      panel = d.createElement('aside');
      panel.className = 'mobile-nav-panel';
      panel.id = 'mobile-nav-panel';
      panel.setAttribute('data-mobile-nav-panel','');
      panel.setAttribute('aria-hidden','true');
      header.parentNode.insertBefore(panel, header.nextSibling);
    }
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');

    /* ---------- Build panel menu from existing links ---------- */
    var desired = ['Explore Fixtures','About','Blog','Search','Contact'];
    var anchors = qa('nav a, .nav-right a');
    function hrefFor(label){
      var L = norm(label);
      for (var i=0;i<anchors.length;i++){
        if (norm(anchors[i].textContent) === L) return anchors[i].getAttribute('href') || '#';
      }
      return '#';
    }
    var navWrap = q('nav', panel) || (function(){ var w=d.createElement('nav'); panel.innerHTML=''; panel.appendChild(w); return w; })();
    var ul = q('ul', navWrap); if (!ul){ ul=d.createElement('ul'); ul.style.listStyle='none'; ul.style.margin='0'; ul.style.padding='0'; navWrap.appendChild(ul); }
    ul.innerHTML='';
    desired.forEach(function(label){
      var li=d.createElement('li'), a=d.createElement('a');
      a.textContent=label; a.href=hrefFor(label); a.setAttribute('role','menuitem'); a.style.display='block'; a.style.padding='10px 6px';
      li.appendChild(a); ul.appendChild(li);
    });

    /* ---------- Login icon: desktop = icon-only; mobile = separate clone ---------- */
    function findLoginAnchor(){
      for (var i=0;i<anchors.length;i++){
        var t = norm(anchors[i].textContent);
        if (t==='log in' || t==='login' || t==='sign in') return anchors[i];
      }
      return null;
    }
    var loginAnchor = findLoginAnchor();
    var loginHref = loginAnchor ? (loginAnchor.getAttribute('href')||'#') : '#';
    var svg = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14z"/></svg>';

    // Desktop: convert existing "Log In" link into icon-only
    var desktopIcon = q('.nav-right .login-icon-btn');
    if (!desktopIcon){
      if (loginAnchor){
        loginAnchor.classList.add('icon-btn','login-icon-btn');
        loginAnchor.setAttribute('aria-label','Log in');
        loginAnchor.innerHTML = svg; // remove text
        desktopIcon = loginAnchor;
      } else {
        // If no anchor exists, add one at the end of .nav-right (or headerBox)
        desktopIcon = d.createElement('a');
        desktopIcon.className = 'icon-btn login-icon-btn';
        desktopIcon.href = loginHref;
        desktopIcon.setAttribute('aria-label','Log in');
        desktopIcon.innerHTML = svg;
        (q('.nav-right', headerBox) || headerBox).appendChild(desktopIcon);
      }
    }

    // Mobile: separate clone pinned top-right (only shown on mobile via CSS)
    if (!q('.login-icon-btn.login-mobile-only', headerBox)){
      var m = desktopIcon.cloneNode(true);
      m.classList.add('login-mobile-only');
      headerBox.appendChild(m);
    }

    /* ---------- Hamburger (left, borderless) ---------- */
    var burger = q('.hamburger-btn', headerBox);
    if (!burger){
      burger = d.createElement('button');
      burger.type='button';
      burger.className='hamburger-btn';
      burger.setAttribute('aria-label','Open menu');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-controls', panel.id || 'mobile-nav-panel');
      burger.innerHTML = '<span class="hamburger-lines" aria-hidden="true"><span></span><span></span><span></span></span>';
      if (getComputedStyle(headerBox).position === 'static') headerBox.style.position = 'relative';
      headerBox.insertBefore(burger, headerBox.firstChild);
      header.classList.add('has-hamburger-injected');
    }

    /* ---------- Behavior + a11y (Esc, overlay, focus trap) ---------- */
    var lastFocused=null;
    function isOpen(){ return burger.getAttribute('aria-expanded')==='true'; }
    function firstFocusable(){ return q('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', panel); }
    function trapTab(e){
      if (e.key!=='Tab') return;
      var f = qa('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', panel);
      if (!f.length) return;
      var first=f[0], last=f[f.length-1];
      if (e.shiftKey && d.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement===last){ e.preventDefault(); first.focus(); }
    }
    function open(){
      lastFocused = d.activeElement;
      burger.setAttribute('aria-expanded','true');
      burger.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      overlay.classList.add('is-active');
      b.classList.add('no-scroll');
      var f=firstFocusable(); if (f) f.focus();
      d.addEventListener('keydown', onKeydown);
    }
    function close(){
      burger.setAttribute('aria-expanded','false');
      burger.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      overlay.classList.remove('is-active');
      b.classList.remove('no-scroll');
      d.removeEventListener('keydown', onKeydown);
      if (typeof burger.focus==='function') burger.focus();
    }
    function onKeydown(e){ if (e.key==='Escape' || e.key==='Esc'){ if (isOpen()){ e.preventDefault(); close(); } return; } trapTab(e); }
    burger.addEventListener('click', function(){ isOpen()? close(): open(); });
    overlay.addEventListener('click', function(){ if (isOpen()) close(); });

    // Close on breakpoint switch
    var lastW=window.innerWidth;
    window.addEventListener('resize', function(){
      var now=window.innerWidth;
      if ((lastW<1024 && now>=1024) || (lastW>=1024 && now<1024)){ if (isOpen()) close(); }
      lastW=now;
    });
  });
})();

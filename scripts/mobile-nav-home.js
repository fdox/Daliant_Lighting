/* =========================================================================
   Mobile header (production):
   - Left: borderless "hamburger" (top-left, floating)
   - Center: logo (your existing markup)
   - Right: login icon (links to existing "Log In" href if present)
   - Slide-over panel with: Explore Fixtures, About, Blog, Search, Contact
   - A11y: role=dialog, aria-modal, aria-hidden, focus trap, Esc/overlay close
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

    // --- overlay ---
    var overlay = q('.mobile-nav-overlay');
    if (!overlay){
      overlay = d.createElement('div');
      overlay.className = 'mobile-nav-overlay';
      overlay.setAttribute('aria-hidden','true');
      b.appendChild(overlay);
    }

    // --- panel ---
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

    // Build menu from existing anchors in preferred order
    var desired = ['Explore Fixtures','About','Blog','Search','Contact'];
    var anchors = qa('nav a, .nav-right a');
    function hrefFor(label){
      var L = norm(label);
      for (var i=0;i<anchors.length;i++){
        if (norm(anchors[i].textContent) === L) return anchors[i].getAttribute('href') || '#';
      }
      return '#';
    }
    var navWrap = q('nav', panel) || (function(){
      var w = d.createElement('nav'); panel.innerHTML=''; panel.appendChild(w); return w;
    })();
    var ul = q('ul', navWrap);
    if (!ul){ ul = d.createElement('ul'); ul.style.listStyle='none'; ul.style.margin='0'; ul.style.padding='0'; navWrap.appendChild(ul); }
    ul.innerHTML = '';
    desired.forEach(function(label){
      var li = d.createElement('li');
      var a = d.createElement('a');
      a.textContent = label;
      a.href = hrefFor(label);
      a.setAttribute('role','menuitem');
      a.style.display = 'block';
      a.style.padding = '10px 6px';
      li.appendChild(a);
      ul.appendChild(li);
    });

    // --- hamburger (left, borderless) ---
    var burger = q('.hamburger-btn');
    if (!burger){
      burger = d.createElement('button');
      burger.type = 'button';
      burger.className = 'hamburger-btn';
      burger.setAttribute('aria-label','Open menu');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-controls', panel.id || 'mobile-nav-panel');
      burger.innerHTML = '<span class="hamburger-lines" aria-hidden="true"><span></span><span></span><span></span></span>';
      if (getComputedStyle(headerBox).position === 'static') headerBox.style.position = 'relative';
      headerBox.insertBefore(burger, headerBox.firstChild);
      header.classList.add('has-hamburger-injected');
    }

    // --- login icon (right) ---
    var loginHref = (function(){
      for (var i=0;i<anchors.length;i++){
        var t = norm(anchors[i].textContent);
        if (t==='log in' || t==='login' || t==='sign in'){ return anchors[i].getAttribute('href') || '#'; }
      }
      return '#';
    })();
    var login = q('.login-icon-btn', headerBox);
    if (!login){
      login = d.createElement('a');
      login.className = 'icon-btn login-icon-btn';
      login.href = loginHref;
      login.setAttribute('aria-label','Log in');
      login.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14z"/></svg>';
      headerBox.appendChild(login);
    }

    // --- behavior (+ focus trap) ---
    function isOpen(){ return burger.getAttribute('aria-expanded')==='true'; }
    function firstFocusable(){
      return q('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])', panel);
    }
    function trapTab(e){
      if (e.key!=='Tab') return;
      var focusables = qa('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', panel);
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length-1];
      if (e.shiftKey && d.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement===last){ e.preventDefault(); first.focus(); }
    }
    function open(){
      burger.setAttribute('aria-expanded','true');
      burger.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      overlay.classList.add('is-active');
      b.classList.add('no-scroll');
      var f = firstFocusable(); if (f) f.focus();
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
    function onKeydown(e){
      if (e.key==='Escape' || e.key==='Esc'){ if (isOpen()) { e.preventDefault(); close(); } return; }
      trapTab(e);
    }
    burger.addEventListener('click', function(){ isOpen()? close(): open(); });
    overlay.addEventListener('click', function(){ if (isOpen()) close(); });

    // Close when switching breakpoints
    var lastW = window.innerWidth;
    window.addEventListener('resize', function(){
      var now = window.innerWidth;
      if ((lastW < 1024 && now >= 1024) || (lastW >= 1024 && now < 1024)){
        if (isOpen()) close();
      }
      lastW = now;
    });
  });
})();

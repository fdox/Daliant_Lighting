/* =========================================================================
   Header UI (production)
   - Mobile: hamburger (left), centered logo, login icon (right).
   - Desktop: nav as-is, but:
       • "Log In" -> icon-only (rightmost)
       • "Contact" sits immediately left of the login icon
       • "Search" text becomes a magnifier icon that expands a small input LEFT
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
    var right = q('.nav-right', headerBox) || (function(){ var r=d.createElement('div'); r.className='nav-right'; headerBox.appendChild(r); return r; })();

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

    /* ---------- Build panel menu ---------- */
    var desired = ['Explore Fixtures','About','Blog','Search','Contact'];
    var anchors = qa('nav a, .nav-right a', header);
    function hrefFor(label){
      var L = norm(label);
      for (var i=0;i<anchors.length;i++){
        if (norm(anchors[i].textContent) === L) return anchors[i].getAttribute('href') || '#';
      }
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

    /* ---------- Desktop: Search icon + expanding input ---------- */
    // Find any existing "Search" link in .nav-right and replace with control
    var searchAnchor = (function(){
      var links = qa('a', right);
      for(var i=0;i<links.length;i++){ if (norm(links[i].textContent) === 'search') return links[i]; }
      return null;
    })();
    var searchCtrl = q('.search-control', right);
    if (!searchCtrl){
      searchCtrl = d.createElement('div');
      searchCtrl.className = 'search-control';
      searchCtrl.innerHTML = '' +
        '<button type="button" class="icon-btn search-toggle" aria-label="Search" aria-expanded="false">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>' +
        '</button>' +
        '<input class="search-input" type="search" placeholder="Search…" aria-label="Search" />';
      if (searchAnchor) right.insertBefore(searchCtrl, searchAnchor); else right.insertBefore(searchCtrl, right.firstChild);
      if (searchAnchor) searchAnchor.remove();
    }
    (function(){
      var btn = q('.search-toggle', searchCtrl);
      var inp = q('.search-input', searchCtrl);
      function open(){ searchCtrl.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); inp.style.display='block'; inp.focus(); }
      function close(){ searchCtrl.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); if(!inp.value) inp.blur(); }
      btn.addEventListener('click', function(){ searchCtrl.classList.contains('is-open') ? close() : open(); });
      inp.addEventListener('keydown', function(e){ if(e.key==='Escape' || e.key==='Esc'){ e.preventDefault(); close(); }});
      inp.addEventListener('blur', function(){ if(!inp.value) close(); });
      // (Future) hook Enter to your search results page
      // inp.addEventListener('keydown', e => { if(e.key==='Enter'){ location.href = '/search?q=' + encodeURIComponent(inp.value); }});
    })();

    /* ---------- Desktop: Login icon rightmost; Contact immediately to its left ---------- */
    function findByText(parent, txt){
      var L=norm(txt); var links=qa('a', parent);
      for(var i=0;i<links.length;i++){ if(norm(links[i].textContent)===L) return links[i]; }
      return null;
    }
    var loginAnchor = (function(){
      var links=qa('a', right);
      for (var i=0;i<links.length;i++){ var t=norm(links[i].textContent); if (t==='log in' || t==='login' || t==='sign in') return links[i]; }
      return null;
    })();
    var loginHref = loginAnchor ? (loginAnchor.getAttribute('href')||'#') : '#';
    var loginIcon = q('.nav-right .login-icon-btn', headerBox);
    var loginSvg = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14z"/></svg>';

    if (!loginIcon){
      if (loginAnchor){
        loginAnchor.classList.add('icon-btn','login-icon-btn');
        loginAnchor.setAttribute('aria-label','Log in');
        loginAnchor.innerHTML = loginSvg;
        loginIcon = loginAnchor;
      } else {
        loginIcon = d.createElement('a');
        loginIcon.className = 'icon-btn login-icon-btn';
        loginIcon.href = loginHref;
        loginIcon.setAttribute('aria-label','Log in');
        loginIcon.innerHTML = loginSvg;
        right.appendChild(loginIcon);
      }
    }

    // Ensure Contact is just left of the login icon; icon stays far right
    var contactLink = findByText(right, 'contact');
    if (contactLink){
      right.insertBefore(contactLink, loginIcon); // places Contact immediately before icon
      right.appendChild(loginIcon);               // ensure icon is last
    } else {
      // If no Contact exists in .nav-right, try moving one from the main nav
      var fromPrimary = findByText(header, 'contact');
      if (fromPrimary){
        right.insertBefore(fromPrimary, loginIcon);
        right.appendChild(loginIcon);
      }
    }

    // Mobile clone of login icon (top-right)
    if (!q('.login-icon-btn.login-mobile-only', headerBox)){
      var m = loginIcon.cloneNode(true);
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

    /* ---------- Behavior + a11y ---------- */
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

    // Close when switching breakpoints
    var lastW=window.innerWidth;
    window.addEventListener('resize', function(){
      var now=window.innerWidth;
      if ((lastW<1024 && now>=1024) || (lastW>=1024 && now<1024)){ if (isOpen()) close(); }
      lastW=now;
    });
  });
})();

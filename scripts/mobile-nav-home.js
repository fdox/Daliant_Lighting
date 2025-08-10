/* =========================================================================
   Mobile menu: visible on MOBILE (top-left) + a11y (dialog, focus trap, Esc)
   - Ensures a hamburger toggle and a slide-over panel exist on every page
   - If no panel is present, creates one and tries to clone your desktop nav
   - Top-left placement inside <header>; hides on desktop automatically
   ========================================================================= */
(function () {
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    var d=document, b=d.body;
    var header = d.querySelector('header') || d.querySelector('.site-header') || b;

    // Resolve or create the slide-over panel
    var panel = d.querySelector('[data-mobile-nav-panel]') ||
                d.querySelector('.mobile-nav-panel') ||
                d.querySelector('#mobileNav');
    if (!panel) {
      panel = d.createElement('aside');
      panel.className = 'mobile-nav-panel';
      panel.setAttribute('data-mobile-nav-panel','');
      // Try to clone desktop nav list if present
      var desktopList = d.querySelector('nav ul, .site-nav ul, .main-nav ul, .nav ul');
      if (desktopList) {
        var wrap = d.createElement('nav');
        wrap.className = 'mobile-nav-clone';
        wrap.appendChild(desktopList.cloneNode(true));
        panel.appendChild(wrap);
      }
      b.appendChild(panel);
    }

    // Dialog semantics
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden','true');
    if (!panel.id) panel.id = 'mobile-nav-panel';

    // Resolve or inject a toggle button (TOP-LEFT)
    var toggle = d.querySelector('[data-mobile-nav-toggle], .mobile-nav-toggle, #mobileMenuButton, .hamburger, .hamburger-btn');
    if (!toggle) {
      toggle = d.createElement('button');
      toggle.type = 'button';
      toggle.className = 'hamburger-btn';
      toggle.setAttribute('data-mobile-nav-toggle','');
      toggle.setAttribute('aria-label','Open menu');
      toggle.innerHTML = '<span class="hamburger-box" aria-hidden="true">'
        + '<span class="hamburger-line"></span>'
        + '<span class="hamburger-line"></span>'
        + '<span class="hamburger-line"></span>'
        + '</span>';
      // Place at top-left inside the header
      if (header) {
        if (getComputedStyle(header).position === 'static') header.style.position = 'relative';
        header.insertBefore(toggle, header.firstChild);
        header.classList.add('has-hamburger-injected');
      } else {
        // Fallback: fixed to viewport
        toggle.classList.add('hamburger-fixed');
        b.appendChild(toggle);
      }
    }
    if (!toggle.hasAttribute('aria-controls')) toggle.setAttribute('aria-controls', panel.id);
    if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

    // Optional overlay (create if missing)
    var overlay = d.querySelector('.mobile-nav-overlay, [data-mobile-nav-overlay]');
    if (!overlay) {
      overlay = d.createElement('div');
      overlay.className = 'mobile-nav-overlay';
      overlay.setAttribute('aria-hidden','true');
      b.appendChild(overlay);
    }

    // A11y behavior
    var focusableSel = [
      'a[href]','area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])','textarea:not([disabled])',
      'button:not([disabled])','[tabindex]:not([tabindex="-1"])'
    ].join(',');
    var lastFocused = null;

    function isOpen(){ return toggle.getAttribute('aria-expanded') === 'true'; }
    function open(){
      lastFocused = d.activeElement;
      toggle.setAttribute('aria-expanded','true');
      panel.setAttribute('aria-hidden','false');
      b.classList.add('no-scroll');
      overlay.classList.add('is-active');
      var f = panel.querySelectorAll(focusableSel);
      if (f.length) f[0].focus();
      d.addEventListener('keydown', onKeydown);
    }
    function close(){
      toggle.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');
      b.classList.remove('no-scroll');
      overlay.classList.remove('is-active');
      d.removeEventListener('keydown', onKeydown);
      if (typeof toggle.focus === 'function') toggle.focus();
    }
    function onKeydown(e){
      if (e.key === 'Escape' || e.key === 'Esc'){ if (isOpen()) { e.preventDefault(); close(); } return; }
      if (e.key === 'Tab'){
        var f = panel.querySelectorAll(focusableSel);
        if (!f.length) return;
        var first=f[0], last=f[f.length-1];
        if (e.shiftKey && d.activeElement===first){ e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    }
    toggle.addEventListener('click', function(){ isOpen() ? close() : open(); });
    overlay.addEventListener('click', function(){ if (isOpen()) close(); });

    // Close when crossing desktop/mobile breakpoints
    var lastW = window.innerWidth;
    window.addEventListener('resize', function(){
      var now = window.innerWidth;
      if ((lastW < 1024 && now >= 1024) || (lastW >= 1024 && now < 1024)) { if (isOpen()) close(); }
      lastW = now;
    });
  });
})();

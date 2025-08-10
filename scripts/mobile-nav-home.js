/* =========================================================================
   Mobile menu: visible on mobile + a11y (dialog, focus trap, Esc)
   - Ensures a hamburger toggle exists and is VISIBLE on mobile only
   - If no toggle is found, injects one into <header> (or fixed to body)
   - Works with an existing panel: [data-mobile-nav-panel], .mobile-nav-panel, #mobileNav
   - Toggles aria-expanded on the button, aria-hidden on the panel, and body.no-scroll
   - Focus trap + Esc close + overlay click close
   ======================================================================= */
(function () {
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    var doc = document;
    var body = doc.body;

    // Resolve (or create) the panel
    var panel = doc.querySelector('[data-mobile-nav-panel]') ||
                doc.querySelector('.mobile-nav-panel') ||
                doc.querySelector('#mobileNav');

    if (!panel) {
      console.warn('[mobile-nav] No mobile nav panel found. Add element with [data-mobile-nav-panel] or .mobile-nav-panel or #mobileNav.');
      return;
    }
    if (!panel.classList.contains('mobile-nav-panel')) panel.classList.add('mobile-nav-panel');
    if (!panel.id) panel.id = 'mobile-nav-panel';

    // Find an existing toggle
    var toggle =
      doc.querySelector('[data-mobile-nav-toggle]') ||
      doc.querySelector('.mobile-nav-toggle') ||
      doc.querySelector('#mobileMenuButton') ||
      doc.querySelector('.hamburger') ||
      doc.querySelector('button[aria-label*="menu" i]');

    // If none, inject one
    if (!toggle) {
      toggle = doc.createElement('button');
      toggle.type = 'button';
      toggle.className = 'hamburger-btn';
      toggle.setAttribute('data-mobile-nav-toggle','');
      toggle.setAttribute('aria-label', 'Open menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panel.id);
      toggle.innerHTML = '<span class="hamburger-box" aria-hidden="true">' +
                           '<span class="hamburger-line"></span>' +
                           '<span class="hamburger-line"></span>' +
                           '<span class="hamburger-line"></span>' +
                         '</span>';
      var header = doc.querySelector('header') || doc.querySelector('.site-header');
      if (header) {
        header.classList.add('has-hamburger-injected');
        header.insertBefore(toggle, header.firstChild);
      } else {
        // Fallback: fixed to the viewport top-left
        toggle.classList.add('hamburger-fixed');
        body.appendChild(toggle);
      }
    }

    // Ensure linkage
    if (!toggle.hasAttribute('aria-controls')) toggle.setAttribute('aria-controls', panel.id);
    if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

    // Dialog semantics
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden','true');

    // Optional overlay (create if missing)
    var overlay = doc.querySelector('.mobile-nav-overlay, [data-mobile-nav-overlay]');
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.className = 'mobile-nav-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      body.appendChild(overlay);
    }

    var focusableSel = [
      'a[href]','area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    var lastFocused = null;

    function isOpen(){ return toggle.getAttribute('aria-expanded') === 'true'; }

    function openPanel(){
      lastFocused = doc.activeElement;
      toggle.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      body.classList.add('no-scroll');
      overlay.classList.add('is-active');
      var f = panel.querySelectorAll(focusableSel);
      if (f.length) f[0].focus();
      doc.addEventListener('keydown', onKeydown);
    }

    function closePanel(){
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      body.classList.remove('no-scroll');
      overlay.classList.remove('is-active');
      doc.removeEventListener('keydown', onKeydown);
      if (typeof toggle.focus === 'function') toggle.focus();
    }

    function onKeydown(e){
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (isOpen()) { e.preventDefault(); closePanel(); }
        return;
      }
      if (e.key === 'Tab') {
        var f = panel.querySelectorAll(focusableSel);
        if (!f.length) return;
        var first = f[0], last = f[f.length-1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    // Toggle behavior
    toggle.addEventListener('click', function(){
      isOpen() ? closePanel() : openPanel();
    });

    // Overlay click closes
    overlay.addEventListener('click', function(){
      if (isOpen()) closePanel();
    });

    // Close if switching breakpoints (e.g., rotating device)
    var lastW = window.innerWidth;
    window.addEventListener('resize', function(){
      var now = window.innerWidth;
      if ((lastW < 1024 && now >= 1024) || (lastW >= 1024 && now < 1024)) {
        if (isOpen()) closePanel();
      }
      lastW = now;
    });
  });
})();

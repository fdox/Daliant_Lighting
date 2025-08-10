// DEBUG-VISIBLE mobile nav (top-left). Shows even if CSS fails.
(function () {
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    var d=document, b=d.body;
    var header = d.querySelector('header') || d.querySelector('.site-header') || b;

    // Panel (create if missing)
    var panel = d.querySelector('[data-mobile-nav-panel]') ||
                d.querySelector('.mobile-nav-panel') ||
                d.querySelector('#mobileNav');
    if (!panel) {
      panel = d.createElement('aside');
      panel.className = 'mobile-nav-panel';
      panel.setAttribute('data-mobile-nav-panel','');
      var desktopList = d.querySelector('nav ul, .site-nav ul, .main-nav ul, .nav ul');
      if (desktopList) {
        var wrap = d.createElement('nav');
        wrap.className = 'mobile-nav-clone';
        wrap.appendChild(desktopList.cloneNode(true));
        panel.appendChild(wrap);
      }
      b.appendChild(panel);
    }
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden','true');
    if (!panel.id) panel.id = 'mobile-nav-panel';

    // Toggle (inject if missing)
    var toggle = d.querySelector('[data-mobile-nav-toggle], .mobile-nav-toggle, #mobileMenuButton, .hamburger, .hamburger-btn');
    if (!toggle) {
      toggle = d.createElement('button');
      toggle.type = 'button';
      toggle.className = 'hamburger-btn';
      toggle.setAttribute('aria-label','Menu');
      toggle.innerHTML = '<span class="hamburger-box" aria-hidden="true">'
        + '<span class="hamburger-line"></span>'
        + '<span class="hamburger-line"></span>'
        + '<span class="hamburger-line"></span>'
        + '</span>';
      if (header) {
        if (getComputedStyle(header).position === 'static') header.style.position = 'relative';
        header.insertBefore(toggle, header.firstChild); // TOP-LEFT
        header.classList.add('has-hamburger-injected');
      } else {
        toggle.classList.add('hamburger-fixed');
        b.appendChild(toggle);
      }
    }
    if (!toggle.hasAttribute('aria-controls')) toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded','false');

    // Visible proof that the JS ran (auto-removes after 4s)
    (function(){
      var tag = d.createElement('div');
      tag.textContent = 'nav-js ok';
      tag.style.cssText = 'position:fixed;top:6px;right:6px;padding:2px 6px;font:11px/1 system-ui;background:#06c;color:#fff;z-index:100000;';
      b.appendChild(tag);
      setTimeout(function(){ tag.remove(); }, 4000);
    })();

    // Inline fallback styles so the button shows even if CSS is broken
    function applyFallbackStyles(){
      toggle.style.display   = 'inline-flex';
      toggle.style.position  = header ? 'absolute' : 'fixed';
      toggle.style.left      = '12px';
      toggle.style.top       = '12px';
      toggle.style.width     = '44px';
      toggle.style.height    = '44px';
      toggle.style.background= 'transparent';
      toggle.style.border    = '1px solid currentColor';
      toggle.style.borderRadius = '8px';
      toggle.style.color     = '#111';
      toggle.style.zIndex    = '10020';
    }
    function updateForViewport(){
      if (window.innerWidth <= 1024) applyFallbackStyles();
      else toggle.style.display = 'none';
    }
    updateForViewport();
    window.addEventListener('resize', updateForViewport);

    // Overlay (create if missing)
    var overlay = d.querySelector('.mobile-nav-overlay, [data-mobile-nav-overlay]');
    if (!overlay) {
      overlay = d.createElement('div');
      overlay.className = 'mobile-nav-overlay';
      overlay.setAttribute('aria-hidden','true');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:10010;';
      b.appendChild(overlay);
    }

    // Open/close + focus trap
    var focusableSel = 'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])';
    var lastFocused=null;
    function isOpen(){ return toggle.getAttribute('aria-expanded') === 'true'; }
    function open(){
      lastFocused = d.activeElement;
      toggle.setAttribute('aria-expanded','true');
      panel.setAttribute('aria-hidden','false');
      b.classList.add('no-scroll');
      overlay.style.opacity='1'; overlay.style.pointerEvents='auto';
      var f = panel.querySelectorAll(focusableSel); if (f.length) f[0].focus();
      d.addEventListener('keydown', onKeydown);
    }
    function close(){
      toggle.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');
      b.classList.remove('no-scroll');
      overlay.style.opacity='0'; overlay.style.pointerEvents='none';
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

  });
})();

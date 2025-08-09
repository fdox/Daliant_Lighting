// Mobile nav toggle (Explore page)
(function(){
  function qs(sel, root){ return (root||document).querySelector(sel); }
  const container = qs('header .nav-container');
  if(!container) return;

  // Buttons (inserted by HTML patch)
  const burger = qs('.hamburger', container);
  const searchBtn = qs('.search-btn', container);
  let panel = qs('#mobileMenu');

  // Build panel content once from existing navs
  if(panel && !panel.dataset.built){
    const primary = qs('.nav-primary ul');
    const right = qs('.nav-right');
    const wrap = document.createElement('div');
    wrap.className = 'mobile-menu-inner';
    if(primary){
      const clonePrimary = primary.cloneNode(true);
      const h = document.createElement('h4'); h.textContent = 'Menu';
      wrap.appendChild(h);
      wrap.appendChild(clonePrimary);
    }
    if(right){
      const cloneRight = right.cloneNode(true);
      const h2 = document.createElement('h4'); h2.textContent = 'Quick Links';
      wrap.appendChild(h2);
      wrap.appendChild(cloneRight);
    }
    panel.appendChild(wrap);
    panel.dataset.built = '1';
  }

  function toggle(open){
    const isOpen = open!=null ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('no-scroll', isOpen);
  }

  if(burger){
    burger.addEventListener('click', ()=>toggle());
  }
  if(panel){
    panel.addEventListener('click', (e)=>{
      // close if you click backdrop
      if(e.target === panel) toggle(false);
    });
  }
  if(searchBtn){
    searchBtn.addEventListener('click', ()=>{ window.location.href = '#'; });
  }
})();

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

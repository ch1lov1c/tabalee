(() => {
  'use strict';
  const products = ET_PRODUCTS;
  const categories = ET_CATEGORIES;
  const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const plural = count => {
    const n = count % 100, last = count % 10;
    if (n >= 11 && n <= 14) return 'предметов';
    if (last === 1) return 'предмет';
    if (last >= 2 && last <= 4) return 'предмета';
    return 'предметов';
  };
  const periodText = product => product.priceQualifier ? `/ сутки · ${escapeHTML(product.priceQualifier)}` : '/ сутки';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const grid = $('#product-grid');
  const filters = $('#filters');
  const results = $('#result-count');
  const menu = $('#mobile-menu');
  const menuToggle = $('.menu-toggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let category = 'all';
  let imageObserver = null;

  // On-scroll reveals do not hide content if JavaScript or motion is disabled.
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.animate([{opacity:0,transform:'translateY(28px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}], {duration:850,easing:'cubic-bezier(.22,1,.36,1)'});
        revealObserver.unobserve(entry.target);
      });
    }, {threshold:.12});
    imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const image = entry.target.querySelector('img');
        if (image) image.animate([{opacity:.2,clipPath:'inset(0 0 14% 0)',transform:'scale(1.06)'},{opacity:1,clipPath:'inset(0 0 0 0)',transform:'scale(1)'}], {duration:950,easing:'cubic-bezier(.22,1,.36,1)'});
        imageObserver.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px 80px 0px',threshold:.06});
    $$('.reveal').forEach(node => revealObserver.observe(node));
  }

  function renderFilters() {
    filters.innerHTML = categories.map(item => {
      const count = item.id === 'all' ? products.length : products.filter(product => product.category === item.id).length;
      const active = category === item.id;
      return `<button type="button" class="filter-button${active ? ' active' : ''}" data-category="${item.id}" aria-pressed="${active}">${escapeHTML(item.label)} <span>${count}</span></button>`;
    }).join('');
  }
  function renderProducts(animate = false) {
    const found = products.filter(product => category === 'all' || product.category === category);
    grid.innerHTML = found.map(product => {
      const name = escapeHTML(product.name);
      const source = escapeHTML(product.source);
      const imageAlt = `${product.name} — ${product.imageKind === 'illustration' ? 'иллюстрация по образцу товара' : 'фотография из VK'}`;
      const imageNote = product.id === '11759208' ? '<span class="image-note">Чехол на фото — опция</span>' : product.id === '11841903' ? '<span class="image-note">Вид условный</span>' : '';
      const conditions = ['11771587','11771578'].includes(product.id) ? '<p class="product-condition">Минимум от 10 шт., условия уточняются</p>' : product.id === '11776006' ? '<p class="product-condition">Изображение условное, состав уточняйте</p>' : '';
      return `<article class="product-card" data-product="${escapeHTML(product.id)}">
        <a class="product-image" href="${source}" target="_blank" rel="noopener noreferrer" aria-label="Открыть товар во ВКонтакте: ${name}">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(imageAlt)}" loading="lazy" decoding="async">
          <span class="product-image-arrow" aria-hidden="true">↗</span>${imageNote}
        </a>
        <div class="product-copy">
          <h3 class="product-name"><a href="${source}" target="_blank" rel="noopener noreferrer">${name}</a></h3>
          <p class="product-short">${escapeHTML(product.short)}</p>${conditions}
          <div class="product-bottom"><div class="product-price"><strong>${product.priceFrom ? 'от ' : ''}${money(product.price)}</strong><small>${periodText(product)}</small></div><a class="product-link" href="${source}" target="_blank" rel="noopener noreferrer" aria-label="Подробнее во ВКонтакте: ${name}">↗</a></div>
        </div>
      </article>`;
    }).join('');
    results.textContent = category === 'all' ? `Все ${products.length} позиций` : `Найдено: ${found.length} ${plural(found.length)}`;
    if (animate && !reduceMotion.matches && found.length) {
      grid.animate([{opacity:.08,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}], {duration:580,easing:'cubic-bezier(.22,1,.36,1)'});
      grid.querySelectorAll('.product-card').forEach((card, index) => {
        if (index < 8) card.animate([{opacity:.12,transform:'translateY(17px)'},{opacity:1,transform:'translateY(0)'}], {duration:500,delay:index * 38,easing:'ease-out'});
      });
    }
    if (imageObserver) grid.querySelectorAll('.product-image').forEach(node => imageObserver.observe(node));
    requestEffects();
  }
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button || button.dataset.category === category) return;
    category = button.dataset.category;
    filters.querySelectorAll('.filter-button').forEach(item => {
      const active = item.dataset.category === category;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderProducts(true);
  });
  function setMenu(open) {
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  menuToggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('click', event => {
    if (!menu.hidden && !menu.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { setMenu(false); menuToggle.focus({preventScroll:true}); }
  });
  $('#year').textContent = new Date().getFullYear();

  // Smooth, restrained parallax on the first screen.
  const hero = $('.hero'), heroImage = $('.hero-image');
  let frame = 0;
  function updateEffects() {
    frame = 0;
    if (reduceMotion.matches) { heroImage.style.setProperty('--parallax','0px'); return; }
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom >= 0 && bounds.top <= window.innerHeight) {
      const amount = Math.min(40, Math.max(-28, (window.innerHeight*.15-bounds.top)*.075));
      heroImage.style.setProperty('--parallax', `${amount.toFixed(1)}px`);
    }
  }
  function requestEffects() { if (!frame) frame = requestAnimationFrame(updateEffects); }
  window.addEventListener('scroll', requestEffects, {passive:true});
  window.addEventListener('resize', requestEffects, {passive:true});
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', requestEffects);
  renderFilters(); renderProducts(); requestEffects();
})();

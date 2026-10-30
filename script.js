/* ==========================================================================
   ATELIER NOBRE — interações
   JavaScript puro, sem dependências.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Configuração ---------- */
  const CONFIG = {
    // Número do WhatsApp no formato internacional, só dígitos (+55 48 99999-9999)
    whatsapp: '5548999999999',
    whatsappMessage: 'Olá, Atelier Nobre! Gostaria de conversar sobre um novo projeto.',
  };

  const PROJECTS = [
    {
      name: 'Casa Atlântica',
      location: 'Florianópolis, SC',
      category: 'Residencial',
      scope: 'Arquitetura e interiores',
      year: '2024',
      area: '620 m²',
      image: 'photo-1613490493576-7fde63acd811',
      alt: 'Casa Atlântica: volumes brancos e horizontais com piscina de borda infinita',
      description:
        'Implantada na encosta voltada ao mar de Jurerê, a casa se organiza em dois volumes horizontais que emolduram o horizonte. Brises de cumaru filtram o sol da tarde e desenham sombras que mudam ao longo do dia, enquanto a piscina prolonga a sala até a paisagem.',
    },
    {
      name: 'Residência Horizonte',
      location: 'Balneário Camboriú, SC',
      category: 'Residencial',
      scope: 'Arquitetura',
      year: '2023',
      area: '480 m²',
      image: 'photo-1600596542815-ffad4c1539a9',
      alt: 'Residência Horizonte: fachada contemporânea com grandes panos de vidro',
      description:
        'Lâminas horizontais de concreto e vidro se estendem sobre o terreno como uma linha de horizonte construída. Grandes vãos deslizantes dissolvem os limites entre sala, varanda e jardim, e a iluminação indireta revela a casa à noite como uma lanterna.',
    },
    {
      name: 'Refúgio da Serra',
      location: 'Urubici, SC',
      category: 'Casa de campo',
      scope: 'Arquitetura e interiores',
      year: '2022',
      area: '210 m²',
      image: 'photo-1449844908441-8829872d2607',
      alt: 'Refúgio da Serra: casa de linhas simples em meio à vegetação',
      description:
        'Na altitude da Serra Catarinense, um abrigo de pedra local e madeira de reflorestamento. A lareira central organiza a planta e aquece o percurso entre os espaços nas noites de geada; as aberturas enquadram os vales como pinturas.',
    },
    {
      name: 'Apartamento Nascente',
      location: 'Curitiba, PR',
      category: 'Interiores',
      scope: 'Reforma integral',
      year: '2025',
      area: '285 m²',
      image: 'photo-1600210492486-724fe5c67fb0',
      alt: 'Apartamento Nascente: sala de estar em tons neutros com linho e madeira clara',
      description:
        'Reforma integral de um apartamento voltado ao leste. Travertino, carvalho claro e linho compõem uma paleta silenciosa que acompanha a luz da manhã ao entardecer. Marcenaria sob medida esconde o cotidiano e deixa à vista apenas o essencial.',
    },
  ];

  /* ---------- Helpers ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let reduced = mqReduce.matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const unsplash = (id, w, h) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ''}`;

  /* ---------- Ano automático ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- WhatsApp ---------- */
  const waUrl = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg || CONFIG.whatsappMessage)}`;
  const formatPhone = (n) => {
    const m = n.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
    return m ? `+${m[1]} ${m[2]} ${m[3]}-${m[4]}` : `+${n}`;
  };
  $$('[data-whatsapp]').forEach((a) => { a.href = waUrl(a.dataset.whatsappMessage); });
  $$('[data-phone]').forEach((a) => {
    a.href = `tel:+${CONFIG.whatsapp}`;
    a.textContent = formatPhone(CONFIG.whatsapp);
  });

  /* ---------- Fallback de imagens externas ---------- */
  const markFallback = (img) => {
    const holder = img.closest('.media, .hero__media');
    if (holder) holder.classList.add('is-fallback');
  };
  const watchImage = (img) => {
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) markFallback(img);
    img.addEventListener('error', () => markFallback(img));
    img.addEventListener('load', () => {
      const holder = img.closest('.media, .hero__media');
      if (holder && img.naturalWidth > 1) holder.classList.remove('is-fallback');
    });
  };
  $$('img').forEach(watchImage);

  /* ---------- Intro / estado pronto ---------- */
  const start = performance.now();
  let readyDone = false;
  const ready = () => {
    if (readyDone) return;
    readyDone = true;
    const wait = reduced ? 0 : Math.max(0, 1000 - (performance.now() - start));
    setTimeout(() => root.classList.add('is-ready'), wait);
  };
  const heroImg = $('.hero__media img');
  if (reduced) ready();
  else {
    if (heroImg && heroImg.complete) ready();
    else if (heroImg) {
      heroImg.addEventListener('load', ready, { once: true });
      heroImg.addEventListener('error', ready, { once: true });
    }
    setTimeout(ready, 1800); // nunca segurar o usuário
  }

  /* ---------- Header ---------- */
  const header = $('#header');
  const themedSections = $$('[data-header]');
  let lastY = window.scrollY;
  let menuOpen = false;

  const updateHeader = (y) => {
    header.classList.toggle('is-scrolled', y > 24);
    if (!menuOpen) {
      const delta = y - lastY;
      if (y > window.innerHeight * 0.6 && delta > 4) header.classList.add('is-hidden');
      else if (delta < -4 || y < 120) header.classList.remove('is-hidden');
    }
    // tema conforme a seção sob o header
    const probe = 40;
    let theme = 'dark';
    for (const s of themedSections) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { theme = s.dataset.header; break; }
    }
    header.classList.toggle('on-light', theme === 'light');
    header.classList.toggle('on-dark', theme !== 'light');
    lastY = y;
  };

  /* ---------- Menu mobile ---------- */
  const toggle = $('.menu-toggle');
  const mnav = $('#mobile-menu');
  const setMenu = (open) => {
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    $('.menu-toggle__label', toggle).textContent = open ? 'Fechar' : 'Menu';
    mnav.classList.toggle('is-open', open);
    mnav.setAttribute('aria-hidden', String(!open));
    if (open) mnav.removeAttribute('inert'); else mnav.setAttribute('inert', '');
    header.classList.toggle('menu-open', open);
    header.classList.remove('is-hidden');
    root.classList.toggle('is-locked', open);
    if (open) setTimeout(() => { const f = $('a', mnav); if (f) f.focus({ preventScroll: true }); }, 350);
  };
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', mnav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', () => { if (menuOpen && window.innerWidth > 860) setMenu(false); });

  /* ---------- Reveals com IntersectionObserver ---------- */
  const revealEls = $$('[data-reveal], [data-split], [data-reveal-img]');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    // Imagens começam 100% recortadas (clip-path) e o Chromium não as considera visíveis;
    // por isso observamos o elemento pai e revelamos o filho.
    const imgIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        $$(':scope > [data-reveal-img], :scope > .project__stage > [data-reveal-img]', en.target)
          .forEach((el) => el.classList.add('is-in'));
        imgIO.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    revealEls.forEach((el) => {
      if (el.hasAttribute('data-reveal-img')) imgIO.observe(el.closest('.project') || el.parentElement);
      else io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Manifesto: palavras acendem com a rolagem ---------- */
  const wordsHost = $('[data-words]');
  let words = [];
  if (wordsHost) {
    const wrap = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(' '));
            else {
              const s = document.createElement('span');
              s.className = 'w';
              s.textContent = p;
              frag.appendChild(s);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child);
        }
      });
    };
    wrap(wordsHost);
    words = $$('.w', wordsHost);
    // limpa espaço inicial
    if (wordsHost.firstChild && wordsHost.firstChild.nodeType === Node.TEXT_NODE) wordsHost.firstChild.remove();
  }
  let litCount = -1;
  const updateWords = (vh) => {
    if (!words.length) return;
    if (reduced) { if (litCount !== words.length) { words.forEach((w) => w.classList.add('is-lit')); litCount = words.length; } return; }
    const r = wordsHost.getBoundingClientRect();
    const progress = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.3), 0, 1);
    const n = Math.round(progress * words.length);
    if (n === litCount) return;
    words.forEach((w, i) => w.classList.toggle('is-lit', i < n));
    litCount = n;
  };

  /* ---------- Parallax sutil ---------- */
  const parallaxEls = $$('[data-parallax]');
  const updateParallax = (vh) => {
    if (reduced) return;
    parallaxEls.forEach((el) => {
      const host = el.parentElement;
      const r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
    });
  };

  /* ---------- Loop de rolagem (rAF) ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      updateHeader(y);
      updateWords(vh);
      updateParallax(vh);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Navegação ativa ---------- */
  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window) {
    const map = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = map.get(en.target.id);
        if (!link) return;
        if (en.isIntersecting) {
          navLinks.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) navIO.observe(s); });
  }

  /* ---------- Filosofia: imagem fixa troca por pilar ---------- */
  const pillars = $$('[data-pillar]');
  const pillarImgs = $$('[data-pillar-img]');
  const pillarCounter = $('[data-pillar-counter]');
  const ROMAN = ['I', 'II', 'III'];
  const setPillar = (i) => {
    pillars.forEach((p, k) => p.classList.toggle('is-active', k === i));
    pillarImgs.forEach((p, k) => p.classList.toggle('is-active', k === i));
    if (pillarCounter) pillarCounter.textContent = ROMAN[i] || String(i + 1);
  };
  if ('IntersectionObserver' in window && pillars.length) {
    const pIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setPillar(Number(en.target.dataset.pillar)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    pillars.forEach((p) => pIO.observe(p));
  }

  /* ---------- Processo: acordeão + linha do tempo ---------- */
  const steps = $$('[data-step]');
  const railSegs = $$('[data-rail]');
  const openStep = (i, { focus = false } = {}) => {
    steps.forEach((s, k) => {
      const open = k === i;
      s.classList.toggle('is-open', open);
      $('.step__head', s).setAttribute('aria-expanded', String(open));
    });
    railSegs.forEach((seg, k) => {
      seg.classList.toggle('is-active', k === i);
      seg.classList.toggle('is-past', k < i);
      seg.setAttribute('aria-pressed', String(k === i));
    });
    if (focus) $('.step__head', steps[i]).focus({ preventScroll: true });
  };
  steps.forEach((s, i) => {
    const btn = $('.step__head', s);
    btn.addEventListener('click', () => {
      if (s.classList.contains('is-open')) {
        s.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        railSegs.forEach((seg, k) => { seg.classList.toggle('is-past', k < i); seg.classList.remove('is-active'); seg.setAttribute('aria-pressed', 'false'); });
      } else openStep(i);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + steps.length) % steps.length;
        $('.step__head', steps[next]).focus();
      }
    });
  });
  railSegs.forEach((seg, i) => seg.addEventListener('click', () => openStep(i)));
  railSegs.forEach((seg, k) => seg.setAttribute('aria-pressed', String(k === 0)));

  /* ---------- Modal de projetos ---------- */
  const modal = $('#project-modal');
  const mImg = $('[data-modal-img]', modal);
  const mMedia = $('.modal__media', modal);
  let current = 0;
  let lastTrigger = null;

  const fillModal = (i) => {
    const p = PROJECTS[i];
    $('[data-modal-num]', modal).textContent = String(i + 1).padStart(2, '0');
    $('[data-modal-category]', modal).textContent = `${p.category} · ${p.year}`;
    $('[data-modal-title]', modal).textContent = p.name;
    $('[data-modal-desc]', modal).textContent = p.description;
    $('[data-modal-location]', modal).textContent = p.location;
    $('[data-modal-year]', modal).textContent = p.year;
    $('[data-modal-area]', modal).textContent = p.area;
    $('[data-modal-scope]', modal).textContent = p.scope;
    $('[data-modal-cta]', modal).href = waUrl(`Olá, Atelier Nobre! Vi o projeto ${p.name} e gostaria de conversar sobre um projeto semelhante.`);
    mMedia.classList.remove('is-fallback');
    mMedia.dataset.fallback = p.name;
    mImg.alt = p.alt;
    mImg.srcset = `${unsplash(p.image, 900)} 900w, ${unsplash(p.image, 1400)} 1400w, ${unsplash(p.image, 2000)} 2000w`;
    mImg.sizes = '(max-width: 860px) 100vw, 58vw';
    mImg.src = unsplash(p.image, 1400);
  };

  const swapTo = (i) => {
    current = (i + PROJECTS.length) % PROJECTS.length;
    if (reduced) { fillModal(current); return; }
    modal.classList.add('is-swapping');
    mMedia.classList.add('is-swapping');
    setTimeout(() => {
      fillModal(current);
      requestAnimationFrame(() => {
        modal.classList.remove('is-swapping');
        mMedia.classList.remove('is-swapping');
      });
    }, 380);
  };

  const openModal = (i, trigger) => {
    current = i;
    lastTrigger = trigger || null;
    fillModal(i);
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    root.classList.add('is-locked');
    hideCursor();
    setTimeout(() => $('[data-modal-close]', modal).focus({ preventScroll: true }), 50);
  };

  let closing = false;
  const finishClose = () => {
    modal.classList.remove('is-closing');
    if (modal.open) { if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); }
    closing = false;
  };
  const closeModal = () => {
    if (!modal.open || closing) return;
    closing = true;
    if (reduced) { finishClose(); return; }
    modal.classList.add('is-closing');
    setTimeout(finishClose, 560);
  };
  modal.addEventListener('close', () => {
    root.classList.remove('is-locked');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
  modal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') swapTo(current + 1);
    if (e.key === 'ArrowLeft') swapTo(current - 1);
  });
  $('[data-modal-close]', modal).addEventListener('click', closeModal);
  $('[data-modal-next]', modal).addEventListener('click', () => swapTo(current + 1));
  $('[data-modal-prev]', modal).addEventListener('click', () => swapTo(current - 1));

  $$('.project').forEach((article) => {
    const i = Number(article.dataset.project);
    const trigger = $('.project__media', article);
    article.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      openModal(i, trigger);
    });
  });

  /* ---------- Cursor personalizado (apenas mouse) ---------- */
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor__label');
  let cx = -200, cy = -200, tx = -200, ty = -200, cs = 0, ts = 0;
  let cursorRAF = null;
  const hideCursor = () => { ts = 0; cursor.classList.remove('is-visible'); };
  const loopCursor = () => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cs += (ts - cs) * 0.16;
    cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) scale(${cs.toFixed(3)})`;
    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 || Math.abs(ts - cs) > 0.001) cursorRAF = requestAnimationFrame(loopCursor);
    else cursorRAF = null;
  };
  const kick = () => { if (!cursorRAF) cursorRAF = requestAnimationFrame(loopCursor); };
  if (mqFine.matches && !reduced) {
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      const target = e.target.closest && e.target.closest('[data-cursor]');
      if (target && !modal.open) {
        if (cursorLabel.textContent !== target.dataset.cursor) cursorLabel.textContent = target.dataset.cursor;
        if (ts === 0) { cx = tx; cy = ty; }
        ts = 1; cursor.classList.add('is-visible');
      } else if (ts !== 0) {
        hideCursor();
      }
      kick();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { hideCursor(); kick(); });
  }

  /* ---------- Botão magnético ---------- */
  if (mqFine.matches && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 0.28;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'transform .25s cubic-bezier(.16,1,.3,1), color .6s';
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1), color .6s';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Mudança de preferência de movimento em tempo real ---------- */
  const onReduceChange = (e) => {
    reduced = e.matches;
    if (reduced) {
      revealEls.forEach((el) => el.classList.add('is-in'));
      parallaxEls.forEach((el) => { el.style.transform = ''; });
      root.classList.add('is-ready');
      updateWords(window.innerHeight);
    }
  };
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduceChange);
})();
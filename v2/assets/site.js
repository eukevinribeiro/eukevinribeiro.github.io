/* Kevin Ribeiro · v2
   O conteúdo vem de content/*.json (editável pelo painel /admin).
   Este arquivo só desenha e anima. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function src(p) { return String(p || '').replace(/^\/+/, ''); }
  function icon(id, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function seal(s) { return '<span class="seal ' + (s === 'Fato' ? 'seal-fato' : 'seal-est') + '">' + esc(s) + '</span>'; }
  function frame(img, label, alt) {
    var c = '<i class="corner c1"></i><i class="corner c2"></i><i class="corner c3"></i><i class="corner c4"></i>';
    if (img) return '<div class="frame">' + c + '<img src="' + esc(src(img)) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async"></div>';
    return '<div class="frame frame--ph">' + c + '<span>' + esc(label) + '</span></div>';
  }

  /* ---------- navegação, tema, progresso ---------- */
  var menuBtn = $('#menu-btn'), panel = $('#panel');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    panel.hidden = !open; panel.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $$('#panel > *').forEach(function (a, i) { a.style.animationDelay = Math.min(i * 55, 330) + 'ms'; });
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setMenu(false); menuBtn.focus(); } });

  $('#theme').addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var next = cur === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('kr-theme', next); } catch (e) {}
    requestAnimationFrame(function () { filters.forEach(function (f) { f.place(); }); });
  });

  var bar = $('#progress'), fab = $('#fab'), tick = false;
  function onScroll() {
    tick = false;
    var h = root.scrollHeight - innerHeight;
    bar.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h) : 0);
    var c = $('#contato').getBoundingClientRect();
    fab.classList.toggle('show', scrollY > innerHeight * 0.8 && c.top > innerHeight * 0.6);
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });

  var navLinks = $$('.links a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (l) { if (l.getAttribute('href') === '#' + en.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['projetos', 'servicos', 'campo', 'trajetoria', 'contato'].forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---------- revelar ao rolar ---------- */
  var revealer = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; revealer.unobserve(el);
      var sibs = $$(':scope > .rv', el.parentNode);
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + 'ms';
      el.classList.add('in');
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(els) {
    els.forEach(function (el) {
      if (!revealer || el.getBoundingClientRect().top < innerHeight) { el.classList.add('rv', 'in'); return; }
      el.classList.add('rv'); revealer.observe(el);
    });
  }
  function onSeen(el, fn, th) {
    if (!('IntersectionObserver' in window)) return fn(el);
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); fn(el); } }, { threshold: th || 0.25 });
    o.observe(el);
  }

  /* =========================================================
     Motor de filtro: FLIP + varredura âmbar
     - quem sai: recolhe de cima para baixo e some
     - quem fica: desliza até a nova posição
     - quem entra: é "desenhado" de cima para baixo, em sequência
     - a grade anima a altura, sem pulo de página
     ========================================================= */
  var filters = [];
  function makeFilter(o) {
    var barEl = o.bar, grid = o.grid, scan = o.scan, ind = $('.ind', barEl), current = o.initial || 'todos';
    barEl.insertAdjacentHTML('beforeend', o.options.map(function (f) {
      return '<button type="button" data-f="' + esc(f.id) + '" aria-pressed="' + (f.id === current) + '">' + esc(f.rotulo) + ' <span class="n">' + o.count(f.id) + '</span></button>';
    }).join(''));
    var btns = $$('button', barEl);
    function place(instant) {
      var b = btns.filter(function (x) { return x.dataset.f === current; })[0]; if (!b) return;
      if (instant) ind.style.transition = 'none';
      ind.style.width = b.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + b.offsetLeft + 'px)';
      if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
    }
    function match(el, f) { return f === 'todos' || (' ' + el.dataset.cats + ' ').indexOf(' ' + f + ' ') > -1; }
    function items() { return [].slice.call(grid.children); }

    function apply(f, animate) {
      current = f;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
      place();
      var act = btns.filter(function (b) { return b.dataset.f === f; })[0];
      if (act && barEl.scrollWidth > barEl.clientWidth) barEl.scrollTo({ left: act.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });

      var els = items();
      els.forEach(function (el) { if (el._leave) el._leave(); el.getAnimations().forEach(function (a) { a.finish(); }); });
      if (!animate || reduce || !grid.animate) {
        els.forEach(function (el) { el.hidden = !match(el, f); });
        return o.onChange && o.onChange(f, els.filter(function (el) { return !el.hidden; }).length);
      }
      var gR = grid.getBoundingClientRect(), h0 = grid.offsetHeight;
      var sl0 = grid.scrollLeft;
      var first = new Map(); els.forEach(function (el) { if (!el.hidden) first.set(el, el.getBoundingClientRect()); });
      var leaving = els.filter(function (el) { return !el.hidden && !match(el, f); });
      var entering = els.filter(function (el) { return el.hidden && match(el, f); });
      var staying = els.filter(function (el) { return !el.hidden && match(el, f); });

      leaving.forEach(function (el) {
        var r = first.get(el);
        el.style.cssText += ';position:absolute;margin:0;z-index:0;left:' + (r.left - gR.left + grid.scrollLeft) + 'px;top:' + (r.top - gR.top + grid.scrollTop) + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
      });
      entering.forEach(function (el) { el.hidden = false; });
      var h1 = grid.offsetHeight;
      if (sl0) { grid.scrollLeft = 0; }
      if (o.after) o.after();

      staying.forEach(function (el) {
        var a = first.get(el), b = el.getBoundingClientRect();
        var dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 560, easing: EASE });
      });
      leaving.forEach(function (el) {
        var an = el.animate([
          { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'none' },
          { opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-8px)' }
        ], { duration: 280, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
        el._leave = function () { el._leave = null; el.hidden = true; el.style.position = el.style.left = el.style.top = el.style.width = el.style.height = el.style.margin = el.style.zIndex = ''; an.cancel(); };
        an.onfinish = function () { if (el._leave) el._leave(); };
      });
      var vis = staying.concat(entering).sort(function (a, b) { return els.indexOf(a) - els.indexOf(b); });
      entering.forEach(function (el) {
        el.animate([
          { opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: 'translateY(14px)' },
          { opacity: 1, clipPath: 'inset(0 0 0% 0)', transform: 'none' }
        ], { duration: 560, delay: 160 + vis.indexOf(el) * 60, easing: EASE, fill: 'backwards' });
      });
      if (h0 !== h1) grid.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 560, easing: EASE });
      if (scan) {
        scan.setAttribute('data-label', 'filtro: ' + (act ? act.firstChild.textContent.trim().toLowerCase() : f));
        scan.animate([
          { opacity: 0, transform: 'translateY(0)' }, { opacity: 1, offset: .12 },
          { opacity: 1, offset: .85 }, { opacity: 0, transform: 'translateY(' + Math.max(h0, h1) + 'px)' }
        ], { duration: 780, easing: 'cubic-bezier(.45,0,.2,1)' });
      }
      o.onChange && o.onChange(f, vis.length);
    }

    barEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && b.dataset.f !== current) apply(b.dataset.f, true); });
    barEl.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = btns.indexOf(document.activeElement); if (i < 0) return;
      var n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length]; n.focus(); n.click(); e.preventDefault();
    });
    var api = { place: function () { place(true); }, apply: apply, current: function () { return current; } };
    filters.push(api);
    apply(current, false); place(true);
    // primeira aparição: a grade é desenhada com a mesma animação do filtro
    if (!reduce && grid.animate) {
      items().forEach(function (el) { if (!el.hidden) el.style.opacity = '0'; });
      onSeen(grid, function () {
        items().filter(function (el) { return !el.hidden; }).forEach(function (el, i) {
          el.style.opacity = '';
          el.animate([{ opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: 'translateY(14px)' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)', transform: 'none' }],
            { duration: 620, delay: i * 70, easing: EASE, fill: 'backwards' });
        });
      }, 0.08);
    }
    return api;
  }
  addEventListener('resize', function () { filters.forEach(function (f) { f.place(); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { filters.forEach(function (f) { f.place(); }); });

  /* ---------- trilho horizontal no celular: indicador de posição ---------- */
  function railDots(rail, dots) {
    if (!rail || !dots) return function () {};
    function vis() { return [].slice.call(rail.children).filter(function (c) { return !c.hidden && c.style.position !== 'absolute'; }); }
    function mark() {
      var v = vis(), x = rail.scrollLeft, best = 0, bd = 1e9;
      v.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - rail.firstElementChild.offsetLeft - x); if (d < bd) { bd = d; best = i; } });
      [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === best); });
    }
    function draw() { dots.innerHTML = vis().map(function () { return '<i></i>'; }).join(''); mark(); }
    var t = false;
    rail.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(function () { t = false; mark(); }); } }, { passive: true });
    draw();
    return draw;
  }

  /* ---------- carregar conteúdo ---------- */
  function get(name) { return fetch('content/' + name + '.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(name); return r.json(); }); }
  Promise.all(['site', 'projetos', 'galeria', 'trajetoria', 'notas'].map(get)).then(function (d) {
    var site = d[0], proj = d[1], gal = d[2], traj = d[3], notas = d[4];
    renderPerfil(site.perfil);
    renderNums(site.numeros);
    renderProjetos(proj);
    renderServicos(site.servicos);
    renderGaleria(gal.itens || []);
    renderTrajetoria(traj.itens || []);
    renderNotas(notas.itens || []);
    renderFaq(site.faq || []);
    renderContato(site.perfil, site.contato_opcoes || []);
    reveal($$('.head, .steps, .agent, .traj > div, .faq, .limit'));
    onScroll();
  }).catch(function (err) {
    console.error(err);
    $('#projs').innerHTML = '<p class="muted">Não foi possível carregar o conteúdo. Abra o site por um servidor (não pelo arquivo direto).</p>';
  });

  /* ---------- perfil / hero ---------- */
  var WA = '5585920020587';
  function renderPerfil(p) {
    if (!p) return;
    WA = String(p.whatsapp || WA).replace(/\D/g, '');
    $$('.js-wa').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Olá, Kevin! Vim pelo seu site.'); });
    if (p.subtitulo) $('#hero-sub').textContent = p.subtitulo;
    if (p.disponibilidade) $('#badge-live').textContent = p.disponibilidade;
    if (p.cidade) $('#disp').textContent = p.cidade + ' · remoto';
    if (p.whatsapp_exibicao) $('#wa-num').textContent = 'WhatsApp ' + p.whatsapp_exibicao;
    if (p.foto) $('#hero-frame').outerHTML = frame(p.foto, '', p.foto_legenda || p.nome);
  }

  /* ---------- números ---------- */
  function renderNums(list) {
    var ul = $('#nums');
    ul.innerHTML = (list || []).map(function (n) {
      return '<li><b data-to="' + esc(n.valor) + '">' + esc(n.valor) + '</b><span>' + esc(n.rotulo) + '</span>' + seal(n.selo) + '</li>';
    }).join('');
    if (reduce) return;
    onSeen(ul, function () {
      $$('b[data-to]', ul).forEach(function (b) {
        var to = parseInt(b.dataset.to, 10); if (isNaN(to)) return;
        var t0 = performance.now(), dur = 1100;
        (function step(t) { var k = Math.min(1, (t - t0) / dur); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); else b.textContent = b.dataset.to; })(t0);
      });
    }, 0.4);
  }

  /* ---------- projetos ---------- */
  var CASOS = {};
  function art(c) {
    var it = c.arte_itens || [];
    switch (c.arte) {
      case 'barras': return '<div class="a-bars"><span style="--h:70%;--f:160">160<small>operação</small></span><span style="--h:52%;--f:80">80<small>capacidade</small></span><span style="--h:100%;--f:180">180<small>governança</small></span></div>';
      case 'fluxo': return '<div class="a-flow">' + it.map(function (x, i) { return (i ? '<i></i>' : '') + '<span>' + esc(x) + '</span>'; }).join('') + '</div>';
      case 'trilha': return '<div class="a-trail"><div><i></i><i></i><i></i><i></i><i class="off"></i><i class="off"></i></div><p class="cap muted">trilha · módulo 4 de 6</p></div>';
      case 'log': return '<div class="a-log">' + it.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>';
      case 'pontos': return '<svg class="a-dots" viewBox="0 0 240 84" aria-hidden="true"><path d="M8 4V78H232" fill="none" stroke="var(--line-2)"/><circle cx="44" cy="56" r="7" fill="var(--action)"/><circle cx="84" cy="30" r="14" fill="var(--action)" opacity=".55"/><circle cx="118" cy="64" r="5" fill="var(--action)"/><circle cx="152" cy="44" r="10" fill="var(--action)"/><circle cx="200" cy="20" r="12" fill="var(--accent)"/></svg>';
      default: return '';
    }
  }
  function renderProjetos(p) {
    var casos = p.casos || [], inv = p.inventario || [];
    casos.forEach(function (c) { CASOS[c.id] = c; });
    $('#proj-total').textContent = casos.length + ' casos · ' + inv.length + ' entregas';
    var grid = $('#projs');
    grid.innerHTML = casos.map(function (c) {
      return '<button type="button" class="proj" data-cats="' + esc((c.categorias || []).join(' ')) + '" data-caso="' + esc(c.id) + '" aria-haspopup="dialog">' +
        '<div class="art" aria-hidden="true">' + art(c) + '</div>' +
        '<div class="proj-body"><div class="proj-meta"><span class="status" data-tom="' + esc(c.status_tom) + '">' + esc(c.status) + '</span><span class="cap">' + esc(c.tipo) + '</span></div>' +
        '<h3>' + esc(c.titulo) + '</h3><p class="body">' + esc(c.resumo) + '</p><span class="link-arrow">Ver o caso' + icon('i-arrow') + '</span></div></button>';
    }).join('');
    var list = $('#inv-list');
    list.innerHTML = inv.map(function (r) {
      return '<li data-cats="' + esc(r.categoria) + '"><span class="t">' + esc(r.tipo) + '</span><span class="e">' + esc(r.entrega) + '</span><span class="p">' + esc(r.papel) + '</span><span class="s">' + esc(r.status) + '</span></li>';
    }).join('');
    var labels = {}; (p.filtros || []).forEach(function (f) { labels[f.id] = f.rotulo; });
    function countCases(f) { return casos.filter(function (c) { return f === 'todos' || (c.categorias || []).indexOf(f) > -1; }).length; }
    function countInv(f) { return inv.filter(function (r) { return f === 'todos' || r.categoria === f; }).length; }
    var drawDots = function () {};
    makeFilter({
      bar: $('#proj-filters'), grid: grid, scan: $('#proj-scan'), options: p.filtros || [],
      after: function () { setTimeout(function () { drawDots(); }, 320); },
      count: function (f) { return countCases(f) + countInv(f); },
      onChange: function (f, n) {
        var ni = countInv(f);
        $('#proj-q').innerHTML = f === 'todos' ? 'mostrando <i>tudo</i> · ' + n + ' casos · ' + ni + ' entregas no inventário'
          : 'tema <i>' + esc((labels[f] || f).toLowerCase()) + '</i> · ' + n + ' ' + (n === 1 ? 'caso' : 'casos') + ' · ' + ni + ' ' + (ni === 1 ? 'entrega' : 'entregas') + ' no inventário';
        $('#inv-n').textContent = '· ' + ni;
        $$('li', list).forEach(function (li, i) {
          var show = f === 'todos' || li.dataset.cats === f;
          if (show && li.hidden && !reduce && li.animate) { li.hidden = false; li.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 30, easing: EASE, fill: 'backwards' }); }
          else li.hidden = !show;
        });
      }
    });
    drawDots = railDots(grid, $('#projs-dots'));
    if (matchMedia('(max-width:760px)').matches) $('.hint').textContent = 'arraste para o lado →';
    grid.addEventListener('click', function (e) { var b = e.target.closest('[data-caso]'); if (b) openCaso(b.dataset.caso, b); });

    $('#caps').innerHTML = (p.capacidades || []).map(function (g) {
      return '<div class="cap-g"><h3>' + esc(g.grupo) + '</h3><ul>' + g.itens.map(function (it) {
        return '<li><button type="button" data-caso="' + esc(it.caso) + '"><span>' + esc(it.texto) + '</span><span>evidência →</span></button></li>';
      }).join('') + '</ul></div>';
    }).join('');
    $('#caps').addEventListener('click', function (e) { var b = e.target.closest('[data-caso]'); if (b) openCaso(b.dataset.caso, b); });
    railDots($('#caps'), $('#caps-dots'));
    if (!matchMedia('(max-width:760px)').matches) reveal($$('#caps > .cap-g'));
  }

  /* ---------- diálogo do caso ---------- */
  var dlg = $('#caso'), lastFocus = null;
  function openDialog(d, from) {
    lastFocus = from || document.activeElement;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function closeDialog(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) closeDialog(d); });
    d.addEventListener('close', function () { document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  });
  function openCaso(id, from) {
    var c = CASOS[id]; if (!c) return;
    $('#caso-meta').textContent = [c.tipo, c.periodo, c.papel].filter(Boolean).join(' · ');
    $('#caso-t').textContent = c.titulo;
    var ev = (c.evidencias || []).filter(function (e) { return e && e.imagem; });
    $('#caso-body').innerHTML =
      '<div><h4>Contexto</h4><p>' + esc(c.contexto) + '</p></div>' +
      '<div><h4>Problema</h4><p>' + esc(c.problema) + '</p></div>' +
      '<div class="full"><h4>O que eu fiz</h4><p>' + esc(c.fiz) + '</p></div>' +
      '<div class="full"><h4>Como funciona</h4><ol class="chain">' + (c.fluxo || []).map(function (s, i) { return '<li style="--i:' + i + '"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + esc(s) + '</span></li>'; }).join('') + '</ol></div>' +
      '<div><h4>Resultado</h4><ul class="res">' + (c.resultados || []).map(function (r) { return '<li><span>' + esc(r.texto) + '</span>' + seal(r.selo) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>Status</h4><p><span class="status" data-tom="' + esc(c.status_tom) + '" style="margin-bottom:10px">' + esc(c.status) + '</span></p><p>' + esc(c.situacao) + '</p><h4 style="margin-top:20px">Aprendizado</h4><p>' + esc(c.aprendizado) + '</p></div>' +
      (ev.length ? '<div class="full"><h4>Evidências</h4><div class="ev">' + ev.map(function (e) { return '<figure>' + frame(e.imagem, '', e.legenda) + (e.legenda ? '<figcaption class="cap muted" style="margin-top:6px">' + esc(e.legenda) + '</figcaption>' : '') + '</figure>'; }).join('') + '</div></div>' : '') +
      '<div class="full"><h4>Ferramentas e referências</h4><div class="tags">' + (c.ferramentas || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<p class="cap muted" style="margin-top:16px">Cliente e dados internos anonimizados. Telas e exemplos usam dados fictícios.</p>' +
      '<p style="margin-top:20px"><a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent('Olá, Kevin! Vi o caso “' + c.titulo + '” no seu site e quero conversar sobre algo parecido.') + '">' + icon('i-chat') + 'Quero algo parecido</a></p></div>';
    $('#caso-body').scrollTop = 0;
    openDialog(dlg, from);
  }

  /* ---------- serviços ---------- */
  function renderServicos(list) {
    var el = $('#svc');
    el.innerHTML = (list || []).map(function (s, i) {
      return '<a class="svc-item" href="#contato" data-need="' + esc(s.id) + '"><span class="svc-n">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(s.titulo) + '</h3><p class="body">' + esc(s.texto) + '</p><span class="out"><span>entrega: ' + esc(s.entrega) + '</span>' + icon('i-arrow') + '</span></a>';
    }).join('');
    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-need]'); if (!a) return;
      var box = document.querySelector('#opts input[value="' + a.dataset.need + '"]');
      if (box && !box.checked) { box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    reveal($$('#svc > .svc-item'));
  }

  /* ---------- em campo ---------- */
  var GAL = [], galVisible = [], galIdx = 0;
  var TIPOS = { evento: 'Evento', evidencia: 'Evidência', certificado: 'Certificado', bastidor: 'Bastidor' };
  function renderGaleria(itens) {
    GAL = itens;
    var grid = $('#gal');
    grid.innerHTML = itens.map(function (g, i) {
      var t = g.tipo || 'evento';
      return '<button type="button" class="shot" data-cats="' + esc(t) + '" data-i="' + i + '" aria-haspopup="dialog"><span class="tag" data-t="' + esc(t) + '">' + esc(TIPOS[t] || t) + '</span>' +
        frame(g.imagem, 'FOTO · ' + (TIPOS[t] || t).toLowerCase(), g.titulo) + '<b>' + esc(g.titulo) + '</b><span class="cap"><span>' + esc(g.data || '') + '</span></span></button>';
    }).join('');
    var semFoto = itens.filter(function (g) { return !g.imagem; }).length;
    $('#gal-total').textContent = itens.length + ' registros' + (semFoto ? ' · ' + semFoto + ' aguardando foto' : '');
    var tipos = ['todos'].concat(Object.keys(TIPOS).filter(function (t) { return itens.some(function (g) { return (g.tipo || 'evento') === t; }); }));
    var opts = tipos.map(function (t) { return { id: t, rotulo: t === 'todos' ? 'Tudo' : TIPOS[t] + (t === 'evidencia' ? 's' : 's') }; });
    makeFilter({
      bar: $('#gal-filters'), grid: grid, scan: $('#gal-scan'), options: opts,
      count: function (f) { return itens.filter(function (g) { return f === 'todos' || (g.tipo || 'evento') === f; }).length; },
      onChange: function (f, n) { $('#gal-q').innerHTML = (f === 'todos' ? 'mostrando <i>tudo</i>' : 'tipo <i>' + esc((TIPOS[f] || f).toLowerCase()) + '</i>') + ' · ' + n + ' ' + (n === 1 ? 'registro' : 'registros'); }
    });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.shot'); if (!b) return;
      galVisible = $$('.shot', grid).filter(function (s) { return !s.hidden; }).map(function (s) { return +s.dataset.i; });
      galIdx = galVisible.indexOf(+b.dataset.i); showLb(); openDialog($('#lb'), b);
    });
  }
  function showLb() {
    var g = GAL[galVisible[galIdx]]; if (!g) return;
    $('#lb-meta').textContent = [TIPOS[g.tipo] || g.tipo, g.data].filter(Boolean).join(' · ');
    $('#lb-t').textContent = g.titulo;
    $('#lb-cap').textContent = g.legenda || '';
    $('#lb-img').innerHTML = g.imagem ? '<img src="' + esc(src(g.imagem)) + '" alt="' + esc(g.titulo) + '">' : frame('', 'espaço reservado para a foto deste registro');
    $('#lb-prev').disabled = $('#lb-next').disabled = galVisible.length < 2;
  }
  $('#lb-prev').addEventListener('click', function () { galIdx = (galIdx + galVisible.length - 1) % galVisible.length; showLb(); });
  $('#lb-next').addEventListener('click', function () { galIdx = (galIdx + 1) % galVisible.length; showLb(); });
  $('#lb').addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') $('#lb-prev').click(); if (e.key === 'ArrowRight') $('#lb-next').click(); });

  /* ---------- trajetória ---------- */
  var TT = { experiencia: 'experiência', formacao: 'formação', certificacao: 'certificação' };
  function renderTrajetoria(itens) {
    var tl = $('#tl');
    tl.innerHTML = itens.map(function (t) {
      return '<li data-tipo="' + esc(t.tipo) + '"' + (t.atual ? ' class="now"' : '') + '><span class="per">' + esc(t.periodo) + '</span><span class="ti">' + esc(t.titulo) + '</span><span class="lu">' + esc(t.lugar) + '</span><span class="ty">' + esc(TT[t.tipo] || t.tipo) + '</span></li>';
    }).join('');
    $('#legend').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('#legend button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('li', tl).forEach(function (li) { li.classList.toggle('dim', b.dataset.tipo !== 'todos' && li.dataset.tipo !== b.dataset.tipo); });
    });
    if (!reduce && tl.animate) {
      $$('li', tl).forEach(function (li) { li.style.opacity = '0'; });
      onSeen(tl, function () {
        $$('li', tl).forEach(function (li, i) { li.style.opacity = ''; li.animate([{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: i * 60, easing: EASE, fill: 'backwards' }); });
      }, 0.1);
    }
  }

  /* ---------- notas ---------- */
  function renderNotas(itens) {
    if (!itens.length) return;
    $('#notas').hidden = false;
    $('#notes').innerHTML = itens.map(function (n) {
      var tag = n.link ? 'a' : 'article';
      return '<' + tag + ' class="note"' + (n.link ? ' href="' + esc(n.link) + '" target="_blank" rel="noopener"' : '') + '><span class="cap muted">' + esc(n.data || '') + '</span><h3 class="h3">' + esc(n.titulo) + '</h3><p class="body muted">' + esc(n.resumo || '') + '</p>' + (n.link ? '<span class="link-arrow">Ler' + icon('i-arrow') + '</span>' : '') + '</' + tag + '>';
    }).join('');
    reveal($$('#notes > .note'));
  }

  /* ---------- faq ---------- */
  function renderFaq(list) {
    $('#faq-list').innerHTML = list.map(function (q) { return '<details><summary>' + esc(q.p) + icon('i-plus') + '</summary><p class="ans">' + esc(q.r) + '</p></details>'; }).join('');
  }

  /* ---------- tese: palavra por palavra ---------- */
  (function () {
    var tag = $('#tagline'); if (!tag) return;
    var hl = { 'estrutura,': 1, 'governança': 1, 'provar.': 1 }, out = [];
    tag.innerHTML.split(/(<br>)/).forEach(function (part) {
      if (part === '<br>') return out.push(part);
      part.split(' ').forEach(function (w) { if (w) out.push('<span class="w' + (hl[w] ? ' hl' : '') + '">' + w + '</span> '); });
    });
    tag.innerHTML = out.join('');
    var words = $$('.w', tag);
    if (reduce) return words.forEach(function (w) { w.classList.add('on'); });
    var t2 = false;
    function upd() { t2 = false; var line = innerHeight * 0.72; words.forEach(function (w) { w.classList.toggle('on', w.getBoundingClientRect().top < line); }); }
    addEventListener('scroll', function () { if (!t2) { t2 = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  })();

  /* ---------- agente: roda quando aparece ---------- */
  (function () {
    var ag = $('#agent'), ty = $('#typing'); if (!ag) return;
    if (reduce) return ag.classList.add('run');
    var full = ty.textContent; ty.textContent = '';
    onSeen(ag, function () {
      var i = 0; (function step() { ty.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(step, 18); else ag.classList.add('run'); })();
    }, 0.4);
  })();

  /* ---------- contato: monta a mensagem e a planta ---------- */
  var SHORT = { agentes: 'agentes de IA', seguro: 'IA segura', kpis: 'contrato → KPI', paineis: 'painel', capacitacao: 'capacitação', palestra: 'palestra', vaga: 'vaga' };
  function renderContato(p, opts) {
    var box = $('#opts');
    box.innerHTML = opts.map(function (o) {
      return '<label class="opt"><input type="checkbox" name="need" value="' + esc(o.id) + '"><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span>' + esc(o.rotulo) + '</span></label>';
    }).join('');
    // planta: 3 nós à esquerda, 3 à direita, 1 embaixo, ligados ao núcleo por linhas ortogonais
    var pos = [[8, 30, 'L'], [8, 120, 'L'], [8, 210, 'L'], [252, 30, 'R'], [252, 120, 'R'], [252, 210, 'R'], [130, 258, 'B']];
    var svg = '<rect class="core" x="125" y="118" width="110" height="44"/><text class="core-t" x="180" y="144" text-anchor="middle">sua operação</text>';
    opts.forEach(function (o, i) {
      var q = pos[i]; if (!q) return;
      var x = q[0], y = q[1], w = 100, h = 30, cy = y + h / 2, d;
      if (q[2] === 'L') d = 'M' + (x + w) + ' ' + cy + ' H117 V140 H125';
      else if (q[2] === 'R') d = 'M' + x + ' ' + cy + ' H243 V140 H235';
      else d = 'M180 ' + y + ' V162';
      svg += '<g class="n" data-id="' + esc(o.id) + '"><path class="wire" d="' + d + '"/><path class="wire-on" d="' + d + '"/><rect class="node" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/><text class="in" x="' + (x + w / 2) + '" y="' + (cy + 3.5) + '" text-anchor="middle">' + esc(SHORT[o.id] || o.rotulo.slice(0, 14)) + '</text></g>';
    });
    var map = $('#map'); map.innerHTML = svg;
    $$('.wire-on', map).forEach(function (pth) { var L = Math.ceil(pth.getTotalLength ? pth.getTotalLength() : 200); pth.style.setProperty('--len', L); });

    var labels = {}; opts.forEach(function (o) { labels[o.id] = o.rotulo; });
    var msgEl = $('#msg'), typer = null;
    function compose() {
      var sel = $$('input:checked', box).map(function (i) { return i.value; });
      var nome = $('#f-nome').value.trim(), emp = $('#f-emp').value.trim();
      var t = 'Olá, Kevin! Vim pelo seu site.';
      if (nome) t += ' Aqui é ' + nome + (emp ? ', de ' + emp : '') + '.'; else if (emp) t += ' Falo de ' + emp + '.';
      if (sel.length) t += '\n\nQuero conversar sobre:\n' + sel.map(function (s) { return '• ' + labels[s]; }).join('\n') + '\n\nPodemos marcar uma conversa?';
      else t += ' Quero conversar.';
      return { text: t, sel: sel };
    }
    function update(animate) {
      var c = compose();
      $$('.n', map).forEach(function (g) { g.classList.toggle('on', c.sel.indexOf(g.dataset.id) > -1); });
      $('#plan').classList.toggle('ready', c.sel.length > 0);
      $('#plan-st').textContent = c.sel.length ? 'pronto · ' + c.sel.length + (c.sel.length === 1 ? ' item' : ' itens') : 'rascunho · 0 itens';
      $('#send').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(c.text);
      $('#send-mail').href = 'mailto:' + (p && p.email || 'johnkevinribeiro@gmail.com') + '?subject=' + encodeURIComponent('Contato pelo site') + '&body=' + encodeURIComponent(c.text);
      clearTimeout(typer);
      if (!animate || reduce) { msgEl.innerHTML = esc(c.text) + '<span class="cur"></span>'; return; }
      var prev = msgEl.textContent, k = 0;
      while (k < prev.length && prev[k] === c.text[k]) k++;
      (function step() { msgEl.innerHTML = esc(c.text.slice(0, k)) + '<span class="cur"></span>'; if (k < c.text.length) { k += 2; typer = setTimeout(step, 12); } })();
    }
    box.addEventListener('change', function () { update(true); });
    $('#f-nome').addEventListener('input', function () { update(false); });
    $('#f-emp').addEventListener('input', function () { update(false); });
    update(false);
    reveal($$('#opts > .opt'));
  }
})();

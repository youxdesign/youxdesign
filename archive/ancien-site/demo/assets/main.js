/* ==========================================================================
   Claire Morel · Psychologue clinicienne
   Interactions du site : en-tête, menu mobile, apparitions au défilement,
   frises, compteurs, exercice de respiration, statut d'ouverture, FAQ, carte.
   Aucun outil de mesure d'audience, aucun cookie.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  doc.classList.add('js');

  /* Horaires d'ouverture : [jour (0 = dimanche), ouverture, fermeture] en heures décimales */
  var HORAIRES = [[1, 9, 20], [2, 9, 20], [3, 9, 20], [4, 9, 20], [5, 9, 20], [6, 9, 13]];

  /* ------------------------------------------------------------------------
     Titres découpés en lignes (héros)
     ------------------------------------------------------------------------ */
  $$('[data-split]').forEach(function (el) {
    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(function (l, i) {
      return '<span class="split-line" style="--i:' + i + '"><span>' + l.trim() + '</span></span>';
    }).join('');
  });
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add('is-ready'); }); });

  /* ------------------------------------------------------------------------
     En-tête : fond au défilement, masqué en descendant
     ------------------------------------------------------------------------ */
  var header = $('.header');
  var mobileCta = $('.mobile-cta');
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      var goingDown = y > lastY && y > 320;
      if (!doc.classList.contains('menu-open')) header.classList.toggle('is-hidden', goingDown);
    }
    if (mobileCta) mobileCta.classList.toggle('is-visible', y > 560 && (window.innerHeight + y) < document.body.scrollHeight - 260);
    lastY = y;
    updateProgress();
    updateParallax();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ------------------------------------------------------------------------
     Menu mobile
     ------------------------------------------------------------------------ */
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = !doc.classList.contains('menu-open');
      doc.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open) header.classList.remove('is-hidden');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.classList.contains('menu-open')) burger.click();
    });
    $$('.mobile-menu a').forEach(function (a, i) {
      a.style.setProperty('--i', i);
      a.addEventListener('click', function () { doc.classList.remove('menu-open'); });
    });
  }

  /* ------------------------------------------------------------------------
     Apparitions au défilement
     ------------------------------------------------------------------------ */
  $$('[data-stagger]').forEach(function (group) {
    $$('[data-reveal]', group).forEach(function (el, i) { el.style.setProperty('--i', i % 8); });
  });
  var revealEls = $$('[data-reveal], [data-mask], .checks li, .phase');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) {
      /* un élément entièrement masqué (clip-path) n'est jamais « visible » : on observe son parent */
      if (el.hasAttribute('data-mask')) {
        var mo = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) { el.classList.add('is-in'); mo.disconnect(); }
        }, { rootMargin: '0px 0px -12% 0px' });
        mo.observe(el.parentElement);
      } else io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------------------
     Frises qui se remplissent au défilement (étapes, parcours)
     ------------------------------------------------------------------------ */
  var tracks = $$('[data-progress]');
  function updateProgress() {
    var vh = window.innerHeight;
    tracks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var start = vh * 0.8, end = vh * 0.45;
      var p = (start - r.top) / (r.height + start - end);
      p = Math.max(0, Math.min(1, p));
      if (reduce) p = 1;
      el.style.setProperty('--p', p.toFixed(3));
      var items = $$('[data-progress-item]', el);
      items.forEach(function (it, i) {
        var threshold = items.length > 1 ? i / (items.length - 1) : 0;
        it.classList.toggle('is-active', p >= threshold * 0.98);
      });
    });
  }

  /* Léger effet de profondeur sur les visuels */
  var parallax = $$('[data-parallax]');
  function updateParallax() {
    if (reduce) return;
    var vh = window.innerHeight;
    parallax.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var c = (r.top + r.height / 2 - vh / 2) / vh;
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.08;
      el.style.transform = 'translate3d(0,' + (c * k * 100).toFixed(2) + 'px,0)';
    });
  }

  /* Suivi de la souris sur le visuel du héros */
  var art = $('[data-tilt]');
  if (art && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var hero = art.closest('.hero') || document.body;
    hero.addEventListener('pointermove', function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      $$('[data-depth]', hero).forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth'));
        el.style.translate = (x * d).toFixed(1) + 'px ' + (y * d).toFixed(1) + 'px';
      });
    });
  }

  /* ------------------------------------------------------------------------
     Compteurs (« 5 à 10 séances »…)
     ------------------------------------------------------------------------ */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var parts = el.getAttribute('data-count').split('-').map(Number);
    var dur = 1600, t0 = performance.now();
    function frame(t) {
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 4);
      el.textContent = parts.map(function (n) { return Math.round(n * e); }).join(' à ');
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Cercle pensées / émotions / comportements
     ------------------------------------------------------------------------ */
  var nodes = $$('.cycle__node');
  if (nodes.length && !reduce) {
    var lit = 0;
    setInterval(function () {
      nodes.forEach(function (n, i) { n.classList.toggle('is-lit', i === lit); });
      lit = (lit + 1) % nodes.length;
    }, 2200);
  }

  /* ------------------------------------------------------------------------
     Statut d'ouverture du cabinet, en direct
     ------------------------------------------------------------------------ */
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function fmt(h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + 'h' + (m ? String(m).padStart(2, '0') : ''); }
  function openStatus(now) {
    var d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var today = HORAIRES.filter(function (x) { return x[0] === d; })[0];
    if (today && h >= today[1] && h < today[2]) return { open: true, text: 'Ouvert maintenant', sub: "jusqu'à " + fmt(today[2]) };
    for (var k = 0; k < 8; k++) {
      var day = (d + k) % 7;
      var slot = HORAIRES.filter(function (x) { return x[0] === day; })[0];
      if (!slot || (k === 0 && h >= slot[1])) continue;
      var when = k === 0 ? "aujourd'hui" : k === 1 ? 'demain' : DAYS[day];
      return { open: false, text: 'Fermé pour le moment', sub: 'réouverture ' + when + ' à ' + fmt(slot[1]) };
    }
    return { open: false, text: 'Fermé', sub: 'sur rendez-vous' };
  }
  var st = openStatus(new Date());
  $$('[data-open-status]').forEach(function (el) {
    var dot = $('.dot', el), t = $('[data-status-text]', el), s = $('[data-status-sub]', el);
    if (dot) dot.classList.toggle('is-closed', !st.open);
    el.classList.toggle('is-closed', !st.open);
    if (t) t.textContent = st.text;
    if (s) s.textContent = st.sub;
  });
  $$('[data-day]').forEach(function (li) {
    if (li.getAttribute('data-day').split(',').map(Number).indexOf(new Date().getDay()) > -1) li.classList.add('is-today');
  });

  /* ------------------------------------------------------------------------
     Exercice de respiration guidé (cohérence cardiaque simplifiée)
     ------------------------------------------------------------------------ */
  var breath = $('[data-breath]');
  if (breath) {
    var circle = $('.breath__circle', breath);
    var label = $('[data-breath-label]', breath);
    var sub = $('[data-breath-sub]', breath);
    var btn = $('[data-breath-toggle]', breath);
    var ring = $('.breath__progress circle', breath);
    var PHASES = [['Inspirez', 4, 1], ['Retenez', 2, 1], ['Expirez', 6, .62]];
    var TOTAL = 60;
    var timer = null, elapsed = 0, phase = 0, phaseLeft = 0, running = false;

    function setPhase(i) {
      phase = i; phaseLeft = PHASES[i][1];
      circle.style.transitionDuration = PHASES[i][1] + 's';
      circle.style.transform = 'scale(' + PHASES[i][2] + ')';
      label.textContent = PHASES[i][0];
    }
    function tick() {
      elapsed += 1; phaseLeft -= 1;
      ring.style.strokeDashoffset = String(1 - elapsed / TOTAL);
      sub.textContent = Math.max(0, TOTAL - elapsed) + ' s';
      if (elapsed >= TOTAL) return stop(true);
      if (phaseLeft <= 0) setPhase((phase + 1) % PHASES.length);
    }
    function start() {
      running = true; elapsed = 0; breath.classList.add('is-running');
      btn.innerHTML = 'Arrêter';
      ring.style.transition = 'stroke-dashoffset 1s linear';
      ring.style.strokeDashoffset = '1';
      sub.textContent = TOTAL + ' s';
      setPhase(0);
      timer = setInterval(tick, 1000);
    }
    function stop(done) {
      running = false; clearInterval(timer); if (!done) breath.classList.remove('is-running');
      circle.style.transitionDuration = '1.6s';
      circle.style.transform = 'scale(.62)';
      label.textContent = done ? 'Bravo' : 'Prêt ?';
      sub.textContent = done ? 'une minute pour vous' : '1 minute';
      btn.innerHTML = done ? 'Recommencer' : 'Commencer';
      if (!done) { ring.style.transition = 'none'; ring.style.strokeDashoffset = '1'; }
    }
    btn.addEventListener('click', function () { running ? stop(false) : start(); });
  }

  /* ------------------------------------------------------------------------
     FAQ : ouverture animée + sommaire actif
     ------------------------------------------------------------------------ */
  $$('details.acc').forEach(function (det) {
    var sum = $('summary', det), body = $('.acc__body', det);
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)' })
          .onfinish = function () { det.open = false; };
        det.classList.add('is-closing');
        setTimeout(function () { det.classList.remove('is-closing'); }, 420);
      } else {
        det.open = true;
        var full = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: full + 'px', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });
  var tocLinks = $$('[data-toc] a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    tocLinks.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) tio.observe(t); });
  }

  /* ------------------------------------------------------------------------
     Carte : chargée seulement après accord du visiteur (aucune requête avant)
     ------------------------------------------------------------------------ */
  var mapBtn = $('[data-map-load]');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var map = mapBtn.closest('.map');
      var f = document.createElement('iframe');
      f.title = 'Carte OpenStreetMap du cabinet';
      f.loading = 'lazy';
      f.src = map.getAttribute('data-src');
      map.appendChild(f);
      $('.map__consent', map).remove();
    });
  }

  /* ------------------------------------------------------------------------
     Bannière « site de démonstration youXdesign »
     ------------------------------------------------------------------------ */
  var bar = $('.demo-bar');
  if (bar) {
    var hidden = false;
    try { hidden = sessionStorage.getItem('demo-bar') === 'off'; } catch (e) {}
    if (!hidden) setTimeout(function () { bar.classList.add('is-visible'); doc.classList.add('has-demo-bar'); }, 2200);
    $('button', bar).addEventListener('click', function () {
      bar.classList.remove('is-visible'); doc.classList.remove('has-demo-bar');
      try { sessionStorage.setItem('demo-bar', 'off'); } catch (e) {}
    });
  }

  /* Année du pied de page */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  onScroll();
  window.addEventListener('resize', function () { updateProgress(); updateParallax(); });
})();

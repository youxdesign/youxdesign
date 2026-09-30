/* Utilitaires partagés par toutes les pages : infos du cabinet, animations au scroll,
   transitions de page, thème. */
(function () {
  if (window.Site) return;
  var cab = null;
  var reduce = function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var FONTS = {
    'Cormorant Garamond': { key: 'cormorant' },
    'Playfair Display': { key: 'playfair', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap' },
    'Lora': { key: 'lora', url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap' }
  };

  var Site = {
    cabinet: function () {
      return cab || (cab = new Promise(function (res) { (function t() { window.CABINET ? res(window.CABINET) : setTimeout(t, 20); })(); }));
    },

    reveal: function (root) {
      root = root || document;
      var els = [].slice.call(root.querySelectorAll('[data-reveal]:not([data-reveal-ready])'));
      if (!els.length) return;
      if (reduce() || !('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.setAttribute('data-reveal-ready', ''); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target; io.unobserve(el);
          setTimeout(function () {
            el.style.opacity = el._rv.o || '1';
            el.style.transform = el._rv.t || 'none';
            setTimeout(function () {
              el.style.transition = el._rv.tr; el.style.transform = el._rv.t; el.style.opacity = el._rv.o;
            }, 900);
          }, el._rvDelay);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

      els.forEach(function (el) {
        el.setAttribute('data-reveal-ready', '');
        var group = el.parentElement && el.parentElement.closest('[data-stagger]');
        var i = 0;
        if (group) i = [].slice.call(group.querySelectorAll('[data-reveal]')).indexOf(el);
        el._rvDelay = Math.min(Math.max(i, 0), 7) * 90;
        el._rv = { o: el.style.opacity, t: el.style.transform, tr: el.style.transition };
        el.style.transition = 'opacity 800ms var(--ease), transform 800ms var(--ease)';
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        io.observe(el);
      });
    },

    setTheme: function (opts, noSave) {
      var r = document.documentElement;
      if (!noSave) { try { localStorage.setItem('cabinet-theme', JSON.stringify(opts)); } catch (e) {} }
      if (opts.palette) r.setAttribute('data-palette', opts.palette);
      if (opts.font && FONTS[opts.font]) {
        var f = FONTS[opts.font];
        r.setAttribute('data-font', f.key);
        if (f.url && !document.getElementById('font-' + f.key)) {
          var l = document.createElement('link');
          l.id = 'font-' + f.key; l.rel = 'stylesheet'; l.href = f.url;
          document.head.appendChild(l);
        }
      }
    }
  };

  /* Transition douce entre les pages internes */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    var href = a.getAttribute('href') || '';
    if (!href || href[0] === '#' || /^(https?:|mailto:|tel:)/.test(href)) return;
    var m = href.match(/([\w-]+)\.dc\.html(?:[?#].*)?$/);
    if (window.__siteRouter && m) {
      /* Site publié en un seul fichier : navigation interne par ancre */
      e.preventDefault();
      var target = m[1] === 'Accueil' ? '#/' : '#/' + m[1];
      document.body.style.transition = 'opacity 400ms var(--ease)';
      document.body.style.opacity = '0';
      setTimeout(function () {
        if (location.hash === target || (target === '#/' && !location.hash)) window.__siteRouter(true);
        else location.hash = target;
      }, 400);
      return;
    }
    if (reduce()) return;
    e.preventDefault();
    document.body.style.transition = 'opacity 450ms var(--ease)';
    document.body.style.opacity = '0';
    setTimeout(function () { window.location.href = a.href; }, 450);
  });
  window.addEventListener('pageshow', function () { document.body.style.opacity = ''; });

  window.Site = Site;
  try { var saved = JSON.parse(localStorage.getItem('cabinet-theme') || 'null'); if (saved) Site.setTheme(saved, true); } catch (e) {}
  window.whenSite = function () {
    return new Promise(function (res) { (function t() { window.Site ? res(window.Site) : setTimeout(t, 30); })(); });
  };
})();

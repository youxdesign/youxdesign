/* ==========================================================================
   Style « Sauge » : interactions de la démo d'origine.
   En-tête au défilement, apparitions, frises, profondeur, compteurs, cercle
   des TCC, respiration guidée, FAQ animée, statut d'ouverture, carte.
   Aucun outil de mesure d'audience, aucun cookie, rien n'est enregistré.
   ========================================================================== */
import { statut } from './lib/horaires.js';
import './carte.js';

const doc = document.documentElement;
const reduire = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, racine) => (racine || document).querySelector(sel);
const $$ = (sel, racine) => Array.from((racine || document).querySelectorAll(sel));

/* Le script est chargé : les apparitions passent sous son contrôle */
doc.classList.add('js-pret');

/* --------------------------------------------------------------------------
   En-tête : fond au défilement, masqué en descendant ; bouton mobile
   -------------------------------------------------------------------------- */
const entete = $('[data-entete]');
const boutonMobile = $('[data-mobile-cta]');
const menu = $('#menu-mobile');
let dernierY = window.scrollY;
let enCours = false;

function auDefilement() {
  const y = window.scrollY;
  if (entete) {
    entete.classList.toggle('is-scrolled', y > 24);
    const descend = y > dernierY && y > 320;
    const menuOuvert = menu && menu.matches(':popover-open');
    if (!menuOuvert) entete.classList.toggle('is-hidden', descend);
  }
  if (boutonMobile) boutonMobile.classList.toggle('is-visible', y > 560 && (window.innerHeight + y) < document.body.scrollHeight - 260);
  dernierY = y;
  majFrises();
  majProfondeur();
  enCours = false;
}
window.addEventListener('scroll', () => {
  if (!enCours) { enCours = true; requestAnimationFrame(auDefilement); }
}, { passive: true });

/* Menu mobile : fermé dès qu'on choisit une page */
if (menu) $$('a', menu).forEach((a) => a.addEventListener('click', () => { try { menu.hidePopover(); } catch (e) { /* déjà fermé */ } }));

/* --------------------------------------------------------------------------
   Apparitions au défilement (décalées dans un même groupe)
   -------------------------------------------------------------------------- */
$$('[data-stagger]').forEach((groupe) => {
  $$('[data-reveal]', groupe).forEach((el, i) => el.style.setProperty('--i', i % 8));
});
$$('.checks li').forEach((el, i) => el.style.setProperty('--i', i));
const aReveler = $$('[data-reveal], [data-mask], .checks li');
if ('IntersectionObserver' in window && !reduire) {
  const io = new IntersectionObserver((entrees) => {
    entrees.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  aReveler.forEach((el) => {
    /* un élément entièrement masqué (clip-path) n'est jamais « visible » : on observe son parent */
    if (el.hasAttribute('data-mask')) {
      const mo = new IntersectionObserver((en) => {
        if (en[0].isIntersecting) { el.classList.add('is-in'); mo.disconnect(); }
      }, { rootMargin: '0px 0px -12% 0px' });
      mo.observe(el.parentElement);
    } else io.observe(el);
  });
} else {
  aReveler.forEach((el) => el.classList.add('is-in'));
}

/* --------------------------------------------------------------------------
   Frises qui se remplissent au défilement (étapes, parcours)
   -------------------------------------------------------------------------- */
const frises = $$('[data-progress]');
function majFrises() {
  const vh = window.innerHeight;
  frises.forEach((el) => {
    const r = el.getBoundingClientRect();
    const debut = vh * 0.8, fin = vh * 0.45;
    let p = (debut - r.top) / (r.height + debut - fin);
    p = reduire ? 1 : Math.max(0, Math.min(1, p));
    el.style.setProperty('--p', p.toFixed(3));
    const etapes = $$('[data-progress-item]', el);
    etapes.forEach((it, i) => {
      const seuil = etapes.length > 1 ? i / (etapes.length - 1) : 0;
      it.classList.toggle('is-active', p >= seuil * 0.98);
    });
  });
}

/* Léger effet de profondeur sur le portrait */
const profondeur = $$('[data-parallax]');
function majProfondeur() {
  if (reduire) return;
  const vh = window.innerHeight;
  profondeur.forEach((el) => {
    const r = el.parentElement.getBoundingClientRect();
    const c = (r.top + r.height / 2 - vh / 2) / vh;
    const k = parseFloat(el.dataset.parallax) || 0.08;
    el.style.transform = `translate3d(0, ${(c * k * 100).toFixed(2)}px, 0)`;
  });
}

/* Le visuel de l'accueil suit doucement la souris */
const visuel = $('[data-tilt]');
if (visuel && !reduire && window.matchMedia('(pointer: fine)').matches) {
  const heros = visuel.closest('.hero') || document.body;
  const couches = $$('[data-depth]', heros);
  heros.addEventListener('pointermove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
    couches.forEach((el) => {
      const d = parseFloat(el.dataset.depth);
      el.style.translate = `${(x * d).toFixed(1)}px ${(y * d).toFixed(1)}px`;
    });
  });
}

/* --------------------------------------------------------------------------
   Compteurs (« 5 à 10 séances »)
   -------------------------------------------------------------------------- */
function compter(el) {
  const parts = el.dataset.count.split('-').map(Number);
  const duree = 1600, t0 = performance.now();
  const image = (t) => {
    const k = Math.min(1, (t - t0) / duree);
    const ease = 1 - Math.pow(1 - k, 4);
    el.textContent = parts.map((n) => Math.round(n * ease)).join(' à ');
    if (k < 1) requestAnimationFrame(image);
  };
  requestAnimationFrame(image);
}
if ('IntersectionObserver' in window && !reduire) {
  const cio = new IntersectionObserver((entrees) => {
    entrees.forEach((en) => { if (en.isIntersecting) { compter(en.target); cio.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));
}

/* --------------------------------------------------------------------------
   Cercle pensées / émotions / comportements : chaque pôle s'éclaire à tour de rôle
   -------------------------------------------------------------------------- */
const noeuds = $$('.cycle__node');
if (noeuds.length && !reduire) {
  let allume = 0;
  setInterval(() => {
    noeuds.forEach((n, i) => n.classList.toggle('is-lit', i === allume));
    allume = (allume + 1) % noeuds.length;
  }, 2200);
}

/* --------------------------------------------------------------------------
   Statut d'ouverture du cabinet, en direct (heure de Paris)
   -------------------------------------------------------------------------- */
$$('[data-statut]').forEach((el) => {
  try {
    const r = statut(JSON.parse(el.dataset.horaires));
    if (!r) return;
    const point = $('.dot', el), titre = $('[data-statut-texte]', el), detail = $('[data-statut-detail]', el);
    if (point) point.classList.toggle('is-closed', !r.ouvert);
    el.classList.toggle('is-closed', !r.ouvert);
    if (titre) titre.textContent = r.titre;
    if (detail) detail.textContent = r.detail;
  } catch (e) { /* le texte par défaut reste affiché */ }
});
const aujourdhui = String(new Date().getDay());
$$('[data-jours]').forEach((li) => {
  if (li.dataset.jours.split(',').includes(aujourdhui)) li.classList.add('is-today');
});

/* --------------------------------------------------------------------------
   Exercice de respiration guidé : 4 s inspiration, 2 s pause, 6 s expiration
   -------------------------------------------------------------------------- */
const souffle = $('[data-breath]');
if (souffle) {
  const cercle = $('.breath__circle', souffle);
  const libelle = $('[data-breath-label]', souffle);
  const sous = $('[data-breath-sub]', souffle);
  const bouton = $('[data-breath-toggle]', souffle);
  const anneau = $('.breath__progress circle', souffle);
  const PHASES = [['Inspirez', 4, 1], ['Retenez', 2, 1], ['Expirez', 6, 0.62]];
  const TOTAL = 60;
  let minuteur = null, ecoule = 0, phase = 0, reste = 0, actif = false;

  const changerPhase = (i) => {
    phase = i; reste = PHASES[i][1];
    cercle.style.transitionDuration = PHASES[i][1] + 's';
    cercle.style.transform = `scale(${PHASES[i][2]})`;
    libelle.textContent = PHASES[i][0];
  };
  const arreter = (fini) => {
    actif = false; clearInterval(minuteur);
    if (!fini) souffle.classList.remove('is-running');
    cercle.style.transitionDuration = '1.6s';
    cercle.style.transform = 'scale(.62)';
    libelle.textContent = fini ? 'Bravo' : 'Prêt ?';
    sous.textContent = fini ? 'une minute pour vous' : '1 minute';
    bouton.textContent = fini ? 'Recommencer' : 'Commencer';
    if (!fini) { anneau.style.transition = 'none'; anneau.style.strokeDashoffset = '1'; }
  };
  const seconde = () => {
    ecoule += 1; reste -= 1;
    anneau.style.strokeDashoffset = String(1 - ecoule / TOTAL);
    sous.textContent = Math.max(0, TOTAL - ecoule) + ' s';
    if (ecoule >= TOTAL) return arreter(true);
    if (reste <= 0) changerPhase((phase + 1) % PHASES.length);
  };
  const demarrer = () => {
    actif = true; ecoule = 0; souffle.classList.add('is-running');
    bouton.textContent = 'Arrêter';
    anneau.style.transition = 'stroke-dashoffset 1s linear';
    anneau.style.strokeDashoffset = '1';
    sous.textContent = TOTAL + ' s';
    changerPhase(0);
    minuteur = setInterval(seconde, 1000);
  };
  bouton.addEventListener('click', () => (actif ? arreter(false) : demarrer()));
}

/* --------------------------------------------------------------------------
   FAQ : ouverture animée et sommaire qui suit la lecture
   -------------------------------------------------------------------------- */
$$('details.acc').forEach((det) => {
  const resume = $('summary', det), corps = $('.acc__body', det);
  resume.addEventListener('click', (e) => {
    if (reduire || !corps.animate) return;
    e.preventDefault();
    if (det.open) {
      const h = corps.offsetHeight;
      corps.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)' })
        .onfinish = () => { det.open = false; };
    } else {
      det.open = true;
      const plein = corps.offsetHeight;
      corps.animate([{ height: '0px', opacity: 0 }, { height: plein + 'px', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  });
});
const liensSommaire = $$('[data-toc] a');
if (liensSommaire.length && 'IntersectionObserver' in window) {
  const tio = new IntersectionObserver((entrees) => {
    entrees.forEach((en) => {
      if (!en.isIntersecting) return;
      liensSommaire.forEach((a) => {
        const actif = a.getAttribute('href') === '#' + en.target.id;
        a.classList.toggle('is-current', actif);
        if (actif) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  liensSommaire.forEach((a) => { const cible = document.getElementById(a.getAttribute('href').slice(1)); if (cible) tio.observe(cible); });
}

/* --------------------------------------------------------------------------
   Bandeau « site de démonstration » (démos youXdesign uniquement)
   -------------------------------------------------------------------------- */
const bandeau = $('[data-demo-bar]');
if (bandeau) {
  doc.classList.add('has-demo-bar');
  $('[data-demo-fermer]', bandeau).addEventListener('click', () => {
    bandeau.hidden = true;
    doc.classList.remove('has-demo-bar');
  });
}

auDefilement();
window.addEventListener('resize', () => { majFrises(); majProfondeur(); });

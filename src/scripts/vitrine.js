/* ==========================================================================
   Vitrine youXdesign : mouvements et interactions
   --------------------------------------------------------------------------
   - Défilement doux (Lenis) à la molette ; défilement natif au doigt.
   - En-tête qui s'efface en descendant, revient en remontant ; menu mobile.
   - Apparitions au défilement, parallaxe légère de l'ouverture, ligne de
     la méthode et lecture mot à mot de la citation liées au défilement.
   - Galerie des styles (onglets), vidéo du configurateur et ses chapitres,
     bascule du tarif, formulaire de contact (prépare un e-mail).
   Rien ne bouge si le visiteur a demandé à réduire les animations.
   ========================================================================== */
import Lenis from 'lenis';

const racine = document.documentElement;
racine.classList.add('vt-js');
const $ = (sel, base) => (base || document).querySelector(sel);
const $$ = (sel, base) => Array.from((base || document).querySelectorAll(sel));
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const borne = (v, min, max) => Math.min(max, Math.max(min, v));

/* --------------------------------------------------------------------------
   Défilement doux
   -------------------------------------------------------------------------- */
let lenis = null;
if (!calme) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const boucle = (t) => { lenis.raf(t); requestAnimationFrame(boucle); };
  requestAnimationFrame(boucle);
}
const entete = $('[data-entete]');
const hauteurEntete = () => (entete ? entete.getBoundingClientRect().height : 0);

function allerVers(cible, { focus = true } = {}) {
  const decalage = -(hauteurEntete() + 16);
  if (lenis) lenis.scrollTo(cible, { offset: decalage, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: cible.getBoundingClientRect().top + window.scrollY + decalage, behavior: calme ? 'auto' : 'smooth' });
  if (focus) {
    if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
  }
}

/* Liens vers une section de la page en cours (#… ou /#…) */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href*="#"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const cible = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!cible) return;
  e.preventDefault();
  fermerMenu();
  allerVers(cible);
  history.pushState(null, '', url.hash);
});
/* Arrivée depuis une autre page avec une ancre : on laisse le navigateur
   placer la page, puis on corrige d'éventuels décalages de chargement. */
if (location.hash) {
  const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (cible) window.addEventListener('load', () => allerVers(cible, { focus: false }), { once: true });
}

/* --------------------------------------------------------------------------
   En-tête et menu mobile
   -------------------------------------------------------------------------- */
const burger = $('[data-burger]');
const menu = $('[data-menu]');
let menuOuvert = false;

function ouvrirMenu() {
  if (!menu || menuOuvert) return;
  menuOuvert = true;
  menu.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => entete.classList.add('est-ouvert')));
  burger.setAttribute('aria-expanded', 'true');
  $('[data-burger-texte]', burger).textContent = 'Fermer le menu';
  lenis?.stop();
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('a', menu)?.focus(), 250);
}
function fermerMenu({ rendreFocus = false } = {}) {
  if (!menu || !menuOuvert) return;
  menuOuvert = false;
  entete.classList.remove('est-ouvert');
  burger.setAttribute('aria-expanded', 'false');
  $('[data-burger-texte]', burger).textContent = 'Ouvrir le menu';
  lenis?.start();
  document.body.style.overflow = '';
  setTimeout(() => { if (!menuOuvert) menu.hidden = true; }, calme ? 0 : 700);
  if (rendreFocus) burger.focus();
}
burger?.addEventListener('click', () => (menuOuvert ? fermerMenu() : ouvrirMenu()));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOuvert) fermerMenu({ rendreFocus: true });
  /* Le focus reste dans le menu tant qu'il est ouvert */
  if (e.key === 'Tab' && menuOuvert) {
    const elements = [burger, ...$$('a, button', menu)];
    const premier = elements[0], dernier = elements[elements.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  }
});
menu?.addEventListener('click', (e) => { if (e.target.closest('a')) fermerMenu(); });
window.matchMedia('(min-width: 56.0625rem)').addEventListener('change', (m) => { if (m.matches) fermerMenu(); });

/* --------------------------------------------------------------------------
   Effets liés au défilement (une seule boucle, au rythme de l'écran)
   -------------------------------------------------------------------------- */
const visuel = $('[data-parallaxe]');
const profondeur = $('[data-profondeur]');
const etapes = $('[data-etapes]');
const ligne = etapes && $('[data-ligne]', etapes)?.parentElement;
const citation = $('[data-lecture-mots]');
const motsCitation = citation ? $$('.vt-mot-lu', citation) : [];
let dernierY = window.scrollY;
let lus = -1;
let enAttente = false;

if (etapes && !calme) etapes.setAttribute('data-progres', '');

function surDefilement() {
  enAttente = false;
  const y = window.scrollY;
  const h = window.innerHeight;

  if (entete) {
    entete.classList.toggle('est-defile', y > 24);
    const descend = y > dernierY + 4, monte = y < dernierY - 4;
    if (descend && y > 160 && !menuOuvert && !entete.contains(document.activeElement)) entete.classList.add('est-cache');
    else if (monte || y < 160) entete.classList.remove('est-cache');
  }
  dernierY = y;
  if (calme) return;

  if (visuel && y < h * 1.4) {
    visuel.style.setProperty('--vt-p', `${(y * 0.1).toFixed(1)}px`);
    profondeur?.style.setProperty('--vt-p2', `${(y * -0.08).toFixed(1)}px`);
  }
  if (ligne) {
    const r = etapes.getBoundingClientRect();
    const p = borne((h * 0.82 - r.top) / (r.height + h * 0.2), 0, 1);
    ligne.style.setProperty('--vt-progres', p.toFixed(3));
  }
  if (motsCitation.length) {
    const r = citation.getBoundingClientRect();
    const p = borne((h * 0.85 - r.top) / (r.height + h * 0.3), 0, 1);
    const n = Math.round(p * motsCitation.length);
    if (n !== lus) {
      motsCitation.forEach((m, i) => m.classList.toggle('est-lu', i < n));
      lus = n;
    }
  }
}
const demander = () => { if (!enAttente) { enAttente = true; requestAnimationFrame(surDefilement); } };
window.addEventListener('scroll', demander, { passive: true });
window.addEventListener('resize', demander);
surDefilement();
if (calme) motsCitation.forEach((m) => m.classList.add('est-lu'));

/* --------------------------------------------------------------------------
   Apparitions au défilement
   -------------------------------------------------------------------------- */
const aReveler = $$('[data-apparait]');
aReveler.forEach((el) => {
  const freres = Array.from(el.parentElement.children).filter((f) => f.hasAttribute('data-apparait'));
  const rang = freres.indexOf(el) % 6;
  if (rang) el.style.setProperty('--vt-i', String(rang));
});
if ('IntersectionObserver' in window && !calme) {
  const io = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('est-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  aReveler.forEach((el) => io.observe(el));
} else {
  aReveler.forEach((el) => el.classList.add('est-visible'));
}

/* --------------------------------------------------------------------------
   Survol : boutons « aimantés » et lueur qui suit le pointeur
   -------------------------------------------------------------------------- */
if (pointeurFin && !calme) {
  $$('[data-aimant]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--vt-mx', `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
      el.style.setProperty('--vt-my', `${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--vt-mx', '0px'); el.style.setProperty('--vt-my', '0px'); });
  });
  $$('[data-lueur]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--vt-lx', `${e.clientX - r.left}px`);
      el.style.setProperty('--vt-ly', `${e.clientY - r.top}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   Galerie des styles (onglets)
   -------------------------------------------------------------------------- */
const galerie = $('[data-galerie]');
if (galerie) {
  const onglets = $$('[data-onglet]', galerie);
  const images = $$('[data-image]', galerie);
  const vue = $('#galerie-vue');
  const detail = $('[data-galerie-detail]', galerie);
  const lien = $('[data-galerie-lien]', galerie);
  const nom = $('[data-galerie-nom]', galerie);
  const adresse = $('[data-galerie-adresse]', galerie);
  let actif = 0;
  let minuterie = null;

  const activer = (i, { focus = false } = {}) => {
    if (i === actif) return;
    actif = i;
    const o = onglets[i];
    onglets.forEach((x, j) => { x.setAttribute('aria-selected', String(j === i)); x.tabIndex = j === i ? 0 : -1; });
    images.forEach((img) => img.classList.toggle('est-actif', img.dataset.image === o.dataset.onglet));
    vue.setAttribute('aria-labelledby', o.id);
    galerie.classList.add('est-change');
    setTimeout(() => {
      detail.textContent = o.dataset.detail;
      nom.textContent = o.dataset.nom;
      lien.href = o.dataset.lien;
      adresse.textContent = o.dataset.lien;
      galerie.classList.remove('est-change');
    }, calme ? 0 : 220);
    if (focus) o.focus();
    /* Sur téléphone, l'onglet choisi reste visible dans la liste */
    if (window.matchMedia('(max-width: 56rem)').matches) o.scrollIntoView({ block: 'nearest', inline: 'center', behavior: calme ? 'auto' : 'smooth' });
  };
  onglets.forEach((o, i) => {
    o.addEventListener('click', () => activer(i));
    if (pointeurFin) {
      o.addEventListener('pointerenter', () => { clearTimeout(minuterie); minuterie = setTimeout(() => activer(i), 110); });
      o.addEventListener('pointerleave', () => clearTimeout(minuterie));
    }
    o.addEventListener('keydown', (e) => {
      const n = onglets.length;
      const cible = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
      if (cible === undefined) return;
      e.preventDefault();
      activer((cible + n) % n, { focus: true });
    });
  });
  /* Toutes les images se chargent quand la galerie approche */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { images.forEach((img) => { img.loading = 'eager'; }); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(galerie);
  }
}

/* --------------------------------------------------------------------------
   Vidéo du configurateur : lecture quand elle est à l'écran, chapitres
   -------------------------------------------------------------------------- */
const blocVideo = $('[data-video]');
if (blocVideo) {
  const video = $('[data-media]', blocVideo);
  const bouton = $('[data-lecture]', blocVideo);
  const chapitres = $$('[data-debut]', blocVideo);
  let voulue = !calme;
  let visible = false;

  const etat = (e) => {
    blocVideo.dataset.etat = e;
    bouton.setAttribute('aria-label', e === 'lecture' ? 'Mettre la vidéo en pause' : 'Lire la vidéo');
  };
  etat('pause');
  const lire = () => {
    if (video.preload === 'none') video.preload = 'auto';
    const p = video.play();
    if (p) p.catch(() => etat('pause'));
  };
  const majChapitres = () => {
    const t = video.currentTime;
    const total = video.duration || 0;
    chapitres.forEach((c) => {
      const debut = Number(c.dataset.debut);
      const fin = c.dataset.fin ? Number(c.dataset.fin) : total || debut + 10;
      const avance = borne((t - debut) / (fin - debut), 0, 1);
      c.style.setProperty('--vt-avance', avance.toFixed(3));
      c.classList.toggle('est-actif', t >= debut && t < fin);
      c.setAttribute('aria-current', t >= debut && t < fin ? 'true' : 'false');
    });
  };
  const boucle = () => { majChapitres(); if (!video.paused) requestAnimationFrame(boucle); };

  video.addEventListener('play', () => { etat('lecture'); requestAnimationFrame(boucle); });
  video.addEventListener('pause', () => etat('pause'));
  video.addEventListener('seeked', majChapitres);
  bouton.addEventListener('click', () => {
    if (video.paused) { voulue = true; lire(); } else { voulue = false; video.pause(); }
  });
  video.addEventListener('click', () => { if (!video.paused) { voulue = false; video.pause(); } });
  chapitres.forEach((c) => c.addEventListener('click', () => {
    const debut = Number(c.dataset.debut);
    voulue = true;
    const aller = () => { video.currentTime = debut; lire(); };
    if (video.readyState >= 1) aller();
    else { video.preload = 'auto'; video.addEventListener('loadedmetadata', aller, { once: true }); video.load(); }
  }));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && e.intersectionRatio >= 0.35;
      if (visible && voulue && video.paused) lire();
      else if (!visible && !video.paused) video.pause();
    }, { threshold: [0, 0.35, 0.7] }).observe(video);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !video.paused) video.pause();
    else if (!document.hidden && visible && voulue) lire();
  });
}

/* --------------------------------------------------------------------------
   Tarif : nouveau site ou refonte
   -------------------------------------------------------------------------- */
const offre = $('[data-offre]');
if (offre) {
  const bascule = $('[data-bascule]', offre);
  const choix = $$('[data-offre-choix]', offre);
  const panneaux = $$('[data-offre-panneau]', offre);
  choix.forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.offreChoix;
    choix.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    bascule.dataset.choix = id;
    panneaux.forEach((p) => { p.hidden = p.dataset.offrePanneau !== id; });
  }));
}

/* --------------------------------------------------------------------------
   Contact : copier l'adresse, préparer l'e-mail
   -------------------------------------------------------------------------- */
$$('[data-copier]').forEach((b) => b.addEventListener('click', async () => {
  const texte = $('[data-copier-texte]', b);
  try {
    await navigator.clipboard.writeText(b.dataset.copier);
    b.classList.add('est-copie');
    texte.textContent = 'Copié';
  } catch {
    texte.textContent = 'Sélectionnez l’adresse';
  }
  setTimeout(() => { b.classList.remove('est-copie'); texte.textContent = 'Copier'; }, 2200);
}));

const formulaire = $('[data-formulaire-contact]');
if (formulaire) {
  const erreur = $('[data-erreur]', formulaire);
  const champSite = $('[data-si-refonte]', formulaire);
  const majSujet = () => {
    const sujet = formulaire.elements.sujet.value;
    champSite.hidden = sujet !== 'Refaire mon site actuel';
  };
  formulaire.addEventListener('change', (e) => { if (e.target.name === 'sujet') majSujet(); });
  majSujet();

  formulaire.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = formulaire.elements;
    const manquants = [];
    [['nom', 'votre nom'], ['email', 'votre e-mail'], ['message', 'votre message']].forEach(([n, libelle]) => {
      const champ = f[n];
      const vide = !champ.value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champ.value.trim()));
      champ.setAttribute('aria-invalid', String(vide));
      if (vide) manquants.push(libelle);
    });
    if (manquants.length) {
      erreur.textContent = `Merci d’indiquer ${manquants.join(', ').replace(/, ([^,]*)$/, ' et $1')}.`;
      erreur.hidden = false;
      f[['nom', 'email', 'message'].find((n) => f[n].getAttribute('aria-invalid') === 'true')].focus();
      return;
    }
    erreur.hidden = true;
    const ligne = (libelle, valeur) => (valeur.trim() ? `${libelle} : ${valeur.trim()}\n` : '');
    const corps = `Bonjour Younes,\n\n${f.message.value.trim()}\n\n${f.nom.value.trim()}\n`
      + ligne('Ville du cabinet', f.ville.value)
      + ligne('Téléphone', f.telephone.value)
      + ligne('E-mail', f.email.value)
      + (champSite.hidden ? '' : ligne('Site actuel', f.site.value));
    const objet = `${f.sujet.value} · ${f.nom.value.trim()}`;
    window.location.href = `mailto:${formulaire.dataset.email}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
  });
}

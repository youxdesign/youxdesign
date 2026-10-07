/* ==========================================================================
   Finitions des sites (tous les styles sauf Sauge, qui a son propre script)
   - En-tête : ombre légère dès qu'on défile, s'efface quand on descend,
     revient dès qu'on remonte.
   - Apparitions : les blocs des sections entrent en douceur, en cascade
     dans une même grille (éléments .apparait des gabarits, et enfants
     directs des conteneurs de section). Masqués par la feuille de style
     seulement si JavaScript est actif ; filet de sécurité après 3 s.
   - Accueil : l'illustration suit légèrement la souris (profondeur).
   - Téléphone : bouton « Prendre rendez-vous » qui reste à portée de pouce.
   - Démos youXdesign : pastille « Créer le mien », que l'on peut masquer.
   Rien ne bouge si le visiteur a demandé à réduire les animations.
   ========================================================================== */
const racine = document.documentElement;
racine.classList.add('js-pret');
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, base) => (base || document).querySelector(sel);
const $$ = (sel, base) => Array.from((base || document).querySelectorAll(sel));

/* --------------------------------------------------------------------------
   En-tête et bouton de rendez-vous sur téléphone
   -------------------------------------------------------------------------- */
const entete = $('.entete');
const menu = $('#menu-mobile');
const cta = $('[data-cta-mobile]');
let dernierY = window.scrollY;
let enAttente = false;

function auDefilement() {
  enAttente = false;
  const y = window.scrollY;
  if (entete) {
    entete.classList.toggle('est-defile', y > 8);
    let menuOuvert = false;
    try { menuOuvert = Boolean(menu && menu.matches(':popover-open')); } catch (e) { /* navigateur sans popover */ }
    const descend = y > dernierY + 4 && y > 320;
    const monte = y < dernierY - 4;
    if (descend && !menuOuvert && !entete.contains(document.activeElement)) entete.classList.add('est-cache');
    else if (monte || y <= 320) entete.classList.remove('est-cache');
  }
  if (cta) {
    const finDePage = window.innerHeight + y > document.documentElement.scrollHeight - 260;
    cta.classList.toggle('est-visible', y > 520 && !finDePage);
  }
  dernierY = y;
}
window.addEventListener('scroll', () => {
  if (!enAttente) { enAttente = true; requestAnimationFrame(auDefilement); }
}, { passive: true });
auDefilement();

/* --------------------------------------------------------------------------
   Apparitions au défilement
   -------------------------------------------------------------------------- */
$$('main .section .conteneur > *').forEach((el) => {
  if (el.classList.contains('apparait') || el.querySelector('.apparait') || el.matches('script, style, template')) return;
  el.classList.add('apparait');
});
const elements = $$('.apparait');

/* Léger décalage entre éléments voisins (cartes d'une même grille) */
elements.forEach((el) => {
  const voisins = Array.from(el.parentElement.children).filter((f) => f.classList.contains('apparait'));
  const rang = voisins.indexOf(el) % 5;
  if (rang) el.style.setProperty('--i', String(rang));
});

/* Une fois apparu, l'élément retrouve ses styles normaux (effets de survol compris) */
function terminer(el) {
  const fin = () => {
    el.removeEventListener('transitionend', surFin);
    el.classList.remove('apparait', 'est-visible');
    el.style.removeProperty('--i');
  };
  const surFin = (e) => { if (e.target === el) fin(); };
  el.addEventListener('transitionend', surFin);
  setTimeout(fin, 2400);
}

if ('IntersectionObserver' in window && !calme) {
  const io = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('est-visible');
      terminer(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  elements.forEach((el) => io.observe(el));
} else {
  elements.forEach((el) => el.classList.add('est-visible'));
}

/* --------------------------------------------------------------------------
   Accueil : profondeur de l'illustration au survol (souris uniquement)
   -------------------------------------------------------------------------- */
const une = $('.une');
if (une && !calme && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  /* [sélecteur, amplitude en pixels] : les éléments du fond bougent plus */
  const COUCHES = [
    ['.une__visuel', 8], ['.une__resa', 7], ['.une__reperes', 5], ['.une__couche--1', 10],
    ['.une__soleil', 14], ['.une__echo', 6], ['.une__enso', 12], ['.une__halo', 18],
    ['.une__bulle', 14], ['.une__carte', 10]
  ];
  const couches = COUCHES.flatMap(([sel, ampleur]) => $$(sel, une).map((el) => [el, ampleur]));
  if (couches.length) {
    couches.forEach(([el]) => el.classList.add('a-profondeur'));
    une.addEventListener('pointermove', (e) => {
      const r = une.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      couches.forEach(([el, a]) => { el.style.translate = `${(x * a * 2).toFixed(1)}px ${(y * a * 2).toFixed(1)}px`; });
    });
    une.addEventListener('pointerleave', () => couches.forEach(([el]) => { el.style.translate = ''; }));
  }
}

/* --------------------------------------------------------------------------
   Pastille « Créer le mien » (démos youXdesign, masquée dans le configurateur)
   -------------------------------------------------------------------------- */
const bandeau = $('[data-demo-bar]');
if (bandeau && !racine.hasAttribute('data-apercu')) {
  racine.classList.add('a-bandeau-demo');
  $('[data-demo-fermer]', bandeau)?.addEventListener('click', () => {
    bandeau.hidden = true;
    racine.classList.remove('a-bandeau-demo');
  });
}

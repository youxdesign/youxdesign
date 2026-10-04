/* ==========================================================================
   Apparitions au défilement (styles communs) : les éléments .apparait sont
   masqués par la feuille de style seulement si JavaScript est actif, puis
   révélés en douceur quand ils entrent à l'écran. Filet de sécurité : s'ils
   n'ont pas été révélés au bout de 3 secondes (script bloqué), ils
   apparaissent d'eux-mêmes. Rien ne bouge si le visiteur a demandé à
   réduire les animations.
   ========================================================================== */
const racine = document.documentElement;
racine.classList.add('js-pret');
const elements = document.querySelectorAll('.apparait');
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Léger décalage entre éléments voisins (cartes d'une même grille) */
elements.forEach((el) => {
  const rang = [...el.parentElement.children].indexOf(el) % 4;
  if (rang) el.style.setProperty('--i', String(rang));
});

if ('IntersectionObserver' in window && !calme) {
  const io = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('est-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  elements.forEach((el) => io.observe(el));
} else {
  elements.forEach((el) => el.classList.add('est-visible'));
}

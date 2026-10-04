/* ==========================================================================
   Animations de l'accueil (styles Immersif et Nocturne)
   - Bouton « Mettre en pause » : arrête les animations du fond et la vidéo
     (règle d'accessibilité : tout mouvement de plus de 5 secondes doit
     pouvoir être interrompu).
   - Vidéo de fond : chargée seulement après la page, et jamais si le
     visiteur a demandé à réduire les animations ou à économiser ses données.
   ========================================================================== */
const racine = document.documentElement;
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const economie = navigator.connection && navigator.connection.saveData;

document.querySelectorAll('[data-pause]').forEach((bouton) => {
  if (calme) return;
  bouton.hidden = false;
  bouton.addEventListener('click', () => {
    const pause = racine.dataset.animations !== 'pause';
    if (pause) racine.dataset.animations = 'pause';
    else delete racine.dataset.animations;
    bouton.setAttribute('aria-pressed', String(pause));
    bouton.textContent = pause ? 'Reprendre l’animation' : 'Mettre l’animation en pause';
    document.querySelectorAll('video[data-fond]').forEach((v) => (pause ? v.pause() : v.play().catch(() => {})));
  });
});

window.addEventListener('load', () => {
  if (calme || economie) return;
  document.querySelectorAll('video[data-fond][data-src]').forEach((v) => {
    v.src = v.dataset.src;
    v.removeAttribute('data-src');
    v.addEventListener('playing', () => v.classList.add('est-lue'), { once: true });
    v.play().catch(() => {});
  });
});

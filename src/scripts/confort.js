/* Confort de lecture (option) : taille du texte et contraste renforcé.
   Rien n'est enregistré : le réglage vaut pour la page affichée. */
const racine = document.documentElement;
const ZOOMS = { '-1': 0.92, 0: 1, 1: 1.15 };
const boutons = document.querySelectorAll('[data-confort-taille]');
boutons.forEach((b) => {
  b.setAttribute('aria-pressed', b.dataset.confortTaille === '0' ? 'true' : 'false');
  b.addEventListener('click', () => {
    document.body.style.zoom = String(ZOOMS[b.dataset.confortTaille]);
    boutons.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  });
});
document.querySelectorAll('[data-confort-contraste]').forEach((c) => {
  c.addEventListener('change', () => {
    if (c.checked) racine.dataset.contraste = '';
    else delete racine.dataset.contraste;
  });
});

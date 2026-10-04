/* Carte interactive à la demande : rien n'est chargé tant que le visiteur
   n'a pas cliqué sur « Afficher la carte interactive ». */
document.querySelectorAll('[data-plan-afficher]').forEach((bouton) => {
  const cadre = bouton.closest('[data-plan]') || bouton.closest('.plan').querySelector('[data-plan]');
  bouton.addEventListener('click', () => {
    const actif = cadre.hasAttribute('data-interactif');
    if (actif) {
      cadre.querySelector('iframe')?.remove();
      cadre.removeAttribute('data-interactif');
      bouton.textContent = 'Afficher la carte interactive';
      bouton.setAttribute('aria-pressed', 'false');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.src = cadre.dataset.src;
    iframe.title = cadre.dataset.titre;
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'no-referrer';
    cadre.appendChild(iframe);
    cadre.setAttribute('data-interactif', '');
    bouton.textContent = 'Masquer la carte interactive';
    bouton.setAttribute('aria-pressed', 'true');
  });
});

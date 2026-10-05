/* Contenu extérieur à la demande (carte interactive, agenda de réservation) :
   rien n'est chargé tant que le visiteur n'a pas cliqué sur le bouton. */
document.querySelectorAll('[data-plan-afficher]').forEach((bouton) => {
  const cadre = bouton.closest('[data-plan]') || bouton.closest('.plan, .opt-agenda')?.querySelector('[data-plan]');
  if (!cadre) return;
  const afficher = bouton.dataset.texteAfficher || 'Afficher la carte interactive';
  const masquer = bouton.dataset.texteMasquer || 'Masquer la carte interactive';
  bouton.addEventListener('click', () => {
    const actif = cadre.hasAttribute('data-interactif');
    if (actif) {
      cadre.querySelector('iframe')?.remove();
      cadre.removeAttribute('data-interactif');
      bouton.textContent = afficher;
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
    bouton.textContent = masquer;
    bouton.setAttribute('aria-pressed', 'true');
  });
});

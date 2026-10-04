/* Respiration guidée : 5 cycles de 12 secondes (4 s inspiration, 2 s pause, 6 s expiration). */
document.querySelectorAll('[data-respiration]').forEach((bloc) => {
  const bouton = bloc.querySelector('[data-respiration-bouton]');
  const consigne = bloc.querySelector('[data-consigne]');
  const PHASES = [['Inspirez…', 4000], ['Retenez', 2000], ['Expirez…', 6000]];
  let minuteurs = [];

  const arreter = (texte) => {
    minuteurs.forEach(clearTimeout);
    minuteurs = [];
    bloc.removeAttribute('data-actif');
    consigne.textContent = texte;
    bouton.textContent = 'Commencer · 1 minute';
  };

  bouton.addEventListener('click', () => {
    if (bloc.hasAttribute('data-actif')) return arreter('Prêt ?');
    bloc.setAttribute('data-actif', '');
    bouton.textContent = 'Arrêter';
    let t = 0;
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const [texte, duree] of PHASES) {
        minuteurs.push(setTimeout(() => { consigne.textContent = texte; }, t));
        t += duree;
      }
    }
    minuteurs.push(setTimeout(() => arreter('Bravo'), t));
  });
});

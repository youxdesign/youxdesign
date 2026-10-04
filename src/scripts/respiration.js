/* Respiration guidée : 5 cycles de 12 secondes (4 s inspiration, 2 s pause, 6 s expiration).
   La phase en cours (data-phase) fait grandir ou rétrécir la sphère en CSS. */
document.querySelectorAll('[data-respiration]').forEach((bloc) => {
  const bouton = bloc.querySelector('[data-respiration-bouton]');
  const consigne = bloc.querySelector('[data-consigne]');
  const PHASES = [['Inspirez…', 4000, 'inspire'], ['Retenez', 2000, 'retiens'], ['Expirez…', 6000, 'expire']];
  let minuteurs = [];

  const arreter = (texte) => {
    minuteurs.forEach(clearTimeout);
    minuteurs = [];
    bloc.removeAttribute('data-actif');
    delete bloc.dataset.phase;
    consigne.textContent = texte;
    bouton.textContent = 'Commencer · 1 minute';
  };

  bouton.addEventListener('click', () => {
    if (bloc.hasAttribute('data-actif')) return arreter('Prêt ?');
    bloc.setAttribute('data-actif', '');
    bouton.textContent = 'Arrêter';
    let t = 0;
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const [texte, duree, phase] of PHASES) {
        minuteurs.push(setTimeout(() => { consigne.textContent = texte; bloc.dataset.phase = phase; }, t));
        t += duree;
      }
    }
    minuteurs.push(setTimeout(() => arreter('Bravo'), t));
  });
});

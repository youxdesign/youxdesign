/* Statut d'ouverture (styles communs) : « Ouvert maintenant, jusqu'à 20 h ». */
import { statut } from './lib/horaires.js';

document.querySelectorAll('[data-statut]').forEach((el) => {
  try {
    const r = statut(JSON.parse(el.dataset.horaires));
    if (!r) return;
    el.textContent = `${r.titre} · ${r.detail}`;
    el.dataset.etat = r.ouvert ? 'ouvert' : 'ferme';
  } catch (e) {
    /* En cas de problème, le statut reste simplement vide */
  }
});

/* Statut d'ouverture : « Ouvert jusqu'à 20 h » ou « Fermé · ouvre lundi à 9 h ».
   Horaires : pour chaque jour (lundi = 0), liste de [début, fin] en minutes. */
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const heure = (m) => `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`;

/* Heure de Paris, quel que soit le fuseau du visiteur. L'heure d'été
   commence le dernier dimanche de mars et finit le dernier dimanche
   d'octobre, à 1 h (heure universelle). */
function maintenant(date = new Date()) {
  const an = date.getUTCFullYear();
  const dernierDimanche = (mois) => {
    const fin = new Date(Date.UTC(an, mois + 1, 0));
    return Date.UTC(an, mois, fin.getUTCDate() - fin.getUTCDay(), 1);
  };
  const t = date.getTime();
  const ete = t >= dernierDimanche(2) && t < dernierDimanche(9);
  const paris = new Date(t + (ete ? 2 : 1) * 3600000);
  return { jour: (paris.getUTCDay() + 6) % 7, minutes: paris.getUTCHours() * 60 + paris.getUTCMinutes() };
}

function calculer(horaires) {
  const { jour, minutes } = maintenant();
  const plage = (horaires[jour] || []).find(([d, f]) => minutes >= d && minutes < f);
  if (plage) return { etat: 'ouvert', texte: `Ouvert en ce moment, jusqu’à ${heure(plage[1])}` };
  for (let i = 0; i < 8; i++) {
    const j = (jour + i) % 7;
    const prochaine = (horaires[j] || []).find(([d]) => i > 0 || d > minutes);
    if (prochaine) {
      const quand = i === 0 ? 'aujourd’hui' : i === 1 ? 'demain' : JOURS[j];
      return { etat: 'ferme', texte: `Fermé pour le moment · ouvre ${quand} à ${heure(prochaine[0])}` };
    }
  }
  return null;
}

document.querySelectorAll('[data-statut]').forEach((el) => {
  try {
    const r = calculer(JSON.parse(el.dataset.horaires));
    if (!r) return;
    el.textContent = r.texte;
    el.dataset.etat = r.etat;
  } catch (e) {
    /* En cas de problème, le statut reste simplement masqué */
  }
});

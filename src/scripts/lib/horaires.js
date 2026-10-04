/* Heure de Paris et statut d'ouverture, partagés par tous les styles.
   Horaires : pour chaque jour (lundi = 0), liste de [début, fin] en minutes. */
export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
export const heure = (m) => `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`;

/* L'heure d'été commence le dernier dimanche de mars et finit le dernier
   dimanche d'octobre, à 1 h (heure universelle). */
export function maintenantParis(date = new Date()) {
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

/* { ouvert, titre, detail } ou null si aucun horaire */
export function statut(horaires, date) {
  const { jour, minutes } = maintenantParis(date);
  const plage = (horaires[jour] || []).find(([d, f]) => minutes >= d && minutes < f);
  if (plage) return { ouvert: true, titre: 'Ouvert maintenant', detail: `jusqu’à ${heure(plage[1])}` };
  for (let i = 0; i < 8; i++) {
    const j = (jour + i) % 7;
    const prochaine = (horaires[j] || []).find(([d]) => i > 0 || d > minutes);
    if (prochaine) {
      const quand = i === 0 ? 'aujourd’hui' : i === 1 ? 'demain' : JOURS[j];
      return { ouvert: false, titre: 'Fermé pour le moment', detail: `réouverture ${quand} à ${heure(prochaine[0])}` };
    }
  }
  return null;
}

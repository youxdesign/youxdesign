/* ==========================================================================
   Créneaux d'exemple (option « créneaux ») : les prochains jours ouverts,
   calculés à partir des horaires de la fiche, avec quelques horaires libres.
   Sur un site client, ces horaires sont remplacés par l'agenda en ligne ;
   ici ils servent à montrer le module.
   ========================================================================== */
const JOURS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/* 540 → « 9 h 00 » ; court : 540 → « 9:00 » */
export const heure = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
export const heureCourte = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

/* nombre de jours voulus, nombre d'horaires par jour */
export function creneaux(cab, nombre = 3, parJour = 3) {
  const jours = [];
  const d = new Date();
  for (let i = 1; jours.length < nombre && i < 21; i++) {
    const j = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    const index = (j.getDay() + 6) % 7;
    const plages = cab.horaires.compact[index] || [];
    if (!plages.length) continue;
    const [debut, fin] = plages[0];
    const pas = Math.max(60, Math.floor((fin - debut) / (parJour + 1) / 30) * 30);
    const heures = Array.from({ length: parJour }, (_, k) => debut + 60 + k * pas).filter((h) => h + 50 <= fin);
    jours.push({
      libelle: `${JOURS[index]} ${j.getDate()} ${MOIS[j.getMonth()]}`,
      jour: JOURS[index],
      date: j.getDate(),
      heures
    });
  }
  return jours;
}

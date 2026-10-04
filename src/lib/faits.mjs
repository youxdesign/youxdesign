/* ==========================================================================
   Repères clés du cabinet, pour les blocs d'ouverture des styles :
   approche, public, adresse, horaires, numéro ADELI ou RPPS.
   Chaque style choisit ceux qu'il affiche et leur présentation.
   ========================================================================== */
export function faits(cab) {
  const p = cab.praticien, c = cab.cabinet;
  const ouverts = cab.horaires.groupes.filter((g) => !g.ferme);
  return [
    p.specialiteCourte && { id: 'approche', cle: 'Approche', valeur: p.specialiteCourte },
    p.public && { id: 'public', cle: 'Public', valeur: p.public },
    { id: 'lieu', cle: 'Cabinet', valeur: `${c.adresse}, ${c.ville}`, detail: c.visio ? 'Au cabinet et en visio' : 'Au cabinet' },
    ouverts[0] && { id: 'horaires', cle: 'Horaires', valeur: `${ouverts[0].libelle} : ${ouverts[0].texte}` },
    p.adeli ? { id: 'numero', cle: 'N° ADELI', valeur: p.adeli } : p.rpps && { id: 'numero', cle: 'N° RPPS', valeur: p.rpps }
  ].filter(Boolean);
}

/* Sélection dans un ordre donné : choisir(cab, ['approche', 'public']) */
export const choisir = (cab, ids) => {
  const tous = faits(cab);
  return ids.map((id) => tous.find((f) => f.id === id)).filter(Boolean);
};

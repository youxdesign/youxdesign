/* ==========================================================================
   Mise en forme légère des textes de la fiche :
     *texte*    → italique (mot mis en valeur dans un titre)
     **texte**  → gras
     retour à la ligne (\n dans le JSON) → nouvelle ligne
   Tout le reste est échappé : la fiche ne peut pas injecter de HTML.
   ========================================================================== */
const echapper = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const formes = (s) => s
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>');

/* HTML enrichi, sur une seule ligne logique (\n → <br>) */
export const enrichi = (s) => formes(echapper(s)).replace(/\n/g, '<br>');

/* Lignes séparées (pour les titres révélés ligne par ligne) */
export const lignes = (s) => String(s ?? '').split('\n').map((l) => formes(echapper(l.trim())));

/* Texte brut, sans mise en forme (titres d'onglet, attributs, données structurées) */
export const brut = (s) => String(s ?? '').replace(/\*\*?/g, '').replace(/\s*\n\s*/g, ' ').trim();

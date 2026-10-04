/* ==========================================================================
   Registre des composants propres à chaque style.
   Un style peut fournir son propre bloc d'ouverture de l'accueil
   (Ouverture.astro) et ses propres illustrations provisoires
   (Illustration.astro). À défaut, les versions communes sont utilisées.
   ========================================================================== */
const ouvertures_ = import.meta.glob('./*/Ouverture.astro', { eager: true });
const illustrations_ = import.meta.glob('./*/Illustration.astro', { eager: true });

const parStyle = (modules) => Object.fromEntries(
  Object.entries(modules).map(([chemin, m]) => [chemin.split('/')[1], m.default])
);

export const ouvertures = parStyle(ouvertures_);
export const illustrations = parStyle(illustrations_);

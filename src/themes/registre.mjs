/* ==========================================================================
   Registre des composants propres à chaque style.
   Un style peut fournir, dans src/themes/<style>/ :
   - Ouverture.astro     : le bloc d'ouverture de l'accueil ;
   - Illustration.astro  : ses illustrations provisoires ;
   - Cadre.astro         : son propre habillage (en-tête, pied de page) ;
   - pages/<Page>.astro  : ses propres gabarits de pages (Accueil, APropos…) ;
   - reglages.mjs        : ses particularités d'habillage (voir REGLAGES).
   À défaut, les versions communes sont utilisées.
   ========================================================================== */
const ouvertures_ = import.meta.glob('./*/Ouverture.astro', { eager: true });
const illustrations_ = import.meta.glob('./*/Illustration.astro', { eager: true });
const cadres_ = import.meta.glob('./*/Cadre.astro', { eager: true });
const pages_ = import.meta.glob('./*/pages/*.astro', { eager: true });
const reglages_ = import.meta.glob('./*/reglages.mjs', { eager: true });

const parStyle = (modules) => Object.fromEntries(
  Object.entries(modules).map(([chemin, m]) => [chemin.split('/')[1], m.default])
);

export const ouvertures = parStyle(ouvertures_);
export const illustrations = parStyle(illustrations_);
export const cadres = parStyle(cadres_);

/* pages.sauge.Accueil → composant */
export const pages = {};
for (const [chemin, m] of Object.entries(pages_)) {
  const [, style, , fichier] = chemin.split('/');
  (pages[style] ||= {})[fichier.replace('.astro', '')] = m.default;
}

/* Particularités d'habillage d'un style (valeurs par défaut ci-dessous) */
const REGLAGES = {
  bandeau: false,      /* bandeau d'information en haut : statut d'ouverture et téléphone */
  avatar: false,       /* initiales dans une pastille, à côté du nom */
  telephone: false,    /* numéro de téléphone dans l'en-tête (grands écrans) */
  manchette: false,    /* nom en grand, centré sous l'en-tête de l'accueil (esprit magazine) */
  reperes: true,       /* bande de repères (diplôme, ADELI, lieu…) sous l'ouverture */
  presentation: 'portrait', /* visuel de la présentation (« Bonjour, je suis… ») : portrait ou cabinet */
  scripts: []          /* scripts propres à l'accueil du style (src/scripts/<nom>.js) */
};
const propres = parStyle(reglages_);
export const reglages = (style) => ({ ...REGLAGES, ...(propres[style] || {}) });

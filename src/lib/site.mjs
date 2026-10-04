/* ==========================================================================
   Ce que l'on génère, et à quelle adresse.

   Deux modes :
   - « vitrine » (par défaut) : le site youXdesign. Configurateur à la racine,
     démo de Claire Morel dans /demo/ et un exemple par style dans /styles/…
   - « client » : le site d'un cabinet, à la racine. Activé par la variable
     d'environnement CABINET (nom du dossier dans cabinets/).
   ========================================================================== */
import { chargerCabinet } from './cabinet.mjs';
import { STYLES, PAGES, style as trouverStyle } from '../config/catalogue.mjs';
import { DOMAINE, CABINET_DEMO } from '../config/youxdesign.mjs';

export const MODE = process.env.CABINET ? 'client' : 'vitrine';

let memo = null;

/* Liste des sites à générer : { cle, base, cab, theme, palette, police, indexable, vitrine } */
export function sites() {
  if (memo) return memo;
  if (MODE === 'client') {
    const cab = chargerCabinet(process.env.CABINET);
    /* STYLE permet de tester un autre style sans modifier la fiche */
    const theme = process.env.STYLE || cab.site.style;
    if (!trouverStyle(theme)) throw new Error(`Style inconnu : « ${theme} ». Styles disponibles : ${STYLES.map((s) => s.id).join(', ')}.`);
    memo = [{
      cle: theme,
      base: '/',
      cab,
      theme,
      palette: process.env.STYLE ? 0 : cab.site.palette,
      police: process.env.STYLE ? 0 : cab.site.police,
      couleurs: process.env.STYLE ? null : cab.site.couleurs || null,
      /* FORCER_INDEXATION sert uniquement à tester le référencement d'une démo */
      indexable: !cab.site.demo || process.env.FORCER_INDEXATION === '1',
      vitrine: false
    }];
  } else {
    const cab = chargerCabinet(CABINET_DEMO);
    memo = STYLES.map((s) => ({
      cle: s.id,
      base: s.id === 'sauge' ? '/demo/' : `/styles/${s.id}/`,
      cab,
      theme: s.id,
      palette: 0,
      police: 0,
      couleurs: null,
      indexable: false,
      vitrine: true
    }));
  }
  return memo;
}

export const domaine = () => (MODE === 'client' ? sites()[0].cab.site.domaine.replace(/\/$/, '') : DOMAINE);

/* Adresse d'une page d'un site : lien(site, 'contact') → « /demo/contact/ » */
export function lien(site, pageId) {
  const page = PAGES.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page inconnue : ${pageId}`);
  return page.chemin ? `${site.base}${page.chemin}/` : site.base;
}

export const adresseComplete = (chemin) => domaine() + chemin;

/* Textes d'une page, avec les variantes propres au style s'il y en a :
   "variantes": { "suisse": { "titre": "…" } } dans la fiche (démos). */
export function textes(site, pageId) {
  const t = site.cab.pages[pageId] || {};
  return { ...t, ...(t.variantes?.[site.theme] || {}) };
}

/* Toutes les routes générées par src/pages/[...chemin].astro */
export function routes() {
  const liste = [];
  for (const site of sites()) {
    for (const page of PAGES) {
      liste.push({ chemin: (site.base + page.chemin).replace(/^\/|\/$/g, '') || undefined, type: 'page', site, page: page.id });
    }
    liste.push({ chemin: (site.base + '404').replace(/^\//, ''), type: 'page', site, page: '404' });
  }
  if (MODE === 'vitrine') {
    liste.push({ chemin: undefined, type: 'configurateur' });
    liste.push({ chemin: 'styles', type: 'galerie' });
    liste.push({ chemin: '404', type: 'erreur-youx' });
  }
  return liste;
}

/* ==========================================================================
   Feuilles de style et scripts
   --------------------------------------------------------------------------
   Chaque site reçoit UNE feuille de style, assemblée et compressée ici :
     1. les polices du style (@font-face) et leurs polices de repli ajustées ;
     2. les palettes et polices (variables CSS) ;
     3. la base commune (src/styles/base.css) ;
     4. le design du style (src/themes/<style>/theme.css).
   Le nom du fichier contient une empreinte de son contenu, ce qui permet de
   le mettre en cache durablement : il change dès que le contenu change.
   Aucun style n'est écrit directement dans les pages (politique de sécurité).
   ========================================================================== */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { build, transform } from 'esbuild';
import { STYLES, PALETTES_LIBRES, style as trouverStyle, paletteDe } from '../config/catalogue.mjs';
import { variablesCss } from './couleurs.mjs';
import polices from '../config/polices.json' with { type: 'json' };
const polices_ = polices;

const racine = process.cwd();
const lire = (chemin) => readFileSync(join(racine, chemin), 'utf8');
const empreinte = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
const CIBLES = ['chrome109', 'safari15.4', 'firefox115', 'edge109'];

/* --- Polices -------------------------------------------------------------- */
const GENERIQUES = {
  serif: "Georgia,'Times New Roman',serif",
  'sans-serif': "system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif"
};

export const pilePolice = (id) => {
  const p = polices[id];
  return `'${p.famille}','${p.famille} repli',${GENERIQUES[p.type]}`;
};

/* Polices japonaises : leurs points de suspension (centrés) et leur signe
   degré (« N° ») ne conviennent pas au français ; ces deux caractères sont
   pris dans la police de repli. */
const JAPONAISES = new Set(['shippori-mincho', 'zen-old-mincho', 'zen-kaku-gothic-new', 'kaisei-tokumin', 'zen-antique', 'hina-mincho']);
const SANS_SUSPENSION = 'U+0000-00AF,U+00B1-2025,U+2027-FFFF';

function fontFaces(ids) {
  let css = '';
  for (const id of new Set(ids)) {
    const p = polices[id];
    const plage = JAPONAISES.has(id) ? `;unicode-range:${SANS_SUSPENSION}` : '';
    for (const f of p.fichiers) {
      css += `@font-face{font-family:'${p.famille}';src:url(${f.url}) format('woff2');font-weight:${f.poids};font-style:${f.style};font-display:swap${plage}}`;
    }
    const r = p.repli;
    css += `@font-face{font-family:'${p.famille} repli';src:local('${r.local}');size-adjust:${r.sizeAdjust};ascent-override:${r.ascentOverride};descent-override:${r.descentOverride};line-gap-override:${r.lineGapOverride}}`;
  }
  return css;
}

/* Fichiers de police à précharger : ceux des titres et du texte courant */
export function prechargements(site) {
  const s = trouverStyle(site.theme);
  const choix = s.polices[site.police] || s.polices[0];
  const fichier = (id, poids) => {
    const f = polices[id].fichiers;
    return (f.find((x) => x.style === 'normal' && x.poids === poids) || f.find((x) => x.style === 'normal')).url;
  };
  return [...new Set([fichier(choix.titres, choix.poids), fichier(choix.texte, 400)])];
}

/* Variables propres à une palette (teintes exactes d'illustration…) */
const extras = (p) => Object.entries(p.variables || {}).map(([k, v]) => `;${k}:${v}`).join('');

const varsPolice = (choix) => `--f-titres:${pilePolice(choix.titres)};--f-texte:${pilePolice(choix.texte)};--fw-titres:${choix.poids}`;

/* --- Feuille de style d'un site ----------------------------------------- */
function reglages(site) {
  const s = trouverStyle(site.theme);
  let css = '';
  if (site.vitrine) {
    /* Démo : toutes les palettes et polices, pour l'aperçu du configurateur */
    css += fontFaces(s.polices.flatMap((p) => [p.titres, p.texte]));
    css += `:root{${variablesCss(s.palettes[0])};${varsPolice(s.polices[0])}}`;
    s.palettes.forEach((p, i) => { css += `:root[data-palette="${i}"]{${variablesCss(p)}${extras(p)}}`; });
    PALETTES_LIBRES.forEach((p, i) => { css += `:root[data-palette="l${i}"]{${variablesCss(p)}}`; });
    s.polices.forEach((p, i) => { css += `:root[data-police="${i}"]{${varsPolice(p)}}`; });
  } else {
    /* Site client : uniquement la palette et la police choisies */
    const choix = s.polices[site.police] || s.polices[0];
    const palette = paletteDe(site);
    css += fontFaces([choix.titres, choix.texte]);
    css += `:root{${variablesCss(palette)}${extras(palette)};${varsPolice(choix)}}`;
  }
  return css;
}

const memo = new Map();

async function compresser(css) {
  const r = await transform(css, { loader: 'css', minify: true, target: CIBLES });
  return r.code;
}

export async function feuilleSite(site) {
  const cle = `site:${site.cle}`;
  if (!memo.has(cle)) {
    const theme = `src/themes/${site.theme}/theme.css`;
    const autonome = trouverStyle(site.theme).autonome;
    const brut = reglages(site) + (autonome ? '' : lire('src/styles/base.css')) + lire('src/styles/options.css') + (existsSync(join(racine, theme)) ? lire(theme) : '');
    const contenu = await compresser(brut);
    const nom = `${site.theme}.${empreinte(contenu)}.css`;
    memo.set(cle, { nom, url: `/css/${nom}`, contenu });
  }
  return memo.get(cle);
}

/* Feuille de style d'un outil youXdesign : « youx » (pages d'information),
   « vitrine » (page de présentation, contact, galerie) ou « configurateur »
   (qui déclare aussi toutes les polices des styles, pour les exemples de
   typographie ; seules celles affichées sont téléchargées). */
const FICHIERS_OUTIL = {
  configurateur: ['src/styles/youx.css', 'src/styles/configurateur.css'],
  vitrine: ['src/styles/youx.css', 'src/styles/vitrine.css']
};

export async function feuilleOutil(nom) {
  const cle = `outil:${nom}`;
  if (!memo.has(cle)) {
    const polices = nom === 'configurateur'
      ? Object.keys(polices_)
      : nom === 'vitrine'
        ? ['inter', 'cormorant-garamond']
        : ['instrument-sans', 'instrument-serif', 'cormorant-garamond'];
    const fichiers = FICHIERS_OUTIL[nom] || [`src/styles/${nom}.css`];
    const brut = fontFaces(polices) + fichiers.map(lire).join('\n');
    const contenu = await compresser(brut);
    const fichier = `${nom}.${empreinte(contenu)}.css`;
    memo.set(cle, { nom: fichier, url: `/css/${fichier}`, contenu });
  }
  return memo.get(cle);
}

/* --- Scripts ------------------------------------------------------------- */
export async function script(nom) {
  const cle = `js:${nom}`;
  if (!memo.has(cle)) {
    const r = await build({
      entryPoints: [join(racine, `src/scripts/${nom}.js`)],
      bundle: true,
      write: false,
      minify: true,
      format: 'iife',
      target: CIBLES,
      legalComments: 'none'
    });
    const contenu = r.outputFiles[0].text;
    const fichier = `${nom}.${empreinte(contenu)}.js`;
    memo.set(cle, { nom: fichier, url: `/js/${fichier}`, contenu });
  }
  return memo.get(cle);
}

export const STYLES_IDS = STYLES.map((s) => s.id);

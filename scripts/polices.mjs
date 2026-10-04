/* ==========================================================================
   Polices auto-hébergées
   --------------------------------------------------------------------------
   Copie les fichiers woff2 (sous-ensemble latin) dans public/fonts/ et calcule,
   pour chaque police, une police de repli ajustée (Arial ou Times New Roman
   redimensionnée) qui évite que le texte « saute » au chargement.

   Deux sortes de polices :
   - statiques : un fichier par graisse (paquets @fontsource/…) ;
   - variables : un seul fichier pour plusieurs graisses (paquets
     @fontsource-variable/…), réduit aux graisses réellement utilisées
     pour rester léger.

   Ce script ne sert qu'à ajouter ou changer une police. Les fichiers produits
   sont enregistrés dans le dépôt : le site n'en a plus besoin pour se générer.

   Utilisation (installer tous les paquets en une seule commande) :
     npm install --no-save subset-font @fontsource/figtree … @fontsource-variable/fraunces …
     node scripts/polices.mjs
   ========================================================================== */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fromBuffer } from '@capsizecss/unpack';
import subsetFont from 'subset-font';

/* Polices statiques : [identifiant Fontsource, famille, type, fichiers « poids-style »] */
const STATIQUES = [
  ['cormorant-garamond', 'Cormorant Garamond', 'serif', ['500-normal', '500-italic', '600-normal']],
  ['instrument-serif', 'Instrument Serif', 'serif', ['400-normal', '400-italic']],
  ['young-serif', 'Young Serif', 'serif', ['400-normal']],
  ['gloock', 'Gloock', 'serif', ['400-normal']],
  ['dm-serif-display', 'DM Serif Display', 'serif', ['400-normal', '400-italic']],
  ['figtree', 'Figtree', 'sans-serif', ['400-normal', '600-normal']],
  ['schibsted-grotesk', 'Schibsted Grotesk', 'sans-serif', ['400-normal', '600-normal']],
  ['bricolage-grotesque', 'Bricolage Grotesque', 'sans-serif', ['400-normal', '600-normal']],
  ['onest', 'Onest', 'sans-serif', ['400-normal', '600-normal']],
  ['plus-jakarta-sans', 'Plus Jakarta Sans', 'sans-serif', ['400-normal', '600-normal']],
  ['manrope', 'Manrope', 'sans-serif', ['400-normal', '600-normal']],
  ['shippori-mincho', 'Shippori Mincho', 'serif', ['400-normal', '500-normal']],
  ['zen-old-mincho', 'Zen Old Mincho', 'serif', ['400-normal']],
  ['zen-kaku-gothic-new', 'Zen Kaku Gothic New', 'sans-serif', ['400-normal', '500-normal']],
  /* Choix supplémentaires proposés dans le configurateur */
  ['playfair-display', 'Playfair Display', 'serif', ['400-normal', '400-italic']],
  ['lora', 'Lora', 'serif', ['400-normal', '400-italic']],
  ['eb-garamond', 'EB Garamond', 'serif', ['400-normal', '400-italic']],
  ['corben', 'Corben', 'serif', ['400-normal']],
  ['yeseva-one', 'Yeseva One', 'serif', ['400-normal']],
  ['rufina', 'Rufina', 'serif', ['400-normal']],
  ['dm-sans', 'DM Sans', 'sans-serif', ['400-normal', '600-normal']],
  ['outfit', 'Outfit', 'sans-serif', ['400-normal', '600-normal']],
  ['public-sans', 'Public Sans', 'sans-serif', ['400-normal', '600-normal']],
  ['kaisei-tokumin', 'Kaisei Tokumin', 'serif', ['400-normal']],
  ['zen-antique', 'Zen Antique', 'serif', ['400-normal']],
  ['hina-mincho', 'Hina Mincho', 'serif', ['400-normal']],
  ['inter-tight', 'Inter Tight', 'sans-serif', ['400-normal', '600-normal']],
  ['space-grotesk', 'Space Grotesk', 'sans-serif', ['400-normal', '600-normal']],
  ['archivo', 'Archivo', 'sans-serif', ['400-normal', '600-normal']]
];

/* Polices variables : [identifiant, famille, type, fichier source, { style: axes conservés }, graisses annoncées]
   Fraunces : taille optique variable (finesse des grands titres), graisse
   fixée à 350 en romain et 300 en italique, comme la démo d'origine.
   Instrument Sans : graisses 400 à 600. */
const VARIABLES = [
  ['fraunces', 'Fraunces', 'serif', 'opsz', { normal: { wght: 350, opsz: { min: 24, max: 144 } }, italic: { wght: 300, opsz: { min: 24, max: 144 } } }, '300 400'],
  ['instrument-sans', 'Instrument Sans', 'sans-serif', 'wght', { normal: { wght: { min: 400, max: 600 } } }, '400 600']
];

/* Caractères du sous-ensemble « latin » (français compris : œ, €, guillemets…) */
const LATIN = [[0x20, 0xFF], [0x131, 0x131], [0x152, 0x153], [0x2BB, 0x2BC], [0x2C6, 0x2C6], [0x2DA, 0x2DA], [0x2DC, 0x2DC], [0x304, 0x304], [0x308, 0x308], [0x329, 0x329], [0x2000, 0x206F], [0x20AC, 0x20AC], [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212], [0x2215, 0x2215], [0xFEFF, 0xFEFF], [0xFFFD, 0xFFFD]];
let caracteres = '';
for (const [a, b] of LATIN) for (let c = a; c <= b; c++) caracteres += String.fromCodePoint(c);

/* Mesures des polices système servant de repli (source : Capsize) */
const SYSTEME = {
  serif: { nom: 'Times New Roman', ascent: 1825, descent: -443, lineGap: 87, unitsPerEm: 2048, xWidthAvg: 832 },
  'sans-serif': { nom: 'Arial', ascent: 1854, descent: -434, lineGap: 67, unitsPerEm: 2048, xWidthAvg: 913 }
};

const pourcent = (v) => `${Number.parseFloat((v * 100).toFixed(2))}%`;

/* Même calcul que Capsize : on agrandit ou réduit la police système pour
   qu'elle occupe la même largeur moyenne et la même hauteur de ligne. */
function repli(m, type) {
  const s = SYSTEME[type];
  const taille = (m.xWidthAvg / m.unitsPerEm) / (s.xWidthAvg / s.unitsPerEm);
  const em = m.unitsPerEm * taille;
  return {
    local: s.nom,
    sizeAdjust: pourcent(taille),
    ascentOverride: pourcent(m.ascent / em),
    descentOverride: pourcent(Math.abs(m.descent) / em),
    lineGapOverride: pourcent(m.lineGap / em)
  };
}

await mkdir('public/fonts', { recursive: true });
const catalogue = {};

for (const [id, famille, type, variantes] of STATIQUES) {
  const fichiers = [];
  let mesures = null;
  for (const v of variantes) {
    const [poids, style] = v.split('-');
    const source = `node_modules/@fontsource/${id}/files/${id}-latin-${v}.woff2`;
    const nom = `${id}-${poids}${style === 'italic' ? '-italique' : ''}.woff2`;
    await copyFile(source, `public/fonts/${nom}`);
    fichiers.push({ poids: Number(poids), style, url: `/fonts/${nom}` });
    if (!mesures && style === 'normal') mesures = await fromBuffer(await readFile(source));
  }
  catalogue[id] = { famille, type, fichiers, repli: repli(mesures, type) };
}

for (const [id, famille, type, axe, styles, poids] of VARIABLES) {
  const fichiers = [];
  let mesures = null;
  for (const [style, axes] of Object.entries(styles)) {
    const source = await readFile(`node_modules/@fontsource-variable/${id}/files/${id}-latin-${axe}-${style}.woff2`);
    const reduit = await subsetFont(source, caracteres, { targetFormat: 'woff2', variationAxes: axes });
    const nom = `${id}-variable${style === 'italic' ? '-italique' : ''}.woff2`;
    await writeFile(`public/fonts/${nom}`, reduit);
    fichiers.push({ poids, style, url: `/fonts/${nom}` });
    if (!mesures && style === 'normal') mesures = await fromBuffer(reduit);
    console.log(`  ${nom} : ${Math.round(reduit.length / 1024)} Ko`);
  }
  catalogue[id] = { famille, type, fichiers, repli: repli(mesures, type), variable: true };
}

await writeFile('src/config/polices.json', JSON.stringify(catalogue, null, 2) + '\n');
console.log(`${STATIQUES.length + VARIABLES.length} familles dans public/fonts/, décrites dans src/config/polices.json`);

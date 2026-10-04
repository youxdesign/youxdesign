/* ==========================================================================
   Polices auto-hébergées
   --------------------------------------------------------------------------
   Copie les fichiers woff2 (sous-ensemble latin) dans public/fonts/ et calcule,
   pour chaque police, une police de repli ajustée (Arial ou Times New Roman
   redimensionnée) qui évite que le texte « saute » au chargement.

   Ce script ne sert qu'à ajouter ou changer une police. Les fichiers produits
   sont enregistrés dans le dépôt : le site n'en a plus besoin pour se générer.

   Utilisation :
     npm install --no-save @fontsource/fraunces @fontsource/figtree …
     node scripts/polices.mjs
   ========================================================================== */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fromBuffer } from '@capsizecss/unpack';

/* [identifiant Fontsource, nom de la famille, type, fichiers « poids-style »] */
const POLICES = [
  ['fraunces', 'Fraunces', 'serif', ['400-normal', '400-italic']],
  ['cormorant-garamond', 'Cormorant Garamond', 'serif', ['500-normal', '500-italic', '600-normal']],
  ['instrument-serif', 'Instrument Serif', 'serif', ['400-normal', '400-italic']],
  ['instrument-sans', 'Instrument Sans', 'sans-serif', ['400-normal', '500-normal', '600-normal']],
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
  ['zen-kaku-gothic-new', 'Zen Kaku Gothic New', 'sans-serif', ['400-normal', '500-normal']]
];

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

for (const [id, famille, type, variantes] of POLICES) {
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

await writeFile('src/config/polices.json', JSON.stringify(catalogue, null, 2) + '\n');
console.log(`${POLICES.length} familles copiées dans public/fonts/ et décrites dans src/config/polices.json`);

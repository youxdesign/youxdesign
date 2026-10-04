/* Image de partage (Open Graph, 1200 × 630) de chaque site, dans ses couleurs */
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { sites } from '../../lib/site.mjs';
import { deriver } from '../../lib/couleurs.mjs';
import { style as trouverStyle, PALETTES_LIBRES } from '../../config/catalogue.mjs';

export function getStaticPaths() {
  return sites().map((site) => ({ params: { fichier: `${site.cle}.png` }, props: { site } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { site } = props;
  const s = trouverStyle(site.theme);
  const p = site.couleurs || (typeof site.palette === 'string' ? PALETTES_LIBRES[Number(site.palette.slice(1))] : s.palettes[site.palette]) || s.palettes[0];
  const c = deriver(p);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${c.fond}"/>
    <path d="M700 630V300a210 210 0 0 1 420 0v330z" fill="${c.doux}"/>
    <circle cx="910" cy="330" r="120" fill="${c['accent2-doux']}"/>
    <path d="M700 500c90-60 180-75 255-45s105 30 165 0v175H700z" fill="${c.accent}" fill-opacity=".85"/>
    <rect x="90" y="250" width="420" height="10" rx="5" fill="${c.accent}"/>
    <rect x="90" y="300" width="320" height="10" rx="5" fill="${c.ligne}"/>
    <rect x="90" y="340" width="360" height="10" rx="5" fill="${c.ligne}"/>
  </svg>`;
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};

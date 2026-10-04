/* Icône de l'onglet (favicon) de chaque site : les initiales sur la couleur d'accent */
import type { APIRoute } from 'astro';
import { sites } from '../../lib/site.mjs';
import { deriver } from '../../lib/couleurs.mjs';
import { paletteDe } from '../../config/catalogue.mjs';

export function getStaticPaths() {
  return sites().map((site) => {
    const c = deriver(paletteDe(site));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${c.bouton}"/><text x="32" y="42" font-family="Georgia,serif" font-size="28" text-anchor="middle" fill="${c['sur-bouton']}">${site.cab.initiales}</text></svg>`;
    return { params: { fichier: `${site.cle}.svg` }, props: { svg } };
  });
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.svg, { headers: { 'Content-Type': 'image/svg+xml' } });

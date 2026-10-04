/* Feuilles de style générées (une par style, plus celles des outils youXdesign) */
import type { APIRoute } from 'astro';
import { sites, MODE } from '../../lib/site.mjs';
import { feuilleSite, feuilleOutil } from '../../lib/assets.mjs';

export async function getStaticPaths() {
  const feuilles = await Promise.all(sites().map((s) => feuilleSite(s)));
  if (MODE === 'vitrine') feuilles.push(await feuilleOutil('youx'), await feuilleOutil('configurateur'));
  return feuilles.map((f) => ({ params: { fichier: f.nom }, props: { contenu: f.contenu } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.contenu, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });

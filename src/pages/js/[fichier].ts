/* Scripts générés à partir de src/scripts/ (compressés, sans dépendance) */
import type { APIRoute } from 'astro';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { MODE } from '../../lib/site.mjs';
import { script } from '../../lib/assets.mjs';

const RESERVES_VITRINE = ['apercu', 'configurateur'];

export async function getStaticPaths() {
  const noms = readdirSync(join(process.cwd(), 'src/scripts'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => f.replace(/\.js$/, ''))
    .filter((n) => MODE === 'vitrine' || !RESERVES_VITRINE.includes(n));
  const fichiers = await Promise.all(noms.map((n) => script(n)));
  return fichiers.map((f) => ({ params: { fichier: f.nom }, props: { contenu: f.contenu } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.contenu, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });

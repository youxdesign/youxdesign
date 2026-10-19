/* robots.txt : tout est autorisé (sauf les maquettes des prospects sur le
   site youXdesign), avec l'adresse du plan du site */
import type { APIRoute } from 'astro';
import { domaine, MODE } from '../lib/site.mjs';

const interdits = MODE === 'vitrine' ? 'Disallow: /maquettes/\n' : '';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n${interdits}\nSitemap: ${domaine()}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });

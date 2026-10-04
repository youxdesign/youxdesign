/* robots.txt : tout est autorisé, avec l'adresse du plan du site */
import type { APIRoute } from 'astro';
import { domaine } from '../lib/site.mjs';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${domaine()}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });

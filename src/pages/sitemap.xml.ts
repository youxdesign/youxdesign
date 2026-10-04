/* Plan du site pour les moteurs de recherche : uniquement les pages indexables
   (ni les pages légales, ni les démos fictives). */
import type { APIRoute } from 'astro';
import { sites, lien, adresseComplete, MODE } from '../lib/site.mjs';
import { PAGES } from '../config/catalogue.mjs';

export const GET: APIRoute = () => {
  const adresses = [];
  if (MODE === 'vitrine') adresses.push(adresseComplete('/'));
  for (const site of sites().filter((s) => s.indexable)) {
    for (const page of PAGES.filter((p) => !p.legal && (p.id !== 'faq' || site.cab.a('faq')))) {
      adresses.push(adresseComplete(lien(site, page.id)));
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${adresses.map((a) => `  <url><loc>${a}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

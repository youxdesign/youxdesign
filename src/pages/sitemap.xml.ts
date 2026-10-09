/* Plan du site pour les moteurs de recherche : uniquement les pages indexables
   (ni les pages légales, ni les démos fictives). Les guides donnent aussi
   leur date de mise à jour (lastmod). */
import type { APIRoute } from 'astro';
import { sites, lien, adresseComplete, MODE } from '../lib/site.mjs';
import { pagesCibles, guides } from '../lib/contenus.mjs';
import { PAGES } from '../config/catalogue.mjs';

const guidesMd = import.meta.glob<any>('/src/contenus/guides/*.md', { eager: true });

export const GET: APIRoute = () => {
  const adresses: { loc: string; lastmod?: string }[] = [];
  if (MODE === 'vitrine') {
    for (const chemin of ['/', '/configurateur/', '/styles/', '/contact/']) adresses.push({ loc: adresseComplete(chemin) });
    for (const slug of pagesCibles()) adresses.push({ loc: adresseComplete(`/${slug}/`) });
    adresses.push({ loc: adresseComplete('/guides/') });
    for (const slug of guides()) {
      const fm = guidesMd[`/src/contenus/guides/${slug}.md`]?.frontmatter ?? {};
      adresses.push({ loc: adresseComplete(`/guides/${slug}/`), lastmod: fm.misAJour ?? fm.publie });
    }
  }
  for (const site of sites().filter((s) => s.indexable)) {
    for (const page of PAGES.filter((p) => !p.legal && (p.id !== 'faq' || site.cab.a('faq')))) {
      adresses.push({ loc: adresseComplete(lien(site, page.id)) });
    }
  }
  const ligne = (a: { loc: string; lastmod?: string }) => `  <url><loc>${a.loc}</loc>${a.lastmod ? `<lastmod>${a.lastmod}</lastmod>` : ''}</url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${adresses.map(ligne).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

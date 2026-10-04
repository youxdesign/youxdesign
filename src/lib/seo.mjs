/* ==========================================================================
   Référencement : titres, descriptions et données structurées (schema.org)
   ========================================================================== */
import { PAGES } from '../config/catalogue.mjs';
import { lien, adresseComplete } from './site.mjs';
import { brut } from './texte.mjs';

/* Titre et description d'une page */
export function meta(site, pageId) {
  const cab = site.cab;
  const qui = `${cab.nomComplet}, ${cab.metier.toLowerCase()} à ${cab.cabinet.ville}`;
  const textes = cab.pages[pageId];
  if (textes) return { titre: textes.seoTitre, description: textes.seoDescription };
  const generiques = {
    'mentions-legales': { titre: `Mentions légales · ${qui}`, description: `Mentions légales du site de ${qui} : éditeur, hébergeur, numéros professionnels.` },
    confidentialite: { titre: `Politique de confidentialité · ${qui}`, description: `Données personnelles et confidentialité sur le site de ${qui} : aucun cookie, aucun outil de suivi.` },
    404: { titre: `Page introuvable · ${qui}`, description: `Cette page n’existe pas ou a été déplacée.` }
  };
  return generiques[pageId];
}

/* Cabinet : nom, adresse, horaires, téléphone (type ProfessionalService) */
export function donneesCabinet(site) {
  const cab = site.cab, c = cab.cabinet, p = cab.praticien;
  const url = adresseComplete(site.base);
  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${url}#cabinet`,
    name: `${cab.nomComplet}, ${p.titre.toLowerCase()}`,
    description: cab.pages.accueil.seoDescription,
    url,
    image: adresseComplete(`/og/${site.cle}.png`),
    telephone: cab.tel.international,
    email: cab.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.adresse,
      postalCode: c.codePostal,
      addressLocality: c.ville,
      addressCountry: 'FR'
    },
    openingHoursSpecification: cab.horaires.schema,
    areaServed: c.zone || c.ville,
    priceRange: cab.tarifs.map((t) => t.prix).join(' – '),
    employee: {
      '@type': 'Person',
      name: cab.nomComplet,
      jobTitle: p.titre,
      ...(p.specialite ? { knowsAbout: p.specialite } : {})
    }
  };
  if (cab.adresse.geo) donnees.geo = { '@type': 'GeoCoordinates', latitude: cab.adresse.geo.lat, longitude: cab.adresse.geo.lng };
  if (cab.rdv) donnees.potentialAction = { '@type': 'ReserveAction', target: cab.rdv.url };
  return donnees;
}

/* Questions fréquentes */
export function donneesFaq(site) {
  const groupes = site.cab.pages.faq.groupes;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groupes.flatMap((g) => g.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: brut(q.reponse.join(' ')) }
    })))
  };
}

/* Fil d'Ariane : Accueil › Page */
export function donneesFil(site, pageId) {
  const page = PAGES.find((p) => p.id === pageId);
  if (!page || pageId === 'accueil') return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: adresseComplete(site.base) },
      { '@type': 'ListItem', position: 2, name: page.menu, item: adresseComplete(lien(site, pageId)) }
    ]
  };
}

/* ==========================================================================
   Configuration Astro : site 100 % statique (dossier dist/).
   Sans variable d'environnement : site youXdesign (configurateur + démos).
   Avec CABINET=<dossier> : site du cabinet correspondant.
   ========================================================================== */
import { defineConfig } from 'astro/config';
import youx from './src/integrations/youx.mjs';
import { MODE, domaine, sites } from './src/lib/site.mjs';

const carte = sites().some((s) => s.cab.site.options.includes('carte'));
/* Services qui reçoivent les formulaires des sites de cabinet (rappel, lettre d'information) */
/* Agendas de réservation intégrés (option « créneaux » des sites de cabinet) */
const agendas = MODE === 'client'
  ? [...new Set(sites().filter((s) => s.cab.a('creneaux') && s.cab.rdv?.agenda).map((s) => new URL(s.cab.rdv.agenda).origin))]
  : [];
const formulaires = MODE === 'client'
  ? [...new Set(sites().flatMap((s) => Object.values(s.cab.contact.formulaires || {}).map((u) => new URL(u).origin)))]
  : [];

export default defineConfig({
  site: domaine(),
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never'
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [youx({ mode: MODE, carte, formulaires, agendas })]
});

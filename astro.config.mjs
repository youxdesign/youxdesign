/* ==========================================================================
   Configuration Astro : site 100 % statique (dossier dist/).
   Sans variable d'environnement : site youXdesign (configurateur + démos).
   Avec CABINET=<dossier> : site du cabinet correspondant.
   ========================================================================== */
import { defineConfig } from 'astro/config';
import youx from './src/integrations/youx.mjs';
import { MODE, domaine, sites } from './src/lib/site.mjs';

const carte = sites().some((s) => s.cab.site.options.includes('carte'));

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
  integrations: [youx({ mode: MODE, carte })]
});

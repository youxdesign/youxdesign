/* ==========================================================================
   Aperçu des démos (site youXdesign uniquement, jamais sur un site client)
   --------------------------------------------------------------------------
   Applique la palette et la police passées dans l'adresse, par exemple
   /styles/terre/?palette=2&police=1, ou des couleurs personnalisées
   (?couleurs=F4F1E8.243028.7C9A7E.DFE6D6.56625A : fond, encre, accent,
   doux, texte secondaire). Les paramètres sont conservés d'une page à
   l'autre. Le configurateur, sur le même site, pilote aussi l'aperçu via
   window.youxApercu.
   ========================================================================== */
import { deriver } from '../lib/couleurs.mjs';

const racine = document.documentElement;
const CLES = ['palette', 'police', 'couleurs'];
const HEXA = /^[0-9a-f]{6}$/i;

function couleurs(valeur) {
  const c = String(valeur || '').split('.');
  if (c.length < 4 || !c.slice(0, 5).every((x) => HEXA.test(x))) return false;
  const [fond, encre, accent, doux, texte2] = c.map((x) => '#' + x);
  const d = deriver({ fond, encre, accent, doux, texte2 });
  for (const [k, v] of Object.entries(d)) {
    if (k === 'schema') racine.style.colorScheme = v;
    else racine.style.setProperty('--c-' + k, v);
  }
  return true;
}

function effacerCouleurs() {
  for (let i = racine.style.length - 1; i >= 0; i--) {
    const p = racine.style[i];
    if (p.startsWith('--c-')) racine.style.removeProperty(p);
  }
  racine.style.colorScheme = '';
}

function appliquer(params) {
  if (params.palette != null) racine.dataset.palette = params.palette;
  if (params.police != null) racine.dataset.police = params.police;
  if (params.couleurs) couleurs(params.couleurs);
  else if (params.couleurs === '') effacerCouleurs();
}

const q = new URLSearchParams(location.search);
const depart = {};
CLES.forEach((k) => { if (q.has(k)) depart[k] = q.get(k); });
appliquer(depart);

/* Dans le configurateur (cadre), le bandeau « démonstration » est masqué */
if (q.has('apercu') || window.self !== window.top) racine.dataset.apercu = '';

/* Conserve les réglages en naviguant d'une page à l'autre */
const suffixe = CLES.filter((k) => q.has(k)).map((k) => `${k}=${encodeURIComponent(q.get(k))}`).join('&');
if (suffixe) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="/"]').forEach((a) => {
      const url = new URL(a.getAttribute('href'), location.origin);
      if (url.pathname.startsWith('/demo/') || url.pathname.startsWith('/styles/')) {
        a.setAttribute('href', url.pathname + (url.search ? url.search + '&' : '?') + suffixe + url.hash);
      }
    });
  });
}

window.youxApercu = { appliquer, effacerCouleurs };

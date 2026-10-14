/* ==========================================================================
   POST /api/etape : compteur anonyme des étapes du configurateur
   --------------------------------------------------------------------------
   Le configurateur envoie un simple code (« e3 », « mailto »…) la première
   fois qu'un visiteur atteint une étape. Seuls la date et le nom de l'étape
   sont transmis au tableur : ni cookie, ni adresse IP, ni identifiant.
   On répond tout de suite ; la transmission se termine en arrière-plan.
   ========================================================================== */
import { origineAutorisee, transmettre } from '../../src/serveur/apps-script.mjs';

/* Même ordre que ETAPES dans src/scripts/configurateur.js. Les numéros
   gardent les étapes dans l'ordre dans l'onglet « Tunnel » du tableur. */
const LIBELLES = {
  e0: '01 · Bienvenue',
  e1: '02 · Identité',
  e2: '03 · Cabinet',
  e3: '04 · Tarifs',
  e4: '05 · Style',
  e5: '06 · Couleurs',
  e6: '07 · Typographie',
  e7: '08 · Photos',
  e8: '09 · Pages',
  e9: '10 · Fonctions',
  e10: '11 · Ton',
  e11: '12 · Récapitulatif',
  mailto: '14 · Envoi depuis sa messagerie',
  copie: '15 · Récapitulatif copié',
  txt: '16 · Récapitulatif téléchargé'
};

export async function onRequestPost({ request, env, waitUntil }) {
  if (origineAutorisee(request)) {
    const code = (await request.text()).trim().slice(0, 12);
    const etape = LIBELLES[code];
    if (etape) waitUntil(transmettre(env, { type: 'etape', etape }));
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

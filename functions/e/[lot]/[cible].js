/* ==========================================================================
   GET /e/<lot>/<cible> : liens comptés des e-mails de prospection
   --------------------------------------------------------------------------
   Les liens d'un envoi passent par ici (par exemple /e/lot9/appel) : on
   ajoute 1 au compteur « Clic e-mail · lot9 · appel » du tableur, puis on
   redirige vers la vraie page. Seuls la date, le lot et le lien sont
   transmis : ni adresse e-mail, ni adresse IP, ni cookie. On sait combien
   de clics a reçus un envoi, jamais qui a cliqué.
   Les liens sont réécrits par scripts/envoyer.mjs au moment de l'envoi.
   ========================================================================== */
import { transmettre } from '../../../src/serveur/apps-script.mjs';
import { DOMAINE, LIEN_APPEL } from '../../../src/config/youxdesign.mjs';

const CIBLES = {
  appel: LIEN_APPEL,
  configurateur: `${DOMAINE}/configurateur/`,
  styles: `${DOMAINE}/styles/`,
  accueil: `${DOMAINE}/`
};
/* Lot : « lot9 », « essai »… (lettres, chiffres et tirets) */
const LOT = /^[a-z0-9-]{1,20}$/;
/* Robots qui suivent les liens pour les indexer : on ne les compte pas.
   Les antivirus de messagerie, eux, se présentent comme des navigateurs :
   les chiffres restent donc un peu gonflés. */
const ROBOT = /bot|crawl|spider|slurp|preview|scan|fetch|curl|wget|python|headless/i;

export async function onRequestGet({ params, request, env, waitUntil }) {
  const lot = String(params.lot || '').toLowerCase();
  const cible = String(params.cible || '').toLowerCase();
  /* « m-<nom> » : la maquette préparée pour ce prospect (/maquettes/<nom>/) */
  const maquette = /^m-([a-z0-9-]{1,60})$/.exec(cible);
  const destination = maquette ? `${DOMAINE}/maquettes/${maquette[1]}/` : CIBLES[cible];
  if (!destination || !LOT.test(lot)) return redirection(`${DOMAINE}/`);
  if (!ROBOT.test(request.headers.get('User-Agent') || '')) {
    waitUntil(transmettre(env, { type: 'etape', etape: `Clic e-mail · ${lot} · ${cible}` }));
  }
  return redirection(destination);
}

const redirection = (adresse) => new Response(null, {
  status: 302,
  headers: { Location: adresse, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }
});

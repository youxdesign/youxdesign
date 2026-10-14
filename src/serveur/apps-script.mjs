/* ==========================================================================
   Relais vers le programme Google Apps Script de Younes
   --------------------------------------------------------------------------
   Utilisé par les fonctions Cloudflare (functions/api/*.js). Le programme
   (services/apps-script/demandes.gs) range les demandes et les étapes du
   configurateur dans le tableur « youXdesign · demandes », et prévient
   Younes par e-mail à chaque demande.

   Son adresse est un réglage Cloudflare, jamais écrit dans le dépôt
   (public) : Cloudflare › Workers & Pages › youxdesign › Paramètres ›
   Variables et secrets › APPS_SCRIPT_URL (type « Secret »).
   ========================================================================== */

/* Pages qui ont le droit d'appeler les fonctions : le site, ses aperçus
   de branche (*.youxdesign.pages.dev) et le serveur de test local. */
export function origineAutorisee(request) {
  const origine = request.headers.get('Origin') || '';
  return origine === 'https://youxdesign.fr'
    || /^https:\/\/[a-z0-9-]+\.youxdesign\.pages\.dev$/.test(origine)
    || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origine);
}

/* Transmet des données au programme Apps Script ; renvoie true si elles
   ont bien été reçues. Google répond par une redirection vers la réponse
   du programme : fetch la suit. */
export async function transmettre(env, donnees) {
  if (!env.APPS_SCRIPT_URL) return false;
  try {
    const reponse = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(donnees),
      redirect: 'follow'
    });
    if (!reponse.ok) return false;
    const resultat = await reponse.json().catch(() => null);
    return Boolean(resultat && resultat.ok);
  } catch (e) {
    return false;
  }
}

export const json = (donnees, status = 200) => new Response(JSON.stringify(donnees), {
  status,
  headers: { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-store' }
});

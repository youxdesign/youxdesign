/* ==========================================================================
   Adresse technique youxdesign.pages.dev : redirigée vers youxdesign.fr.
   La page demandée est conservée (/demo/, /apercu-demov2.gif…), pour que
   les liens et images des e-mails déjà envoyés continuent de fonctionner.
   Les aperçus de branche (refonte.youxdesign.pages.dev…) et les sites des
   clients (autres adresses) ne sont pas concernés.
   ========================================================================== */
const ADRESSE_TECHNIQUE = 'youxdesign.pages.dev';
const DOMAINE = 'https://youxdesign.fr';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname !== ADRESSE_TECHNIQUE) return next();
  return Response.redirect(DOMAINE + url.pathname + url.search, 301);
}

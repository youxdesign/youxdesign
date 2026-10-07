/* ==========================================================================
   E-mail de prospection : génération des versions prêtes à envoyer.

   Utilisation :  npm run email

   Lit les modèles email/modele.html et email/modele.txt, y place l'adresse
   du site (réglage DOMAINE de src/config/youxdesign.mjs : c'est la seule
   chose à changer le jour d'un nom de domaine définitif), l'e-mail, les
   tarifs (TARIF) et le lien « Réserver un appel gratuit » (DOMAINE/appel/,
   qui mène vers LIEN_APPEL), puis crée :
     email/email-prospection.html   version HTML, à envoyer
     email/email-prospection.txt    version texte, à joindre au même envoi
     email/apercu-exemple.html      exemple rempli, pour relire le rendu

   Deux e-mails : email-prospection (création d'un site) et email-refonte
   (refonte d'un site existant, l'adresse du praticien est conservée).
   Variables à remplir par l'outil d'envoi (publipostage), une par prospect :
     {{prenom}}                   prénom
     {{detail_personnalisation}}  une phrase complète sur le cabinet du
                                  prospect (peut rester vide)
     {{source}}                   où l'adresse a été trouvée, par exemple
                                  « votre site psyroubaix.fr »
     {{site_actuel}}              (e-mail « refonte » seulement) l'adresse
                                  actuelle de son site, par exemple psyroubaix.fr

   Vérifications : poids de l'e-mail (moins de 100 Ko, sinon Gmail le coupe),
   aucune adresse oubliée, images bien présentes dans le site.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DOMAINE, EMAIL, TARIF } from '../src/config/youxdesign.mjs';

const racine = process.cwd();
const dossier = join(racine, 'email');
const domaine = DOMAINE.replace(/\/$/, '');
const remplacer = (texte) => texte
  .replaceAll('%DOMAINE_COURT%', domaine.replace(/^https?:\/\//, ''))
  .replaceAll('%APPEL%', `${domaine}/appel/`)
  .replaceAll('%DOMAINE%', domaine)
  .replaceAll('%EMAIL%', EMAIL)
  .replaceAll('%TARIF_LANCEMENT%', String(TARIF.lancement))
  .replaceAll('%TARIF_NORMAL%', String(TARIF.normal))
  .replaceAll('%TARIF_PLACES%', String(TARIF.places))
  .replaceAll('%TARIF_MENSUEL%', String(TARIF.mensuel))
  .replaceAll('%TARIF_REFONTE%', String(TARIF.refonte));

/* Deux e-mails : création d'un site, et refonte d'un site existant (adresse conservée) */
const MODELES = [
  { modele: 'modele', sortie: 'email-prospection', exemple: 'apercu-exemple', variables: ['prenom', 'detail_personnalisation', 'source'] },
  { modele: 'modele-refonte', sortie: 'email-refonte', exemple: 'apercu-exemple-refonte', variables: ['prenom', 'detail_personnalisation', 'source', 'site_actuel'] }
];
const EXEMPLE = {
  prenom: 'Julie',
  detail_personnalisation: 'J’ai découvert votre cabinet de Roubaix en cherchant une psychologue qui reçoit les adolescents.',
  source: 'votre page professionnelle sur Google',
  site_actuel: 'julie-durand-psychologue.fr'
};
const erreurs = [];
const resume = [];
for (const m of MODELES) {
  const html = remplacer(readFileSync(join(dossier, `${m.modele}.html`), 'utf8'));
  const texte = remplacer(readFileSync(join(dossier, `${m.modele}.txt`), 'utf8'));
  writeFileSync(join(dossier, `${m.sortie}.html`), html);
  writeFileSync(join(dossier, `${m.sortie}.txt`), texte);
  writeFileSync(join(dossier, `${m.exemple}.html`), html.replace(/\{\{(\w+)\}\}/g, (_, v) => EXEMPLE[v] ?? `{{${v}}}`));

  const poids = Buffer.byteLength(html);
  if (poids > 100 * 1024) erreurs.push(`${m.sortie} pèse ${Math.round(poids / 1024)} Ko : au-delà de 100 Ko, Gmail le coupe`);
  for (const [nom, contenu] of [['HTML', html], ['texte', texte]]) {
    const oublis = contenu.match(/%[A-Z_]+%/g);
    if (oublis) erreurs.push(`${m.sortie}, version ${nom} : réglage non remplacé ${[...new Set(oublis)].join(', ')}`);
    const presentes = [...new Set((contenu.match(/\{\{\w+\}\}/g) || []).map((v) => v.slice(2, -2)))];
    for (const v of m.variables) if (!presentes.includes(v)) erreurs.push(`${m.sortie}, version ${nom} : variable {{${v}}} absente`);
    for (const v of presentes) if (!m.variables.includes(v)) erreurs.push(`${m.sortie}, version ${nom} : variable inconnue {{${v}}}`);
  }
  const images = [...html.matchAll(/src="([^"]+)"/g)].map((x) => x[1]);
  for (const src of images) {
    if (!src.startsWith(domaine)) { erreurs.push(`image hors du site : ${src}`); continue; }
    const chemin = src.slice(domaine.length);
    if (!existsSync(join(racine, 'youx-statique', chemin)) && !existsSync(join(racine, 'public', chemin))) erreurs.push(`image introuvable dans le projet : ${chemin}`);
  }
  if ([...html.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].length) erreurs.push(`${m.sortie} : image sans texte alternatif`);
  resume.push(`  ${m.sortie} : ${Math.round(poids / 1024)} Ko, variables ${m.variables.map((v) => `{{${v}}}`).join(' ')}`);
}

console.log(`\nE-mails de prospection générés dans email/ (adresse du site : ${domaine})\n${resume.join('\n')}`);
if (erreurs.length) {
  console.error(`\nÀ corriger :\n${erreurs.map((e) => `  • ${e}`).join('\n')}\n`);
  process.exit(1);
}
console.log('Vérifications : tout est en ordre.\n');

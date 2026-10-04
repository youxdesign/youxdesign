/* ==========================================================================
   E-mail de prospection : génération des versions prêtes à envoyer.

   Utilisation :  npm run email

   Lit les modèles email/modele.html et email/modele.txt, y place l'adresse
   du site (réglage DOMAINE de src/config/youxdesign.mjs : c'est la seule
   chose à changer le jour d'un nom de domaine définitif) et crée :
     email/email-prospection.html   version HTML, à envoyer
     email/email-prospection.txt    version texte, à joindre au même envoi
     email/apercu-exemple.html      exemple rempli, pour relire le rendu

   Variables à remplir par l'outil d'envoi (publipostage), une par prospect :
     {{civilite}}                 Madame, Monsieur, Docteur…
     {{nom}}                      nom de famille
     {{detail_personnalisation}}  une phrase complète sur le cabinet du
                                  prospect (peut rester vide)
     {{source}}                   où l'adresse a été trouvée, par exemple
                                  « votre page professionnelle sur Google »

   Vérifications : poids de l'e-mail (moins de 100 Ko, sinon Gmail le coupe),
   aucune adresse oubliée, images bien présentes dans le site.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DOMAINE, EMAIL } from '../src/config/youxdesign.mjs';

const racine = process.cwd();
const dossier = join(racine, 'email');
const domaine = DOMAINE.replace(/\/$/, '');
const remplacer = (texte) => texte
  .replaceAll('%DOMAINE_COURT%', domaine.replace(/^https?:\/\//, ''))
  .replaceAll('%DOMAINE%', domaine)
  .replaceAll('%EMAIL%', EMAIL);

const html = remplacer(readFileSync(join(dossier, 'modele.html'), 'utf8'));
const texte = remplacer(readFileSync(join(dossier, 'modele.txt'), 'utf8'));
writeFileSync(join(dossier, 'email-prospection.html'), html);
writeFileSync(join(dossier, 'email-prospection.txt'), texte);

/* Exemple rempli, pour relire */
const EXEMPLE = {
  civilite: 'Madame',
  nom: 'Durand',
  detail_personnalisation: 'J’ai découvert votre cabinet de Roubaix en cherchant une psychologue qui reçoit les adolescents.',
  source: 'votre page professionnelle sur Google'
};
const exemple = html.replace(/\{\{(\w+)\}\}/g, (_, v) => EXEMPLE[v] ?? `{{${v}}}`);
writeFileSync(join(dossier, 'apercu-exemple.html'), exemple);

/* Vérifications */
const erreurs = [];
const poids = Buffer.byteLength(html);
if (poids > 100 * 1024) erreurs.push(`l'e-mail pèse ${Math.round(poids / 1024)} Ko : au-delà de 100 Ko, Gmail le coupe`);
for (const [nom, contenu] of [['HTML', html], ['texte', texte]]) {
  const oublis = contenu.match(/%[A-Z_]+%/g);
  if (oublis) erreurs.push(`version ${nom} : réglage non remplacé ${[...new Set(oublis)].join(', ')}`);
}
const variables = [...new Set(html.match(/\{\{\w+\}\}/g))];
for (const v of ['{{civilite}}', '{{nom}}', '{{detail_personnalisation}}', '{{source}}']) {
  if (!variables.includes(v) || !texte.includes(v)) erreurs.push(`variable ${v} absente d'une des deux versions`);
}
/* Chaque image doit exister dans le site (youx-statique/ ou public/) */
const images = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
for (const src of images) {
  if (!src.startsWith(domaine)) { erreurs.push(`image hors du site : ${src}`); continue; }
  const chemin = src.slice(domaine.length);
  if (!existsSync(join(racine, 'youx-statique', chemin)) && !existsSync(join(racine, 'public', chemin))) erreurs.push(`image introuvable dans le projet : ${chemin}`);
}
const sansAlt = [...html.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)];
if (sansAlt.length) erreurs.push(`${sansAlt.length} image(s) sans texte alternatif`);

console.log(`\nE-mail de prospection généré dans email/ (${Math.round(poids / 1024)} Ko, ${images.length} images, adresse du site : ${domaine})`);
console.log(`Variables : ${variables.join(' ')}`);
if (erreurs.length) {
  console.error(`\nÀ corriger :\n${erreurs.map((e) => `  • ${e}`).join('\n')}\n`);
  process.exit(1);
}
console.log('Vérifications : tout est en ordre.\n');

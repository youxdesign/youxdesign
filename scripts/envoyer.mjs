/* ==========================================================================
   Envoi des e-mails de prospection, tels qu'ils ont été conçus (images et
   liens directs intacts), depuis younes@youxdesign.fr.

   Utilisation :
     npm run envoyer -- <prospects.json>                  aperçu, rien n'est envoyé
     npm run envoyer -- <prospects.json> --essai <adresse>  un e-mail de test par prospect, à <adresse>
     npm run envoyer -- <prospects.json> --confirmer       envoi réel aux prospects

   Fichier prospects (JSON), une entrée par personne :
     { "prenom": "Nathalie", "email": "…", "modele": "refonte" | "creation",
       "site": "psychologue-vdascq.fr", "detail": "J’ai découvert…" }

   Identifiants : fichier ~/.config/youxdesign/envoi.env (jamais dans le dépôt)
     SMTP_UTILISATEUR=younes@youxdesign.fr
     SMTP_MOT_DE_PASSE=<mot de passe d'application Google, 16 lettres>

   Sécurités : sans --confirmer rien ne part chez les prospects ; une adresse
   déjà présente dans le journal (journal-envois.csv, à côté du fichier
   prospects) n'est jamais relancée ; une pause sépare deux envois.
   ========================================================================== */
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import nodemailer from 'nodemailer';

const MODELES = { refonte: 'email-refonte', creation: 'email-prospection' };
const PAUSE_SECONDES = 90;

const args = process.argv.slice(2);
const fichier = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--essai');
const essai = args.includes('--essai') ? args[args.indexOf('--essai') + 1] : null;
const confirmer = args.includes('--confirmer');
if (!fichier) { console.error('Indiquez le fichier des prospects : npm run envoyer -- prospects.json'); process.exit(1); }
if (essai && confirmer) { console.error('Choisissez --essai ou --confirmer, pas les deux.'); process.exit(1); }

const prospects = JSON.parse(readFileSync(resolve(fichier), 'utf8'));
const journal = join(dirname(resolve(fichier)), 'journal-envois.csv');
const dejaEnvoyes = new Set(existsSync(journal)
  ? readFileSync(journal, 'utf8').split('\n').slice(1).map((l) => l.split(';')[1]).filter(Boolean)
  : []);

const echapper = (t) => t.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function preparer(p) {
  const sortie = MODELES[p.modele];
  if (!sortie) throw new Error(`${p.prenom} : modèle inconnu « ${p.modele} » (refonte ou creation)`);
  const v = { prenom: p.prenom, detail_personnalisation: p.detail ?? '', source: `votre site ${p.site}`, site_actuel: p.site };
  const remplir = (s, html) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in v)) throw new Error(`${p.prenom} : variable {{${k}}} inconnue`);
    return html ? echapper(v[k]) : v[k];
  });
  const html = remplir(readFileSync(join('email', `${sortie}.html`), 'utf8'), true);
  const texte = remplir(readFileSync(join('email', `${sortie}.txt`), 'utf8'), false);
  const sujet = html.match(/<title>([^<]+)<\/title>/)[1].trim();
  return { html, texte, sujet };
}

const lots = prospects.map((p) => ({ p, ...preparer(p) }));
console.log(`\n${lots.length} prospect(s) — ${confirmer ? 'ENVOI RÉEL' : essai ? `essai vers ${essai}` : 'aperçu seulement'}\n`);
for (const { p, sujet } of lots) {
  const note = dejaEnvoyes.has(p.email) ? '  (déjà envoyé : ignoré)' : '';
  console.log(`  ${p.prenom.padEnd(12)} ${p.email.padEnd(36)} ${p.modele.padEnd(9)} ${sujet}${note}`);
}
if (!confirmer && !essai) { console.log('\nRien n’a été envoyé. Ajoutez --essai <adresse> ou --confirmer.\n'); process.exit(0); }

const env = join(homedir(), '.config/youxdesign/envoi.env');
const reglages = Object.fromEntries(readFileSync(env, 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/\s/g, '')]));
if (!reglages.SMTP_MOT_DE_PASSE) { console.error(`Mot de passe d'application manquant dans ${env}`); process.exit(1); }

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: reglages.SMTP_UTILISATEUR, pass: reglages.SMTP_MOT_DE_PASSE }
});
await transport.verify();

if (confirmer && !existsSync(journal)) appendFileSync(journal, 'date;email;prenom;modele\n');
let premier = true;
for (const { p, html, texte, sujet } of lots) {
  if (confirmer && dejaEnvoyes.has(p.email)) continue;
  if (!premier && confirmer) { console.log(`  pause de ${PAUSE_SECONDES} s…`); await new Promise((r) => setTimeout(r, PAUSE_SECONDES * 1000)); }
  premier = false;
  await transport.sendMail({
    from: { name: 'Younes Yagoubi', address: reglages.SMTP_UTILISATEUR },
    to: essai ?? p.email,
    subject: essai ? `[Test ${p.prenom}] ${sujet}` : sujet,
    html, text: texte
  });
  if (confirmer) appendFileSync(journal, `${new Date().toISOString()};${p.email};${p.prenom};${p.modele}\n`);
  console.log(`  ✓ ${p.prenom} → ${essai ?? p.email}`);
}
console.log('\nTerminé.\n');

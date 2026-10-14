/* ==========================================================================
   POST /api/demande : bouton « Envoyer ma demande » du configurateur
   --------------------------------------------------------------------------
   Reçoit le récapitulatif et les coordonnées du visiteur, les vérifie, puis
   les transmet au programme Apps Script, qui les range dans le tableur et
   prévient Younes par e-mail. Aucun e-mail n'est envoyé au visiteur : le
   destinataire est toujours Younes, ce qui empêche de détourner le
   formulaire pour écrire à des inconnus.
   Champ « site » : piège à robots, invisible pour les visiteurs. S'il est
   rempli, on répond « envoyé » sans rien transmettre.
   ========================================================================== */
import { origineAutorisee, transmettre, json } from '../../src/serveur/apps-script.mjs';

const TAILLE_MAX = 40000;
const courriel = /^[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}$/i;
const texte = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function onRequestPost({ request, env }) {
  if (!origineAutorisee(request)) return json({ ok: false }, 403);

  const brut = await request.text();
  if (brut.length > TAILLE_MAX) return json({ ok: false, erreur: 'trop-long' }, 413);
  let d;
  try { d = JSON.parse(brut); } catch (e) { return json({ ok: false }, 400); }
  if (!d || typeof d !== 'object') return json({ ok: false }, 400);

  if (texte(d.site, 200)) return json({ ok: true });

  const recap = texte(d.recap, 30000);
  const email = texte(d.email, 200);
  const telephone = texte(d.telephone, 40);
  const emailValide = courriel.test(email);
  const telephoneValide = (telephone.match(/\d/g) || []).length >= 8;
  if (recap.length < 40) return json({ ok: false }, 400);
  if (!emailValide && !telephoneValide) return json({ ok: false, erreur: 'contact' }, 422);

  const recue = await transmettre(env, {
    type: 'demande',
    nom: texte(d.nom, 120),
    email: emailValide ? email : '',
    telephone: telephoneValide ? telephone : '',
    ville: texte(d.ville, 120),
    style: texte(d.style, 120),
    recap
  });
  return recue ? json({ ok: true }) : json({ ok: false, erreur: 'transmission' }, 502);
}

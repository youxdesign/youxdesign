/* ==========================================================================
   Pages de contenu du site youXdesign, écrites en Markdown
   --------------------------------------------------------------------------
   - src/contenus/pages/<adresse>.md  → youxdesign.fr/<adresse>/
     pages de présentation ciblées (création, refonte, Lille) ;
   - src/contenus/guides/<adresse>.md → youxdesign.fr/guides/<adresse>/
     guides pratiques, sourcés.
   Le nom du fichier donne l'adresse de la page : ajouter un fichier suffit
   pour créer une page (elle entre aussi dans le plan du site). Un fichier
   dont le nom commence par « _ » est ignoré (brouillon).
   ========================================================================== */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { TARIF, LIEN_APPEL } from '../config/youxdesign.mjs';
import { enrichi, brut } from './texte.mjs';

const lister = (dossier) => readdirSync(join(process.cwd(), 'src/contenus', dossier))
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => f.slice(0, -3))
  .sort();

export const pagesCibles = () => lister('pages');
export const guides = () => lister('guides');

/* Montants dans les textes : {{lancement}}, {{normal}}, {{places}},
   {{mensuel}} et {{refonte}} prennent les valeurs de TARIF, pour qu'un
   changement de prix se répercute partout. */
export const remplir = (s) => String(s ?? '').replace(/\{\{(\w+)\}\}/g, (m, cle) => (cle in TARIF ? String(TARIF[cle]) : m));

/* Typographie française : espace insécable avant « : ; ! ? » et à
   l'intérieur des guillemets, pour qu'aucun signe ne commence une ligne ;
   de même dans « 23 mai », « 75 000 € », « n° 85 » ou « article 44 ». */
const MOIS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';
export const typo = (s) => String(s ?? '')
  .replace(/ ([:;!?»])/g, ' $1')
  .replace(/« /g, '« ')
  .replace(new RegExp(`(\\d) (${MOIS})`, 'g'), '$1 $2')
  .replace(/(\d) (?=\d{3}\b)/g, '$1 ')
  .replace(/(\d) (€|min\b)/g, '$1 $2')
  .replace(/\b(n°|articles?|le|les) (\d)/g, '$1 $2');

/* Les deux à la fois : textes de l'en-tête des fichiers Markdown */
export const texte = (s) => typo(remplir(s));

/* Une ligne de l'en-tête mise en forme : *italique*, **gras** et liens
   [texte](/adresse/) (adresses du site ou https:// seulement) ; tout le
   reste est échappé. */
export const enLigne = (s) => enrichi(texte(s))
  .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, '<a class="vt-lien" href="$2">$1</a>');

/* La même, sans mise en forme (titres d'onglet, données structurées) */
export const sansForme = (s) => brut(texte(s)).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

/* Adresse d'un bouton : « appel » désigne la réservation de l'appel gratuit */
export const adresseBouton = (lien) => (lien === 'appel' ? LIEN_APPEL : lien);

/* Titre découpé pour l'animation mot à mot : *…* marque la partie colorée */
export const segments = (s) => texte(s).split(/\*([^*]+)\*/)
  .map((t, i) => ({ texte: t.trim(), em: i % 2 === 1 }))
  .filter((x) => x.texte);

/* Date lisible : « 9 octobre 2026 » */
export const dateLongue = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/* Temps de lecture, à raison de 200 mots par minute */
export const lecture = (brut) => Math.max(1, Math.round(String(brut).split(/\s+/).filter(Boolean).length / 200));

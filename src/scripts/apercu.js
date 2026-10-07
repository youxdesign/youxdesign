/* ==========================================================================
   Aperçu des démos (site youXdesign uniquement, jamais sur un site client)
   --------------------------------------------------------------------------
   1. Applique la palette, la police et les options passées dans l'adresse,
      par exemple /styles/terre/?palette=2&police=1&options=creneaux,carte
      (style Immersif : &fond=diaporama&voile=fort),
      ou des couleurs personnalisées (?couleurs=F4F1E8.243028.7C9A7E.DFE6D6.56625A :
      fond, encre, accent, doux, texte secondaire). Ces réglages suivent le
      visiteur d'une page à l'autre.
   2. Le configurateur (même site) pilote l'aperçu en direct par
      window.youxApercu : palette, police, options, textes, séances et
      tarifs, photos, pages, et « focus » sur un bloc (défilement doux et
      mise en valeur).
   Rien n'est envoyé ni enregistré.
   ========================================================================== */
import { deriver } from '../lib/couleurs.mjs';

const racine = document.documentElement;
const CLES = ['palette', 'police', 'couleurs', 'options', 'fond', 'voile'];
const FONDS = ['zoom', 'diaporama', 'parallaxe', 'degrade', 'video'];
const VOILES = ['leger', 'moyen', 'fort'];
const HEXA = /^[0-9a-f]{6}$/i;
const reduire = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Couleurs ------------------------------------------------------------ */
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

/* --- Options : blocs [data-option] affichés ou masqués ------------------- */
function options(liste) {
  const actives = new Set(liste);
  document.querySelectorAll('[data-option]').forEach((el) => { el.hidden = !actives.has(el.dataset.option); });
}

/* --- Pages du menu ------------------------------------------------------- */
function pages(liste) {
  const visibles = new Set(liste);
  document.querySelectorAll('[data-page-lien]').forEach((el) => {
    if (el.dataset.option) return; /* la FAQ suit son option */
    el.hidden = !visibles.has(el.dataset.pageLien);
  });
}

/* --- Focus : défilement jusqu'à un bloc et mise en valeur ---------------- */
function focus(id) {
  const cible = document.querySelector(`[data-option="${id}"]:not([hidden])`);
  if (!cible) return false;
  const visible = cible.closest('.opt-confort') || cible;
  visible.scrollIntoView({ behavior: reduire() ? 'auto' : 'smooth', block: 'center' });
  visible.classList.remove('opt-surbrillance');
  void visible.offsetWidth;
  visible.classList.add('opt-surbrillance');
  setTimeout(() => visible.classList.remove('opt-surbrillance'), 1900);
  return true;
}

/* --- Textes : nom, ville, téléphone… du prospect à la place de la démo ---- */
const originaux = new WeakMap();
function textes(remplacements) {
  const paires = (remplacements || []).filter(([de, vers]) => de && vers && de !== vers);
  const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement && !n.parentElement.closest('script, style') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
  });
  const noeuds = [];
  while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
  for (const n of noeuds) {
    if (!originaux.has(n)) originaux.set(n, n.nodeValue);
    let t = originaux.get(n);
    for (const [de, vers] of paires) t = t.split(de).join(vers);
    if (n.nodeValue !== t) n.nodeValue = t;
  }
  /* Le mot en filigrane du pied de page (style Sauge) */
  document.querySelectorAll('[data-mot]').forEach((el) => {
    if (!el.dataset.motOriginal) el.dataset.motOriginal = el.dataset.mot;
    let t = el.dataset.motOriginal;
    for (const [de, vers] of paires) t = t.split(de).join(vers);
    el.dataset.mot = t;
  });
}

/* --- Photos déposées dans le configurateur (adresses blob: locales) ------ */
function photo(type, url) {
  /* La photo du cabinet sert aussi d'image d'ambiance (grandes images d'accueil) */
  const selecteur = type === 'cabinet' ? '[data-visuel="cabinet"], [data-visuel="ambiance"]' : `[data-visuel="${type}"]`;
  document.querySelectorAll(selecteur).forEach((el) => {
    let img = el.querySelector('img.apercu-photo');
    if (!url) { if (img) img.remove(); el.classList.remove('a-photo'); return; }
    if (!img) {
      img = document.createElement('img');
      img.className = 'apercu-photo';
      img.alt = '';
      el.prepend(img);
    }
    img.src = url;
    el.classList.add('a-photo');
  });
}

/* --- Application des réglages -------------------------------------------- */
function appliquer(params) {
  if (params.palette != null) racine.dataset.palette = params.palette;
  if (params.police != null) racine.dataset.police = params.police;
  /* Style Immersif : animation du fond et voile */
  if (FONDS.includes(params.fond) && racine.dataset.theme === 'immersif') racine.dataset.fond = params.fond;
  if (VOILES.includes(params.voile) && racine.dataset.theme === 'immersif') racine.dataset.voile = params.voile;
  /* Couleurs personnalisées : on quitte les teintes propres à une palette */
  if (params.couleurs && couleurs(params.couleurs)) racine.dataset.palette = 'perso';
  else if (params.couleurs === '') effacerCouleurs();
  if (params.options != null) {
    const liste = Array.isArray(params.options) ? params.options : String(params.options).split(',').filter(Boolean);
    if (document.body) options(liste);
    else document.addEventListener('DOMContentLoaded', () => options(liste), { once: true });
  }
}

const q = new URLSearchParams(location.search);
const depart = {};
CLES.forEach((k) => { if (q.has(k)) depart[k] = q.get(k); });
appliquer(depart);

/* Dans le configurateur (cadre), le bandeau « démonstration » est masqué */
const dansCadre = q.has('apercu') || window.self !== window.top;
if (dansCadre) racine.dataset.apercu = '';

/* Conserve les réglages en naviguant d'une page à l'autre */
const suffixe = [...CLES, 'apercu'].filter((k) => q.has(k)).map((k) => `${k}=${encodeURIComponent(q.get(k))}`).join('&');
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

/* Démonstration : les formulaires et boutons d'exemple n'envoient rien */
let minuterieMessage = null;
document.addEventListener('click', (e) => {
  const action = e.target.closest('[data-demo-action]');
  if (!action) return;
  e.preventDefault();
  let message = document.querySelector('.opt-message');
  if (!message) {
    message = document.createElement('p');
    message.className = 'opt-message';
    message.setAttribute('role', 'status');
    document.body.append(message);
  }
  message.textContent = 'Démonstration : cette action est désactivée sur l’exemple.';
  clearTimeout(minuterieMessage);
  minuterieMessage = setTimeout(() => message.remove(), 2600);
});
document.addEventListener('submit', (e) => {
  if (e.target.closest('[data-demo-formulaire]')) e.preventDefault();
});

/* Retour en haut de page (réglages de l'image d'accueil) */
function haut() { window.scrollTo({ top: 0, behavior: reduire() ? 'auto' : 'smooth' }); }

/* --- Séances et tarifs saisis dans le configurateur ----------------------
   Les gabarits marquent chaque séance : liste [data-tarifs-liste], séance
   [data-tarif-index], champs [data-tarif="nom|duree|prix|lieu|texte"] et
   blocs facultatifs [data-tarif-bloc]. Les mentions uniques (« Séance de
   50 min · 60 € » de l'accueil) portent [data-tarif-une="n°"].
   Nom ou prix laissé vide : le texte de la démo reste affiché ; durée vide :
   elle disparaît. Les séances ajoutées reprennent la forme de la première,
   sans le lieu ni la description propres à la démo. */
const modelesTarifs = new WeakMap();
const montrer = (el, oui) => { if (el) el.style.display = oui ? '' : 'none'; };

function ecrire(racineTarif, cle, valeur, { copie = false } = {}) {
  racineTarif.querySelectorAll(`[data-tarif="${cle}"]`).forEach((champ) => {
    if (champ.dataset.tarifOrigine === undefined) champ.dataset.tarifOrigine = champ.textContent;
    const texte = valeur || (cle === 'duree' || copie ? '' : champ.dataset.tarifOrigine);
    if (champ.textContent !== texte) champ.textContent = texte;
    if (cle === 'duree') montrer(champ.closest('[data-tarif-bloc="duree"]') || champ, Boolean(texte));
  });
}

function tarifs(liste) {
  const seances = (liste || [])
    .map((t) => ({ nom: (t.type || t.nom || '').trim(), duree: (t.duree || '').trim(), prix: (t.prix || '').trim() }))
    .filter((t) => t.nom || t.duree || t.prix);
  if (!seances.length) return;

  document.querySelectorAll('[data-tarifs-liste]').forEach((liste) => {
    const elements = [...liste.querySelectorAll(':scope > [data-tarif-index]')];
    if (!modelesTarifs.has(liste) && elements[0]) modelesTarifs.set(liste, elements[0].cloneNode(true));
    const modele = modelesTarifs.get(liste);
    seances.forEach((t, i) => {
      let el = elements[i];
      if (!el && modele) {
        el = modele.cloneNode(true);
        el.dataset.tarifIndex = String(i);
        el.dataset.tarifCopie = '';
        el.querySelectorAll('[data-tarif-bloc="lieu"], [data-tarif-bloc="texte"]').forEach((b) => montrer(b, false));
        el.querySelectorAll('[data-tarif]').forEach((champ) => { champ.dataset.tarifOrigine = ''; });
        /* Apparition déjà faite : la nouvelle séance est visible tout de suite */
        el.classList.add('est-visible', 'is-in');
        liste.append(el);
      }
      if (!el) return;
      montrer(el, true);
      const copie = el.dataset.tarifCopie !== undefined;
      ecrire(el, 'nom', t.nom, { copie });
      ecrire(el, 'duree', t.duree, { copie });
      ecrire(el, 'prix', t.prix, { copie });
      /* Lieu et description de la démo : seulement si c'est toujours la même séance */
      if (!copie) {
        const origine = el.querySelector('[data-tarif="nom"]')?.dataset.tarifOrigine;
        const meme = !t.nom || t.nom === origine;
        el.querySelectorAll('[data-tarif-bloc="lieu"], [data-tarif-bloc="texte"]').forEach((b) => montrer(b, meme));
      }
    });
    /* Séances retirées dans le configurateur : masquées (elles reviennent si on les rajoute) */
    [...liste.querySelectorAll(':scope > [data-tarif-index]')].slice(seances.length).forEach((el) => montrer(el, false));
  });

  document.querySelectorAll('[data-tarif-une]').forEach((el) => {
    const t = seances[Number(el.dataset.tarifUne)] || seances[0];
    ecrire(el, 'duree', t.duree);
    ecrire(el, 'prix', t.prix);
  });
}

window.youxApercu = { appliquer, effacerCouleurs, options, pages, focus, textes, photo, haut, tarifs };

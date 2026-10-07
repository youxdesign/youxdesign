/* ==========================================================================
   Configurateur youXdesign
   --------------------------------------------------------------------------
   - Douze étapes ; les réponses vivent dans cet onglet (sessionStorage) et
     disparaissent quand on le ferme. Rien n'est envoyé à un serveur.
   - L'aperçu est le VRAI site de démonstration (même adresse), piloté par
     window.youxApercu : style, palette, police, options, textes, photos.
   - Cocher une fonctionnalité amène l'aperçu sur le bloc correspondant
     (changement de page si besoin, défilement doux, mise en valeur).
   - La demande part de la messagerie du visiteur (lien mailto), ou se copie,
     ou se télécharge en .txt.
   ========================================================================== */
import { STYLES, PALETTES_LIBRES, OPTIONS, PAGES, FONDS, VOILES } from '../config/catalogue.mjs';
import { EMAIL } from '../config/youxdesign.mjs';
import { deriver } from '../lib/couleurs.mjs';
/* Seuls les champs utiles de la fiche de démo sont embarqués */
import { praticien, contact, cabinet, site } from '../../cabinets/claire-morel/cabinet.json';

const demo = { praticien, contact, cabinet, site };

const $ = (sel, racine) => (racine || document).querySelector(sel);
const $$ = (sel, racine) => Array.from((racine || document).querySelectorAll(sel));
const reduire = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const estMobile = () => window.matchMedia('(max-width: 1023px)').matches;

const CLE_MEMOIRE = 'youx-configurateur';
const memoire = (() => { try { return window.sessionStorage; } catch (e) { return null; } })();
const ETAPES = ['Bienvenue', 'Identité', 'Cabinet', 'Tarifs', 'Style', 'Couleurs', 'Typographie', 'Photos', 'Pages', 'Fonctions', 'Ton', 'Envoi'];
/* Page (et éventuellement bloc) que l'aperçu montre à chaque étape */
const VUE_ETAPE = [['accueil'], ['accueil'], ['contact'], ['consultations'], ['accueil'], ['accueil'], ['accueil'], ['accueil', 'portrait'], ['accueil'], [null], ['accueil'], ['accueil']];
const FORMATS = { ordinateur: [1280, 800], mobile: [390, 844] };

const defaut = () => ({
  etape: 0,
  prenom: '', nom: '', profession: 'psychologue', titre: '', approche: '', numero: '', telephone: '', email: '',
  publics: ['Adultes', 'Adolescents'],
  motifs: ['Anxiété', 'Stress et burn-out', 'Dépression', 'Sommeil', 'Phobies', 'TOC', 'Estime de soi', 'Relations'],
  adresse: '', cp: '', ville: '', acces: '', visio: true, pmr: false,
  jours: Array.from({ length: 7 }, (_, i) => ({ ouvert: i < 6, debut: '9:00', fin: i === 5 ? '13:00' : '19:00' })),
  tarifs: [
    { type: 'Séance individuelle', duree: '50 min', prix: '60 €' },
    { type: 'Séance en visio', duree: '50 min', prix: '60 €' },
    { type: 'Premier entretien', duree: '60 min', prix: '70 €' }
  ],
  rdvMode: 'Doctolib', rdvLien: '',
  style: 'sauge', palette: '0', police: '0', couleurs: { accent: '', fond: '' },
  fond: 'zoom', voile: 'moyen',
  surMesure: false, ambiances: [], pistes: [], envies: '', eviter: '',
  photosStatut: '',
  pages: ['a-propos', 'approche', 'consultations'],
  options: [...demo.site.options],
  questionnaires: ['Fiche de premier rendez-vous', 'Anxiété · GAD-7', 'Humeur · PHQ-9'], questionnairesPerso: '', resultats: 'Envoyés au praticien',
  ton: 'vous', registre: 'chaleureux', motsCles: '', remarques: ''
});

let etat = defaut();
const photos = {}; /* { portrait: { url, nom } } : jamais enregistrées, seulement affichées */


/* ==========================================================================
   Démarrage
   ========================================================================== */
function demarrer() {
  restaurer();
  peindreNuanciers();
  remplirFormulaire();
  brancherFormulaire();
  brancherNavigation();
  brancherApercu();
  brancherPhotos();
  brancherEnvoi();
  aller(etat.etape, { initial: true });
}

function restaurer() {
  if (!memoire) return;
  try {
    const brut = memoire.getItem(CLE_MEMOIRE);
    if (brut) etat = { ...defaut(), ...JSON.parse(brut) };
  } catch (e) { /* réponses illisibles : on repart de zéro */ }
}

let minuterieMemoire = null;
function enregistrer() {
  if (!memoire) return;
  clearTimeout(minuterieMemoire);
  minuterieMemoire = setTimeout(() => {
    try {
      memoire.setItem(CLE_MEMOIRE, JSON.stringify(etat));
      const note = $('[data-memoire]');
      if (note) { note.hidden = false; clearTimeout(note._t); note._t = setTimeout(() => { note.hidden = true; }, 1800); }
    } catch (e) { /* stockage plein ou refusé : tant pis, rien n'est perdu à l'écran */ }
  }, 300);
}

/* Les nuanciers et exemples de polices sont colorés ici (aucun style écrit dans la page) */
function peindreNuanciers() {
  $$('[data-couleur]').forEach((el) => { el.style.background = el.dataset.couleur; });
  $$('[data-pile]').forEach((el) => { el.style.fontFamily = el.dataset.pile; el.style.fontWeight = el.dataset.poids || 400; });
  /* Vignettes des styles : fond et encre de leur première palette */
  STYLES.forEach((s) => {
    const v = $(`.cfg-style__vignette--${s.id}`);
    if (!v) return;
    const d = deriver(s.palettes[0]);
    v.style.background = d.fond;
    v.style.color = d.encre;
    v.style.setProperty('--v-accent', d.accent);
    v.style.setProperty('--v-doux', d.doux);
    v.style.setProperty('--v-clair', d.clair);
  });
}

/* ==========================================================================
   Formulaire <-> état
   ========================================================================== */
function remplirFormulaire() {
  $$('[data-champ]').forEach((el) => {
    const v = etat[el.dataset.champ];
    if (el.type === 'checkbox') el.checked = Boolean(v);
    else el.value = v ?? '';
  });
  $$('[data-choix]').forEach((el) => { el.checked = String(etat[el.dataset.choix]) === el.value; });
  $$('[data-liste]').forEach((el) => { el.checked = (etat[el.dataset.liste] || []).includes(el.value); });
  $$('[data-option-choix]').forEach((el) => { el.checked = etat.options.includes(el.dataset.optionChoix); });
  etat.jours.forEach((j, i) => {
    $(`[data-jour-ouvert="${i}"]`).checked = j.ouvert;
    $(`[data-jour-debut="${i}"]`).value = j.debut;
    $(`[data-jour-fin="${i}"]`).value = j.fin;
    $(`[data-jour="${i}"]`).classList.toggle('est-ferme', !j.ouvert);
  });
  dessinerTarifs();
  majPalettesEtPolices();
  majCouleursPerso();
  majConditionnels();
}

function majConditionnels() {
  $$('[data-si-profession]').forEach((el) => { el.hidden = etat.profession !== el.dataset.siProfession; });
  $$('[data-si-rdv]').forEach((el) => { el.hidden = etat.rdvMode === 'Téléphone'; });
  $$('[data-si-style]').forEach((el) => { el.hidden = etat.style !== el.dataset.siStyle; });
  const sous = $('[data-sous-questionnaires]');
  if (sous) sous.hidden = !etat.options.includes('questionnaires');
  $$('[data-voir]').forEach((b) => { b.disabled = !etat.options.includes(b.dataset.voir); });
}

function brancherFormulaire() {
  const formulaire = $('[data-formulaire]');
  formulaire.addEventListener('submit', (e) => e.preventDefault());

  formulaire.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('[data-champ]') && el.type !== 'checkbox') {
      etat[el.dataset.champ] = el.value;
      if (['prenom', 'nom', 'titre', 'ville', 'adresse', 'cp', 'telephone', 'email', 'numero'].includes(el.dataset.champ)) apercuTextes();
      enregistrer();
    } else if (el.matches('[data-tarif-champ]')) {
      const i = Number(el.closest('.cfg-tarif').dataset.index);
      etat.tarifs[i][el.dataset.tarifChamp] = el.value;
      apercuTarifs();
      enregistrer();
    } else if (el.matches('[data-couleur-perso]')) {
      etat.couleurs[el.dataset.couleurPerso] = el.value;
      majCouleursPerso();
      apercuCouleurs();
      enregistrer();
    }
  });

  formulaire.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('[data-champ][type="checkbox"]')) {
      etat[el.dataset.champ] = el.checked;
    } else if (el.matches('[data-choix]')) {
      const cle = el.dataset.choix;
      etat[cle] = el.value;
      if (cle === 'style') changerStyle();
      if (cle === 'fond' || cle === 'voile') montrerFond(cle);
      majConditionnels();
    } else if (el.matches('[data-liste]')) {
      const cle = el.dataset.liste;
      const liste = new Set(etat[cle] || []);
      if (el.checked) liste.add(el.value); else liste.delete(el.value);
      etat[cle] = [...liste];
      if (cle === 'pages') apercuPages();
    } else if (el.matches('[data-option-choix]')) {
      basculerOption(el.dataset.optionChoix, el.checked);
    } else if (el.matches('[data-palette]')) {
      etat.palette = el.value;
      etat.couleurs = { accent: '', fond: '' };
      majPalettesEtPolices();
      majCouleursPerso();
      apercuCouleurs();
      annoncer('Palette appliquée à l’aperçu.');
    } else if (el.matches('[data-police]')) {
      etat.police = el.value;
      apercuAppliquer({ police: etat.police });
      annoncer('Police appliquée à l’aperçu.');
    } else if (el.matches('[data-jour-ouvert]')) {
      const i = Number(el.dataset.jourOuvert);
      etat.jours[i].ouvert = el.checked;
      $(`[data-jour="${i}"]`).classList.toggle('est-ferme', !el.checked);
    } else if (el.matches('[data-jour-debut]')) {
      etat.jours[Number(el.dataset.jourDebut)].debut = el.value;
    } else if (el.matches('[data-jour-fin]')) {
      etat.jours[Number(el.dataset.jourFin)].fin = el.value;
    }
    enregistrer();
  });

  /* Horaires du lundi recopiés sur les autres jours ouverts */
  $('[data-copier-horaires]').addEventListener('click', () => {
    const ref = etat.jours[0];
    etat.jours.forEach((j, i) => { if (i && j.ouvert) { j.debut = ref.debut; j.fin = ref.fin; } });
    remplirFormulaire();
    enregistrer();
    toast('Horaires recopiés.');
  });

  /* Tarifs */
  $('[data-ajouter-tarif]').addEventListener('click', () => {
    if (etat.tarifs.length >= 6) return;
    etat.tarifs.push({ type: '', duree: '', prix: '' });
    dessinerTarifs();
    $$('.cfg-tarif input')[(etat.tarifs.length - 1) * 3]?.focus();
    enregistrer();
  });
  $('[data-tarifs]').addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-retirer-tarif]');
    if (!bouton) return;
    etat.tarifs.splice(Number(bouton.closest('.cfg-tarif').dataset.index), 1);
    dessinerTarifs();
    apercuTarifs();
    enregistrer();
  });

  /* Couleurs personnalisées : retour à la palette */
  $('[data-couleurs-reinit]').addEventListener('click', () => {
    etat.couleurs = { accent: '', fond: '' };
    majCouleursPerso();
    apercuCouleurs();
    enregistrer();
  });
}

function dessinerTarifs() {
  const zone = $('[data-tarifs]');
  const modele = $('[data-modele-tarif]');
  zone.replaceChildren(...etat.tarifs.map((t, i) => {
    const ligne = modele.content.firstElementChild.cloneNode(true);
    ligne.dataset.index = i;
    $$('[data-tarif-champ]', ligne).forEach((input) => {
      input.value = t[input.dataset.tarifChamp] || '';
      input.setAttribute('aria-label', `${input.closest('label').querySelector('span').textContent}, séance ${i + 1}`);
    });
    return ligne;
  }));
  $('[data-ajouter-tarif]').hidden = etat.tarifs.length >= 6;
}

function majPalettesEtPolices() {
  $$('[data-palettes-de]').forEach((g) => { g.hidden = g.dataset.palettesDe !== etat.style; });
  $$('[data-polices-de]').forEach((g) => { g.hidden = g.dataset.policesDe !== etat.style; });
  $$('[data-palette]').forEach((el) => {
    const groupe = el.closest('[data-palettes-de]');
    el.checked = el.value === etat.palette && (!groupe || groupe.dataset.palettesDe === etat.style);
  });
  $$('[data-police]').forEach((el) => {
    const groupe = el.closest('[data-polices-de]');
    el.checked = el.value === String(etat.police) && groupe.dataset.policesDe === etat.style;
  });
}

/* Palette de base (style ou libre), utilisée pour les couleurs personnalisées */
function paletteBase() {
  const s = STYLES.find((x) => x.id === etat.style) || STYLES[0];
  if (String(etat.palette).startsWith('l')) return PALETTES_LIBRES[Number(etat.palette.slice(1))] || s.palettes[0];
  return s.palettes[Number(etat.palette)] || s.palettes[0];
}

function majCouleursPerso() {
  const base = deriver(paletteBase());
  const perso = etat.couleurs.accent || etat.couleurs.fond;
  ['accent', 'fond'].forEach((k) => {
    const input = $(`[data-couleur-perso="${k}"]`);
    input.value = (etat.couleurs[k] || base[k]).toLowerCase();
    $(`[data-couleur-valeur="${k}"]`).textContent = etat.couleurs[k] ? etat.couleurs[k].toUpperCase() : k === 'accent' ? 'Celle de la palette' : 'Celui de la palette';
  });
  $('[data-couleurs-reinit]').hidden = !perso;
}

/* Couleurs personnalisées → paramètre « couleurs » de l'aperçu */
function couleursPerso() {
  if (!etat.couleurs.accent && !etat.couleurs.fond) return '';
  const p = paletteBase();
  const fond = etat.couleurs.fond || p.fond;
  const sombre = deriver({ ...p, fond }).schema === 'dark';
  const encre = etat.couleurs.fond ? (sombre ? '#F3EFE8' : '#1C1A18') : p.encre;
  const accent = etat.couleurs.accent || p.accent;
  const melange = (a, b, t) => {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  const doux = etat.couleurs.fond ? melange(fond, accent, 0.14) : p.doux;
  const texte2 = etat.couleurs.fond ? melange(fond, encre, 0.7) : p.texte2 || melange(fond, encre, 0.7);
  return [fond, encre, accent, doux, texte2].map((c) => c.replace('#', '').toUpperCase()).join('.');
}

/* Style Immersif : animation du fond et voile, montrés en haut de l'accueil */
function montrerFond(cle) {
  if (pageApercu !== 'accueil') return chargerApercu('accueil');
  apercuAppliquer({ [cle]: etat[cle] });
  const a = api();
  if (a && a.haut) a.haut();
  const nom = cle === 'fond' ? FONDS.find((f) => f.id === etat.fond)?.nom : `Voile ${VOILES.find((v) => v.id === etat.voile)?.nom.toLowerCase()}`;
  annoncer(`${nom} : appliqué à l’aperçu.`);
}

function changerStyle() {
  etat.palette = String(etat.palette).startsWith('l') ? etat.palette : '0';
  etat.police = '0';
  majPalettesEtPolices();
  majCouleursPerso();
  chargerApercu(pageApercu);
  annoncer(`Style ${STYLES.find((s) => s.id === etat.style).nom} affiché dans l’aperçu.`);
  /* Style Immersif : ses réglages apparaissent sous la liste, on les amène à l'écran */
  const reglages = $(`[data-si-style="${etat.style}"]`);
  if (reglages) {
    majConditionnels();
    setTimeout(() => reglages.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }), 250);
  }
}

/* ==========================================================================
   Navigation entre les étapes
   ========================================================================== */
function brancherNavigation() {
  $('[data-suivant]').addEventListener('click', () => aller(etat.etape + 1));
  $('[data-precedent]').addEventListener('click', () => aller(etat.etape - 1));
  $$('[data-aller]').forEach((b) => b.addEventListener('click', () => aller(Number(b.dataset.aller))));
  /* Raccourci : Entrée dans un champ simple passe à l'étape suivante */
  $('[data-formulaire]').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="file"])')) {
      e.preventDefault();
      aller(etat.etape + 1);
    }
  });
}

function aller(i, { initial = false } = {}) {
  const cible = Math.max(0, Math.min(ETAPES.length - 1, i));
  const avant = etat.etape;
  etat.etape = cible;
  $$('[data-etape]').forEach((s) => {
    const actif = Number(s.dataset.etape) === cible;
    s.hidden = !actif;
    s.classList.toggle('vers-arriere', actif && cible < avant);
  });
  $$('[data-aller]').forEach((b) => {
    const n = Number(b.dataset.aller);
    if (n === cible) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    b.classList.toggle('est-fait', n < cible);
  });
  $('[data-etape-nom]').textContent = ETAPES[cible];
  $('[data-etape-compte]').textContent = `${cible + 1} / ${ETAPES.length}`;
  $('[data-precedent]').disabled = cible === 0;
  const suivant = $('[data-suivant]');
  suivant.hidden = cible === ETAPES.length - 1;
  suivant.textContent = cible === 0 ? 'Commencer' : 'Continuer';
  if (cible === ETAPES.length - 1) dessinerRecap();
  /* Le bouton de l'étape courante reste visible dans la barre de progression */
  $(`[data-aller="${cible}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduire() ? 'auto' : 'smooth' });
  if (!initial) {
    const panneau = $('.cfg-panneau');
    if (estMobile()) window.scrollTo({ top: 0, behavior: 'auto' }); else panneau.scrollTo({ top: 0, behavior: 'auto' });
    $(`#t-${cible}`)?.focus({ preventScroll: true });
    const [page, bloc] = VUE_ETAPE[cible];
    if (page && page !== pageApercu) chargerApercu(page, bloc ? { visuel: bloc } : null);
    else if (bloc) focusApercu({ visuel: bloc });
  }
  enregistrer();
}

/* ==========================================================================
   Aperçu en direct
   ========================================================================== */
let iframe, appareil, ecran, pageApercu = 'accueil', formatApercu = 'ordinateur', enAttente = null, pret = false;

const baseStyle = (style) => (style === 'sauge' ? '/demo/' : `/styles/${style}/`);
const cheminPage = (page) => {
  const p = PAGES.find((x) => x.id === page);
  return p && p.chemin ? `${p.chemin}/` : '';
};

function parametres() {
  const q = new URLSearchParams({ apercu: '1', palette: String(etat.palette), police: String(etat.police), options: etat.options.join(',') });
  if (etat.style === 'immersif') { q.set('fond', etat.fond); q.set('voile', etat.voile); }
  const c = couleursPerso();
  if (c) q.set('couleurs', c);
  return q.toString();
}

function chargerApercu(page, focusApres = null) {
  pageApercu = page || 'accueil';
  enAttente = focusApres;
  pret = false;
  const url = `${baseStyle(etat.style)}${cheminPage(pageApercu)}?${parametres()}`;
  iframe.src = url;
  $('[data-ouvrir-apercu]').href = url.replace('apercu=1&', '');
  const select = $('[data-page-apercu]');
  if (select.value !== pageApercu) select.value = pageApercu;
}

function api() {
  try { return iframe.contentWindow && iframe.contentWindow.youxApercu; } catch (e) { return null; }
}

function apercuAppliquer(params) { const a = api(); if (a) a.appliquer(params); }
function apercuCouleurs() {
  const c = couleursPerso();
  apercuAppliquer(c ? { palette: etat.palette, couleurs: c } : { couleurs: '', palette: etat.palette });
}
function apercuPages() { const a = api(); if (a) a.pages(['accueil', 'contact', ...etat.pages]); }

function remplacements() {
  const d = demo, e = etat;
  const paires = [];
  const ajouter = (de, vers) => { if (de && vers && vers.trim()) paires.push([de, vers.trim()]); };
  const prenom = e.prenom.trim(), nom = e.nom.trim();
  if (prenom || nom) {
    const complet = [prenom || d.praticien.prenom, nom || d.praticien.nom].join(' ');
    ajouter(`${d.praticien.prenom} ${d.praticien.nom}`, complet);
    ajouter(d.praticien.prenom, prenom);
    ajouter(`« ${d.praticien.nom} »`, nom && `« ${nom} »`);
    const initiales = ((prenom || d.praticien.prenom)[0] + (nom || d.praticien.nom)[0]).toUpperCase();
    ajouter('CM', initiales);
    ajouter('Cm', initiales[0] + initiales[1].toLowerCase());
  }
  if (e.titre.trim()) {
    ajouter(d.praticien.titre, e.titre);
    ajouter(d.praticien.titre.toLowerCase(), e.titre.toLowerCase());
  }
  if (e.ville.trim()) {
    ajouter(`du ${d.cabinet.quartier}`, `de ${e.ville}`);
    ajouter(d.cabinet.quartier, e.ville);
    ajouter(d.cabinet.ville, e.ville);
  }
  ajouter(d.cabinet.adresse, e.adresse);
  ajouter(d.cabinet.codePostal, e.cp);
  ajouter(d.contact.telephone, e.telephone);
  ajouter(d.contact.email, e.email);
  ajouter(d.praticien.adeli, e.numero);
  /* Les plus longues d'abord, pour ne pas couper un mot déjà remplacé */
  return paires.sort((a, b) => b[0].length - a[0].length);
}
/* Séances et tarifs : nom, durée et prix à la place de ceux de la démo */
function apercuTarifs() {
  const a = api();
  if (a && a.tarifs) a.tarifs(etat.tarifs);
}
function apercuTextes() {
  const a = api();
  if (a) a.textes(remplacements());
  const slug = [etat.prenom, etat.nom].filter((x) => x.trim()).join('-').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  $('[data-adresse]').textContent = slug ? `${slug}.fr` : 'votre-cabinet.fr';
}
function apercuPhotos() {
  const a = api();
  if (!a) return;
  ['portrait', 'cabinet', 'logo'].forEach((t) => a.photo(t, photos[t]?.url || ''));
}

/* Tout l'état d'un coup, après chaque chargement de page dans l'aperçu */
function synchroniser() {
  const a = api();
  if (!a) return;
  const c = couleursPerso();
  a.appliquer({ palette: String(etat.palette), police: String(etat.police), options: etat.options, couleurs: c || '', fond: etat.fond, voile: etat.voile });
  if (c) a.appliquer({ couleurs: c });
  apercuPages();
  apercuTarifs();
  apercuTextes();
  apercuPhotos();
}

function focusApercu(cible) {
  const a = api();
  if (!a || !cible) return;
  if (cible.option) {
    a.focus(cible.option);
  } else if (cible.visuel) {
    const el = iframe.contentDocument.querySelector(`[data-visuel="${cible.visuel}"]`);
    if (el) el.scrollIntoView({ behavior: reduire() ? 'auto' : 'smooth', block: 'center' });
  }
}

/* Une fonctionnalité cochée : l'aperçu va la montrer */
function basculerOption(id, actif) {
  const liste = new Set(etat.options);
  if (actif) liste.add(id); else liste.delete(id);
  if (id === 'hds' && actif) liste.add('questionnaires');
  etat.options = [...liste];
  $$('[data-option-choix]').forEach((el) => { el.checked = etat.options.includes(el.dataset.optionChoix); });
  majConditionnels();
  const a = api();
  if (a) a.options(etat.options);
  if (actif) voir(id === 'hds' ? 'questionnaires' : id, { auto: true });
}

function voir(id, { auto = false } = {}) {
  const option = OPTIONS.find((o) => o.id === id);
  if (!option) return;
  if (!etat.options.includes(id)) { toast('Activez d’abord cette fonctionnalité pour la voir.'); return; }
  const page = option.page || pageApercu;
  if (estMobile() && auto && !sceneOuverte()) {
    /* Sur téléphone, l'aperçu est replié : on propose d'aller voir */
    preparerFocus(page, id);
    toast(`« ${option.nom} » ajouté à l’aperçu.`, { action: 'Voir', rappel: () => ouvrirScene() });
    return;
  }
  if (estMobile() && !sceneOuverte()) ouvrirScene();
  preparerFocus(page, id);
  annoncer(`Aperçu : ${option.nom}.`);
}

function preparerFocus(page, id) {
  if (page !== pageApercu) chargerApercu(page, { option: id });
  else if (pret) setTimeout(() => focusApercu({ option: id }), estMobile() && !sceneOuverte() ? 600 : 60);
  else enAttente = { option: id };
}

function brancherApercu() {
  iframe = $('[data-iframe]');
  appareil = $('[data-appareil]');
  ecran = $('[data-ecran]');
  formatApercu = estMobile() ? 'mobile' : 'ordinateur';
  $$('[data-format] input').forEach((r) => { r.checked = r.value === formatApercu; });

  iframe.addEventListener('load', () => {
    pret = true;
    /* Page affichée (si le visiteur a cliqué un lien dans l'aperçu) */
    try {
      const chemin = iframe.contentWindow.location.pathname.replace(/^\/(demo|styles\/[a-z]+)\//, '').replace(/\/$/, '');
      const page = PAGES.find((p) => p.chemin === chemin);
      if (page) { pageApercu = page.id; $('[data-page-apercu]').value = page.id; }
    } catch (e) { /* page d'un autre site : on ne touche à rien */ }
    synchroniser();
    if (enAttente) {
      const cible = enAttente;
      enAttente = null;
      setTimeout(() => focusApercu(cible), 250);
    }
  });

  $('[data-page-apercu]').addEventListener('change', (e) => chargerApercu(e.target.value));
  $$('[data-format] input').forEach((r) => r.addEventListener('change', () => { formatApercu = r.value; ajuster(); }));
  $$('[data-voir]').forEach((b) => b.addEventListener('click', () => voir(b.dataset.voir)));

  /* Mise à l'échelle de l'appareil dans la scène */
  new ResizeObserver(ajuster).observe(ecran);
  ajuster();

  /* Feuille d'aperçu sur téléphone */
  $('[data-ouvrir-scene]').addEventListener('click', ouvrirScene);
  $('[data-fermer-apercu]').addEventListener('click', fermerScene);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sceneOuverte()) fermerScene(); });

  chargerApercu('accueil');
}

function ajuster() {
  const [w, h] = FORMATS[formatApercu];
  ecran.dataset.formatActif = formatApercu;
  const barre = formatApercu === 'ordinateur' ? 38 : 0;
  const style = getComputedStyle(ecran);
  const dispoW = ecran.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - (formatApercu === 'mobile' ? 26 : 0);
  const dispoH = ecran.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - barre - (formatApercu === 'mobile' ? 26 : 0);
  const echelle = Math.max(0.2, Math.min(1, dispoW / w, dispoH / h));
  iframe.style.width = `${w}px`;
  iframe.style.height = `${h}px`;
  iframe.style.transform = `scale(${echelle})`;
  iframe.style.transformOrigin = 'top left';
  appareil.style.width = `${Math.round(w * echelle)}px`;
  appareil.style.height = `${Math.round(h * echelle) + barre}px`;
}

const sceneOuverte = () => $('[data-scene]').classList.contains('est-ouverte');
function ouvrirScene() {
  const scene = $('[data-scene]');
  scene.classList.add('est-ouverte');
  $('[data-formulaire]').inert = true;
  $('[data-pied]').inert = true;
  requestAnimationFrame(ajuster);
  setTimeout(() => $('[data-fermer-apercu]').focus(), 50);
}
function fermerScene() {
  $('[data-scene]').classList.remove('est-ouverte');
  $('[data-formulaire]').inert = false;
  $('[data-pied]').inert = false;
  $('[data-ouvrir-scene]').focus();
}

/* ==========================================================================
   Photos (affichées seulement, jamais enregistrées ni envoyées)
   ========================================================================== */
function brancherPhotos() {
  $$('[data-fichier]').forEach((input) => input.addEventListener('change', () => {
    if (input.files[0]) prendrePhoto(input.dataset.fichier, input.files[0]);
    input.value = '';
  }));
  $$('[data-retirer-photo]').forEach((b) => b.addEventListener('click', () => retirerPhoto(b.dataset.retirerPhoto)));
  $$('[data-depot]').forEach((zone) => {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('survol'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('survol'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('survol');
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith('image/')) prendrePhoto(zone.dataset.depot, f);
    });
  });
}

function prendrePhoto(type, fichier) {
  if (photos[type]) URL.revokeObjectURL(photos[type].url);
  photos[type] = { url: URL.createObjectURL(fichier), nom: fichier.name };
  majDepot(type);
  const a = api();
  if (a) a.photo(type, photos[type].url);
  if (type !== 'logo') focusApercu({ visuel: type });
  toast('Photo ajoutée à l’aperçu.');
}
function retirerPhoto(type) {
  if (photos[type]) URL.revokeObjectURL(photos[type].url);
  delete photos[type];
  majDepot(type);
  const a = api();
  if (a) a.photo(type, '');
}
function majDepot(type) {
  const zone = $(`[data-depot="${type}"]`);
  const p = photos[type];
  $('.cfg-depot__vignette', zone).style.backgroundImage = p ? `url("${p.url}")` : '';
  const nom = $('[data-depot-nom]', zone);
  if (!nom.dataset.aide) nom.dataset.aide = nom.textContent;
  nom.textContent = p ? p.nom : nom.dataset.aide;
  $(`[data-retirer-photo="${type}"]`).hidden = !p;
  $('label.cfg-bouton', zone).firstChild.textContent = p ? 'Changer' : 'Choisir';
}

/* ==========================================================================
   Récapitulatif et envoi
   ========================================================================== */
const ouiNon = (b) => (b ? 'Oui' : 'Non');
const ou = (x) => (Array.isArray(x) ? (x.length ? x.join(', ') : '—') : (String(x || '').trim() || '—'));

function nomDeLaPalette() {
  if (etat.couleurs.accent || etat.couleurs.fond) {
    return `Couleurs personnalisées (${[etat.couleurs.accent && `principale ${etat.couleurs.accent.toUpperCase()}`, etat.couleurs.fond && `fond ${etat.couleurs.fond.toUpperCase()}`].filter(Boolean).join(', ')}), à partir de « ${paletteBase().nom} »`;
  }
  return paletteBase().nom + (String(etat.palette).startsWith('l') ? ' (palette libre)' : '');
}

function lignesRecap() {
  const s = STYLES.find((x) => x.id === etat.style) || STYLES[0];
  const police = s.polices[Number(etat.police)] || s.polices[0];
  const horaires = etat.jours.map((j, i) => `${['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][i]} : ${j.ouvert ? `${j.debut.replace(':', ' h ')} – ${j.fin.replace(':', ' h ')}`.replace(/ h 00/g, ' h') : 'fermé'}`).join('\n');
  const tarifs = etat.tarifs.filter((t) => (t.type || '').trim()).map((t) => `${t.type}${t.duree ? ` · ${t.duree}` : ''}${t.prix ? ` · ${t.prix}` : ''}`).join('\n');
  const nomsOptions = etat.options.filter((o) => o !== 'hds').map((id) => OPTIONS.find((o) => o.id === id)?.nom).filter(Boolean);
  const pagesChoisies = ['Accueil', ...PAGES.filter((p) => etat.pages.includes(p.id)).map((p) => p.menu), ...(etat.pages.includes('blog') ? ['Blog ou ressources'] : []), ...(etat.options.includes('faq') ? ['FAQ'] : []), 'Contact', 'Mentions légales', 'Confidentialité'];
  const lignes = [
    ['Nom', [etat.prenom, etat.nom].filter((x) => x.trim()).join(' ')],
    ['Profession', { psychologue: 'Psychologue', sophrologue: 'Sophrologue', coach: 'Coach', autre: 'Autre' }[etat.profession]],
    ['Titre', etat.titre], ['Approche', etat.approche]
  ];
  if (etat.profession === 'psychologue') lignes.push(['N° ADELI ou RPPS', etat.numero]);
  lignes.push(
    ['Téléphone', etat.telephone], ['E-mail', etat.email],
    ['Public', etat.publics], ['Motifs', etat.motifs],
    ['Adresse', [etat.adresse, [etat.cp, etat.ville].filter((x) => x.trim()).join(' ')].filter((x) => x.trim()).join(', ')],
    ['Accès', etat.acces], ['Horaires', horaires],
    ['Visio', ouiNon(etat.visio)], ['Accès PMR', ouiNon(etat.pmr)],
    ['Séances', tarifs],
    ['Rendez-vous', etat.rdvMode + (etat.rdvMode !== 'Téléphone' && etat.rdvLien.trim() ? ` : ${etat.rdvLien.trim()}` : '')],
    ['Style', s.nom + (etat.surMesure ? ' (direction artistique sur mesure souhaitée)' : '')],
    ['Palette', nomDeLaPalette()], ['Police des titres', police.nom],
    ...(etat.style === 'immersif' ? [['Image d’accueil', `${FONDS.find((f) => f.id === etat.fond)?.nom || ''}, voile ${(VOILES.find((v) => v.id === etat.voile)?.nom || '').toLowerCase()}`]] : []),
    ['Ambiance', etat.ambiances], ['Pistes', etat.pistes], ['Envies', etat.envies], ['À éviter', etat.eviter],
    ['Photos', [etat.photosStatut, Object.keys(photos).length ? `Déposées dans l’aperçu : ${Object.values(photos).map((p) => p.nom).join(', ')}` : ''].filter(Boolean).join('\n')],
    ['Pages', pagesChoisies],
    ['Fonctionnalités', nomsOptions]
  );
  if (etat.options.includes('questionnaires')) {
    lignes.push(['Questionnaires', [etat.questionnaires.join(', '), etat.questionnairesPerso.trim() && `Personnels : ${etat.questionnairesPerso.trim().replace(/\n/g, ', ')}`, `Résultats : ${etat.resultats}`, `Hébergement certifié HDS : ${etat.options.includes('hds') ? 'oui (option payante, sur devis)' : 'non'}`].filter(Boolean).join('\n')]);
  }
  lignes.push(
    ['Ton', `${etat.ton === 'tu' ? 'Tutoiement' : 'Vouvoiement'}, registre ${etat.registre}`],
    ['Mots-clés', etat.motsCles], ['Remarques', etat.remarques]
  );
  return lignes.map(([k, v]) => [k, ou(v)]);
}

function texteRecap() {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Demande de site · youXdesign\n${date}\n\n` + lignesRecap().map(([k, v]) => `${k} :${v.includes('\n') ? '\n' : ' '}${v}`).join('\n') + '\n';
}

function dessinerRecap() {
  const dl = $('[data-recap]');
  dl.replaceChildren(...lignesRecap().map(([k, v]) => {
    const div = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    div.append(dt, dd);
    return div;
  }));
  const noms = Object.values(photos).map((p) => p.nom);
  const rappel = $('[data-rappel-photos]');
  rappel.hidden = !noms.length;
  rappel.textContent = noms.length ? `N’oubliez pas vos images : l’e-mail ne peut pas les joindre automatiquement. Ajoutez-les en pièces jointes (${noms.join(', ')}).` : '';
  const nom = [etat.prenom, etat.nom].filter((x) => x.trim()).join(' ');
  const sujet = `Demande de site · ${nom || 'nouveau cabinet'}`;
  $('[data-mailto]').href = `mailto:${EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(texteRecap())}`;
}

function brancherEnvoi() {
  $('[data-copier]').addEventListener('click', async () => {
    const texte = texteRecap();
    try {
      await navigator.clipboard.writeText(texte);
    } catch (e) {
      const zone = document.createElement('textarea');
      zone.value = texte;
      zone.setAttribute('readonly', '');
      zone.className = 'sr-only';
      document.body.append(zone);
      zone.select();
      document.execCommand('copy');
      zone.remove();
    }
    toast('Récapitulatif copié.');
  });
  $('[data-telecharger]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([texteRecap()], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demande-youxdesign.txt';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const effacer = $('[data-effacer]');
  effacer.addEventListener('click', () => {
    if (!effacer.dataset.confirmer) {
      effacer.dataset.confirmer = '1';
      effacer.textContent = 'Confirmer : tout effacer';
      setTimeout(() => { delete effacer.dataset.confirmer; effacer.textContent = 'Tout effacer et recommencer'; }, 4000);
      return;
    }
    try { memoire && memoire.removeItem(CLE_MEMOIRE); } catch (e) { /* rien */ }
    Object.keys(photos).forEach(retirerPhoto);
    etat = defaut();
    remplirFormulaire();
    chargerApercu('accueil');
    aller(0);
    toast('Toutes les réponses ont été effacées.');
  });
}

/* ==========================================================================
   Messages
   ========================================================================== */
let minuterieToast = null;
function toast(message, { action, rappel } = {}) {
  const t = $('[data-toast]');
  t.replaceChildren(document.createTextNode(message));
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = action;
    b.addEventListener('click', () => { t.hidden = true; rappel(); });
    t.append(b);
  }
  t.hidden = false;
  clearTimeout(minuterieToast);
  minuterieToast = setTimeout(() => { t.hidden = true; }, action ? 5000 : 2400);
}
function annoncer(message) {
  const zone = $('[data-annonce]');
  if (zone) { zone.textContent = ''; setTimeout(() => { zone.textContent = message; }, 30); }
}

/* Démarrage, une fois toutes les fonctions définies */
if ($('[data-cfg]')) demarrer();

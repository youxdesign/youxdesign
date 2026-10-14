/** @OnlyCurrentDoc */
/* ==========================================================================
   youXdesign · demandes du configurateur et compteur d'étapes
   --------------------------------------------------------------------------
   Programme Google Apps Script relié au tableur « youXdesign · demandes »
   (Google Drive de Younes). Le site lui transmet, par ses fonctions
   Cloudflare (functions/api/demande.js et functions/api/etape.js) :
   - { type: 'demande', nom, email, telephone, ville, style, recap }
     → une ligne dans l'onglet « Demandes » et un e-mail à Younes ;
   - { type: 'etape', etape } → une ligne « date + étape » dans l'onglet
     « Journal », et rien d'autre : le compteur est anonyme.
   L'onglet « Tunnel » compte les visiteurs arrivés à chaque étape.

   Installation (une seule fois) :
   1. Dans le tableur : Extensions › Apps Script, remplacer le contenu par
      ce fichier, puis enregistrer.
   2. Choisir la fonction « installer », puis Exécuter : Google demande
      d'autoriser le programme (ce tableur seulement, et l'envoi d'e-mails).
   3. Déployer › Nouveau déploiement › Application Web :
      exécuter en tant que « Moi », accès « Tout le monde ».
   4. Copier l'URL de l'application Web dans le réglage Cloudflare
      APPS_SCRIPT_URL (voir src/serveur/apps-script.mjs).
   Après une modification de ce code : Déployer › Gérer les déploiements ›
   modifier (crayon) › Version : nouvelle version. L'URL ne change pas.
   ========================================================================== */
const DESTINATAIRE = 'contact@youxdesign.fr';
/* Au-delà, les demandes sont toujours rangées dans le tableur, mais sans
   e-mail : un robot ne peut pas remplir la boîte de Younes. */
const EMAILS_MAX_PAR_JOUR = 25;

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return repondre(false); }
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const maintenant = new Date();

  if (d && d.type === 'etape' && typeof d.etape === 'string') {
    const etape = propre(d.etape, 60);
    classeur.getSheetByName('Journal').appendRow([jour(maintenant), etape]);
    compter(classeur, etape);
    return repondre(true);
  }

  if (d && d.type === 'demande') {
    const v = {
      nom: propre(d.nom, 120), email: propre(d.email, 200), telephone: propre(d.telephone, 40),
      ville: propre(d.ville, 120), style: propre(d.style, 120), recap: String(d.recap || '').slice(0, 30000)
    };
    classeur.getSheetByName('Demandes').appendRow([maintenant, sur(v.nom), sur(v.email), sur(v.telephone), sur(v.ville), sur(v.style), sur(v.recap)]);
    classeur.getSheetByName('Journal').appendRow([jour(maintenant), '13 · Demande envoyée']);
    compter(classeur, '13 · Demande envoyée');
    prevenir(v, classeur.getUrl());
    return repondre(true);
  }

  return repondre(false);
}

/* Ajoute 1 au compteur de l'étape dans l'onglet « Tunnel » (lignes 4 et
   suivantes, triées par nom d'étape : les numéros gardent l'ordre). Pas de
   formule : elles dépendraient des réglages de langue du tableur. */
function compter(classeur, etape) {
  const tunnel = classeur.getSheetByName('Tunnel');
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const nombre = Math.max(tunnel.getLastRow() - 3, 0);
    const lignes = nombre ? tunnel.getRange(4, 1, nombre, 2).getValues() : [];
    const i = lignes.findIndex((l) => l[0] === etape);
    if (i >= 0) {
      tunnel.getRange(4 + i, 2).setValue(Number(lignes[i][1] || 0) + 1);
    } else {
      tunnel.getRange(4 + nombre, 1, 1, 2).setValues([[etape, 1]]);
      tunnel.getRange(4, 1, nombre + 1, 2).sort(1);
    }
  } finally {
    verrou.releaseLock();
  }
}

/* Vérification rapide du déploiement : ouvrir l'URL dans un navigateur */
function doGet() {
  return ContentService.createTextOutput('youXdesign : réception des demandes active.');
}

/* E-mail à Younes ; « Répondre » écrit directement à la personne */
function prevenir(v, adresseTableur) {
  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const proprietes = PropertiesService.getScriptProperties();
    const cle = 'emails-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const deja = Number(proprietes.getProperty(cle) || 0);
    if (deja >= EMAILS_MAX_PAR_JOUR) return;
    proprietes.setProperty(cle, String(deja + 1));
  } finally {
    verrou.releaseLock();
  }
  const lignes = [
    'Nouvelle demande envoyée depuis le configurateur de youxdesign.fr.',
    '',
    'Nom : ' + (v.nom || '—'),
    'E-mail : ' + (v.email || '—'),
    'Téléphone : ' + (v.telephone || '—'),
    'Ville : ' + (v.ville || '—'),
    'Style choisi : ' + (v.style || '—'),
    '',
    v.email ? 'Répondre à cet e-mail écrit directement à cette personne.' : 'Pas d’e-mail indiqué : rappeler la personne au téléphone.',
    'Toutes les demandes sont aussi rangées dans le tableur : ' + adresseTableur,
    '',
    '————————————————',
    '',
    v.recap
  ];
  const options = { name: 'youXdesign · configurateur' };
  if (v.email) options.replyTo = v.email;
  MailApp.sendEmail(DESTINATAIRE, 'Nouvelle demande de site · ' + (v.nom || 'sans nom'), lignes.join('\n'), options);
}

/* À lancer une fois depuis l'éditeur : crée les onglets et demande les autorisations */
function installer() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const onglet = (nom, entetes) => {
    const feuille = classeur.getSheetByName(nom) || classeur.insertSheet(nom);
    if (entetes && feuille.getLastRow() === 0) {
      feuille.appendRow(entetes);
      feuille.setFrozenRows(1);
      feuille.getRange(1, 1, 1, entetes.length).setFontWeight('bold');
    }
    return feuille;
  };

  const tunnel = onglet('Tunnel');
  const demandes = onglet('Demandes', ['Reçue le', 'Nom', 'E-mail', 'Téléphone', 'Ville', 'Style', 'Récapitulatif']);
  demandes.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  demandes.setColumnWidth(7, 600);
  const journal = onglet('Journal', ['Date', 'Étape']);
  journal.getRange('A:A').setNumberFormat('dd/mm/yyyy');
  journal.setColumnWidth(2, 260);

  /* « Tunnel » : recalculé à partir du Journal (relancer « installer »
     remet donc les compteurs d'aplomb), puis tenu à jour par compter(). */
  tunnel.clear();
  tunnel.getRange('A1').setValue('Visiteurs du configurateur, étape par étape (compteur anonyme)').setFontWeight('bold');
  tunnel.getRange('A3:B3').setValues([['Étape', 'Visiteurs depuis le début']]).setFontWeight('bold');
  const totaux = {};
  if (journal.getLastRow() > 1) {
    journal.getRange(2, 2, journal.getLastRow() - 1, 1).getValues()
      .forEach(([etape]) => { if (etape) totaux[etape] = (totaux[etape] || 0) + 1; });
  }
  const lignes = Object.keys(totaux).sort().map((etape) => [etape, totaux[etape]]);
  if (lignes.length) tunnel.getRange(4, 1, lignes.length, 2).setValues(lignes);
  tunnel.setColumnWidth(1, 300);
  tunnel.setColumnWidth(2, 200);
  classeur.setActiveSheet(tunnel);
  classeur.moveActiveSheet(1);

  /* Supprime la feuille vide créée avec le tableur (« Feuille 1 ») */
  classeur.getSheets()
    .filter((f) => !['Tunnel', 'Demandes', 'Journal'].includes(f.getName()) && f.getLastRow() === 0)
    .forEach((f) => classeur.deleteSheet(f));

  /* Demande dès maintenant l'autorisation d'envoyer des e-mails */
  MailApp.getRemainingDailyQuota();
}

/* Repartir de zéro : vide le journal des étapes (compteur anonyme) et
   retire les demandes d'essai (nom contenant « ESSAI youXdesign »), puis
   recalcule « Tunnel ». Les vraies demandes sont conservées. */
function repartirDeZero() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const demandes = classeur.getSheetByName('Demandes');
  for (let r = demandes.getLastRow(); r >= 2; r--) {
    if (String(demandes.getRange(r, 2).getValue()).includes('ESSAI youXdesign')) demandes.deleteRow(r);
  }
  const journal = classeur.getSheetByName('Journal');
  if (journal.getLastRow() > 1) journal.deleteRows(2, journal.getLastRow() - 1);
  installer();
}

const repondre = (ok) => ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON);
const jour = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const propre = (s, max) => String(s || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
/* Un texte qui commence par = + - @ serait lu comme une formule par le tableur */
const sur = (s) => (/^[=+\-@]/.test(s) ? "'" + s : s);

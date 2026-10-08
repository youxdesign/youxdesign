/* ==========================================================================
   Textes des pages légales, générés à partir de la fiche du cabinet.
   Chaque fonction renvoie une liste de rubriques { id, titre, html } que
   chaque style met en page à sa façon. Une seule source pour tous les styles.
   ========================================================================== */
import { OPTIONS } from '../config/catalogue.mjs';
import { DOMAINE, STUDIO } from '../config/youxdesign.mjs';

const e = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lienExterne = (url, texte) => `<a href="${e(url)}" target="_blank" rel="noopener">${e(texte)}<span class="sr-only"> (nouvel onglet)</span></a>`;
const mail = (adr) => `<a href="mailto:${e(adr)}">${e(adr)}</a>`;

export function mentionsLegales(cab, liens) {
  const p = cab.praticien, l = cab.legal;
  const directeur = p.accord === 'f' ? 'Directrice de la publication' : p.accord === 'm' ? 'Directeur de la publication' : 'Direction de la publication';
  const numeros = [p.adeli && `N° ADELI : ${e(p.adeli)}`, p.rpps && `N° RPPS : ${e(p.rpps)}`].filter(Boolean).join(' · ');
  const externes = [cab.rdv?.plateforme, cab.estPsychologue && 'ameli.fr', cab.a('carte') && 'OpenStreetMap'].filter(Boolean);
  const rubriques = [
    {
      id: 'editeur',
      titre: 'Éditeur du site',
      html: `<p><strong>${e(cab.nomComplet)}</strong>, ${e(p.statut || p.titre.toLowerCase())}<br>${e(cab.adresse.uneLigne)}<br>Téléphone : <a href="${e(cab.tel.lien)}">${e(cab.tel.affiche)}</a> · E-mail : ${mail(cab.contact.email)}${p.siret ? `<br>SIRET : ${e(p.siret)}` : ''}${numeros ? `<br>${numeros}` : ''}</p><p>${directeur} : ${e(l.directeurPublication || cab.nomComplet)}.</p>`
    },
    {
      id: 'hebergement',
      titre: 'Hébergement',
      html: `<p>Cloudflare, Inc.<br>101 Townsend Street, San Francisco, CA 94107, États-Unis<br>Téléphone : +1 650 319 8930<br>${lienExterne('https://www.cloudflare.com/', 'www.cloudflare.com')}</p>`
    },
    {
      id: 'conception',
      titre: 'Conception et réalisation',
      html: `<p>${e(STUDIO)} · <a href="${e(DOMAINE)}/">${e(DOMAINE.replace('https://', ''))}</a></p>`
    }
  ];
  if (cab.estPsychologue) rubriques.push({
    id: 'activite',
    titre: 'Activité réglementée',
    html: `<p>Le titre de psychologue est protégé par l’article 44 de la loi n° 85-772 du 25 juillet 1985. ${e(cab.nomComplet)} est ${cab.accord('enregistré')} auprès de l’Agence régionale de santé${p.ars ? ` ${e(p.ars)}` : ''}${p.adeli || p.rpps ? ', sous le numéro indiqué ci-dessus' : ''}. Sa pratique s’inscrit dans le respect du Code de déontologie des psychologues.</p>`
  });
  if (l.mediateur) rubriques.push({ id: 'mediation', titre: 'Médiation', html: `<p>${e(l.mediateur)}</p>` });
  rubriques.push(
    {
      id: 'propriete',
      titre: 'Propriété intellectuelle',
      html: '<p>L’ensemble des contenus de ce site (textes, images, mise en page) est protégé par le droit d’auteur. Toute reproduction, même partielle, est soumise à l’autorisation préalable de l’éditeur.</p>'
    },
    {
      id: 'responsabilite',
      titre: 'Responsabilité',
      html: `<p>Les informations publiées sur ce site sont données à titre général. Elles ne remplacent en aucun cas une consultation individuelle ni un avis médical. En cas d’urgence, appelez le <a href="tel:15">15</a> ou le <a href="tel:3114">3114</a>.</p>${externes.length ? `<p>Le site contient des liens vers des services extérieurs (${e(externes.join(', '))}). L’éditeur n’est pas responsable de leur contenu ni de leur fonctionnement.</p>` : ''}`
    },
    {
      id: 'credits',
      titre: 'Crédits',
      html: `<p>Conception, illustrations et réalisation : ${e(STUDIO)}.${cab.a('carte') ? ' Fond de carte : © contributeurs OpenStreetMap.' : ''}</p><p>Pour en savoir plus sur le traitement de vos données, consultez la <a href="${e(liens.confidentialite)}">politique de confidentialité</a>.</p>`
    }
  );
  return rubriques;
}

export function confidentialite(cab) {
  const p = cab.praticien;
  const formulaires = ['rappel', 'newsletter', 'questionnaires'].filter((o) => cab.a(o));
  const tiers = OPTIONS.filter((o) => o.tiers && o.id !== 'carte' && cab.a(o.id));
  const enBref = formulaires.length
    ? 'Ce site ne dépose aucun cookie et n’utilise aucun outil de mesure d’audience. Les seules informations recueillies sont celles que vous choisissez de transmettre via les services décrits ci-dessous.'
    : 'Ce site ne dépose aucun cookie, n’utilise aucun outil de mesure d’audience et ne comporte aucun formulaire : il ne recueille aucune donnée de santé.';
  const rubriques = [
    { id: 'en-bref', titre: 'En bref', resume: true, html: `<p>${enBref}</p>` },
    {
      id: 'responsable',
      titre: 'Responsable du traitement',
      html: `<p>${e(cab.nomComplet)}, ${e(p.titre.toLowerCase())}<br>${e(cab.adresse.uneLigne)}<br>${mail(cab.contact.email)}</p>`
    },
    {
      id: 'donnees',
      titre: 'Données recueillies',
      html: '<p>Le site lui-même ne recueille aucune donnée personnelle. Si vous me contactez par téléphone ou par e-mail, les informations que vous transmettez (nom, coordonnées, message) servent uniquement à vous répondre et à organiser un rendez-vous.</p><p>Merci de ne pas transmettre d’informations médicales par e-mail : nous les aborderons en séance, dans un cadre confidentiel.</p>'
    }
  ];
  if (cab.rdv) rubriques.push({
    id: 'rendez-vous',
    titre: 'Prise de rendez-vous',
    html: `<p>La prise de rendez-vous en ligne s’effectue sur ${e(cab.rdv.plateforme)}, un service distinct qui dispose de sa propre politique de confidentialité. Le site ne transmet aucune information à ${e(cab.rdv.plateforme)} : vous y accédez par un simple lien.</p>`
  });
  rubriques.push(
    {
      id: 'hebergement',
      titre: 'Hébergement et données techniques',
      html: '<p>Le site est hébergé par Cloudflare, Inc. (États-Unis). Pour afficher les pages et protéger le site contre les attaques, l’hébergeur traite des données techniques de connexion, comme l’adresse IP et la page demandée. Ces données peuvent être traitées hors de l’Union européenne, dans le cadre des garanties prévues par le RGPD. Elles ne sont ni consultées ni exploitées par le cabinet.</p>'
    },
    {
      id: 'services',
      titre: 'Services extérieurs',
      html: '<p>À l’ouverture d’une page, votre navigateur ne contacte aucun autre site : les polices de caractères, les images et le plan d’accès sont hébergés sur ce site.</p>'
        + (cab.a('carte') ? '<p>Sur la page Contact, la carte interactive est fournie par OpenStreetMap. Elle ne se charge que si vous cliquez sur « Afficher la carte interactive » ; votre adresse IP est alors transmise à OpenStreetMap.</p>' : '')
        + tiers.map((o) => `<p>${e(o.nom)} : ce service repose sur ${e(o.tiers)}. Les informations que vous y saisissez sont transmises à ce prestataire, uniquement pour ce service.</p>`).join('')
    },
    {
      id: 'cookies',
      titre: 'Cookies et stockage',
      html: '<p>Ce site ne dépose aucun cookie et n’enregistre rien sur votre appareil. Aucun bandeau de consentement n’est donc nécessaire.</p>'
    },
    {
      id: 'conservation',
      titre: 'Durée de conservation',
      html: '<p>Les échanges de prise de contact sont conservés le temps nécessaire pour y répondre, puis supprimés s’ils ne donnent pas lieu à un suivi. Le dossier des personnes suivies est conservé de manière sécurisée, conformément aux obligations professionnelles.</p>'
    },
    {
      id: 'droits',
      titre: 'Vos droits',
      html: `<p>Conformément au Règlement général sur la protection des données (RGPD), vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition sur vos données. Pour l’exercer, écrivez à ${mail(cab.contact.email)}.</p><p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (${lienExterne('https://www.cnil.fr/', 'cnil.fr')}).</p>`
    }
  );
  if (cab.estPsychologue) rubriques.push({
    id: 'secret',
    titre: 'Secret professionnel',
    html: '<p>Tout ce qui est confié en séance est couvert par le secret professionnel, conformément au Code de déontologie des psychologues.</p>'
  });
  return rubriques;
}

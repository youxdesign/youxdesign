/* ==========================================================================
   youXdesign · Configurateur
   Données : étapes, styles, palettes, polices, fonctionnalités.
   Pour ajouter une palette ou un motif, il suffit de compléter ces listes.
   ========================================================================== */
window.YX = window.YX || {};

YX.EMAIL = 'youxdesign@gmail.com';
YX.STUDIO = 'youXdesign';

/* [nom court, titre, introduction, section de l'aperçu à montrer] */
YX.STEPS = [
  ['Bienvenue', 'Configurons ensemble votre site', "En une dizaine de minutes, vous indiquez vos informations et vos goûts. L'aperçu se construit à chaque réponse.", 'top'],
  ['Identité', 'Qui êtes-vous ?', 'Ces informations apparaissent en haut de votre site et dans le pied de page.', 'hero'],
  ['Cabinet', 'Votre cabinet', 'Adresse, accès et horaires, pour que vos patients vous trouvent facilement.', 'infos'],
  ['Tarifs', 'Tarifs et prise de rendez-vous', 'Indiquez vos séances et la façon dont vos patients réservent.', 'infos'],
  ['Style', 'Choisissez un point de départ', "Ces styles servent à visualiser votre site. La direction artistique peut aller beaucoup plus loin : mélange de styles, univers illustré, identité entièrement sur mesure.", 'top'],
  ['Couleurs', 'Palette de couleurs', 'Des palettes pensées pour le style choisi, ou vos propres couleurs.', 'top'],
  ['Typographie', 'Typographie des titres', 'La police donne le ton du site. Chaque option est adaptée au style choisi.', 'top'],
  ['Photos', 'Photos et logo', "Déposez vos images pour les voir dans l'aperçu, ou dites-nous ce dont vous disposez.", 'hero'],
  ['Pages', 'Pages du site', 'Les pages qui apparaîtront dans le menu.', 'top'],
  ['Fonctions', 'Fonctionnalités', "Activez les blocs qui vous intéressent : ils s'ajoutent à l'aperçu.", 'motifs'],
  ['Ton', 'Ton des textes', "La façon de vous adresser à vos patients. Les textes de l'aperçu s'adaptent.", 'hero'],
  ['Envoi', 'Récapitulatif', 'Vérifiez vos réponses, puis envoyez-les en un clic.', 'top']
];

YX.STYLES = [
  { id: 'suisse', name: 'Minimalisme suisse', desc: 'Grille stricte, grande typographie, un accent vif.' },
  { id: 'terre', name: 'Terre & organique', desc: 'Formes arrondies, tons chauds, serif douce.' },
  { id: 'wabi', name: 'Wabi-sabi', desc: "Lin et encre, beaucoup d'air, une image forte." },
  { id: 'sante', name: 'Santé contemporaine', desc: 'Clair, rassurant, orienté rendez-vous.' },
  { id: 'immersif', name: 'Immersif', desc: 'Image plein écran animée, titre sur la photo.', dark: true },
  { id: 'editorial', name: 'Éditorial', desc: 'Esprit magazine : serif italique, filets, portrait légendé.' },
  { id: 'pastel', name: 'Pastel doux', desc: 'Couleurs tendres, formes rondes, très accueillant.' },
  { id: 'nocturne', name: 'Nocturne', desc: 'Fond sombre et feutré, halo lumineux qui respire.' }
];

/* [nom, fond, encre, accent, doux, texte secondaire] */
YX.PAL = {
  suisse: [['Blanc & orange', '#FFFFFF', '#111111', '#FF5A1F', '#F2F2F2', '#555555'], ['Blanc & bleu', '#FFFFFF', '#111111', '#2346FF', '#EEF0F7', '#555555'], ['Blanc & rouge', '#FFFFFF', '#111111', '#E0312B', '#F4F0EF', '#555555'], ['Craie & vert', '#F6F6F1', '#141414', '#1D8A4E', '#E8E8DF', '#555555']],
  terre: [['Terracotta', '#F4EBDD', '#3B2417', '#A94C25', '#E6C58A', '#5A3F2E'], ['Olive', '#F1EEE2', '#2B2B1A', '#6B7A36', '#D8CF9E', '#4E4D36'], ['Argile rose', '#F6EAE4', '#3A1F1D', '#B0513F', '#EBC3AA', '#5C3A35'], ['Ocre', '#F5EEDF', '#33261A', '#A36C12', '#E3C79A', '#5A4631']],
  wabi: [['Lin & rouille', '#ECE6DA', '#22201C', '#9A4A2C', '#DDD5C6', '#4F4A42'], ['Encre & indigo', '#E9E7E1', '#1C1E24', '#2E4A6E', '#D9D6CE', '#4A4B50'], ['Mousse', '#E8E7DC', '#20231C', '#56663F', '#D8D7C8', '#4B4E43'], ['Cendre', '#E4E1DC', '#1F1E1C', '#6B5F55', '#D3CFC8', '#4E4A45']],
  sante: [['Bleu glacier', '#FFFFFF', '#0F2B46', '#1D5FA8', '#EEF5FB', '#4F6275'], ['Sarcelle', '#FFFFFF', '#0E2F33', '#0E7479', '#EAF5F5', '#4B6466'], ['Violet doux', '#FFFFFF', '#221A40', '#5741B0', '#F2EFFB', '#5A5575'], ['Vert santé', '#FFFFFF', '#12301F', '#1F7446', '#EDF6F0', '#4C6356']],
  immersif: [['Nuit & laiton', '#F5F2EC', '#161A1D', '#B8894A', '#E6DED0', '#555A5E'], ['Ardoise & sauge', '#F2F3EF', '#1B2422', '#6F8F7A', '#DDE3DA', '#4E5955'], ['Brume & bleu', '#F1F3F6', '#131C28', '#3F6EA8', '#DCE3EC', '#4F5A68'], ['Sable & corail', '#F7F1EA', '#221A16', '#D0674A', '#EED9C9', '#5E514A']],
  editorial: [['Papier & encre', '#F6F1E7', '#1A1714', '#B23A26', '#E9DFCB', '#5B544A'], ['Crème & vert', '#F4F0E4', '#16211B', '#2F6B4A', '#E2DCC8', '#4E5850'], ['Ivoire & bleu', '#F7F4EC', '#141A2A', '#27408B', '#E5E0D1', '#50566A'], ['Rose & bordeaux', '#F8EEEA', '#2A1419', '#8C2440', '#EFD9D3', '#634B50']],
  pastel: [['Pêche', '#FFF6F0', '#3A2A2A', '#E07A5F', '#FFE0D1', '#6B5656'], ['Lavande', '#F7F4FF', '#2A2545', '#7B61D9', '#E4DCFF', '#5D5878'], ['Menthe', '#F2FBF7', '#1F3A31', '#2E9C78', '#CFF0E2', '#4F6A61'], ['Ciel', '#F3F8FF', '#1D2F48', '#3C7FD9', '#D6E7FF', '#51627A']],
  nocturne: [['Minuit & or', '#12141C', '#ECE6DA', '#C9A66B', '#1C2030', '#A7A3AE'], ['Forêt nocturne', '#0F1714', '#E4EAE3', '#8FBF9F', '#18241F', '#9DAAA2'], ['Prune', '#17121A', '#EFE6EE', '#D291B8', '#231B27', '#AFA3AE'], ['Océan', '#0D1520', '#E3EAF2', '#7FB3D5', '#152131', '#9CA9B8']]
};

YX.EXTRA = [['Sauge & crème', '#F4F1E8', '#243028', '#7C9A7E', '#DFE6D6', '#56625A'], ['Bleu nuit & sable', '#F5EFE4', '#14213D', '#E0A458', '#E8DCC4', '#4F5670'], ['Rose poudré', '#FBF1EF', '#3B2327', '#C46A7A', '#F2D6D6', '#6A5054'], ['Lavande & prune', '#F6F3FA', '#2E1F3A', '#8E5BA8', '#E4D9EE', '#5E5168'], ['Océan clair', '#F1F7F8', '#0F2E3A', '#1F7A8C', '#D4EAEE', '#4A6470'], ['Moutarde', '#FAF5E8', '#2C2716', '#C9971C', '#F0E2B8', '#5E5640'], ['Corail & menthe', '#F6FBF9', '#1E2E2A', '#E4694F', '#CDEDE2', '#4E625C'], ['Brique & gris', '#F3F1EF', '#262322', '#B5452E', '#E2DDD8', '#5A5552'], ['Pistache', '#F5F8EE', '#223019', '#7FA33A', '#E0EBC8', '#56624A'], ['Bleu Klein', '#F4F4F1', '#101018', '#1F3FD1', '#E3E4EC', '#52525E'], ['Anthracite & cuivre', '#1B1C1E', '#ECE7E0', '#C8804F', '#26272A', '#A8A39C'], ['Nuit & lilas', '#141A2E', '#E8E6F2', '#A99BE8', '#1D2540', '#A5A6BA']];

/* [nom, pile titres, pile texte (null = identique), graisse des titres] */
YX.FONTS = {
  suisse: [['Schibsted Grotesk', "'Schibsted Grotesk',sans-serif", null, 600], ['Instrument Sans', "'Instrument Sans',sans-serif", null, 600], ['Bricolage Grotesque', "'Bricolage Grotesque',sans-serif", null, 600]],
  terre: [['Young Serif', "'Young Serif',serif", "'Figtree',sans-serif", 400], ['Gloock', "'Gloock',serif", "'Figtree',sans-serif", 400], ['DM Serif Display', "'DM Serif Display',serif", "'Figtree',sans-serif", 400]],
  wabi: [['Shippori Mincho', "'Shippori Mincho',serif", "'Zen Kaku Gothic New',sans-serif", 400], ['Cormorant Garamond', "'Cormorant Garamond',serif", "'Zen Kaku Gothic New',sans-serif", 500], ['Zen Old Mincho', "'Zen Old Mincho',serif", "'Zen Kaku Gothic New',sans-serif", 400]],
  sante: [['Onest', "'Onest',sans-serif", null, 600], ['Plus Jakarta Sans', "'Plus Jakarta Sans',sans-serif", null, 600], ['Manrope', "'Manrope',sans-serif", null, 600]],
  immersif: [['Bodoni Moda', "'Bodoni Moda',serif", "'Jost',sans-serif", 400], ['Marcellus', "'Marcellus',serif", "'Jost',sans-serif", 400], ['Italiana', "'Italiana',serif", "'Jost',sans-serif", 400]],
  editorial: [['Instrument Serif', "'Instrument Serif',serif", "'Hanken Grotesk',sans-serif", 400], ['Newsreader', "'Newsreader',serif", "'Hanken Grotesk',sans-serif", 400], ['Libre Caslon', "'Libre Caslon Text',serif", "'Hanken Grotesk',sans-serif", 400]],
  pastel: [['Nunito', "'Nunito',sans-serif", null, 800], ['Quicksand', "'Quicksand',sans-serif", "'Nunito',sans-serif", 700], ['Varela Round', "'Varela Round',sans-serif", "'Nunito',sans-serif", 400]],
  nocturne: [['Spectral', "'Spectral',serif", "'Karla',sans-serif", 300], ['Tenor Sans', "'Tenor Sans',sans-serif", "'Karla',sans-serif", 400], ['Libre Bodoni', "'Libre Bodoni',serif", "'Karla',sans-serif", 400]]
};

/* Familles Google Fonts à charger pour chaque style (chargées à la demande) */
YX.GF = {
  suisse: ['Schibsted+Grotesk:wght@400;500;600;700', 'Instrument+Sans:wght@400;500;600;700', 'Bricolage+Grotesque:wght@400;500;600;700'],
  terre: ['Young+Serif', 'Gloock', 'DM+Serif+Display', 'Figtree:wght@400;500;600;700'],
  wabi: ['Shippori+Mincho:wght@400;500', 'Cormorant+Garamond:wght@400;500;600', 'Zen+Old+Mincho:wght@400;500', 'Zen+Kaku+Gothic+New:wght@400;500'],
  sante: ['Onest:wght@400;500;600;700', 'Plus+Jakarta+Sans:wght@400;500;600;700', 'Manrope:wght@400;500;600;700'],
  immersif: ['Bodoni+Moda:wght@400;500', 'Marcellus', 'Italiana', 'Jost:wght@400;500;600'],
  editorial: ['Instrument+Serif:ital@0;1', 'Newsreader:ital,wght@0,400;1,400', 'Libre+Caslon+Text:ital,wght@0,400;1,400', 'Hanken+Grotesk:wght@400;500;600'],
  pastel: ['Nunito:wght@400;600;700;800', 'Varela+Round', 'Quicksand:wght@500;600;700'],
  nocturne: ['Spectral:wght@300;400', 'Tenor+Sans', 'Libre+Bodoni:wght@400;500', 'Karla:wght@400;500;600']
};

YX.QUEST = [
  ['GAD-7', 'Anxiété', '7 questions · 2 min', function (v) { return 'Ces deux dernières semaines, à quelle fréquence ' + (v ? 'vous êtes-vous senti(e)' : "t'es-tu senti(e)") + ' nerveux(se), anxieux(se) ou tendu(e) ?'; }, ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours']],
  ['PHQ-9', 'Humeur', '9 questions · 3 min', function (v) { return 'Ces deux dernières semaines, à quelle fréquence ' + (v ? 'avez-vous' : 'as-tu') + " eu peu d'intérêt ou de plaisir à faire les choses ?"; }, ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours']],
  ['PSS-10', 'Stress perçu', '10 questions · 3 min', function (v) { return 'Le mois dernier, ' + (v ? 'avez-vous' : 'as-tu') + ' eu le sentiment de ne pas pouvoir faire face à tout ?'; }, ['Jamais', 'Presque jamais', 'Parfois', 'Souvent']],
  ['ISI', 'Sommeil', '7 questions · 2 min', function (v) { return 'Quelle est la sévérité de ' + (v ? 'vos difficultés à vous endormir ?' : 'tes difficultés à t’endormir ?'); }, ['Aucune', 'Légère', 'Moyenne', 'Sévère']],
  ['Pré-consultation', 'Fiche de premier rendez-vous', 'Motif, attentes, disponibilités', function (v) { return "Qu'est-ce qui " + (v ? 'vous amène' : "t'amène") + ' à consulter ?'; }, ['Anxiété ou stress', 'Humeur', 'Relations', 'Autre chose']],
  ['Suivi', 'Point entre les séances', '5 questions · 1 min', function (v) { return 'Comment ' + (v ? 'vous sentez-vous' : 'te sens-tu') + ' depuis la dernière séance ?'; }, ['Mieux', 'Pareil', 'Moins bien', 'Je ne sais pas']]
];

YX.FOND = {
  zoom: ['Zoom lent', "L'image s'approche très lentement, comme une respiration."],
  diaporama: ['Diaporama', "Deux ou trois images se succèdent en fondu. Déposez-les à l'étape Photos."],
  parallaxe: ['Parallaxe', "L'image défile plus lentement que le texte : faites défiler l'aperçu pour le voir."],
  degrade: ['Dégradé animé', 'Les couleurs de la palette ondulent doucement. Aucune photo nécessaire.'],
  video: ['Vidéo en boucle', "Une courte vidéo muette (10 à 20 s) tourne en fond. L'aperçu montre une image : joignez la vidéo à l'e-mail."]
};

YX.MOTIFS = {
  'Anxiété': "Inquiétudes envahissantes, crises d'angoisse.", 'Stress et burn-out': 'Épuisement, surcharge mentale.',
  'Dépression': "Tristesse qui dure, perte d'envie.", 'Sommeil': 'Endormissement difficile, ruminations.',
  'Phobies': 'Transports, foule, prise de parole…', 'TOC': 'Pensées obsédantes, rituels.',
  'Estime de soi': 'Doute, autocritique, peur du jugement.', 'Relations': 'Couple, famille, travail.',
  'Deuil': "Traverser la perte d'un proche.", 'Troubles alimentaires': 'Rapport difficile à la nourriture.',
  'Addictions': 'Alcool, tabac, écrans, jeux.', 'Parentalité': 'Les étapes de la vie de parent.'
};

YX.PAGES = ['Accueil', 'À propos', 'Approche', 'Consultations & tarifs', 'FAQ', 'Contact', 'Blog / ressources', 'Mentions légales'];

/* [clé, nom, description, groupe] */
YX.FEATS = [
  ['creneaux', 'Module de créneaux', 'Un aperçu des prochains créneaux qui renvoie vers la réservation.', 'Rendez-vous et contact'],
  ['rappel', 'Formulaire de rappel', 'Le visiteur laisse son prénom et son numéro, vous le rappelez.', 'Rendez-vous et contact'],
  ['paiement', 'Paiement en ligne', 'Règlement ou acompte à la réservation, facture envoyée automatiquement.', 'Rendez-vous et contact'],
  ['statut', "Statut d'ouverture en direct", 'Indique si le cabinet est ouvert en ce moment.', 'Rendez-vous et contact'],
  ['questionnaires', 'Questionnaires en ligne', 'Auto-évaluations et fiche de pré-consultation, remplies avant ou entre les séances.', 'Contenus et outils'],
  ['FAQ', 'Questions fréquentes', 'Remboursement, durée, confidentialité : les réponses aux questions habituelles.', 'Contenus et outils'],
  ['respiration', 'Exercice de respiration guidé', "Un cercle animé d'une minute que vos visiteurs peuvent suivre.", 'Contenus et outils'],
  ['ressources', 'Ressources à télécharger', 'Fiches, exercices et audios que vos patients retrouvent en ligne.', 'Contenus et outils'],
  ['ateliers', 'Ateliers et groupes', 'Agenda de séances collectives avec inscription.', 'Contenus et outils'],
  ['newsletter', "Lettre d'information", 'Les visiteurs s’inscrivent pour recevoir vos articles.', 'Contenus et outils'],
  ['carte', "Carte d'accès", 'Plan du quartier avec votre adresse.', 'Pratique et accessibilité'],
  ['accessibilite', 'Confort de lecture', 'Taille du texte et contraste réglables par le visiteur.', 'Pratique et accessibilité'],
  ['multilingue', 'Version anglaise', 'Le site traduit, avec un sélecteur de langue.', 'Pratique et accessibilité']
];

YX.DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/* Valeurs d'exemple utilisées tant qu'un champ est vide */
YX.EX = { prenom: 'Camille', nom: 'Martin', titre: 'Psychologue clinicienne', approche: 'TCC', adeli: '59 93 0000 0', telephone: '06 00 00 00 00', email: 'contact@exemple.fr', adresse: '12 rue Exemple', cp: '59000', ville: 'Lille', acces: 'Métro République, parking à 100 m' };

YX.def = function () {
  return {
    prenom: '', nom: '', titre: '', approche: '', adeli: '', telephone: '', email: '',
    publics: ['Adultes', 'Adolescents'], motifs: ['Anxiété', 'Stress et burn-out', 'Dépression', 'Sommeil', 'Phobies', 'Estime de soi', 'Relations', 'TOC'],
    adresse: '', cp: '', ville: '', acces: '', visio: true,
    jours: [['9h', '20h'], ['9h', '20h'], ['9h', '20h'], ['9h', '20h'], ['9h', '20h'], ['9h', '13h'], null].map(function (x) { return x ? { on: true, open: x[0], close: x[1] } : { on: false, open: '9h', close: '18h' }; }),
    pmr: false,
    tarifs: [{ type: 'Séance individuelle', duree: '50 min', prix: '60 €' }, { type: 'Séance en visio', duree: '50 min', prix: '60 €' }, { type: 'Premier entretien', duree: '60 min', prix: '70 €' }],
    rdvMode: 'Doctolib', rdvLien: '', style: 'suisse', pal: 0, custom: '', font: 0, photoStatus: '',
    pages: ['Accueil', 'À propos', 'Approche', 'Consultations & tarifs', 'Contact', 'Mentions légales'],
    feats: ['FAQ', 'carte'], fondMode: 'zoom', voile: 'moyen', customBg: '', quests: ['GAD-7', 'PHQ-9', 'Pré-consultation'], questRes: 'Envoyés au psychologue', questPerso: '',
    surMesure: false, moods: [], pistes: [], envies: '', eviter: '', ton: 'vous', registre: 'chaleureux', motsCles: '', remarques: ''
  };
};

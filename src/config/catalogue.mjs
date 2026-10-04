/* ==========================================================================
   Catalogue youXdesign
   --------------------------------------------------------------------------
   Les styles proposés, leurs palettes et leurs polices, et les options que
   le configurateur propose. Ce fichier alimente à la fois les sites et le
   configurateur : une palette ajoutée ici apparaît partout.

   Palette = { nom, fond, encre, accent, doux, texte2, accent2? }
     fond    couleur de fond des pages
     encre   couleur du texte principal
     accent  couleur des boutons et des liens
     doux    surfaces teintées (encarts, cartes, formes décoratives)
     texte2  texte secondaire
     accent2 seconde couleur, utilisée avec parcimonie (facultative)
   Réglages fins facultatifs (sinon calculés) : fond2, surface, doux2, clair,
   profond, surProfond, accent2Doux.
   Les contrastes sont vérifiés et corrigés automatiquement (src/lib/couleurs.mjs).

   autonome : le style a sa propre feuille de style complète et ses propres
   gabarits de pages (src/themes/<style>/pages/), sans la base commune.
   ========================================================================== */

export const STYLES = [
  {
    id: 'sauge',
    nom: 'Sauge',
    autonome: true,
    resume: 'Doux et lumineux : arches, serif élégante, beaucoup d’air.',
    detail: 'Le style de la démo Claire Morel. Des formes en arche, une typographie à empattements très lisible et des teintes apaisantes.',
    palettes: [
      { nom: 'Sauge & crème', fond: '#F6F3EE', encre: '#1D2925', accent: '#2E4A3F', doux: '#EAF0EA', texte2: '#4F5B56', accent2: '#B86E4E', fond2: '#EEE9E1', surface: '#FFFDFA', doux2: '#DCE6DD', clair: '#9FB5A4', profond: '#18291F', surProfond: '#F3EFE8', accent2Doux: '#F2E1D6',
        variables: { '--arche-1': '#E9DCCB', '--arche-2': '#E3CDB7', '--arche-3': '#C9A58B', '--arche-4': '#9C735C', '--soleil-1': '#FFF5E6', '--soleil-2': '#F7DCC0', '--soleil-3': '#EBC3A0', '--colline-1a': '#B9C9BC', '--colline-1b': '#9FB5A4', '--colline-2a': '#7F9C89', '--colline-2b': '#5F7E6B', '--colline-3a': '#3F5F50', '--colline-3b': '#2E4A3F', '--portrait-2': '#C8D6CB', '--portrait-3': '#A9BEAF', '--souffle-1': '#CFE0D3', '--souffle-3': '#5E8170' } },
      { nom: 'Eucalyptus', fond: '#F4F5F1', encre: '#1B2828', accent: '#335C5D', doux: '#E1EBE8', texte2: '#4C5C5B', accent2: '#B07A52' },
      { nom: 'Argile', fond: '#F8F3EE', encre: '#2B211C', accent: '#8A4B31', doux: '#F1E3D8', texte2: '#5E4F47', accent2: '#4E6A56' },
      { nom: 'Lavande', fond: '#F6F4F8', encre: '#241F33', accent: '#544586', doux: '#EAE6F3', texte2: '#575168', accent2: '#B9785B' }
    ],
    polices: [
      { nom: 'Fraunces', titres: 'fraunces', texte: 'instrument-sans', poids: 400 },
      { nom: 'Cormorant Garamond', titres: 'cormorant-garamond', texte: 'instrument-sans', poids: 500 },
      { nom: 'Instrument Serif', titres: 'instrument-serif', texte: 'instrument-sans', poids: 400 },
      { nom: 'Playfair Display', titres: 'playfair-display', texte: 'instrument-sans', poids: 400 },
      { nom: 'Lora', titres: 'lora', texte: 'instrument-sans', poids: 400 },
      { nom: 'EB Garamond', titres: 'eb-garamond', texte: 'instrument-sans', poids: 400 }
    ]
  },
  {
    id: 'terre',
    nom: 'Terre & organique',
    resume: 'Formes arrondies, tons chauds, serif généreuse.',
    detail: 'Un univers chaleureux et enveloppant : formes organiques, vagues, couleurs de terre cuite et de sable.',
    palettes: [
      { nom: 'Terracotta', fond: '#F4EBDD', encre: '#3B2417', accent: '#A94C25', doux: '#EBD5B3', texte2: '#5A3F2E', accent2: '#6B7A36' },
      { nom: 'Olive', fond: '#F1EEE2', encre: '#2B2B1A', accent: '#5E6B2F', doux: '#DFD8B0', texte2: '#4E4D36', accent2: '#A94C25' },
      { nom: 'Argile rose', fond: '#F6EAE4', encre: '#3A1F1D', accent: '#A8483A', doux: '#EECDB9', texte2: '#5C3A35', accent2: '#7A6A3A' },
      { nom: 'Ocre', fond: '#F5EEDF', encre: '#33261A', accent: '#94600F', doux: '#E9D3AC', texte2: '#5A4631', accent2: '#5E6B2F' }
    ],
    polices: [
      { nom: 'Young Serif', titres: 'young-serif', texte: 'figtree', poids: 400 },
      { nom: 'Gloock', titres: 'gloock', texte: 'figtree', poids: 400 },
      { nom: 'DM Serif Display', titres: 'dm-serif-display', texte: 'figtree', poids: 400 },
      { nom: 'Corben', titres: 'corben', texte: 'figtree', poids: 400 },
      { nom: 'Yeseva One', titres: 'yeseva-one', texte: 'figtree', poids: 400 },
      { nom: 'Rufina', titres: 'rufina', texte: 'figtree', poids: 400 }
    ]
  },
  {
    id: 'sante',
    nom: 'Santé contemporaine',
    resume: 'Clair, rassurant, orienté rendez-vous.',
    detail: 'Une présentation nette et structurée, qui met en avant l’essentiel : tarifs, accès et prise de rendez-vous.',
    palettes: [
      { nom: 'Bleu glacier', fond: '#FFFFFF', encre: '#0F2B46', accent: '#1D5FA8', doux: '#EEF5FB', texte2: '#4F6275' },
      { nom: 'Sarcelle', fond: '#FFFFFF', encre: '#0E2F33', accent: '#0E6E73', doux: '#EAF5F5', texte2: '#4B6466' },
      { nom: 'Violet doux', fond: '#FFFFFF', encre: '#221A40', accent: '#5741B0', doux: '#F2EFFB', texte2: '#5A5575' },
      { nom: 'Vert santé', fond: '#FFFFFF', encre: '#12301F', accent: '#1F7446', doux: '#EDF6F0', texte2: '#4C6356' }
    ],
    polices: [
      { nom: 'Onest', titres: 'onest', texte: 'onest', poids: 600 },
      { nom: 'Plus Jakarta Sans', titres: 'plus-jakarta-sans', texte: 'plus-jakarta-sans', poids: 600 },
      { nom: 'Manrope', titres: 'manrope', texte: 'manrope', poids: 600 },
      { nom: 'DM Sans', titres: 'dm-sans', texte: 'dm-sans', poids: 600 },
      { nom: 'Outfit', titres: 'outfit', texte: 'outfit', poids: 600 },
      { nom: 'Public Sans', titres: 'public-sans', texte: 'public-sans', poids: 600 }
    ]
  },
  {
    id: 'wabi',
    nom: 'Wabi-sabi',
    resume: 'Lin et encre, beaucoup d’air, une grande sérénité.',
    detail: 'Inspiré de l’esthétique japonaise de l’imperfection : asymétrie, matières naturelles, typographie fine et silence visuel.',
    palettes: [
      { nom: 'Lin & rouille', fond: '#ECE6DA', encre: '#22201C', accent: '#8E4226', doux: '#E0D8C9', texte2: '#4F4A42' },
      { nom: 'Encre & indigo', fond: '#E9E7E1', encre: '#1C1E24', accent: '#2E4A6E', doux: '#DCD9D1', texte2: '#4A4B50' },
      { nom: 'Mousse', fond: '#E8E7DC', encre: '#20231C', accent: '#4E5D38', doux: '#DBDACB', texte2: '#4B4E43' },
      { nom: 'Cendre', fond: '#E4E1DC', encre: '#1F1E1C', accent: '#62574E', doux: '#D7D3CC', texte2: '#4E4A45' }
    ],
    polices: [
      { nom: 'Shippori Mincho', titres: 'shippori-mincho', texte: 'zen-kaku-gothic-new', poids: 400 },
      { nom: 'Cormorant Garamond', titres: 'cormorant-garamond', texte: 'zen-kaku-gothic-new', poids: 500 },
      { nom: 'Zen Old Mincho', titres: 'zen-old-mincho', texte: 'zen-kaku-gothic-new', poids: 400 },
      { nom: 'Kaisei Tokumin', titres: 'kaisei-tokumin', texte: 'zen-kaku-gothic-new', poids: 400 },
      { nom: 'Zen Antique', titres: 'zen-antique', texte: 'zen-kaku-gothic-new', poids: 400 },
      { nom: 'Hina Mincho', titres: 'hina-mincho', texte: 'zen-kaku-gothic-new', poids: 400 }
    ]
  },
  {
    id: 'suisse',
    nom: 'Minimalisme suisse',
    resume: 'Grille stricte, grande typographie, un accent vif.',
    detail: 'Rigueur graphique : une grille nette, des titres imposants, des filets fins et une seule couleur forte.',
    palettes: [
      { nom: 'Blanc & orange', fond: '#FFFFFF', encre: '#111111', accent: '#FF5A1F', doux: '#F2F2F2', texte2: '#555555' },
      { nom: 'Blanc & bleu', fond: '#FFFFFF', encre: '#111111', accent: '#2346FF', doux: '#EEF0F7', texte2: '#555555' },
      { nom: 'Blanc & rouge', fond: '#FFFFFF', encre: '#111111', accent: '#E0312B', doux: '#F4F0EF', texte2: '#555555' },
      { nom: 'Craie & vert', fond: '#F6F6F1', encre: '#141414', accent: '#1D8A4E', doux: '#E8E8DF', texte2: '#555555' }
    ],
    polices: [
      { nom: 'Schibsted Grotesk', titres: 'schibsted-grotesk', texte: 'schibsted-grotesk', poids: 600 },
      { nom: 'Instrument Sans', titres: 'instrument-sans', texte: 'instrument-sans', poids: 600 },
      { nom: 'Bricolage Grotesque', titres: 'bricolage-grotesque', texte: 'bricolage-grotesque', poids: 600 },
      { nom: 'Inter Tight', titres: 'inter-tight', texte: 'inter-tight', poids: 600 },
      { nom: 'Space Grotesk', titres: 'space-grotesk', texte: 'space-grotesk', poids: 600 },
      { nom: 'Archivo', titres: 'archivo', texte: 'archivo', poids: 600 }
    ]
  },
  {
    id: 'immersif',
    nom: 'Immersif',
    resume: 'Image plein écran animée, titre sur la photo.',
    detail: 'Une grande image d’ambiance en fond, animée avec lenteur, et un titre posé dessus : une entrée en matière sensorielle.',
    palettes: [
      { nom: 'Nuit & laiton', fond: '#F5F2EC', encre: '#161A1D', accent: '#B8894A', doux: '#E6DED0', texte2: '#555A5E' },
      { nom: 'Ardoise & sauge', fond: '#F2F3EF', encre: '#1B2422', accent: '#6F8F7A', doux: '#DDE3DA', texte2: '#4E5955' },
      { nom: 'Brume & bleu', fond: '#F1F3F6', encre: '#131C28', accent: '#3F6EA8', doux: '#DCE3EC', texte2: '#4F5A68' },
      { nom: 'Sable & corail', fond: '#F7F1EA', encre: '#221A16', accent: '#D0674A', doux: '#EED9C9', texte2: '#5E514A' }
    ],
    polices: [
      { nom: 'Bodoni Moda', titres: 'bodoni-moda', texte: 'jost', poids: 400 },
      { nom: 'Marcellus', titres: 'marcellus', texte: 'jost', poids: 400 },
      { nom: 'Italiana', titres: 'italiana', texte: 'jost', poids: 400 },
      { nom: 'Playfair Display', titres: 'playfair-display', texte: 'jost', poids: 400 },
      { nom: 'Cormorant Garamond', titres: 'cormorant-garamond', texte: 'jost', poids: 500 },
      { nom: 'Gilda Display', titres: 'gilda-display', texte: 'jost', poids: 400 }
    ]
  },
  {
    id: 'editorial',
    nom: 'Éditorial',
    resume: 'Esprit magazine : serif italique, filets, portrait légendé.',
    detail: 'La mise en page d’un beau magazine : nom en manchette, colonnes, filets fins et grands titres en italique.',
    palettes: [
      { nom: 'Papier & encre', fond: '#F6F1E7', encre: '#1A1714', accent: '#B23A26', doux: '#E9DFCB', texte2: '#5B544A' },
      { nom: 'Crème & vert', fond: '#F4F0E4', encre: '#16211B', accent: '#2F6B4A', doux: '#E2DCC8', texte2: '#4E5850' },
      { nom: 'Ivoire & bleu', fond: '#F7F4EC', encre: '#141A2A', accent: '#27408B', doux: '#E5E0D1', texte2: '#50566A' },
      { nom: 'Rose & bordeaux', fond: '#F8EEEA', encre: '#2A1419', accent: '#8C2440', doux: '#EFD9D3', texte2: '#634B50' }
    ],
    polices: [
      { nom: 'Instrument Serif', titres: 'instrument-serif', texte: 'hanken-grotesk', poids: 400 },
      { nom: 'Newsreader', titres: 'newsreader', texte: 'hanken-grotesk', poids: 400 },
      { nom: 'Libre Caslon', titres: 'libre-caslon-text', texte: 'hanken-grotesk', poids: 400 },
      { nom: 'DM Serif Display', titres: 'dm-serif-display', texte: 'hanken-grotesk', poids: 400 },
      { nom: 'Lora', titres: 'lora', texte: 'hanken-grotesk', poids: 400 },
      { nom: 'EB Garamond', titres: 'eb-garamond', texte: 'hanken-grotesk', poids: 400 }
    ]
  },
  {
    id: 'pastel',
    nom: 'Pastel doux',
    resume: 'Couleurs tendres, formes rondes, très accueillant.',
    detail: 'Des tons tendres, des formes arrondies et une typographie ronde : un site qui met à l’aise dès le premier regard.',
    palettes: [
      { nom: 'Pêche', fond: '#FFF6F0', encre: '#3A2A2A', accent: '#E07A5F', doux: '#FFE0D1', texte2: '#6B5656' },
      { nom: 'Lavande', fond: '#F7F4FF', encre: '#2A2545', accent: '#7B61D9', doux: '#E4DCFF', texte2: '#5D5878' },
      { nom: 'Menthe', fond: '#F2FBF7', encre: '#1F3A31', accent: '#2E9C78', doux: '#CFF0E2', texte2: '#4F6A61' },
      { nom: 'Ciel', fond: '#F3F8FF', encre: '#1D2F48', accent: '#3C7FD9', doux: '#D6E7FF', texte2: '#51627A' }
    ],
    polices: [
      { nom: 'Nunito', titres: 'nunito', texte: 'nunito', poids: 800 },
      { nom: 'Quicksand', titres: 'quicksand', texte: 'nunito', poids: 700 },
      { nom: 'Varela Round', titres: 'varela-round', texte: 'nunito', poids: 400 },
      { nom: 'Fredoka', titres: 'fredoka', texte: 'nunito', poids: 600 },
      { nom: 'Comfortaa', titres: 'comfortaa', texte: 'nunito', poids: 700 },
      { nom: 'Outfit', titres: 'outfit', texte: 'nunito', poids: 600 }
    ]
  },
  {
    id: 'nocturne',
    nom: 'Nocturne',
    resume: 'Fond sombre et feutré, halo lumineux qui respire.',
    detail: 'Une ambiance du soir, calme et enveloppante : fond sombre, lumière dorée qui respire doucement, typographie fine.',
    palettes: [
      { nom: 'Minuit & or', fond: '#12141C', encre: '#ECE6DA', accent: '#C9A66B', doux: '#1C2030', texte2: '#A7A3AE' },
      { nom: 'Forêt nocturne', fond: '#0F1714', encre: '#E4EAE3', accent: '#8FBF9F', doux: '#18241F', texte2: '#9DAAA2' },
      { nom: 'Prune', fond: '#17121A', encre: '#EFE6EE', accent: '#D291B8', doux: '#231B27', texte2: '#AFA3AE' },
      { nom: 'Océan', fond: '#0D1520', encre: '#E3EAF2', accent: '#7FB3D5', doux: '#152131', texte2: '#9CA9B8' }
    ],
    polices: [
      { nom: 'Spectral', titres: 'spectral', texte: 'karla', poids: 300 },
      { nom: 'Tenor Sans', titres: 'tenor-sans', texte: 'karla', poids: 400 },
      { nom: 'Libre Bodoni', titres: 'libre-bodoni', texte: 'karla', poids: 400 },
      { nom: 'Cormorant Garamond', titres: 'cormorant-garamond', texte: 'karla', poids: 500 },
      { nom: 'Marcellus', titres: 'marcellus', texte: 'karla', poids: 400 },
      { nom: 'Fraunces', titres: 'fraunces', texte: 'karla', poids: 400 }
    ]
  }
];

/* Style Immersif : animation du fond de l'accueil et voile sur l'image */
export const FONDS = [
  { id: 'zoom', nom: 'Zoom lent', description: 'L’image s’approche très lentement, comme une respiration.' },
  { id: 'diaporama', nom: 'Diaporama', description: 'Deux ou trois images se succèdent en fondu.' },
  { id: 'parallaxe', nom: 'Parallaxe', description: 'L’image défile plus lentement que le texte.' },
  { id: 'degrade', nom: 'Dégradé animé', description: 'Les couleurs de la palette ondulent doucement. Aucune photo nécessaire.' },
  { id: 'video', nom: 'Vidéo en boucle', description: 'Une courte vidéo muette (10 à 20 s) tourne en fond. L’aperçu montre une image : joignez la vidéo à l’e-mail.' }
];
export const VOILES = [
  { id: 'leger', nom: 'Léger' },
  { id: 'moyen', nom: 'Moyen' },
  { id: 'fort', nom: 'Fort' }
];

/* Palettes libres, utilisables avec n'importe quel style */
export const PALETTES_LIBRES = [
  { nom: 'Sauge & crème', fond: '#F4F1E8', encre: '#243028', accent: '#56755A', doux: '#DFE6D6', texte2: '#56625A' },
  { nom: 'Bleu nuit & sable', fond: '#F5EFE4', encre: '#14213D', accent: '#9A5B12', doux: '#E8DCC4', texte2: '#4F5670' },
  { nom: 'Rose poudré', fond: '#FBF1EF', encre: '#3B2327', accent: '#A84A5C', doux: '#F2D6D6', texte2: '#6A5054' },
  { nom: 'Lavande & prune', fond: '#F6F3FA', encre: '#2E1F3A', accent: '#7A4594', doux: '#E4D9EE', texte2: '#5E5168' },
  { nom: 'Océan clair', fond: '#F1F7F8', encre: '#0F2E3A', accent: '#1A6A7A', doux: '#D4EAEE', texte2: '#4A6470' },
  { nom: 'Moutarde', fond: '#FAF5E8', encre: '#2C2716', accent: '#8A6510', doux: '#F0E2B8', texte2: '#5E5640' },
  { nom: 'Corail & menthe', fond: '#F6FBF9', encre: '#1E2E2A', accent: '#C0472F', doux: '#CDEDE2', texte2: '#4E625C' },
  { nom: 'Brique & gris', fond: '#F3F1EF', encre: '#262322', accent: '#A63F2A', doux: '#E2DDD8', texte2: '#5A5552' },
  { nom: 'Pistache', fond: '#F5F8EE', encre: '#223019', accent: '#5B7A25', doux: '#E0EBC8', texte2: '#56624A' },
  { nom: 'Bleu Klein', fond: '#F4F4F1', encre: '#101018', accent: '#1F3FD1', doux: '#E3E4EC', texte2: '#52525E' },
  { nom: 'Anthracite & cuivre', fond: '#1B1C1E', encre: '#ECE7E0', accent: '#D08A58', doux: '#26272A', texte2: '#B3AEA7' },
  { nom: 'Nuit & lilas', fond: '#141A2E', encre: '#E8E6F2', accent: '#A99BE8', doux: '#1D2540', texte2: '#AEB0C4' }
];

/* Options proposées dans le configurateur.
   tiers : l'option repose sur un service extérieur ; la politique de
   confidentialité du cabinet le mentionne automatiquement si elle est active. */
export const OPTIONS = [
  { id: 'creneaux', nom: 'Module de créneaux', groupe: 'Rendez-vous et contact', page: 'accueil', description: 'Un aperçu des prochains créneaux libres, qui renvoie vers la réservation.', tiers: 'votre plateforme de rendez-vous' },
  { id: 'rappel', nom: 'Formulaire de rappel', groupe: 'Rendez-vous et contact', page: 'contact', description: 'Le visiteur laisse son prénom et son numéro, vous le rappelez. Aucune question sur le motif.', tiers: 'un service d’envoi de formulaires' },
  { id: 'paiement', nom: 'Paiement en ligne', groupe: 'Rendez-vous et contact', page: 'consultations', description: 'Règlement ou acompte à la réservation, facture envoyée automatiquement.', tiers: 'un prestataire de paiement' },
  { id: 'statut', nom: 'Statut d’ouverture en direct', groupe: 'Rendez-vous et contact', page: 'accueil', description: 'Indique si le cabinet est ouvert en ce moment, d’après vos horaires.' },
  { id: 'questionnaires', nom: 'Questionnaires en ligne', groupe: 'Contenus et outils', page: 'accueil', description: 'Auto-évaluations et fiche de pré-consultation, remplies avant ou entre les séances.', tiers: 'un hébergeur certifié pour les données de santé (HDS)' },
  { id: 'faq', nom: 'Questions fréquentes', groupe: 'Contenus et outils', page: 'faq', description: 'Remboursement, durée, confidentialité : les réponses aux questions habituelles.' },
  { id: 'respiration', nom: 'Exercice de respiration guidé', groupe: 'Contenus et outils', page: 'accueil', description: 'Un cercle animé d’une minute que vos visiteurs peuvent suivre.' },
  { id: 'ressources', nom: 'Ressources à télécharger', groupe: 'Contenus et outils', page: 'approche', description: 'Fiches, exercices et audios que vos patients retrouvent en ligne.' },
  { id: 'ateliers', nom: 'Ateliers et groupes', groupe: 'Contenus et outils', page: 'approche', description: 'Agenda de séances collectives, avec inscription par téléphone ou par e-mail.' },
  { id: 'newsletter', nom: 'Lettre d’information', groupe: 'Contenus et outils', page: 'accueil', description: 'Les visiteurs s’inscrivent pour recevoir vos articles.', tiers: 'un service d’envoi d’e-mails' },
  { id: 'carte', nom: 'Carte d’accès', groupe: 'Pratique et accessibilité', page: 'contact', description: 'Plan du quartier avec votre adresse, et carte interactive à la demande.', tiers: 'OpenStreetMap, seulement si le visiteur affiche la carte interactive' },
  { id: 'accessibilite', nom: 'Confort de lecture', groupe: 'Pratique et accessibilité', page: null, description: 'Taille du texte et contraste réglables par le visiteur.' },
  { id: 'multilingue', nom: 'Version anglaise', groupe: 'Pratique et accessibilité', page: null, description: 'Le site traduit, avec un sélecteur de langue.' }
];

/* Pages d'un site de cabinet, dans l'ordre du menu.
   menu : texte court affiché dans la navigation */
export const PAGES = [
  { id: 'accueil', chemin: '', menu: 'Accueil' },
  { id: 'a-propos', chemin: 'a-propos', menu: 'À propos' },
  { id: 'approche', chemin: 'approche', menu: 'Mon approche' },
  { id: 'consultations', chemin: 'consultations', menu: 'Consultations & tarifs' },
  { id: 'faq', chemin: 'faq', menu: 'FAQ' },
  { id: 'contact', chemin: 'contact', menu: 'Contact' },
  { id: 'mentions-legales', chemin: 'mentions-legales', menu: 'Mentions légales', legal: true },
  { id: 'confidentialite', chemin: 'confidentialite', menu: 'Confidentialité', legal: true }
];

export const style = (id) => STYLES.find((s) => s.id === id);

/* Palette effective d'un site : couleurs personnalisées, palette libre
   (« l3 ») ou palette du style (numéro) */
export function paletteDe(site) {
  const s = style(site.theme);
  if (site.couleurs) return site.couleurs;
  if (typeof site.palette === 'string' && site.palette.startsWith('l')) return PALETTES_LIBRES[Number(site.palette.slice(1))] || s.palettes[0];
  return s.palettes[site.palette] || s.palettes[0];
}

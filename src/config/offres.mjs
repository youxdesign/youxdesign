/* ==========================================================================
   Les deux offres youXdesign : création d'un site, refonte d'un site
   --------------------------------------------------------------------------
   Affichées dans la section Tarifs de la vitrine (bascule entre les deux)
   et sur les pages ciblées (src/contenus/pages/). Les montants viennent de
   TARIF (youxdesign.mjs) : un changement de prix se fait là-bas.
   « avant » et « mois » contiennent un peu de HTML (prix barré, gras).
   ========================================================================== */
import { TARIF } from './youxdesign.mjs';

export const OFFRES = {
  creation: {
    nom: 'Nouveau site',
    prix: TARIF.lancement,
    avant: `au lieu de <s>${TARIF.normal} €</s> · réservé aux ${TARIF.places} premiers cabinets`,
    mois: `puis <strong>${TARIF.mensuel} € par mois</strong> pour l’hébergement et les modifications mineures`,
    cta: 'Configurer mon site',
    note: 'Votre site est mis en ligne avec un nom de domaine à votre nom.',
    liste: [
      'Design sur mesure et rédaction de vos pages',
      'Référencement local et fiche Google optimisée',
      'Mentions légales et confidentialité rédigées pour vous',
      'Lien vers Doctolib ou votre outil de réservation',
      'Site adapté au téléphone et rapide à charger'
    ]
  },
  refonte: {
    nom: 'Refonte de mon site',
    prix: TARIF.refonte,
    avant: 'pour refaire le site que vous avez déjà',
    mois: `<strong>Hébergement en option</strong> (${TARIF.mensuel} € par mois, modifications mineures comprises) : vous pouvez aussi garder votre hébergeur actuel`,
    cta: 'Imaginer mon nouveau site',
    note: 'Je refais votre site sur votre adresse actuelle : vos patients et Google vous retrouvent au même endroit.',
    liste: [
      'Design sur mesure et rédaction de vos pages',
      'Référencement local et mise à jour de votre fiche Google',
      'Mentions légales et confidentialité rédigées pour vous',
      'Anciennes adresses de vos pages redirigées vers les nouvelles',
      'Votre nom de domaine actuel conservé'
    ]
  }
};

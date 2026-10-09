/* ==========================================================================
   Réglages du site youXdesign (configurateur, démos, e-mail de prospection)
   ========================================================================== */

/* Adresse du site youXdesign. Pour passer à un nom de domaine définitif,
   changez uniquement cette ligne (elle sert aussi aux liens de l'e-mail). */
export const DOMAINE = 'https://youxdesign.fr';

/* Adresse qui reçoit les demandes envoyées depuis le configurateur */
export const EMAIL = 'contact@youxdesign.fr';

export const STUDIO = 'youXdesign';

/* Coordonnées : le téléphone n'apparaît que dans les mentions légales
   (obligatoire pour un professionnel) ; partout ailleurs, l'e-mail. */
export const FONDATEUR = 'Younes';
export const EDITEUR = 'Younes Yagoubi';
export const TELEPHONE = '07 61 84 57 91';
export const TELEPHONE_LIEN = '+33761845791';

/* Appel découverte gratuit (bouton de l'e-mail de prospection, page Contact).
   L'adresse courte youxdesign.fr/appel/ mène vers LIEN_APPEL : par défaut le
   formulaire de contact, sujet « appel » choisi d'avance. Le jour où une page
   de réservation existe (Google Agenda, Calendly…), collez son adresse dans
   RESERVATION_APPEL : les e-mails déjà envoyés y mèneront aussi. */
export const RESERVATION_APPEL = '';
export const LIEN_APPEL = RESERVATION_APPEL || '/contact/?sujet=appel';

/* Tarifs affichés sur la vitrine (euros) :
   création : lancement au lieu de normal, pour les « places » premiers cabinets,
   puis « mensuel » par mois (hébergement et modifications mineures) ;
   refonte : prix unique, hébergement en option au même tarif mensuel. */
export const TARIF = { lancement: 249, normal: 690, places: 10, mensuel: 10, refonte: 199 };

/* Fiche utilisée pour toutes les démos */
export const CABINET_DEMO = 'claire-morel';

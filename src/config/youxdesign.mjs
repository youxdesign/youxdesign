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
   L'adresse courte youxdesign.fr/appel/ mène vers LIEN_APPEL, y compris depuis
   les e-mails déjà envoyés. RESERVATION_APPEL : page de réservation Google Agenda
   (appel de 15 min par téléphone, du lundi au vendredi de 18 h à 21 h, le
   week-end de 9 h à 21 h). Vide, LIEN_APPEL revient au formulaire de contact. */
export const RESERVATION_APPEL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ25Izk0gJTEhu_fPsYf2koEeE3CQoTBzndsbkQdYKs207lXY9x9xrC4N-006-FPG_xxikFukeGe';
export const LIEN_APPEL = RESERVATION_APPEL || '/contact/?sujet=appel';

/* Tarifs affichés sur la vitrine (euros) :
   création : lancement au lieu de normal, pour les « places » premiers cabinets,
   puis « mensuel » par mois (hébergement et modifications mineures) ;
   refonte : prix unique, hébergement en option au même tarif mensuel. */
export const TARIF = { lancement: 249, normal: 690, places: 10, mensuel: 10, refonte: 199 };

/* Fiche utilisée pour toutes les démos */
export const CABINET_DEMO = 'claire-morel';

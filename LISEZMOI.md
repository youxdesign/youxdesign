# youXdesign · mode d'emploi

Ce dossier contient deux choses :

1. **le site youXdesign** : la vitrine, le configurateur, la page contact, la démo de Claire Morel et les neuf styles, en ligne sur https://youxdesign.fr ;
2. **la fabrique des sites de vos clients** : à partir d'une fiche (un fichier texte par cabinet), elle produit un site complet, prêt à mettre en ligne.

Tout est écrit en français, y compris les messages d'erreur. Vous n'avez pas besoin de savoir programmer : il suffit de modifier des fichiers texte et de lancer quelques commandes, toujours les mêmes. Claude Code peut aussi les lancer pour vous.

---

## Sommaire

1. [Les adresses du site](#1-les-adresses-du-site)
2. [Préparer l'ordinateur (une seule fois)](#2-préparer-lordinateur-une-seule-fois)
3. [Créer le site d'un nouveau client, pas à pas](#3-créer-le-site-dun-nouveau-client-pas-à-pas)
4. [La fiche du cabinet](#4-la-fiche-du-cabinet)
5. [Style, couleurs et police](#5-style-couleurs-et-police)
6. [Photos, plan et fichiers](#6-photos-plan-et-fichiers)
7. [Les fonctionnalités (options)](#7-les-fonctionnalités-options)
8. [Mettre un site client en ligne sur Cloudflare](#8-mettre-un-site-client-en-ligne-sur-cloudflare)
9. [Modifier le site youXdesign](#9-modifier-le-site-youxdesign)
10. [L'e-mail de prospection](#10-le-mail-de-prospection)
11. [Avant de livrer un site : la liste de contrôle](#11-avant-de-livrer-un-site--la-liste-de-contrôle)
12. [En cas de problème](#12-en-cas-de-problème)
13. [Où se trouve quoi](#13-où-se-trouve-quoi)

---

## 1. Les adresses du site

| Page | Adresse |
| --- | --- |
| Vitrine (page d'accueil) | https://youxdesign.fr/ |
| Configurateur | https://youxdesign.fr/configurateur/ |
| Contact | https://youxdesign.fr/contact/ |
| Mentions légales et confidentialité | https://youxdesign.fr/mentions-legales/ |
| Démo Claire Morel, style Sauge | https://youxdesign.fr/demo/ |
| Galerie des styles | https://youxdesign.fr/styles/ |
| Terre & organique | https://youxdesign.fr/styles/terre/ |
| Santé contemporaine | https://youxdesign.fr/styles/sante/ |
| Wabi-sabi | https://youxdesign.fr/styles/wabi/ |
| Minimalisme suisse | https://youxdesign.fr/styles/suisse/ |
| Immersif | https://youxdesign.fr/styles/immersif/ |
| Éditorial | https://youxdesign.fr/styles/editorial/ |
| Pastel doux | https://youxdesign.fr/styles/pastel/ |
| Nocturne | https://youxdesign.fr/styles/nocturne/ |

Chaque démo a les mêmes pages : ajoutez à son adresse `a-propos/`, `approche/`, `consultations/`, `faq/`, `contact/`, `mentions-legales/` ou `confidentialite/`. Par exemple : https://youxdesign.fr/styles/terre/contact/

**Montrer une démo avec d'autres réglages** : ajoutez des paramètres à l'adresse, ils suivent le visiteur de page en page.

- `?palette=2` : troisième palette du style (les palettes sont numérotées à partir de 0) ;
- `?police=1` : deuxième police ;
- `?options=creneaux,carte,faq` : fonctionnalités affichées ;
- style Immersif : `?fond=diaporama&voile=fort`.

Exemple : https://youxdesign.fr/styles/terre/?palette=1&police=2&options=statut,carte,faq

**Images de l'e-mail** : https://youxdesign.fr/email/apercu-sites.gif. Les images des anciens e-mails restent en place, ne les supprimez pas : `/email/apercu-demos.gif`, `/apercu-demo.gif`, `/apercu-demov2.gif`, `/apercu-demov3.gif` et le dossier `/brand/`.

**Code et versions de travail**

- Le code est sur GitHub : https://github.com/youxdesign/youxdesign
- La branche `main` est ce qui est en ligne sur youxdesign.fr.
- La branche `refonte` sert à travailler : chaque envoi sur cette branche est visible à part, sur https://refonte.youxdesign.pages.dev, sans toucher au site en ligne.

---

## 2. Préparer l'ordinateur (une seule fois)

1. **Installer Node.js 24.** C'est le moteur qui fabrique les sites. Téléchargez la version « LTS » sur https://nodejs.org et installez-la comme une application.
   Sur ce Mac, Node.js est déjà présent dans un dossier personnel (`~/.local/node`). Pour que le Terminal le trouve, tapez une seule fois :
   ```bash
   echo 'export PATH="$HOME/.local/node/bin:$PATH"' >> ~/.zshrc
   ```
   puis fermez et rouvrez le Terminal.
2. **Ouvrir le Terminal dans le dossier du projet :**
   ```bash
   cd ~/Downloads/YouXdesign/repo
   ```
3. **Installer les outils du projet** (à refaire seulement si on vous le demande) :
   ```bash
   npm install
   ```

Vérification : `node -v` doit afficher `v24…`.

---

## 3. Créer le site d'un nouveau client, pas à pas

Exemple pour une psychologue, Julie Bernard. Le nom de dossier choisi est `julie-bernard` : en minuscules, sans espace ni accent.

1. **Recevoir la demande.** Le prospect remplit le configurateur et envoie le récapitulatif depuis sa messagerie, à l'adresse contact@youxdesign.fr. Ses photos arrivent en pièces jointes.

2. **Copier la fiche d'exemple.** Dupliquez le dossier `cabinets/claire-morel/` et renommez la copie `cabinets/julie-bernard/`.

3. **Remplir la fiche** `cabinets/julie-bernard/cabinet.json` avec les informations du récapitulatif (voir la [partie 4](#4-la-fiche-du-cabinet)). Deux points importants :
   - mettez `"demo": false`, sinon le site demande à Google de ne pas le référencer ;
   - mettez dans `"domaine"` l'adresse définitive du site, par exemple `https://www.julie-bernard-psychologue.fr`.

4. **Déposer les photos** dans `cabinets/julie-bernard/images/` (voir la [partie 6](#6-photos-plan-et-fichiers)). Supprimez la carte de Claire Morel (`carte.png`) puis refaites le plan :
   ```bash
   npm run carte -- julie-bernard
   ```

5. **Fabriquer le site :**
   ```bash
   npm run client -- julie-bernard
   ```
   Le site complet apparaît dans `clients/julie-bernard/`. Si la fiche contient une erreur, le message dit en français quel champ corriger.

6. **Le regarder avant de le livrer :**
   ```bash
   npm run apercu -- clients/julie-bernard
   ```
   puis ouvrez http://localhost:4321 dans votre navigateur. Appuyez sur `Ctrl + C` dans le Terminal pour arrêter.

7. **Le mettre en ligne** sur Cloudflare (voir la [partie 8](#8-mettre-un-site-client-en-ligne-sur-cloudflare)).

8. **Plus tard, pour une modification** : changez la fiche ou les photos, recommencez l'étape 5, puis envoyez à nouveau le dossier sur Cloudflare.

Pour essayer un autre style sans modifier la fiche :
```bash
npm run client -- julie-bernard --style nocturne
```

---

## 4. La fiche du cabinet

Toutes les pages du site sont construites à partir de ce seul fichier : `cabinets/<dossier>/cabinet.json`. La meilleure façon d'apprendre est d'ouvrir celle de Claire Morel et de la comparer avec la démo.

**Règles d'écriture**

- Le texte est toujours entre guillemets droits : `"comme ceci"`.
- Chaque ligne d'une liste se termine par une virgule, sauf la dernière.
- Dans les textes : `*mot*` met en italique, `**mot**` met en gras et `\n` passe à la ligne.
- Les champs qui commencent par `_` sont des commentaires : ils sont ignorés.

**Les grandes parties de la fiche**

| Partie | Contenu |
| --- | --- |
| `site` | adresse du site, style, palette, police, fonctionnalités (voir parties 5 et 7) |
| `praticien` | prénom, nom, `accord` (`"f"`, `"m"` ou `"n"` pour les accords : « diplômée »…), profession (`psychologue`, `sophrologue`, `coach` ou `autre`), titre, spécialité, diplôme, année d'installation, n° ADELI, n° RPPS, SIRET, statut, ARS, public reçu, citation |
| `contact` | téléphone et sa note, e-mail et sa note, plateforme de rendez-vous (`rendezVous` : nom, lien et, si possible, agenda intégrable), adresses des services en ligne (partie 7) |
| `cabinet` | adresse, complément, code postal, ville, quartier, coordonnées GPS (pour le plan), accès PMR, visio, horaires et façons de venir (`acces`) |
| `tarifs` | chaque type de séance : nom, lieu, prix, durée, texte ; `miseEnAvant: true` pour celle à mettre en avant |
| `motifs` | motifs de consultation : titre, texte, icône |
| `pages` | les textes de chaque page : `accueil`, `a-propos`, `approche`, `consultations`, `faq`, `contact` |
| `legal` | date de mise à jour des pages légales, directeur de la publication, médiateur (si besoin) |

**Horaires** : `"9:00-20:00"`, ou `"9:00-12:30, 14:00-19:00"` pour deux plages, ou `""` si le cabinet est fermé ce jour-là.

**Pages** : chaque page a un titre et une description pour Google (`seoTitre`, `seoDescription`), puis ses textes. La FAQ est rangée en groupes de questions. Sur l'accueil, `questionsAccueil` choisit les quatre questions affichées.

> Dans la fiche de Claire Morel, `variantes` contient les titres propres à chaque démo. Ce champ ne sert qu'aux démos : vous pouvez le supprimer de la fiche d'un client, il ne sera pas utilisé.

**Pages légales.** Les mentions légales et la politique de confidentialité sont rédigées automatiquement à partir de la fiche : identité, numéros, hébergeur (Cloudflare), absence de cookies. Relisez-les avant chaque livraison.

---

## 5. Style, couleurs et police

Dans la partie `site` de la fiche :

```json
"style": "terre",
"palette": 1,
"police": 2,
```

| Style (`style`) | Palettes (`palette` : 0, 1, 2, 3) | Polices des titres (`police` : 0 à 5) |
| --- | --- | --- |
| `sauge` | Sauge & crème, Eucalyptus, Argile, Lavande | Fraunces, Cormorant Garamond, Instrument Serif, Playfair Display, Lora, EB Garamond |
| `terre` | Terracotta, Olive, Argile rose, Ocre | Young Serif, Gloock, DM Serif Display, Corben, Yeseva One, Rufina |
| `sante` | Bleu glacier, Sarcelle, Violet doux, Vert santé | Onest, Plus Jakarta Sans, Manrope, DM Sans, Outfit, Public Sans |
| `wabi` | Lin & rouille, Encre & indigo, Mousse, Cendre | Shippori Mincho, Cormorant Garamond, Zen Old Mincho, Kaisei Tokumin, Zen Antique, Hina Mincho |
| `suisse` | Blanc & orange, Blanc & bleu, Blanc & rouge, Craie & vert | Schibsted Grotesk, Instrument Sans, Bricolage Grotesque, Inter Tight, Space Grotesk, Archivo |
| `immersif` | Nuit & laiton, Ardoise & sauge, Brume & bleu, Sable & corail | Bodoni Moda, Marcellus, Italiana, Playfair Display, Cormorant Garamond, Gilda Display |
| `editorial` | Papier & encre, Crème & vert, Ivoire & bleu, Rose & bordeaux | Instrument Serif, Newsreader, Libre Caslon, DM Serif Display, Lora, EB Garamond |
| `pastel` | Pêche, Lavande, Menthe, Ciel | Nunito, Quicksand, Varela Round, Fredoka, Comfortaa, Outfit |
| `nocturne` | Minuit & or, Forêt nocturne, Prune, Océan | Spectral, Tenor Sans, Libre Bodoni, Cormorant Garamond, Marcellus, Fraunces |

**Palettes utilisables avec tous les styles** : `"palette": "l0"` à `"l11"`. Dans l'ordre : Sauge & crème, Bleu nuit & sable, Rose poudré, Lavande & prune, Océan clair, Moutarde, Corail & menthe, Brique & gris, Pistache, Bleu Klein, Anthracite & cuivre, Nuit & lilas.

**Couleurs du client** (son logo, par exemple) : elles remplacent la palette.
```json
"couleurs": { "fond": "#F6F3EE", "encre": "#1D2925", "accent": "#2E4A3F", "doux": "#EAF0EA" }
```
`fond` est le fond des pages, `encre` le texte, `accent` les boutons et les liens, `doux` les encarts. Les contrastes sont vérifiés et corrigés automatiquement pour rester lisibles.

**Style Immersif** : `"fond"` règle l'animation de l'image d'accueil (`"zoom"`, `"diaporama"`, `"parallaxe"`, `"degrade"` ou `"video"`) et `"voile"` l'assombrissement de l'image (`"leger"`, `"moyen"` ou `"fort"`). Un bouton permet au visiteur de mettre l'animation en pause, et rien ne bouge s'il a demandé à réduire les animations.

**Astuce** : essayez d'abord les combinaisons dans le configurateur ou avec les paramètres d'adresse de la [partie 1](#1-les-adresses-du-site), puis recopiez les numéros dans la fiche.

---

## 6. Photos, plan et fichiers

**Photos.** Déposez-les dans `cabinets/<dossier>/images/` avec ces noms exacts :

| Fichier | Utilisation | Conseil |
| --- | --- | --- |
| `portrait.jpg` | portrait du praticien | lumineux, cadrage buste, 1 200 px de large au moins |
| `cabinet.jpg` | photo du cabinet | 1 600 px de large au moins |
| `ambiance.jpg` | grande image d'ambiance (styles Wabi-sabi, Immersif) | 2 000 px de large au moins |
| `ambiance-2.jpg`, `ambiance-3.jpg` | images suivantes du diaporama (Immersif) | même format que `ambiance.jpg` |
| `fond.mp4` | vidéo de fond (Immersif, réglage `"video"`) | 10 à 20 secondes, sans son, 5 Mo au plus |

Les formats `.jpg`, `.png` et `.webp` sont acceptés. Les photos sont redimensionnées et converties automatiquement (formats AVIF et WebP). S'il manque une photo, le site affiche l'illustration du style à la place.

**Plan d'accès.** Indiquez la latitude et la longitude du cabinet dans la fiche (sur https://www.openstreetmap.org : clic droit sur le cabinet, puis « Afficher l'adresse »), puis :
```bash
npm run carte -- <dossier>
```
L'image du plan est enregistrée une fois pour toutes dans `images/carte.png` et hébergée sur le site. La carte interactive OpenStreetMap ne se charge que si le visiteur clique.

**Fichiers à télécharger** (option `ressources`) : déposez-les dans `cabinets/<dossier>/fichiers/` et décrivez-les dans la fiche :
```json
"ressources": [
  { "titre": "Le journal des pensées", "detail": "Fiche à imprimer · PDF", "icone": "livre", "fichier": "journal-des-pensees.pdf" }
]
```

---

## 7. Les fonctionnalités (options)

Elles se choisissent dans la liste `"options"` de la partie `site` :
```json
"options": ["statut", "respiration", "carte", "faq"]
```

| Option | Ce qu'elle ajoute | Ce qu'il faut prévoir |
| --- | --- | --- |
| `statut` | « Ouvert maintenant, jusqu'à 20 h », calculé à l'heure de Paris | rien : les horaires de la fiche suffisent |
| `respiration` | exercice de respiration guidé d'une minute | rien |
| `faq` | page Questions fréquentes et extrait sur l'accueil | les questions dans `pages.faq` |
| `carte` | plan d'accès sur l'accueil et la page contact | coordonnées GPS et `npm run carte` |
| `accessibilite` | bouton « Aa » : taille du texte et contraste renforcé | rien |
| `ateliers` | groupes et ateliers proposés | la liste `"ateliers": [{ "titre": "…", "detail": "…" }]` |
| `ressources` | fiches et exercices à télécharger | la liste `"ressources"` et les fichiers (partie 6) |
| `rappel` | formulaire « être rappelé » | un service qui reçoit les formulaires (Formspree, Tally…) : son adresse dans `contact.formulaires.rappel` |
| `newsletter` | inscription à une lettre d'information | un service d'envoi d'e-mails (Brevo…) : son adresse dans `contact.formulaires.newsletter` |
| `questionnaires` | questionnaires avant ou entre les séances | un outil hébergé chez un hébergeur certifié pour les données de santé (HDS) : son adresse dans `contact.questionnaires`. Ajoutez l'option `hds` seulement si c'est vraiment le cas. |
| `paiement` | encart sur le paiement en ligne | le paiement passe par la plateforme de rendez-vous ou un prestataire, à mettre en place avec le client |
| `multilingue` | lien « EN » vers la version anglaise | la version anglaise, à réaliser à part : son adresse dans `contact.versionAnglaise` |
| `creneaux` | prochains créneaux libres (option gratuite) | voir ci-dessous |

Une option qui dépend d'un service n'apparaît sur le site du client que si l'adresse de ce service est renseignée : jamais de bouton qui ne mène nulle part. La politique de sécurité du site autorise automatiquement l'envoi des formulaires vers ces services, et vers eux seulement.

**Module de créneaux** (option gratuite). Il affiche les vraies disponibilités du praticien, jamais des horaires inventés :

- si sa plateforme permet d'intégrer son agenda dans un site (c'est le cas de Calendly, Cal.com ou des pages de réservation de Google Agenda), indiquez l'adresse de cet agenda dans `contact.rendezVous.agenda`. Le site affiche alors un bouton « Afficher les créneaux disponibles » : l'agenda s'ouvre dans la page, seulement si le visiteur clique, comme la carte ;
- sinon (Doctolib, par exemple, ne le permet pas), le bloc affiche un bouton « Voir les créneaux disponibles » qui ouvre directement la page de réservation.

```json
"rendezVous": { "plateforme": "Calendly", "url": "https://calendly.com/julie-bernard", "agenda": "https://calendly.com/julie-bernard/seance" }
```

Dans les démos, le module montre des horaires d'exemple, calculés à partir des horaires du cabinet, pour que les prospects voient à quoi il ressemble.

**Ce qui n'est jamais ajouté** : cookies, outils de mesure d'audience, bannière de consentement, polices ou images chargées depuis un autre site, formulaire demandant des informations de santé (en dehors de l'outil HDS des questionnaires). C'est ce qui permet d'écrire, dans la politique de confidentialité, que le site ne dépose aucun cookie.

---

## 8. Mettre un site client en ligne sur Cloudflare

Chaque client a son propre projet Cloudflare Pages. La méthode la plus simple consiste à glisser le dossier du site dans le navigateur.

**Première mise en ligne**

1. Connectez-vous sur https://dash.cloudflare.com.
2. Ouvrez « Workers & Pages », puis « Créer » (Create). Choisissez l'onglet **Pages**, puis **« Upload assets »** (téléverser des fichiers).
3. Donnez un nom au projet, par exemple `julie-bernard`. Le site sera d'abord visible sur `julie-bernard.pages.dev`.
4. Glissez le dossier `clients/julie-bernard`, puis cliquez sur « Deploy » (déployer).

**Nom de domaine**

5. Dans le projet, ouvrez **« Custom domains »** (domaines personnalisés), puis ajoutez le domaine du client, par exemple `www.julie-bernard-psychologue.fr`.
   - Si le domaine est géré chez Cloudflare, tout se fait seul.
   - Sinon, Cloudflare indique l'enregistrement à ajouter chez le fournisseur du domaine.
6. Vérifiez que l'adresse dans `"domaine"` de la fiche est exactement celle-ci. Elle sert pour Google, le plan du site et les aperçus de partage.

**Mises à jour suivantes** : dans le projet, choisissez « Create deployment » (nouveau déploiement), puis glissez le dossier `clients/julie-bernard` mis à jour.

Le dossier `clients/` n'est pas envoyé sur GitHub : c'est un résultat, que l'on peut toujours refabriquer avec `npm run client`. Ce qui compte, et qu'il faut garder précieusement, c'est le dossier `cabinets/<dossier>/` (fiche, photos, fichiers).

---

## 9. Modifier le site youXdesign

Le site youXdesign est relié à GitHub : Cloudflare le reconstruit tout seul à chaque envoi.

- **Branche `refonte`** : pour travailler. Chaque envoi est visible sur https://refonte.youxdesign.pages.dev, sans toucher au site public.
- **Branche `main`** : ce qui est en ligne sur https://youxdesign.fr. On y fusionne `refonte` quand tout est validé.

Réglages de Cloudflare pour ce projet (déjà faits, à ne pas changer) :

| Réglage | Valeur |
| --- | --- |
| Commande de build | `npm run build` |
| Dossier de sortie | `dist` |
| Variable d'environnement | `NODE_VERSION` = `24` |

**Pour voir le site youXdesign sur l'ordinateur :**
```bash
npm run build
npm run apercu
```
puis ouvrez http://localhost:4321.

**Ce qu'on modifie le plus souvent**

- Les textes et données de la démo : `cabinets/claire-morel/cabinet.json` (cette fiche alimente les neuf styles).
- Les styles, palettes, polices et options proposés : `src/config/catalogue.mjs`.
- L'adresse du site youXdesign et l'e-mail qui reçoit les demandes : `src/config/youxdesign.mjs`. Pour passer à un nom de domaine définitif, il suffit de changer la ligne `DOMAINE`. Elle sert aussi aux liens de l'e-mail : relancez ensuite `npm run email`. Le même fichier contient le téléphone (affiché seulement dans les mentions légales), le nom de l'éditeur, les tarifs (`TARIF`, repris par la vitrine et par l'e-mail) et le lien « Réserver un appel gratuit » (`RESERVATION_APPEL` : vide, l'adresse courte https://youxdesign.fr/appel/ mène au formulaire de contact, sujet « appel » ; collez-y l'adresse d'une page de réservation Google Agenda ou Calendly le jour où vous en avez une).

**La vitrine (page d'accueil)**

- Les textes de la page d'accueil : `src/gabarits/youx/Vitrine.astro` (réalisations, vidéo, fonctionnalités, méthode, tarif, questions fréquentes). Les autres pages : `Contact.astro`, `Legal.astro` (mentions légales), `Accueil.astro` (galerie des styles) dans le même dossier.
- En-tête et pied de page : `src/components/youx/Entete.astro` et `Pied.astro`.
- Le design et les animations : `src/styles/vitrine.css` et `src/scripts/vitrine.js`. Le défilement doux utilise la bibliothèque Lenis ; tout mouvement s'arrête si le visiteur a demandé à réduire les animations.
- Les captures des neuf styles : `src/assets/vitrine/` (une version ordinateur et une version téléphone par style, en WebP). Si un style change beaucoup, refaites la capture avec la même taille (1440 × 900 en écran double densité pour l'ordinateur, 390 × 844 pour le téléphone).
- La vidéo du configurateur : `youx-statique/video/` (MP4, MP4 allégé pour téléphone, WebM et image d'attente). Les chapitres (moments clés de la vidéo, en secondes) sont réglés en haut de `Vitrine.astro`.
- L'image de partage sur les réseaux sociaux : `youx-statique/og-youxdesign.png` (1200 × 630).
- Le formulaire de contact n'envoie rien lui-même : il prépare un e-mail dans la messagerie du visiteur, adressé à `EMAIL`.

---

## 10. L'e-mail de prospection

**Les fichiers**, dans le dossier `email/` :

| Fichier | Rôle |
| --- | --- |
| `email-prospection.html` | création d'un site : la version à envoyer |
| `email-prospection.txt` | sa version texte, à envoyer avec la version HTML (certaines messageries l'affichent) |
| `email-refonte.html`, `email-refonte.txt` | refonte d'un site existant (l'adresse du praticien est conservée) |
| `apercu-exemple.html`, `apercu-exemple-refonte.html` | les e-mails remplis pour une « Julie », pour relire le rendu |
| `modele.html`, `modele.txt`, `modele-refonte.html`, `modele-refonte.txt` | les modèles : c'est là qu'on modifie le texte |

Dans les modèles, `%DOMAINE%`, `%EMAIL%`, `%APPEL%` (bouton « Réserver un appel gratuit ») et les tarifs `%TARIF_LANCEMENT%`, `%TARIF_NORMAL%`, `%TARIF_PLACES%`, `%TARIF_MENSUEL%`, `%TARIF_REFONTE%` sont remplacés automatiquement à partir de `src/config/youxdesign.mjs` : un changement de prix se fait là, puis `npm run email`. L'e-mail ne donne pas de numéro de téléphone : le visiteur réserve un appel ou répond au message.

Après toute modification des modèles, régénérez les versions prêtes à envoyer :
```bash
npm run email
```
La commande vérifie aussi que l'e-mail pèse moins de 100 Ko (au-delà, Gmail le coupe), que les variables sont présentes et que toutes les images existent sur le site.

**Les variables**, à remplir pour chaque prospect par l'outil d'envoi :

| Variable | Contenu | Exemple |
| --- | --- | --- |
| `{{prenom}}` | prénom | Julie |
| `{{detail_personnalisation}}` | une phrase complète sur son cabinet, ou rien | J'ai découvert votre cabinet de Roubaix en cherchant une psychologue qui reçoit les adolescents. |
| `{{source}}` | où vous avez trouvé l'adresse | votre page professionnelle sur Google |
| `{{site_actuel}}` | (e-mail « refonte » seulement) l'adresse de son site actuel | julie-durand-psychologue.fr |

**Quel e-mail pour qui ?** L'e-mail « refonte » quand le praticien a son propre nom de domaine (psyroubaix.fr…). L'e-mail « création » quand il n'a pas de site, ou seulement une page gratuite (Wix, Jimdo, Weebly, Google Sites…) : lui promettre de « garder son adresse » n'aurait pas de sens.

**Envoyer : la commande `npm run envoyer`**

Elle envoie les e-mails depuis younes@youxdesign.fr exactement tels qu'ils ont été conçus, images et liens directs compris.

> N'utilisez pas l'outil Gmail de Claude (ni un simple copier-coller du code HTML) pour ces e-mails : il supprime les images et transforme chaque lien en redirection google.com, ce qui affiche un avertissement au destinataire. En dépannage, on peut ouvrir l'aperçu dans Safari, tout sélectionner (Cmd+A), copier (Cmd+C) et coller dans un nouveau message Gmail : images et liens restent intacts.

1. **Une seule fois : le mot de passe d'application.** Dans le compte Google de younes@youxdesign.fr (myaccount.google.com › Sécurité), activez la validation en deux étapes, puis créez un « mot de passe d'application ». Collez ses 16 lettres dans le fichier `~/.config/youxdesign/envoi.env`, hors du projet, jamais sur GitHub :
   ```
   SMTP_UTILISATEUR=younes@youxdesign.fr
   SMTP_MOT_DE_PASSE=<les 16 lettres>
   ```
2. **La liste du lot**, un fichier JSON rangé dans le dossier `envois/`, à côté du projet (`YouXdesign/envois/prospects-lot3.json`…). Il contient une entrée par prospect :
   ```json
   [
     { "prenom": "Julie", "email": "contact@julie-durand-psychologue.fr", "modele": "refonte",
       "site": "julie-durand-psychologue.fr",
       "detail": "J’ai découvert votre cabinet de Roubaix et votre travail auprès des adolescents." }
   ]
   ```
   `modele` vaut `refonte` ou `creation`. `site` remplit `{{site_actuel}}` et la source du pied de l'e-mail (« votre site … »). `detail` remplit `{{detail_personnalisation}}`.
3. **Les trois étapes**, depuis le dossier `repo` :
   ```bash
   npm run envoyer -- ../envois/prospects-lot3.json
   ```
   affiche la liste et l'objet de chaque e-mail, sans rien envoyer.
   ```bash
   npm run envoyer -- ../envois/prospects-lot3.json --essai yagoubiyounes@gmail.com
   ```
   envoie chaque e-mail personnalisé à votre propre adresse, objet « [Test Julie] … ». Relisez-les sur ordinateur et sur téléphone.
   ```bash
   npm run envoyer -- ../envois/prospects-lot3.json --confirmer
   ```
   envoie pour de vrai, avec 90 secondes entre deux prospects.
4. **Le journal** `envois/journal-envois.csv` garde la date de chaque envoi. Une adresse qui y figure n'est jamais relancée par erreur, même si elle réapparaît dans un autre lot.

**Les bonnes habitudes**

- Petits lots, de 10 à 15 e-mails, espacés de quelques jours : le domaine est neuf, et Gmail se méfie des gros envois.
- Uniquement des adresses publiées par le praticien lui-même, et toujours présentes sur son site le jour de l'envoi.
- Après l'envoi, passez les lignes en « Envoyé » dans le fichier de suivi Excel. Elles deviennent bleues, puis jaunes au moment de la relance (J+10).
- Le pied de l'e-mail indique où l'adresse a été trouvée et propose de répondre « STOP ». Retirez aussitôt de vos listes toute personne qui répond « STOP » (onglet « Liste STOP » du fichier de suivi).

**La relance**, une seule fois, environ 10 jours après le premier envoi : un message court, sans image ni lien, envoyé en réponse au premier e-mail (même conversation). Le texte, en version refonte et en version création, est dans `envois/relance.txt`. Une tâche programmée de Claude (barre latérale › « Scheduled ») peut préparer ces réponses en brouillons dans Gmail ; vous les relisez, puis vous les envoyez vous-même.

**Le GIF animé** de l'e-mail présente six démos (Sauge, Terre & organique, Nocturne, Pastel doux, Éditorial, Santé contemporaine) : l'accueil, puis les motifs de consultation, en fondu de l'une à l'autre (environ 1 Mo). Il est hébergé sur le site, dans `youx-statique/email/apercu-sites.gif`, à l'adresse https://youxdesign.fr/email/apercu-sites.gif. Pour le refaire, donnez-lui un nouveau nom de fichier : les e-mails déjà envoyés gardent ainsi l'ancien. Une image ajoutée ou changée n'apparaît dans les e-mails qu'une fois envoyée sur la branche `main`.

**Ce que l'e-mail ne promet pas**, volontairement : « 100 % conforme RGPD », « certifié accessible », « hébergé en France » ou tout autre engagement impossible à prouver. Gardez cette règle si vous modifiez le texte.

---

## 11. Avant de livrer un site : la liste de contrôle

- [ ] `"demo": false` et la bonne adresse dans `"domaine"`.
- [ ] Nom, titre, numéro ADELI ou RPPS, SIRET, adresse, téléphone et e-mail exacts.
- [ ] Horaires, tarifs et lien de prise de rendez-vous vérifiés.
- [ ] Aucun texte de Claire Morel oublié : cherchez « Claire », « Morel », « Esquermoise » et « Vieux-Lille » dans la fiche.
- [ ] Photos du client en place et plan refait avec `npm run carte`.
- [ ] Pages légales relues : mentions légales et confidentialité.
- [ ] Encart d'urgence (15 et 3114) présent sur l'accueil, la FAQ et la page contact. Il est ajouté automatiquement.
- [ ] Pour une psychologue ou un psychologue : ni témoignages, ni promesse de résultat dans les textes.
- [ ] Site regardé avec `npm run apercu`, sur ordinateur et sur téléphone, toutes les pages.
- [ ] Après la mise en ligne : le domaine fonctionne et la page Contact affiche la bonne adresse.

---

## 12. En cas de problème

| Message ou situation | Que faire |
| --- | --- |
| `command not found: npm` ou `node` | Node.js n'est pas installé ou pas trouvé : voir la [partie 2](#2-préparer-lordinateur-une-seule-fois). |
| `La fiche cabinets/… contient des erreurs` | Le message liste chaque champ à corriger, avec son chemin (par exemple `contact › email : adresse e-mail invalide`). |
| `n'est pas un JSON valide` | Une virgule ou un guillemet manque dans la fiche. Le message indique la position de l'erreur. |
| `Fiche introuvable` | Vérifiez le nom du dossier dans `cabinets/` et dans la commande. |
| Une photo n'apparaît pas | Vérifiez son nom exact (`portrait.jpg`…) et son dossier (`images/`), puis refabriquez le site. |
| Le plan est celui de Lille | Supprimez `images/carte.png`, renseignez les coordonnées GPS, puis lancez `npm run carte -- <dossier>`. |
| Cloudflare affiche « Build failed » pour youxdesign.fr | Vérifiez les réglages de la [partie 9](#9-modifier-le-site-youxdesign). Le détail est dans Cloudflare, onglet « Deployments ». |
| Une image n'apparaît pas dans l'e-mail | Elle n'est sans doute pas encore sur la branche `main` : ouvrez son adresse dans un navigateur pour vérifier. Si l'e-mail a été envoyé avec l'outil Gmail de Claude, c'est lui qui a retiré les images : utilisez `npm run envoyer` (partie 10). |
| `npm run envoyer` : « Invalid login » ou « Username and Password not accepted » | Le mot de passe d'application est faux ou a été supprimé : créez-en un nouveau et remplacez-le dans `~/.config/youxdesign/envoi.env`. |

En cas de doute, demandez à Claude Code : il connaît ce projet et peut lancer les commandes pour vous.

---

## 13. Où se trouve quoi

```
cabinets/            une fiche par cabinet (claire-morel = la démo)
  <dossier>/
    cabinet.json     la fiche : tous les textes et réglages du site
    images/          photos (portrait, cabinet, ambiance…) et plan
    fichiers/        fichiers à télécharger (option « ressources »)
clients/             sites fabriqués par « npm run client », prêts à mettre en ligne
dist/                site youXdesign fabriqué par « npm run build »
email/               e-mail de prospection : modèles et versions prêtes à envoyer
../envois/           à côté du projet (jamais sur GitHub) : listes des lots, journal des envois, texte de relance
youx-statique/       fichiers propres au site youXdesign : logo, images des e-mails, vidéo, image de partage
src/assets/vitrine/  captures des neuf styles affichées sur la vitrine
src/gabarits/youx/   pages du site youXdesign : vitrine, configurateur, contact, mentions légales, galerie
public/fonts/        polices hébergées sur les sites (aucun appel à Google Fonts)
scripts/             commandes : client, aperçu, carte, e-mail, envoi des e-mails, polices
src/config/          catalogue (styles, palettes, polices, options) et réglages youXdesign
src/themes/          le design de chaque style
src/gabarits/        les pages communes (accueil, à propos, contact…)
archive/             l'ancien site, conservé tel quel
```

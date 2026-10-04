/* ==========================================================================
   youXdesign · Configurateur
   Logique : état, étapes du formulaire, sauvegarde locale, aperçu, envoi.
   Les réponses restent dans le navigateur (localStorage) jusqu'à l'envoi.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'youx-config-v1', IMGKEY = 'youx-config-img-v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = YX.esc;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- État -------------------------------------------------------------- */
  var S = (function () {
    var saved = {}, im = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    try { im = JSON.parse(localStorage.getItem(IMGKEY) || '{}'); } catch (e) {}
    return { step: Math.min(saved.step || 0, YX.STEPS.length - 1), d: Object.assign(YX.def(), saved.d || {}), imgs: im.imgs || {}, names: im.names || {}, imgWarn: false, confirmReset: false, device: 'desktop' };
  })();
  var LAST = YX.STEPS.length - 1;

  function persist() { try { localStorage.setItem(KEY, JSON.stringify({ d: S.d, step: S.step })); flashSaved(); } catch (e) {} }
  function persistImgs() {
    try { localStorage.setItem(IMGKEY, JSON.stringify({ imgs: S.imgs, names: S.names })); S.imgWarn = false; }
    catch (e) { S.imgWarn = true; }
  }
  var savedTimer;
  function flashSaved() {
    var el = $('[data-saved]'); if (!el) return;
    el.classList.add('is-on'); clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { el.classList.remove('is-on'); }, 1400);
  }

  /* Mise à jour d'un champ : aperçu relancé, formulaire redessiné si demandé */
  function upd(patch, rerenderForm) {
    var styleChanged = 'style' in patch && patch.style !== S.d.style;
    Object.assign(S.d, patch);
    persist();
    if (styleChanged) { loadFonts(); transition(renderPreview); } else schedulePreview();
    if (rerenderForm) renderForm(false);
  }
  function toggleIn(key, v, max) {
    var cur = (S.d[key] || []).slice(), i = cur.indexOf(v);
    if (i > -1) cur.splice(i, 1); else if (!max || cur.length < max) cur.push(v);
    var p = {}; p[key] = cur; upd(p, true);
  }
  function transition(fn) {
    if (document.startViewTransition && !reduce) document.startViewTransition(fn); else fn();
  }

  /* --- Polices de l'aperçu, chargées à la demande ------------------------ */
  var loadedFonts = {};
  function loadFonts(style) {
    style = style || S.d.style;
    if (loadedFonts[style]) return;
    loadedFonts[style] = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + YX.GF[style].map(function (f) { return 'family=' + f; }).join('&') + '&display=swap';
    document.head.appendChild(l);
  }

  /* --- Petits composants de formulaire ----------------------------------- */
  function chips(list, isOn, attrs, opts) {
    opts = opts || {};
    return '<div class="chips' + (opts.cls ? ' ' + opts.cls : '') + '" role="group"' + (opts.label ? ' aria-label="' + esc(opts.label) + '"' : '') + '>' + list.map(function (x) {
      var label = Array.isArray(x) ? x[0] : x, value = Array.isArray(x) ? x[1] : x;
      var on = isOn(value), locked = opts.locked && opts.locked(value);
      return '<button type="button" class="chip' + (on ? ' is-on' : '') + (locked ? ' is-locked' : '') + '" aria-pressed="' + on + '"' + (locked ? ' disabled' : '') + ' ' + attrs + '="' + esc(String(value)) + '">' + (on ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>' : '') + esc(label) + '</button>';
    }).join('') + '</div>';
  }
  function field(key, label, ph, o) {
    o = o || {};
    var v = esc(S.d[key] || '');
    var input = o.rows ? '<textarea data-field="' + key + '" rows="' + o.rows + '" placeholder="' + esc(ph) + '">' + v + '</textarea>'
      : '<input data-field="' + key + '" value="' + v + '" placeholder="' + esc(ph) + '"' + (o.type ? ' type="' + o.type + '"' : '') + (o.mode ? ' inputmode="' + o.mode + '"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : '') + '>';
    return '<label class="field"><span class="field__label">' + label + (o.hint ? ' <em>' + o.hint + '</em>' : '') + '</span>' + input + '</label>';
  }
  function group(title, inner, hint) { return '<div class="group"><p class="group__title">' + title + (hint ? ' <em>' + hint + '</em>' : '') + '</p>' + inner + '</div>'; }
  function toggle(on, title, desc, attr) {
    return '<button type="button" class="toggle' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on + '" ' + attr + '><span class="toggle__text"><span class="toggle__title">' + title + '</span><span class="toggle__desc">' + desc + '</span></span><span class="toggle__track"><span class="toggle__knob"></span></span></button>';
  }
  function swatches(pl) { return '<span class="swatches">' + [pl[1], pl[4], pl[3], pl[2]].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>'; }

  /* --- Contenu de chaque étape ------------------------------------------- */
  var STEP_HTML = [
    function () {
      return '<div class="welcome">' +
        '<ol class="welcome__list">' +
        '<li><span>1</span><div><strong>Vos informations</strong><p>Identité, cabinet, horaires et tarifs.</p></div></li>' +
        '<li><span>2</span><div><strong>Votre style</strong><p>Univers, couleurs, typographie et photos.</p></div></li>' +
        '<li><span>3</span><div><strong>Votre contenu</strong><p>Pages, fonctionnalités et ton des textes.</p></div></li></ol>' +
        '<div class="note"><p class="note__title">À préparer si possible</p><ul><li>Vos coordonnées et votre numéro ADELI ou RPPS</li><li>Vos horaires et vos tarifs</li><li>Une photo de vous, du cabinet et votre logo si vous en avez</li></ul></div>' +
        '<p class="muted small">Vos réponses sont enregistrées automatiquement dans ce navigateur. Vous pouvez fermer la page et reprendre plus tard.</p>' +
        '<div class="row"><button type="button" class="btn btn--primary btn--lg" data-go="1">Commencer <span aria-hidden="true">→</span></button><a class="btn btn--ghost btn--lg" href="demo/" target="_blank" rel="noopener">Voir un site réalisé ↗</a></div></div>';
    },
    function () {
      var d = S.d;
      return '<div class="grid2">' + field('prenom', 'Prénom', 'Camille', { auto: 'given-name' }) + field('nom', 'Nom', 'Martin', { auto: 'family-name' }) + '</div>' +
        field('titre', 'Titre', 'Psychologue clinicienne') + field('approche', 'Approche', 'TCC, thérapie systémique, EMDR…') + field('adeli', 'N° ADELI ou RPPS', '59 93 0000 0') +
        '<div class="grid2">' + field('telephone', 'Téléphone', '06 00 00 00 00', { type: 'tel', auto: 'tel' }) + field('email', 'E-mail', 'contact@exemple.fr', { type: 'email', auto: 'email' }) + '</div>' +
        group('Public accueilli', chips(['Adultes', 'Adolescents', 'Enfants', 'Couples', 'Seniors'], function (x) { return d.publics.indexOf(x) > -1; }, 'data-toggle-publics')) +
        group('Motifs de consultation principaux', chips(Object.keys(YX.MOTIFS), function (x) { return d.motifs.indexOf(x) > -1; }, 'data-toggle-motifs'), d.motifs.length + ' sélectionnés');
    },
    function () {
      var d = S.d, J = d.jours;
      var heures = []; for (var mm = 7 * 60; mm <= 22 * 60; mm += 30) heures.push(Math.floor(mm / 60) + 'h' + (mm % 60 ? '30' : ''));
      var opt = function (cur) { return heures.map(function (h) { return '<option' + (h === cur ? ' selected' : '') + '>' + h + '</option>'; }).join(''); };
      return field('adresse', 'Adresse', '12 rue Exemple', { auto: 'street-address' }) +
        '<div class="grid-cp">' + field('cp', 'Code postal', '59000', { mode: 'numeric', auto: 'postal-code' }) + field('ville', 'Ville', 'Lille', { auto: 'address-level2' }) + '</div>' +
        field('acces', 'Accès', 'Métro République, parking à 100 m, 2e étage') +
        group('Horaires d’ouverture', '<div class="days">' + YX.DAYS.map(function (label, i) {
          var j = J[i] || { on: false, open: '9h', close: '18h' };
          return '<div class="day' + (j.on ? ' is-on' : '') + '"><button type="button" class="day__name" data-day="' + i + '" aria-pressed="' + j.on + '"><i></i>' + label + '</button>' +
            (j.on ? '<span class="day__hours"><select data-day-open="' + i + '" aria-label="Ouverture ' + label + '">' + opt(j.open) + '</select><span>à</span><select data-day-close="' + i + '" aria-label="Fermeture ' + label + '">' + opt(j.close) + '</select></span>' : '<span class="day__off">Fermé</span>') + '</div>';
        }).join('') + '</div><button type="button" class="linkbtn" data-copy-hours>Appliquer les horaires du premier jour ouvert à tous les jours ouverts</button>', 'touchez un jour pour l’ouvrir ou le fermer') +
        '<div class="grid2">' + group('Consultations en visio', chips([['Oui', 'true'], ['Non', 'false']], function (x) { return String(d.visio) === x; }, 'data-bool-visio')) +
        group('Accès PMR', chips([['Oui', 'true'], ['Non', 'false']], function (x) { return String(d.pmr) === x; }, 'data-bool-pmr')) + '</div>';
    },
    function () {
      var d = S.d;
      return group('Vos séances', '<div class="tarifs"><div class="tarifs__head"><span>Type de séance</span><span>Durée</span><span>Prix</span></div>' +
        d.tarifs.map(function (r, i) {
          return '<div class="tarifs__row"><input data-tarif="' + i + '" data-k="type" value="' + esc(r.type) + '" placeholder="Séance individuelle" aria-label="Type de séance ' + (i + 1) + '"><input data-tarif="' + i + '" data-k="duree" value="' + esc(r.duree) + '" placeholder="50 min" aria-label="Durée"><input data-tarif="' + i + '" data-k="prix" value="' + esc(r.prix) + '" placeholder="60 €" aria-label="Prix"></div>';
        }).join('') + '</div><div class="row row--between"><p class="muted small">Laissez une ligne vide pour la masquer.</p>' + (d.tarifs.length < 6 ? '<button type="button" class="linkbtn" data-add-tarif>+ Ajouter une ligne</button>' : '') + '</div>') +
        group('Prise de rendez-vous', chips(['Doctolib', 'Autre plateforme', 'Téléphone'], function (x) { return d.rdvMode === x; }, 'data-set-rdvMode')) +
        (d.rdvMode !== 'Téléphone' ? field('rdvLien', 'Lien de réservation', 'https://www.doctolib.fr/…', { type: 'url' }) : '');
    },
    function () {
      var d = S.d;
      var cards = YX.STYLES.map(function (st) {
        var pl = YX.PAL[st.id][0], fn = YX.FONTS[st.id][0], on = d.style === st.id;
        var bg = st.dark ? 'linear-gradient(160deg,#6A7B80,#1B2124)' : pl[1], ink = st.dark ? '#FFFFFF' : pl[2];
        return '<button type="button" class="style-card' + (on ? ' is-on' : '') + '" data-style="' + st.id + '" aria-pressed="' + on + '">' +
          '<span class="style-card__art style-card__art--' + st.id + '" style="background:' + bg + ';color:' + ink + ';--a:' + pl[3] + '"><span style="font-family:' + fn[1] + ';font-weight:' + fn[3] + '">Aa</span><i></i></span>' +
          '<span class="style-card__text"><strong>' + st.name + '</strong><span>' + st.desc + '</span></span></button>';
      }).join('');
      var imm = d.style === 'immersif' ? '<div class="panel">' + group('Fond animé de la page d’accueil', chips(Object.keys(YX.FOND).map(function (k) { return [YX.FOND[k][0], k]; }), function (x) { return (d.fondMode || 'zoom') === x; }, 'data-set-fondMode') + '<p class="muted small">' + YX.FOND[d.fondMode || 'zoom'][1] + '</p>') +
        group('Voile sur l’image', chips([['Léger', 'leger'], ['Moyen', 'moyen'], ['Fort', 'fort']], function (x) { return (d.voile || 'moyen') === x; }, 'data-set-voile'), 'pour la lisibilité du texte') + '</div>' : '';
      return '<div class="style-grid">' + cards + '</div>' + imm +
        toggle(d.surMesure, 'Je veux une direction artistique sur mesure', 'Le style choisi sert seulement de repère. On construit ensemble un univers propre à votre pratique.', 'data-flip="surMesure"') +
        group('L’ambiance que vous imaginez', chips(['Apaisant', 'Lumineux', 'Chaleureux', 'Doux', 'Minimaliste', 'Élégant', 'Moderne', 'Intemporel', 'Nature', 'Poétique', 'Artistique', 'Audacieux', 'Coloré', 'Rassurant', 'Professionnel', 'Accueillant'], function (x) { return d.moods.indexOf(x) > -1; }, 'data-toggle-moods'), 'autant de mots que vous voulez') +
        group('Pistes à explorer', chips(['Mélanger plusieurs styles', 'Illustrations sur mesure', 'Logo / identité à créer', 'Photos ou textures de matières', 'Animations plus présentes', 'Mode sombre', 'Couleurs vives', 'Univers enfant / famille'], function (x) { return d.pistes.indexOf(x) > -1; }, 'data-toggle-pistes')) +
        field('envies', 'Vos envies et références', 'Un site, une marque, un film, un lieu, une matière, une couleur qui vous parle… Collez des liens si vous en avez.', { rows: 4 }) +
        field('eviter', 'Ce que vous ne voulez surtout pas', 'Trop médical, trop sombre, photos de banque d’images…', { rows: 2 });
    },
    function () {
      var d = S.d, m = YX.model(d, S.imgs);
      var pals = YX.PAL[m.style].map(function (pl, i) { var on = d.pal === i; return '<button type="button" class="pal' + (on ? ' is-on' : '') + '" data-pal="' + i + '" aria-pressed="' + on + '">' + swatches(pl) + '<span>' + pl[0] + '</span></button>'; }).join('');
      var extra = YX.EXTRA.map(function (pl, i) { var on = d.pal === 100 + i; return '<button type="button" class="pal pal--sm' + (on ? ' is-on' : '') + '" data-pal="' + (100 + i) + '" aria-pressed="' + on + '">' + swatches(pl) + '<span>' + pl[0] + '</span></button>'; }).join('');
      return '<div class="pal-grid">' + pals + '</div>' +
        group('Plus de palettes', '<div class="pal-grid pal-grid--3">' + extra + '</div>', 'utilisables avec tous les styles') +
        '<div class="panel">' + group('Couleurs personnalisées', '<p class="muted small">Votre couleur fétiche ou celles de votre logo. Elles remplacent celles de la palette.</p>' +
          '<div class="colorrow"><label class="colorpick"><input type="color" data-color="custom" value="' + (d.custom || m.t.accent) + '"><span><strong>Accent</strong><span>' + (d.custom ? d.custom.toUpperCase() : 'Accent de la palette') + '</span></span></label>' + (d.custom ? '<button type="button" class="linkbtn" data-clear="custom">Revenir à la palette</button>' : '') + '</div>' +
          '<div class="colorrow"><label class="colorpick"><input type="color" data-color="customBg" value="' + (d.customBg || m.t.bg) + '"><span><strong>Fond</strong><span>' + (d.customBg ? d.customBg.toUpperCase() : 'Fond de la palette') + '</span></span></label>' + (d.customBg ? '<button type="button" class="linkbtn" data-clear="customBg">Revenir à la palette</button>' : '') + '</div>' +
          '<p class="muted small">Avec un fond personnalisé, la couleur du texte s’ajuste automatiquement pour rester lisible.</p>') + '</div>';
    },
    function () {
      var d = S.d, style = YX.PAL[d.style] ? d.style : 'suisse';
      return '<div class="font-list">' + YX.FONTS[style].map(function (fn, i) {
        var on = d.font === i;
        return '<button type="button" class="font-card' + (on ? ' is-on' : '') + '" data-font="' + i + '" aria-pressed="' + on + '"><span class="font-card__aa" style="font-family:' + fn[1] + ';font-weight:' + fn[3] + '">Aa</span><span><span class="font-card__sample" style="font-family:' + fn[1] + ';font-weight:' + fn[3] + '">Prendre soin de soi</span><span class="font-card__name">' + fn[0] + '</span></span></button>';
      }).join('') + '</div>';
    },
    function () {
      var d = S.d;
      var defs = [['portrait', 'Portrait', 'Photo de vous, lumineuse, cadrage buste'], ['cabinet', 'Cabinet ou ambiance', 'Votre cabinet, un détail, une lumière'], ['logo', 'Logo', 'PNG ou SVG, fond transparent de préférence']];
      if (d.style === 'immersif') defs.push(['fond1', 'Image de fond 1', 'Plein écran, format paysage, sans texte'], ['fond2', 'Image de fond 2', 'Pour le diaporama'], ['fond3', 'Image de fond 3', 'Pour le diaporama']);
      return group('Vos photos aujourd’hui', chips(["J'ai des photos professionnelles", 'Je vais en faire faire', "Photos d'ambiance (banque d'images)", 'Pas de photo : un design typographique'], function (x) { return d.photoStatus === x; }, 'data-photo-status', { cls: 'chips--stack' })) +
        group('Déposer vos images', '<div class="uploads">' + defs.map(function (u) {
          var has = !!S.imgs[u[0]];
          return '<div class="upload' + (has ? ' has-img' : '') + '" data-drop="' + u[0] + '"><span class="upload__thumb' + (u[0] === 'logo' ? ' upload__thumb--contain' : '') + '"' + (has ? ' style="background-image:url(' + S.imgs[u[0]] + ')"' : '') + '>' + (has ? '' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>') + '</span>' +
            '<span class="upload__text"><strong>' + u[1] + '</strong><span>' + esc(S.names[u[0]] || u[2]) + '</span></span>' +
            (has ? '<button type="button" class="linkbtn" data-remove-img="' + u[0] + '">Retirer</button>' : '') +
            '<label class="btn btn--ghost btn--sm">' + (has ? 'Changer' : 'Choisir') + '<input type="file" accept="image/*" data-img="' + u[0] + '" hidden></label></div>';
        }).join('') + '</div>', 'glissez-déposez ou choisissez un fichier') +
        (S.imgWarn ? '<p class="alert">Images trop lourdes pour être mémorisées : elles restent visibles pendant cette session, mais pensez à les joindre à l’e-mail.</p>' : '') +
        '<p class="muted small">Les images sont réduites pour l’aperçu. Joignez les versions originales en haute définition à l’e-mail final.</p>';
    },
    function () {
      var d = S.d;
      return chips(YX.PAGES, function (x) { return x === 'Accueil' || x === 'Mentions légales' || d.pages.indexOf(x) > -1; }, 'data-toggle-pages', { locked: function (x) { return x === 'Accueil' || x === 'Mentions légales'; }, cls: 'chips--lg' }) +
        '<p class="muted small">L’accueil et les mentions légales sont toujours inclus.</p>';
    },
    function () {
      var d = S.d, fs = d.feats, groups = {};
      YX.FEATS.forEach(function (x) { (groups[x[3]] = groups[x[3]] || []).push(x); });
      return Object.keys(groups).map(function (g) {
        return group(g, '<div class="toggles">' + groups[g].map(function (x) {
          var on = fs.indexOf(x[0]) > -1;
          var sub = x[0] === 'questionnaires' && on ? '<div class="subpanel">' +
            group('Questionnaires proposés', chips(YX.QUEST.map(function (q) { return [q[0] === 'Pré-consultation' || q[0] === 'Suivi' ? q[0] : q[1] + ' · ' + q[0], q[0]]; }), function (k) { return d.quests.indexOf(k) > -1; }, 'data-toggle-quests')) +
            field('questPerso', 'Vos propres questionnaires', 'Bilan de couple, questionnaire d’accueil enfant…', { rows: 3, hint: 'un par ligne' }) +
            group('Les résultats sont', chips(['Envoyés au psychologue', 'Affichés au patient', 'Les deux'], function (k) { return d.questRes === k; }, 'data-set-questRes')) +
            '<p class="muted small">Les réponses sont chiffrées et hébergées chez un hébergeur de données de santé. Les échelles d’auto-évaluation restent indicatives.</p></div>' : '';
          return toggle(on, x[1], x[2], 'data-feat="' + x[0] + '"') + sub;
        }).join('') + '</div>');
      }).join('');
    },
    function () {
      var d = S.d, m = YX.model(d, S.imgs);
      var pubs = (d.publics.length ? d.publics : ['Adultes']).map(function (x) { return x.toLowerCase(); });
      var intros = YX.intros(d.ton !== 'tu', pubs.length > 1 ? pubs.slice(0, -1).join(', ') + ' et ' + pubs[pubs.length - 1] : pubs[0], d.visio);
      return group('S’adresser aux patients', chips([['Vouvoiement', 'vous'], ['Tutoiement', 'tu']], function (x) { return d.ton === x; }, 'data-set-ton')) +
        group('Registre', '<div class="reg-list">' + [['chaleureux', 'Chaleureux'], ['sobre', 'Sobre'], ['dynamique', 'Dynamique']].map(function (r) {
          var on = d.registre === r[0];
          return '<button type="button" class="reg' + (on ? ' is-on' : '') + '" data-set-registre="' + r[0] + '" aria-pressed="' + on + '"><strong>' + r[1] + '</strong><span>« ' + esc(intros[r[0]]) + ' »</span></button>';
        }).join('') + '</div>') +
        field('motsCles', 'Mots, valeurs ou phrases à faire passer', 'Bienveillance, pas de jugement, concret…', { rows: 3 }) +
        field('remarques', 'Autres remarques', 'Un site que vous aimez, une contrainte, une date de lancement…', { rows: 3 });
    },
    function () {
      var r = recap();
      return '<div class="note note--dark"><p class="note__title">Ceci est un aperçu de votre page d’accueil</p><p>Les autres pages de votre site (' + esc(r.autresPages) + ') seront conçues une fois la commande validée, dans le même style.</p></div>' +
        '<dl class="recap">' + r.rows.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]).replace(/\n/g, '<br>') + '</dd></div>'; }).join('') + '</dl>' +
        (r.imgNames.length ? '<p class="alert"><strong>N’oubliez pas vos images.</strong> L’e-mail ne peut pas les joindre automatiquement : ajoutez-les en pièces jointes (' + esc(r.imgNames.join(', ')) + ').</p>' : '') +
        '<div class="send"><a class="btn btn--primary btn--lg" href="' + esc(r.mailto) + '">Envoyer par e-mail <span aria-hidden="true">→</span></a><button type="button" class="btn btn--ghost btn--lg" data-copy>Copier le résumé</button><button type="button" class="btn btn--ghost btn--lg" data-download>Télécharger (.txt)</button></div>' +
        '<p class="muted small">Votre messagerie s’ouvre avec le résumé prêt à envoyer à ' + esc(YX.EMAIL) + '. Si rien ne s’ouvre, copiez le résumé et collez-le dans un message.</p>' +
        '<button type="button" class="linkbtn linkbtn--danger" data-reset>' + (S.confirmReset ? 'Confirmer : tout effacer' : 'Recommencer à zéro') + '</button>';
    }
  ];

  /* --- Récapitulatif et e-mail ------------------------------------------- */
  function recap() {
    var d = S.d, m = YX.model(d, S.imgs), v = m.v, fs = d.feats;
    var or = function (x) { return (x || '').trim() || '—'; };
    var full = ((d.prenom || '') + ' ' + (d.nom || '')).trim();
    var imgNames = Object.keys(S.imgs).map(function (k) { return { portrait: 'portrait', cabinet: 'photo du cabinet', logo: 'logo', fond1: 'image de fond 1', fond2: 'image de fond 2', fond3: 'image de fond 3' }[k] + (S.names[k] ? ' « ' + S.names[k] + ' »' : ''); });
    var styleName = (YX.STYLES.filter(function (x) { return x.id === m.style; })[0] || {}).name;
    var rows = [
      ['Nom', or(full)],
      ['Titre', or(d.titre) + (d.approche ? ' · ' + d.approche : '')],
      ['ADELI / RPPS', or(d.adeli)],
      ['Contact', [d.telephone, d.email].filter(Boolean).join(' · ') || '—'],
      ['Public', d.publics.join(', ') || '—'],
      ['Motifs', d.motifs.join(', ') || '—'],
      ['Adresse', [d.adresse, [d.cp, d.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '—'],
      ['Accès', or(d.acces) + (d.pmr ? ' · accessible PMR' : '')],
      ['Horaires', YX.horairesText(d.jours) || 'Aucun jour ouvert'],
      ['Visio', d.visio ? 'Oui' : 'Non'],
      ['Tarifs', m.p.tarifs.map(function (r) { return r.type + ' · ' + r.duree + ' · ' + r.prix; }).join('\n') || '—'],
      ['Rendez-vous', d.rdvMode + (d.rdvLien ? ' · ' + d.rdvLien : '')],
      ['Style', styleName + (d.surMesure ? ' · point de départ, DA sur mesure souhaitée' : '')],
      m.style === 'immersif' ? ['Fond accueil', YX.FOND[d.fondMode || 'zoom'][0] + ' · voile ' + ({ leger: 'léger', moyen: 'moyen', fort: 'fort' }[d.voile || 'moyen'])] : null,
      ['Ambiance', d.moods.join(', ') || '—'],
      ['Pistes DA', d.pistes.join(', ') || '—'],
      ['Envies', or(d.envies)],
      ['À éviter', or(d.eviter)],
      ['Palette', m.pal[0] + (d.custom ? ' · accent perso ' + d.custom.toUpperCase() : '') + (d.customBg ? ' · fond perso ' + d.customBg.toUpperCase() : '')],
      ['Typographie', m.font[0]],
      ['Photos', or(d.photoStatus) + (imgNames.length ? '\nDéposées : ' + imgNames.join(', ') : '')],
      ['Pages', YX.PAGES.filter(function (x) { return x === 'Accueil' || x === 'Mentions légales' || d.pages.indexOf(x) > -1; }).join(', ')],
      ['Fonctions', YX.FEATS.filter(function (x) { return fs.indexOf(x[0]) > -1; }).map(function (x) { return x[1]; }).join(', ') || '—'],
      fs.indexOf('questionnaires') > -1 ? ['Questionnaires', (d.quests.join(', ') || '—') + ((d.questPerso || '').trim() ? '\nPerso : ' + d.questPerso.trim().split('\n').join(', ') : '') + '\nRésultats : ' + d.questRes] : null,
      ['Ton', (v ? 'Vouvoiement' : 'Tutoiement') + ' · ' + d.registre],
      ['Mots-clés', or(d.motsCles)],
      ['Remarques', or(d.remarques)]
    ].filter(Boolean);
    var subject = 'Demande de site – ' + (full || 'nouveau client');
    var summary = subject + '\n\n' + rows.map(function (r) { return r[0] + ' : ' + r[1].replace(/\n/g, ' / '); }).join('\n') + (imgNames.length ? '\n\nImages jointes à ce message : ' + imgNames.join(', ') : '');
    return {
      rows: rows, imgNames: imgNames, summary: summary, subject: subject,
      mailto: 'mailto:' + YX.EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(summary),
      autresPages: YX.PAGES.filter(function (x) { return x !== 'Accueil' && (x === 'Mentions légales' || d.pages.indexOf(x) > -1); }).join(', ')
    };
  }

  /* --- Rendu du formulaire ----------------------------------------------- */
  var panel = $('[data-panel]'), body = $('[data-body]');
  function renderForm(stepChanged) {
    var st = YX.STEPS[S.step];
    var scroll = panel.scrollTop;
    $('[data-step-count]').textContent = S.step === 0 ? 'Configurateur de site' : 'Étape ' + S.step + ' sur ' + LAST;
    $('[data-progress]').style.transform = 'scaleX(' + (S.step / LAST) + ')';
    $$('[data-goto]').forEach(function (b, i) {
      b.classList.toggle('is-current', i === S.step);
      b.classList.toggle('is-done', i < S.step);
      if (i === S.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    var html = '<header class="step-head"><p class="step-kicker">' + (S.step === 0 ? 'Bienvenue' : String(S.step).padStart(2, '0') + ' · ' + st[0]) + '</p><h1 class="step-title">' + st[1] + '</h1><p class="step-intro">' + st[2] + '</p></header><div class="step-body">' + STEP_HTML[S.step]() + '</div>';
    body.innerHTML = html;
    $('[data-prev]').disabled = S.step === 0;
    var next = $('[data-next]');
    next.hidden = S.step === 0 || S.step === LAST;
    next.innerHTML = (S.step === LAST - 1 ? 'Voir le récapitulatif' : 'Suivant') + ' <span aria-hidden="true">→</span>';
    if (stepChanged) {
      panel.scrollTop = 0;
      if (panel.scrollHeight <= panel.clientHeight + 1) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (!reduce) body.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      var h = $('.step-title', body); if (h && document.activeElement && document.activeElement.closest && !document.activeElement.closest('.stepper')) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    } else panel.scrollTop = scroll;
  }

  function go(n) {
    n = Math.max(0, Math.min(LAST, n));
    if (n === S.step) return;
    S.step = n; S.confirmReset = false;
    persist();
    renderForm(true);
    scrollPreviewTo(YX.STEPS[n][3]);
  }

  /* --- Aperçu ------------------------------------------------------------ */
  var pvRoot = $('[data-pv]'), pvScroll = $('[data-preview]'), pvFrame = $('[data-frame]');
  var raf = 0, imgVarsKey = '';
  function schedulePreview() { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderPreview); }
  function renderPreview() {
    var m = YX.model(S.d, S.imgs);
    var vars = YX.themeVars(m);
    Object.keys(vars).forEach(function (k) { pvRoot.style.setProperty(k, vars[k]); });
    /* Les images passent par des variables CSS : posées une seule fois par changement */
    var key = Object.keys(S.imgs).map(function (k) { return k + S.imgs[k].length; }).join('|') + m.style;
    if (key !== imgVarsKey) {
      imgVarsKey = key;
      ['logo', 'portrait', 'hero', 'fond0', 'fond1', 'fond2'].forEach(function (k) { pvRoot.style.removeProperty('--img-' + k); });
      if (m.img.logo) pvRoot.style.setProperty('--img-logo', 'url(' + m.img.logo + ')');
      if (m.img.portrait) pvRoot.style.setProperty('--img-portrait', 'url(' + m.img.portrait + ')');
      if (m.img.hero) pvRoot.style.setProperty('--img-hero', 'url(' + m.img.hero + ')');
      m.fondUrls.forEach(function (u, i) { pvRoot.style.setProperty('--img-fond' + i, 'url(' + u + ')'); });
    }
    /* Horloge commune : les animations reprennent là où elles en étaient */
    pvRoot.style.setProperty('--t', (-performance.now() / 1000).toFixed(2) + 's');
    pvRoot.setAttribute('data-style', m.style);
    pvRoot.innerHTML = YX.renderPreview(m);
    $('[data-url]').textContent = m.p.url;
    fit();
    onPreviewScroll();
  }
  function fit() {
    var w = S.device === 'mobile' ? 390 : 1280;
    var avail = pvScroll.clientWidth;
    var z = Math.min(1, avail / w);
    pvRoot.style.width = w + 'px';
    pvRoot.style.zoom = z;
  }
  function scrollPreviewTo(sec) {
    var target = sec === 'top' ? null : pvRoot.querySelector('[data-sec="' + sec + '"]');
    var top = 0;
    if (target) {
      var z = parseFloat(pvRoot.style.zoom) || 1;
      top = (target.getBoundingClientRect().top - pvScroll.getBoundingClientRect().top) + pvScroll.scrollTop - 16 * z;
    }
    pvScroll.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }
  function onPreviewScroll() {
    var para = pvRoot.querySelector('[data-parallax]');
    if (para) { var z = parseFloat(pvRoot.style.zoom) || 1; para.style.transform = 'translateY(' + Math.round(pvScroll.scrollTop / z * 0.4) + 'px)'; }
  }
  pvScroll.addEventListener('scroll', onPreviewScroll, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(pvScroll);
  else window.addEventListener('resize', fit);

  function setDevice(dev) {
    S.device = dev;
    $$('[data-device]').forEach(function (b) { var on = b.getAttribute('data-device') === dev; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    transition(function () { pvFrame.setAttribute('data-device', dev); fit(); });
  }

  /* --- Images : réduction côté navigateur avant mémorisation ------------- */
  function loadImg(key, file) {
    if (!file || !/^image\//.test(file.type)) return;
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = key === 'logo' ? 500 : /^fond/.test(key) ? 1600 : 1100, s = Math.min(1, max / Math.max(im.width, im.height));
        var cv = document.createElement('canvas');
        cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        S.imgs[key] = key === 'logo' ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.8);
        S.names[key] = file.name;
        persistImgs(); renderForm(false); renderPreview(); scrollPreviewTo('hero');
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }

  /* --- Événements -------------------------------------------------------- */
  body.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-field')) { var p = {}; p[t.getAttribute('data-field')] = t.value; upd(p); }
    else if (t.hasAttribute('data-tarif')) {
      var arr = S.d.tarifs.map(function (x) { return Object.assign({}, x); });
      arr[+t.getAttribute('data-tarif')][t.getAttribute('data-k')] = t.value; upd({ tarifs: arr });
    }
    else if (t.hasAttribute('data-color')) { var c = {}; c[t.getAttribute('data-color')] = t.value; upd(c); var lab = t.parentNode.querySelector('span span'); if (lab) lab.textContent = t.value.toUpperCase(); }
  });
  body.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-color')) renderForm(false);
    if (t.hasAttribute('data-img')) loadImg(t.getAttribute('data-img'), t.files && t.files[0]);
    var di = t.getAttribute('data-day-open') || t.getAttribute('data-day-close');
    if (di != null) {
      var J = S.d.jours.map(function (x) { return Object.assign({}, x); });
      J[+di][t.hasAttribute('data-day-open') ? 'open' : 'close'] = t.value; upd({ jours: J });
    }
  });
  body.addEventListener('click', function (e) {
    var b = e.target.closest('button, [data-go]'); if (!b) return;
    var a = function (n) { return b.getAttribute(n); };
    var m;
    if (a('data-go') != null) return go(+a('data-go'));
    ['publics', 'motifs', 'moods', 'pistes', 'pages', 'quests'].forEach(function (k) { if (a('data-toggle-' + k) != null) toggleIn(k, a('data-toggle-' + k)); });
    ['rdvMode', 'fondMode', 'voile', 'questRes', 'ton', 'registre'].forEach(function (k) { if (a('data-set-' + k) != null) { var p = {}; p[k] = a('data-set-' + k); upd(p, true); } });
    ['visio', 'pmr'].forEach(function (k) { if (a('data-bool-' + k) != null) { var p = {}; p[k] = a('data-bool-' + k) === 'true'; upd(p, true); } });
    if (a('data-photo-status') != null) { var ps = a('data-photo-status'); upd({ photoStatus: S.d.photoStatus === ps ? '' : ps }, true); }
    if (a('data-style')) { upd({ style: a('data-style'), pal: S.d.pal >= 100 ? S.d.pal : 0, font: 0 }, true); scrollPreviewTo('top'); }
    if (a('data-pal') != null) upd({ pal: +a('data-pal'), custom: '' }, true);
    if (a('data-font') != null) upd({ font: +a('data-font') }, true);
    if (a('data-flip')) { var f = {}; f[a('data-flip')] = !S.d[a('data-flip')]; upd(f, true); }
    if (a('data-clear')) { var c = {}; c[a('data-clear')] = ''; upd(c, true); }
    if (a('data-feat')) {
      var k = a('data-feat'), was = S.d.feats.indexOf(k) > -1;
      toggleIn('feats', k);
      if (!was) setTimeout(function () { scrollPreviewTo(k === 'questionnaires' ? 'quest' : 'motifs'); }, 60);
    }
    if (a('data-day') != null) { var J = S.d.jours.map(function (x) { return Object.assign({}, x); }); var i = +a('data-day'); J[i].on = !J[i].on; upd({ jours: J }, true); }
    if (a('data-copy-hours') != null) { var src = S.d.jours.filter(function (x) { return x.on; })[0]; if (src) upd({ jours: S.d.jours.map(function (x) { return x.on ? Object.assign({}, x, { open: src.open, close: src.close }) : x; }) }, true); }
    if (a('data-add-tarif') != null) { upd({ tarifs: S.d.tarifs.concat([{ type: '', duree: '', prix: '' }]) }, true); }
    if (a('data-remove-img')) { delete S.imgs[a('data-remove-img')]; delete S.names[a('data-remove-img')]; persistImgs(); renderForm(false); renderPreview(); }
    if (a('data-copy') != null) {
      m = recap().summary;
      var done = function () { b.textContent = 'Résumé copié ✓'; setTimeout(function () { b.textContent = 'Copier le résumé'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(m).then(done, function () {});
    }
    if (a('data-download') != null) {
      var r = recap();
      var blob = new Blob([r.summary], { type: 'text/plain;charset=utf-8' });
      var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = r.subject.replace(/[^\w\- àâäçéèêëîïôöùûüÿœæ]/gi, '') + '.txt';
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    }
    if (a('data-reset') != null) {
      if (!S.confirmReset) { S.confirmReset = true; return renderForm(false); }
      S.d = YX.def(); S.imgs = {}; S.names = {}; S.step = 0; S.confirmReset = false;
      persist(); persistImgs(); loadFonts(); renderForm(true); renderPreview(); scrollPreviewTo('top');
    }
  });
  /* Glisser-déposer des images */
  body.addEventListener('dragover', function (e) { var z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('is-drag'); } });
  body.addEventListener('dragleave', function (e) { var z = e.target.closest('[data-drop]'); if (z) z.classList.remove('is-drag'); });
  body.addEventListener('drop', function (e) { var z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('is-drag'); loadImg(z.getAttribute('data-drop'), e.dataTransfer.files[0]); });

  $('[data-prev]').addEventListener('click', function () { go(S.step - 1); });
  $('[data-next]').addEventListener('click', function () { go(S.step + 1); });
  $$('[data-goto]').forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  $$('[data-device]').forEach(function (b) { b.addEventListener('click', function () { setDevice(b.getAttribute('data-device')); }); });

  /* Mobile : aperçu en plein écran */
  var app = $('.app');
  var autoMobile = false;
  $$('[data-show-preview]').forEach(function (b) { b.addEventListener('click', function () {
    if (!autoMobile && window.innerWidth < 600) { autoMobile = true; S.device = 'mobile'; $$('[data-device]').forEach(function (x) { var on = x.getAttribute('data-device') === 'mobile'; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); }); pvFrame.setAttribute('data-device', 'mobile'); }
    transition(function () { app.classList.add('is-preview'); fit(); });
    scrollPreviewTo(YX.STEPS[S.step][3]);
  }); });
  $$('[data-hide-preview]').forEach(function (b) { b.addEventListener('click', function () { transition(function () { app.classList.remove('is-preview'); }); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && app.classList.contains('is-preview')) app.classList.remove('is-preview');
  });

  /* --- Démarrage --------------------------------------------------------- */
  loadFonts();
  renderForm(false);
  renderPreview();
  requestAnimationFrame(function () { document.documentElement.classList.add('is-ready'); });
})();

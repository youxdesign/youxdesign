/* ==========================================================================
   youXdesign · Configurateur
   Aperçu en direct : calcule le thème à partir des réponses, puis génère
   le HTML de la page d'accueil dans le style choisi.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Couleurs ----------------------------------------------------------- */
  function hx(h) { h = (h || '#000000').replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function mix(a, b, t) { var A = hx(a), B = hx(b); return '#' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0'); }).join(''); }
  function lum(h) { var c = hx(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function onColor(bg) { var L = lum(bg); return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.05) ? '#FFFFFF' : '#111111'; }
  YX.color = { mix: mix, lum: lum, onColor: onColor };

  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  YX.esc = esc;

  /* Horaires « Lundi – vendredi : 9h – 20h » à partir des jours cochés */
  YX.horairesText = function (J) {
    J = J || []; var out = [], i = 0;
    while (i < 7) {
      var j = J[i];
      if (!j || !j.on) { i++; continue; }
      var k = i;
      while (k + 1 < 7 && J[k + 1] && J[k + 1].on && J[k + 1].open === j.open && J[k + 1].close === j.close) k++;
      var days = k === i ? YX.DAYS[i] : k === i + 1 ? YX.DAYS[i] + ' et ' + YX.DAYS[k].toLowerCase() : YX.DAYS[i] + ' – ' + YX.DAYS[k].toLowerCase();
      out.push(days + ' : ' + j.open + ' – ' + j.close);
      i = k + 1;
    }
    return out.join('\n');
  };

  /* --- Modèle : toutes les valeurs dérivées des réponses ----------------- */
  YX.model = function (d, imgs) {
    var v = d.ton !== 'tu';
    var val = function (k) { return (d[k] || '').trim() || YX.EX[k]; };
    var style = YX.PAL[d.style] ? d.style : 'suisse';
    var pal = d.pal >= 100 ? (YX.EXTRA[d.pal - 100] || YX.PAL[style][0]) : (YX.PAL[style][d.pal] || YX.PAL[style][0]);
    var font = YX.FONTS[style][d.font] || YX.FONTS[style][0];
    var accent = d.custom || pal[3];
    var bg = pal[1], ink = pal[2], soft = pal[4], muted = pal[5];
    if (d.customBg) { bg = d.customBg; ink = lum(bg) < 0.18 ? '#F3EFE8' : '#1C1A18'; muted = mix(bg, ink, 0.7); soft = mix(bg, accent, 0.2); }
    var t = {
      bg: bg, ink: ink, accent: accent, soft: soft, muted: muted,
      tint: mix(bg, ink, 0.06), line: mix(bg, ink, 0.14),
      h: font[1], b: font[2] || font[1], hw: font[3],
      accentInk: onColor(accent), softInk: onColor(soft) === '#FFFFFF' ? '#FFFFFF' : ink
    };

    var prenom = val('prenom'), ville = val('ville'), titre = val('titre');
    var nom = prenom + ' ' + val('nom');
    var publics = (d.publics && d.publics.length ? d.publics : ['Adultes']).map(function (x) { return x.toLowerCase(); });
    var publicStr = publics.length > 1 ? publics.slice(0, -1).join(', ') + ' et ' + publics[publics.length - 1] : publics[0];
    var horairesStr = YX.horairesText(d.jours);
    var horaires = (horairesStr || 'Sur rendez-vous').split('\n').filter(Boolean);
    var tarifs = (d.tarifs || []).filter(function (r) { return (r.type || '').trim(); });
    var adresseComplete = val('adresse') + ', ' + val('cp') + ' ' + ville;
    var slug = (prenom + '-' + val('nom') + '-psychologue').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var p = {
      nom: nom, prenom: prenom, titre: titre, ville: ville, approche: val('approche'), adeli: val('adeli'),
      telephone: val('telephone'), email: val('email'), acces: val('acces'), adresseComplete: adresseComplete,
      horaires: horaires, horaire0: horaires[0] || 'Sur rendez-vous', tarifs: tarifs, visio: !!d.visio, pmr: !!d.pmr,
      lieu: val('adresse') + ', ' + ville + (d.visio ? ' · visio' : ''), lieuCourt: ville + (d.visio ? ' & visio' : ''),
      publicCap: publicStr.charAt(0).toUpperCase() + publicStr.slice(1),
      tagLieu: 'Cabinet à ' + ville + (d.visio ? ' & visio' : ''),
      initiales: (prenom[0] || '') + (val('nom')[0] || ''),
      url: slug + '.fr',
      tarif0: tarifs[0] ? tarifs[0].duree + ' · ' + tarifs[0].prix : '',
      badges: ['Au cabinet'].concat(d.visio ? ['En visio'] : []).concat(publics.slice(0, 2).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); })),
      checks: [titre + ', ADELI ' + val('adeli')].concat(d.pmr ? ['Cabinet accessible aux personnes à mobilité réduite'] : []).concat(d.rdvMode !== 'Téléphone' ? ['Réservation en ligne à toute heure'] : ['Réponse rapide par téléphone'])
    };

    var reg = d.registre || 'chaleureux';
    var H1 = {
      suisse: { chaleureux: 'Aller mieux, pas à pas', sobre: 'Comprendre, agir, aller mieux', dynamique: 'Reprendre la main' },
      terre: { chaleureux: 'Un lieu chaleureux pour déposer ce qui pèse', sobre: 'Un accompagnement psychologique à ' + ville, dynamique: "Retrouver de l'élan, à " + (v ? 'votre' : 'ton') + ' rythme' },
      wabi: { chaleureux: "Prendre le temps de comprendre, puis d'avancer.", sobre: 'Consultations de psychologie, au calme.', dynamique: 'Un premier pas suffit.' },
      sante: { chaleureux: 'Un soutien psychologique bienveillant, à ' + ville + (d.visio ? ' ou en visio' : ''), sobre: titre + ' à ' + ville + ', au cabinet' + (d.visio ? ' ou en visio' : ''), dynamique: 'Des outils concrets pour aller mieux, dès la première séance' },
      immersif: { chaleureux: 'Retrouver de la clarté, pas à pas', sobre: 'Psychologue à ' + ville + (d.visio ? ' et en visio' : ''), dynamique: 'Reprendre sa vie en main' },
      editorial: { chaleureux: 'Parler, comprendre, se sentir mieux', sobre: 'Consultations de psychologie à ' + ville, dynamique: 'Des outils concrets pour changer ce qui pèse' },
      pastel: { chaleureux: 'Un espace doux pour aller mieux', sobre: 'Psychologue pour ' + publicStr + ' à ' + ville, dynamique: 'Avancer à ' + (v ? 'votre' : 'ton') + ' rythme, avec des outils concrets' },
      nocturne: { chaleureux: 'Un espace calme pour déposer ce qui pèse', sobre: 'Consultations de psychologie, en toute discrétion', dynamique: 'Le premier pas est souvent le plus important' }
    };
    var INTRO = YX.intros(v, publicStr, d.visio);
    var copy = {
      h1: H1[style][reg], intro: 'Je suis ' + prenom + ', ' + titre.toLowerCase() + '. ' + INTRO[reg],
      cta: d.rdvMode === 'Téléphone' ? 'Appeler le cabinet' : 'Prendre rendez-vous',
      ctaCourt: d.rdvMode === 'Téléphone' ? 'Appeler' : 'Rendez-vous',
      motifsTitre: reg === 'sobre' ? 'Motifs de consultation' : (v ? 'Ce qui peut vous amener' : "Ce qui peut t'amener"),
      motifsIntro: v ? "Votre situation n'y figure pas ? Parlons-en lors d'un premier échange." : "Ta situation n'y figure pas ? Parlons-en lors d'un premier échange.",
      respiration: v ? "Suivez le cercle : inspirez quand il s'ouvre, expirez quand il se referme. Un des premiers outils que l'on apprend en séance." : "Suis le cercle : inspire quand il s'ouvre, expire quand il se referme. Un des premiers outils que l'on apprend en séance.",
      ctaTitre: { suisse: 'Prendre rendez-vous', terre: "Prenons le temps d'en parler", wabi: "Quand le moment sera venu, il suffit d'un premier pas.", sante: v ? 'Réservez votre première séance' : 'Réserve ta première séance', immersif: 'Faire le premier pas', editorial: 'Prendre rendez-vous', pastel: 'Parlons-en', nocturne: 'Le premier pas commence ici' }[style],
      rappel: v ? 'Ou laissez vos coordonnées, je vous rappelle.' : 'Ou laisse tes coordonnées, je te rappelle.',
      questTitre: v ? 'Faire le point sur votre situation' : 'Faire le point sur ta situation',
      questIntro: 'Quelques questionnaires courts, à remplir en ligne avant ou entre les séances. ' + ({ 'Envoyés au psychologue': 'Les réponses me sont transmises de façon confidentielle.', 'Affichés au patient': v ? 'Vous obtenez un résultat indicatif à la fin.' : 'Tu obtiens un résultat indicatif à la fin.', 'Les deux': v ? 'Vous obtenez un résultat indicatif et les réponses me sont transmises.' : 'Tu obtiens un résultat indicatif et les réponses me sont transmises.' }[d.questRes] || '')
    };

    var nums = { suisse: ['1', '2', '3', '4'], terre: ['1', '2', '3', '4'], wabi: ['i', 'ii', 'iii', 'iv'], sante: ['01', '02', '03', '04'], immersif: ['01', '02', '03', '04'], editorial: ['I', 'II', 'III', 'IV'], pastel: ['1', '2', '3', '4'], nocturne: ['01', '02', '03', '04'] }[style];
    var etapes = [
      ['Premier rendez-vous', v ? 'Vous exposez ce qui vous amène, à votre rythme.' : "Tu exposes ce qui t'amène, à ton rythme."],
      ['Comprendre', 'Nous repérons ensemble ce qui entretient la difficulté.'],
      ['Agir', v ? 'Des objectifs clairs et des exercices adaptés à votre quotidien.' : 'Des objectifs clairs et des exercices adaptés à ton quotidien.'],
      ['Faire le point', 'Des bilans réguliers pour mesurer les progrès.']
    ].map(function (e, i) { return { n: nums[i], t: e[0], d: e[1] }; });
    var motifs = (d.motifs && d.motifs.length ? d.motifs : ['Anxiété', 'Stress et burn-out', 'Sommeil', 'Estime de soi']).map(function (m) { return { t: m, d: YX.MOTIFS[m] || '' }; });
    var faq = [
      ['Les séances sont-elles remboursées ?', "Les séances ne sont pas prises en charge par l'Assurance maladie. De nombreuses mutuelles proposent un forfait : une facture " + (v ? 'vous' : 'te') + ' est remise à chaque séance.'],
      ['Combien de séances faut-il prévoir ?'],
      [d.visio ? 'Les séances en visio sont-elles possibles ?' : 'Faut-il préparer la première séance ?'],
      ['Ce qui est dit reste-t-il confidentiel ?']
    ];

    var fs = d.feats || [];
    var f = {}; YX.FEATS.forEach(function (x) { f[x[0]] = fs.indexOf(x[0]) > -1; });
    f.utilBar = f.accessibilite || f.multilingue;

    var showPhoto = d.photoStatus !== 'Pas de photo : un design typographique';
    var heroSrc = ['suisse', 'editorial', 'pastel'].indexOf(style) > -1 ? (imgs.portrait || imgs.cabinet) : (imgs.cabinet || imgs.portrait);
    var img = { show: showPhoto, logo: imgs.logo || '', hero: heroSrc || '', portrait: imgs.portrait || '' };

    var fondUrls = ['fond1', 'fond2', 'fond3'].map(function (k) { return imgs[k]; }).filter(Boolean);
    if (!fondUrls.length && imgs.cabinet) fondUrls.push(imgs.cabinet);

    var qs = d.quests || [];
    var qSel = YX.QUEST.filter(function (q) { return qs.indexOf(q[0]) > -1; });
    var quests = qSel.map(function (q) { return { t: q[0] === 'Pré-consultation' || q[0] === 'Suivi' ? q[1] : q[1] + ' (' + q[0] + ')', d: q[2] }; })
      .concat((d.questPerso || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return { t: x, d: 'Questionnaire personnalisé' }; }));
    var qd = qSel[0] || YX.QUEST[4];
    var questDemo = { name: qd[1], n: (qd[2].match(/\d+/) || ['6'])[0], q: qd[3](v), opts: qd[4] };

    var nav = YX.PAGES.filter(function (x) { return x !== 'Accueil' && x !== 'Mentions légales' && (d.pages || []).indexOf(x) > -1; }).map(function (l) { return l.replace(' & tarifs', ''); });

    return { d: d, v: v, style: style, pal: pal, font: font, t: t, p: p, copy: copy, etapes: etapes, motifs: motifs, faq: faq, f: f, img: img, fondUrls: fondUrls, quests: quests, questDemo: questDemo, nav: nav };
  };

  YX.intros = function (v, publicStr, visio) {
    return {
      chaleureux: v ? 'Je vous accueille avec douceur et des outils concrets, pour avancer à votre rythme.' : "Je t'accueille avec douceur et des outils concrets, pour avancer à ton rythme.",
      sobre: 'Je reçois les ' + publicStr + ' au cabinet' + (visio ? ' et en visio' : '') + '. Les objectifs sont définis ensemble dès les premières séances.',
      dynamique: v ? 'Une méthode structurée et des exercices concrets, pour que vous constatiez vos progrès séance après séance.' : 'Une méthode structurée et des exercices concrets, pour que tu constates tes progrès séance après séance.'
    };
  };

  /* Variables CSS du thème, posées sur la racine de l'aperçu */
  YX.themeVars = function (m) {
    var t = m.t;
    return {
      '--bg': t.bg, '--ink': t.ink, '--accent': t.accent, '--soft': t.soft, '--muted': t.muted, '--tint': t.tint, '--line': t.line,
      '--h': t.h, '--b': t.b, '--hw': t.hw, '--accent-ink': t.accentInk, '--soft-ink': t.softInk,
      '--ink-accent': mix(t.ink, t.accent, 0.45), '--ink-deep': mix(t.ink, '#000000', 0.25),
      '--grad': 'linear-gradient(120deg,' + [t.ink, mix(t.ink, t.accent, 0.55), mix(t.ink, t.soft, 0.3), mix(t.ink, t.accent, 0.3), t.ink].join(',') + ')'
    };
  };

  /* --- Gabarits ----------------------------------------------------------- */
  var A = function (arr, fn) { return (arr || []).map(fn).join(''); };
  var navHtml = function (m) { return '<nav class="pv-nav">' + A(m.nav, function (n) { return '<span>' + esc(n) + '</span>'; }) + '</nav><span class="pv-burger" aria-hidden="true"><i></i><i></i></span>'; };
  var logo = function (m, fallback) { return m.img.logo ? '<span class="pv-logo" style="background-image:var(--img-logo)"></span>' : fallback; };
  var photo = function (m, label, cls) {
    if (!m.img.show) return '';
    return '<div class="pv-photo ' + (cls || '') + '">' + (m.img.hero ? '<div class="pv-photo__img" style="background-image:var(--img-hero)"></div>' : '<span class="pv-photo__ph">' + esc(label) + '</span>') + '</div>';
  };
  var statusBar = function (m) { return m.f.statut ? '<div class="pv-status"><span><i class="pv-dot"></i>Cabinet ouvert · jusqu’à 20h</span><span>' + esc(m.p.telephone) + '</span></div>' : ''; };

  var HERO = {
    suisse: function (m) {
      return statusBar(m) + '<header class="pv-header">' + logo(m, '<p class="pv-brand">' + esc(m.p.nom) + '</p>') +
        '<p class="pv-header__meta">' + esc(m.p.titre) + '<br>' + esc(m.p.approche) + ' · ' + esc(m.p.lieuCourt) + '</p>' + navHtml(m) +
        '<span class="pv-btn pv-btn--sm">' + esc(m.copy.ctaCourt) + ' ↗</span></header>' +
        '<section class="pv-hero"><h1 class="pv-h1">' + esc(m.copy.h1) + '<span class="pv-accent">.</span></h1>' +
        '<div class="pv-hero__cols"><dl class="pv-dl"><div><dt>Méthode</dt><dd>' + esc(m.p.approche) + '</dd></div><div><dt>Public</dt><dd>' + esc(m.p.publicCap) + '</dd></div><div><dt>Lieu</dt><dd>' + esc(m.p.lieu) + '</dd></div><div><dt>ADELI</dt><dd>' + esc(m.p.adeli) + '</dd></div></dl>' +
        '<div class="pv-stack"><p class="pv-lead">' + esc(m.copy.intro) + '</p><div class="pv-btns"><span class="pv-btn">' + esc(m.copy.cta) + ' →</span><span class="pv-btn pv-btn--ghost">Mon approche</span></div></div>' +
        photo(m, 'Votre portrait', 'pv-photo--suisse') + '</div></section>';
    },
    terre: function (m) {
      return statusBar(m) + '<header class="pv-header">' + logo(m, '<p class="pv-brand">' + esc(m.p.nom) + '</p>') + navHtml(m) + '<span class="pv-btn pv-btn--sm">' + esc(m.copy.cta) + '</span></header>' +
        '<section class="pv-hero' + (m.img.show ? ' pv-hero--split' : '') + '"><div class="pv-stack"><p class="pv-eyebrow">' + esc(m.p.tagLieu) + '</p><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p>' +
        '<div class="pv-btns"><span class="pv-btn">' + esc(m.copy.cta) + '</span><span class="pv-btn pv-btn--ghost">Faire connaissance</span></div></div>' +
        (m.img.show ? '<div class="pv-art"><div class="pv-blob pv-anim-morph" aria-hidden="true"></div><div class="pv-bubble pv-anim-float" aria-hidden="true"></div>' + photo(m, 'Photo du cabinet ou portrait', 'pv-photo--arch') + '</div>' : '') + '</section>';
    },
    wabi: function (m) {
      return statusBar(m) + '<header class="pv-header">' + logo(m, '<p class="pv-brand">' + esc(m.p.nom) + '</p>') + navHtml(m) + '</header>' +
        '<section class="pv-hero' + (m.img.show ? ' pv-hero--split' : '') + '"><p class="pv-vertical">' + esc(m.p.titre + ' · ' + m.p.ville + (m.p.visio ? ' · visio' : '')) + '</p><div class="pv-stack"><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p><span class="pv-textlink">' + esc(m.copy.cta) + ' —</span></div>' +
        (m.img.show ? '<div class="pv-art"><div class="pv-enso pv-anim-breathe" aria-hidden="true"></div>' + photo(m, 'une image forte', 'pv-photo--tall') + '</div>' : '') + '</section>';
    },
    sante: function (m) {
      var right = m.f.creneaux
        ? '<div class="pv-card pv-slots"><div class="pv-row"><h2 class="pv-h3">Prendre rendez-vous</h2><span class="pv-muted">' + esc(m.p.tarif0) + '</span></div>' + slotDays(m) + '<div class="pv-slots__grid">' + A(['09:00', '10:00', '11:00', '14:00', '15:30', '17:00', '18:30', '19:15'], function (h, i) { return '<span class="' + (i === 3 ? 'is-on' : '') + '">' + h + '</span>'; }) + '</div><span class="pv-btn pv-btn--block">' + esc(m.copy.cta) + ' →</span></div>'
        : '<div class="pv-card"><h2 class="pv-h3">Horaires du cabinet</h2>' + A(m.p.horaires, function (h) { return '<p>' + esc(h) + '</p>'; }) + '<p class="pv-muted">' + esc(m.p.adresseComplete) + '</p><span class="pv-btn pv-btn--block">' + esc(m.copy.cta) + ' →</span></div>';
      return statusBar(m) + '<header class="pv-header">' + logo(m, '<span class="pv-mono">' + esc(m.p.initiales) + '</span>') + '<div class="pv-brandblock"><p class="pv-brand">' + esc(m.p.nom) + '</p><p class="pv-muted">' + esc(m.p.titre) + ' · ' + esc(m.p.ville) + '</p></div>' + navHtml(m) + '<span class="pv-header__tel">' + esc(m.p.telephone) + '</span><span class="pv-btn pv-btn--sm">' + esc(m.copy.ctaCourt) + '</span></header>' +
        '<section class="pv-hero pv-hero--split"><div class="pv-stack"><div class="pv-badges">' + A(m.p.badges, function (b) { return '<span>' + esc(b) + '</span>'; }) + '</div><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p>' +
        '<ul class="pv-checks">' + A(m.p.checks, function (c) { return '<li><span>✓</span>' + esc(c) + '</li>'; }) + '</ul>' +
        (m.img.show ? '<div class="pv-person"><span class="pv-avatar"' + (m.img.portrait ? ' style="background-image:var(--img-portrait)"' : '') + '></span><div><p class="pv-strong">' + esc(m.p.nom) + '</p><p class="pv-muted">' + esc(m.p.titre) + ' · ' + esc(m.p.approche) + '</p></div></div>' : '') +
        '</div>' + right + '</section>';
    },
    immersif: function (m) {
      var fm = m.d.fondMode || 'zoom';
      var layers = m.fondUrls.length ? m.fondUrls.map(function (u, i) { return 'var(--img-fond' + i + ')'; }) : ['linear-gradient(150deg,var(--ink-accent),var(--ink-deep))', 'linear-gradient(200deg,' + mix(m.t.ink, m.t.soft, 0.3) + ',var(--ink))', 'linear-gradient(110deg,' + mix(m.t.ink, m.t.accent, 0.25) + ',' + mix(m.t.ink, m.t.soft, 0.15) + ')'];
      var n0 = layers.length; while (layers.length < 3) layers.push(layers[layers.length % n0]);
      var bgHtml;
      if (fm === 'degrade') bgHtml = '<div class="pv-imm__layer pv-imm__grad pv-anim-grad"></div>';
      else if (fm === 'diaporama') bgHtml = A(layers, function (l, i) { return '<div class="pv-imm__slide" style="--k:' + i + '"><div class="pv-imm__layer pv-anim-kb" style="background-image:' + l + '"></div></div>'; });
      else if (fm === 'parallaxe') bgHtml = '<div class="pv-imm__layer pv-imm__para" data-parallax style="background-image:' + layers[0] + '"></div>';
      else bgHtml = '<div class="pv-imm__layer pv-anim-kb" style="background-image:' + layers[0] + '"></div>';
      return '<div class="pv-imm" data-voile="' + esc(m.d.voile || 'moyen') + '"><div class="pv-imm__bg" aria-hidden="true">' + bgHtml + '<div class="pv-imm__veil"></div></div>' +
        '<header class="pv-header">' + logo(m, '<p class="pv-brand">' + esc(m.p.nom) + '</p>') + navHtml(m) + '<span class="pv-btn pv-btn--sm pv-btn--glass">' + esc(m.copy.cta) + '</span></header>' +
        (fm === 'video' ? '<span class="pv-videotag">▶ vidéo en boucle</span>' : '') +
        '<section class="pv-hero"><p class="pv-eyebrow">' + esc(m.p.titre) + ' · ' + esc(m.p.lieuCourt) + '</p><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p><div class="pv-btns"><span class="pv-btn">' + esc(m.copy.cta) + '</span><span class="pv-btn pv-btn--glass">Découvrir mon approche</span></div></section>' +
        '<div class="pv-imm__foot"><div><p>Approche</p><p>' + esc(m.p.approche) + '</p></div><div><p>Consultations</p><p>' + esc(m.p.lieu) + '</p></div><div><p>Horaires</p><p>' + esc(m.p.horaire0) + '</p></div>' +
        (fm === 'diaporama' ? '<div class="pv-imm__dots">' + A(layers, function (l, i) { return '<span style="--k:' + i + '"></span>'; }) + '</div>' : '<span class="pv-imm__scroll">Défiler ↓</span>') + '</div></div>';
    },
    editorial: function (m) {
      return statusBar(m) + '<header class="pv-header"><span class="pv-header__meta">' + esc(m.p.titre) + ' · ' + esc(m.p.ville) + '</span>' + navHtml(m) + '<span class="pv-textlink">' + esc(m.copy.cta) + ' →</span></header>' +
        '<div class="pv-masthead">' + logo(m, '<p class="pv-brand">' + esc(m.p.nom) + '</p>') + '</div>' +
        '<section class="pv-hero' + (m.img.show ? ' pv-hero--edito' : ' pv-hero--edito-noimg') + '"><dl class="pv-dl"><div><dt>Approche</dt><dd>' + esc(m.p.approche) + '</dd></div><div><dt>Public</dt><dd>' + esc(m.p.publicCap) + '</dd></div><div><dt>Cabinet</dt><dd>' + esc(m.p.adresseComplete) + '</dd></div><div><dt>Horaires</dt><dd>' + esc(m.p.horaire0) + '</dd></div></dl>' +
        '<div class="pv-stack"><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p><span class="pv-btn">' + esc(m.copy.cta) + '</span></div>' +
        (m.img.show ? '<figure class="pv-figure">' + photo(m, 'Votre portrait', 'pv-photo--tall') + '<figcaption>' + esc(m.p.nom) + ', au cabinet de ' + esc(m.p.ville) + '</figcaption></figure>' : '') + '</section>';
    },
    pastel: function (m) {
      return statusBar(m) + '<div class="pv-pastel-bg pv-anim-morph" aria-hidden="true"></div><header class="pv-header">' + logo(m, '<span class="pv-pill-brand"><span class="pv-mono">' + esc(m.p.initiales) + '</span>' + esc(m.p.nom) + '</span>') + navHtml(m) + '<span class="pv-btn pv-btn--sm">' + esc(m.copy.ctaCourt) + '</span></header>' +
        '<section class="pv-hero' + (m.img.show ? ' pv-hero--split' : '') + '"><div class="pv-stack"><p class="pv-hello">Bonjour, je suis ' + esc(m.p.prenom) + '</p><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p><div class="pv-btns"><span class="pv-btn">' + esc(m.copy.cta) + '</span><span class="pv-btn pv-btn--soft">Faire connaissance</span></div></div>' +
        (m.img.show ? '<div class="pv-art"><div class="pv-bubble pv-anim-float" aria-hidden="true"></div>' + photo(m, 'Votre portrait', 'pv-photo--round') + '<div class="pv-floatcard pv-anim-float"><strong>' + esc(m.p.tagLieu) + '</strong><span>' + esc(m.p.publicCap) + '</span></div></div>' : '') + '</section>';
    },
    nocturne: function (m) {
      return '<div class="pv-halo pv-anim-breathe" aria-hidden="true"></div>' + statusBar(m) + '<header class="pv-header">' + logo(m, '<p class="pv-brand">' + esc(m.p.nom) + '</p>') + navHtml(m) + '<span class="pv-btn pv-btn--sm pv-btn--ghost">' + esc(m.copy.ctaCourt) + '</span></header>' +
        '<section class="pv-hero pv-hero--center"><p class="pv-eyebrow">' + esc(m.p.titre) + ' · ' + esc(m.p.lieuCourt) + '</p><h1 class="pv-h1">' + esc(m.copy.h1) + '</h1><p class="pv-lead">' + esc(m.copy.intro) + '</p><div class="pv-btns"><span class="pv-btn">' + esc(m.copy.cta) + '</span><span class="pv-btn pv-btn--ghost">Mon approche</span></div></section>' +
        (m.img.show ? '<div class="pv-wide">' + photo(m, 'Photo du cabinet, lumière du soir', 'pv-photo--wide') + '</div>' : '');
    }
  };

  function slotDays() {
    var out = [], dd = new Date();
    while (out.length < 5) { dd.setDate(dd.getDate() + 1); if (dd.getDay() !== 0) out.push(new Date(dd)); }
    return '<div class="pv-slots__days">' + A(out, function (x, i) { return '<span class="' + (i === 0 ? 'is-on' : '') + '"><small>' + x.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small>' + x.getDate() + '</span>'; }) + '</div>';
  }

  function sections(m) {
    var f = m.f, p = m.p, c = m.copy, out = '';

    out += '<section class="pv-sec" data-sec="motifs"><div class="pv-sec__head"><h2 class="pv-h2">' + esc(c.motifsTitre) + '</h2><p class="pv-muted">' + esc(c.motifsIntro) + '</p></div>' +
      '<ul class="pv-motifs">' + A(m.motifs, function (x) { return '<li><span class="pv-strong">' + esc(x.t) + '</span><span class="pv-muted">' + esc(x.d) + '</span></li>'; }) + '</ul></section>';

    out += '<section class="pv-sec pv-sec--tint"><h2 class="pv-h2">Comment se passe l’accompagnement</h2><ol class="pv-steps">' +
      A(m.etapes, function (e) { return '<li><span class="pv-num">' + esc(e.n) + '</span><h3 class="pv-h3">' + esc(e.t) + '</h3><p class="pv-muted">' + esc(e.d) + '</p></li>'; }) + '</ol></section>';

    if (f.respiration) out += '<section class="pv-sec pv-breath"><div class="pv-stack"><p class="pv-eyebrow">Une minute pour soi</p><h2 class="pv-h2">Respirer, avant toute chose</h2><p class="pv-muted">' + esc(c.respiration) + '</p><span class="pv-btn">Commencer · 1:00</span></div>' +
      '<div class="pv-breath__stage" aria-hidden="true"><span class="pv-breath__ring"></span><span class="pv-breath__circle pv-anim-breathe"></span><span class="pv-breath__label">inspirez</span></div></section>';

    if (f.questionnaires) out += '<section class="pv-sec pv-quest" data-sec="quest"><div class="pv-stack"><h2 class="pv-h2">' + esc(c.questTitre) + '</h2><p class="pv-muted">' + esc(c.questIntro) + '</p><ul class="pv-list">' +
      A(m.quests, function (q) { return '<li><span><span class="pv-strong">' + esc(q.t) + '</span><span class="pv-muted">' + esc(q.d) + '</span></span><span class="pv-link">Commencer →</span></li>'; }) + '</ul></div>' +
      '<div class="pv-card pv-quiz"><div class="pv-row pv-muted"><span>' + esc(m.questDemo.name) + '</span><span>Question 2 sur ' + esc(m.questDemo.n) + '</span></div><div class="pv-bar"><i></i></div><p class="pv-h3">' + esc(m.questDemo.q) + '</p>' +
      A(m.questDemo.opts, function (o, i) { return '<span class="pv-opt' + (i === 1 ? ' is-on' : '') + '"><i></i>' + esc(o) + '</span>'; }) + '<p class="pv-small pv-muted">Ces questionnaires sont indicatifs et ne remplacent pas un entretien.</p></div></section>';

    if (f.ressources) out += '<section class="pv-sec"><h2 class="pv-h2">Ressources à télécharger</h2><ul class="pv-cards3">' +
      A([['Fiche', "Traverser une crise d'angoisse", 'Les gestes qui aident sur le moment.', 'Télécharger · PDF'], ['Exercice', 'Le carnet des pensées', 'Repérer et questionner les pensées automatiques.', 'Télécharger · PDF'], ['Audio', 'Relaxation guidée, 10 minutes', 'À écouter le soir, au calme.', 'Écouter']],
        function (r) { return '<li class="pv-card"><span class="pv-tag">' + r[0] + '</span><span class="pv-h3">' + r[1] + '</span><span class="pv-muted">' + r[2] + '</span><span class="pv-link">' + r[3] + ' →</span></li>'; }) + '</ul></section>';

    if (f.ateliers) out += '<section class="pv-sec pv-sec--tint"><div class="pv-sec__head"><h2 class="pv-h2">Ateliers et groupes</h2><p class="pv-muted">Des séances collectives en petit groupe, au cabinet ou en visio.</p></div><div class="pv-list">' +
      A([[12, 'Gérer son stress', '4 séances · 6 personnes · au cabinet'], [26, 'Mieux dormir', '3 séances · en visio'], [40, 'Groupe de parole parents', 'Un samedi par mois']], function (a) {
        var x = new Date(); x.setDate(x.getDate() + a[0]);
        return '<div class="pv-atelier"><span class="pv-date">' + x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + '</span><span><span class="pv-strong">' + a[1] + '</span><span class="pv-muted">' + a[2] + '</span></span><span class="pv-btn pv-btn--sm pv-btn--ghost">S’inscrire</span></div>';
      }) + '</div></section>';

    out += '<section class="pv-sec pv-infos" data-sec="infos"><div><h2 class="pv-h2">Consultations et tarifs</h2>' +
      A(p.tarifs, function (r) { return '<div class="pv-tarif"><span class="pv-h3">' + esc(r.type) + '</span><span class="pv-price">' + esc(r.prix) + '</span><span class="pv-muted">' + esc(r.duree) + '</span></div>'; }) +
      (f.paiement ? '<p class="pv-note">Paiement en ligne sécurisé à la réservation · facture envoyée par e-mail</p>' : '') + '</div>' +
      '<aside class="pv-aside"><div><p class="pv-label">Horaires</p>' + A(p.horaires, function (h) { return '<p>' + esc(h) + '</p>'; }) + '</div>' +
      '<div><p class="pv-label">Adresse</p><p>' + esc(p.adresseComplete) + '</p><p class="pv-soft">' + esc(p.acces) + '</p>' + (p.pmr ? '<p class="pv-soft">Accessible aux personnes à mobilité réduite</p>' : '') + '</div>' +
      (p.visio ? '<div><p class="pv-label">À distance</p><p>Séances en visio sur plateforme sécurisée</p></div>' : '') +
      (f.creneaux && m.style !== 'sante' ? '<div><p class="pv-label">Prochains créneaux</p><div class="pv-chips">' + A(['9:00', '11:00', '15:30', '18:30'], function (h, i) { return '<span class="' + (i === 0 ? 'is-on' : '') + '">' + h + '</span>'; }) + '</div></div>' : '') +
      '<span class="pv-btn pv-btn--block">' + esc(c.cta) + '</span></aside></section>';

    if (f.carte) out += '<section class="pv-sec pv-sec--flush"><div class="pv-map"><svg viewBox="0 0 1200 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-20 90 C 300 60 600 160 1220 110"/><path d="M180 -20 C 220 140 330 260 380 400"/><path d="M820 -20 C 760 120 860 260 940 400"/><path d="M-20 300 C 400 260 800 330 1220 280"/><path class="s2" d="M420 30 L 1000 230"/><path class="s2" d="M60 200 L 560 190 L 900 80"/></svg>' +
      '<span class="pv-pin"><i></i></span><div class="pv-map__card"><strong>' + esc(p.nom) + '</strong><span>' + esc(p.adresseComplete) + '</span></div></div></section>';

    if (f.FAQ) out += '<section class="pv-sec"><h2 class="pv-h2">Questions fréquentes</h2><div class="pv-faq">' +
      A(m.faq, function (q, i) { return '<div class="pv-faq__item"><p class="pv-faq__q"><span>' + esc(q[0]) + '</span><span>' + (i === 0 ? '−' : '+') + '</span></p>' + (i === 0 ? '<p class="pv-muted">' + esc(q[1]) + '</p>' : '') + '</div>'; }) + '</div></section>';

    out += '<section class="pv-cta"><div class="pv-cta__inner"><h2 class="pv-cta__title">' + esc(c.ctaTitre) + '</h2><p>' + esc(p.adresseComplete) + ' · ' + esc(p.telephone) + '</p><span class="pv-btn pv-btn--cta">' + esc(c.cta) + '</span>' +
      (f.rappel ? '<div class="pv-rappel"><p>' + esc(c.rappel) + '</p><div class="pv-rappel__row"><span>Prénom</span><span>Téléphone</span><span class="pv-btn pv-btn--sm pv-btn--cta">Être rappelé</span></div></div>' : '') + '</div></section>';

    if (f.newsletter) out += '<section class="pv-sec pv-news"><div><p class="pv-h3">La lettre du cabinet</p><p class="pv-muted">Un article par mois sur le bien-être psychologique, sans publicité.</p></div><div class="pv-news__row"><span>Adresse e-mail</span><span class="pv-btn pv-btn--sm">S’inscrire</span></div></section>';

    out += '<footer class="pv-footer"><div><p class="pv-strong">' + esc(p.nom) + '</p><p>' + esc(p.titre) + '</p><p class="pv-muted">ADELI ' + esc(p.adeli) + '</p></div>' +
      '<div><p class="pv-label">Pages</p>' + A(m.nav, function (n) { return '<span>' + esc(n) + '</span>'; }) + '</div>' +
      '<div><p class="pv-label">Contact</p><span>' + esc(p.telephone) + '</span><span>' + esc(p.email) + '</span><span>' + esc(p.adresseComplete) + '</span></div>' +
      '<div><p class="pv-label">Urgence</p><span>Samu : 15</span><span>Prévention du suicide : 3114</span>' + (f.statut ? '<span class="pv-open"><i class="pv-dot"></i>Cabinet ouvert</span>' : '') + '</div>' +
      '<p class="pv-footer__bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(p.nom) + '</span><span>Mentions légales · Confidentialité</span></p></footer>' +
      '<div class="pv-endnote"><p>Ceci est un aperçu de votre page d’accueil</p><p>Les autres pages de votre site seront réalisées une fois la commande validée, dans le style choisi.</p></div>';
    return out;
  }

  YX.renderPreview = function (m) {
    var f = m.f;
    var util = f.utilBar ? '<div class="pv-util">' + (f.accessibilite ? '<span class="pv-util__a11y"><span class="pv-muted">Confort de lecture</span><b>A−</b><b>A+</b><b>Contraste</b></span>' : '') + (f.multilingue ? '<span><b>FR</b> <span class="pv-muted">/ EN</span></span>' : '') + '</div>' : '';
    return '<div class="pv-in" data-sec="top">' + util + '<div class="pv-herowrap" data-sec="hero">' + HERO[m.style](m) + '</div>' + sections(m) + '</div>';
  };
})();

/* ==========================================================================
   Couleurs : calcul des teintes dérivées d'une palette, avec contrôle des
   contrastes (WCAG 2.2 niveau AA : 4,5:1 pour le texte, 3:1 pour les
   éléments d'interface). Utilisé à la génération du site et, dans l'aperçu
   du configurateur, pour les couleurs personnalisées.
   ========================================================================== */

const hexa = (h) => {
  let s = String(h || '#000').replace('#', '').trim();
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) || 0);
};
const enHexa = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/* Mélange de deux couleurs : t = 0 donne a, t = 1 donne b */
export const melange = (a, b, t) => {
  const A = hexa(a), B = hexa(b);
  return enHexa(A.map((v, i) => v + (B[i] - v) * t));
};

export const luminance = (h) => {
  const c = hexa(h).map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

export const contraste = (a, b) => {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

export const estSombre = (h) => luminance(h) < 0.2;

/* Rapproche « couleur » de « vers » jusqu'à atteindre le contraste demandé
   face à chacune des couleurs de fond. Renvoie la couleur la moins modifiée. */
export function assurerContraste(couleur, fonds, cible, vers) {
  const liste = [].concat(fonds);
  const ok = (c) => liste.every((f) => contraste(c, f) >= cible);
  if (ok(couleur)) return couleur.toUpperCase();
  for (let t = 0.04; t <= 1.0001; t += 0.04) {
    const c = melange(couleur, vers, t);
    if (ok(c)) return c;
  }
  return vers;
}

/* Calcule toutes les variables de couleur d'un site à partir d'une palette */
export function deriver(p) {
  const sombre = estSombre(p.fond);
  const vers = sombre ? '#FFFFFF' : '#000000';
  const fond = p.fond.toUpperCase();
  const encre = assurerContraste(p.encre, [fond, p.doux], 7, vers);
  const doux = p.doux.toUpperCase();
  const texte2 = assurerContraste(p.texte2 || melange(fond, encre, 0.7), [fond, doux], 4.6, encre);
  const accent = p.accent.toUpperCase();
  const accent2 = (p.accent2 || p.accent).toUpperCase();

  /* Lien : l'accent, assombri ou éclairci si besoin pour rester lisible */
  const lien = assurerContraste(accent, [fond, doux], 4.6, encre);

  /* Bouton : texte clair ou foncé selon ce qui contraste le mieux */
  const clair = sombre ? encre : '#FFFFFF';
  const fonce = sombre ? fond : encre;
  const surBouton = contraste(accent, clair) >= contraste(accent, fonce) ? clair : fonce;
  const versBouton = surBouton === clair ? (sombre ? fond : encre) : '#FFFFFF';
  const bouton = assurerContraste(accent, surBouton, 4.6, versBouton);
  const boutonSurvol = assurerContraste(melange(bouton, versBouton, 0.16), surBouton, 4.6, versBouton);

  /* Section sombre (bandeau d'appel, pied de page) */
  const profond = (p.profond || (sombre ? melange(fond, '#000000', 0.35) : melange(accent, encre, 0.55))).toUpperCase();
  const surProfond = assurerContraste(p.surProfond || (sombre ? encre : fond), profond, 7, '#FFFFFF');
  const surProfond2 = assurerContraste(melange(profond, surProfond, 0.78), profond, 4.6, surProfond);
  /* Accent clair : décor, et texte sur les sections sombres */
  const accentClair = (p.clair || melange(accent, fond, 0.5)).toUpperCase();
  const accentProfond = assurerContraste(p.clair || melange(accent, fond, 0.45), profond, 4.6, surProfond);
  const fond2 = (p.fond2 || melange(fond, encre, sombre ? 0.06 : 0.045)).toUpperCase();

  /* Section inversée : la couleur du texte en fond, celle du fond en texte
     (sections sombres des styles clairs, bandeau clair des styles sombres) */
  const inverse = encre;
  const surInverse = assurerContraste(fond, inverse, 7, sombre ? '#000000' : '#FFFFFF');
  const surInverse2 = assurerContraste(melange(inverse, surInverse, 0.74), inverse, 4.6, surInverse);
  const accentInverse = assurerContraste(accent, inverse, 4.6, surInverse);
  const accent2Doux = (p.accent2Doux || melange(fond, accent2, sombre ? 0.2 : 0.14)).toUpperCase();

  return {
    fond,
    encre,
    doux,
    texte2,
    accent,
    accent2,
    lien,
    bouton,
    'sur-bouton': surBouton,
    'bouton-survol': boutonSurvol,
    surface: (p.surface || (sombre ? melange(fond, encre, 0.05) : melange(fond, '#FFFFFF', 0.6))).toUpperCase(),
    fond2,
    texte3: assurerContraste(melange(texte2, fond, 0.22), [fond, fond2, doux], 4.6, encre),
    doux2: (p.doux2 || melange(doux, accent, 0.1)).toUpperCase(),
    clair: accentClair,
    'accent-doux': melange(fond, accent, sombre ? 0.2 : 0.1),
    'accent2-doux': accent2Doux,
    'accent2-texte': assurerContraste(melange(accent2, encre, 0.55), [accent2Doux], 4.6, encre),
    ligne: melange(fond, encre, 0.14),
    'ligne-forte': assurerContraste(melange(fond, encre, 0.4), [fond], 3.1, encre),
    profond,
    'sur-profond': surProfond,
    'sur-profond2': surProfond2,
    'accent-profond': accentProfond,
    'ligne-profond': melange(profond, surProfond, 0.2),
    inverse,
    'sur-inverse': surInverse,
    'sur-inverse2': surInverse2,
    'accent-inverse': accentInverse,
    'doux-inverse': melange(inverse, surInverse, 0.07),
    'ligne-inverse': melange(inverse, surInverse, 0.22),
    focus: assurerContraste(accent, [fond, doux], 3.2, encre),
    schema: sombre ? 'dark' : 'light'
  };
}

/* Variables CSS correspondantes : « --c-fond: #F6F3EE; … » */
export function variablesCss(p) {
  const d = deriver(p);
  return Object.entries(d)
    .map(([k, v]) => (k === 'schema' ? `color-scheme:${v}` : `--c-${k}:${v}`))
    .join(';');
}

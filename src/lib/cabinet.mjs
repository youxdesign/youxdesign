/* ==========================================================================
   Fiche du cabinet : lecture, vérification et valeurs calculées.
   La fiche est le fichier cabinets/<identifiant>/cabinet.json.
   En cas d'erreur, la génération s'arrête avec un message en français qui
   indique le champ à corriger.
   ========================================================================== */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { STYLES } from '../config/catalogue.mjs';

const texte = z.string().trim().min(1);
const paragraphes = z.array(texte);
const element = z.object({ titre: texte, texte: texte.optional(), date: texte.optional(), icone: texte.optional() });
const horaire = z.string().regex(/^(\s*\d{1,2}[:h]\d{2}\s*-\s*\d{1,2}[:h]\d{2}\s*)(,\s*\d{1,2}[:h]\d{2}\s*-\s*\d{1,2}[:h]\d{2}\s*)*$|^$/, 'format attendu « 9:00-20:00 » ou « 9:00-12:30, 14:00-19:00 », ou vide si fermé');

const pageTextes = z.object({ seoTitre: texte, seoDescription: texte }).passthrough();

const schema = z.object({
  site: z.object({
    domaine: z.string().url('doit être une adresse complète, par exemple https://www.mon-cabinet.fr'),
    style: z.enum(STYLES.map((s) => s.id)),
    palette: z.union([z.number().int().min(0), z.string()]).default(0),
    police: z.number().int().min(0).default(0),
    couleurs: z.object({ fond: texte, encre: texte, accent: texte, doux: texte, texte2: texte.optional(), accent2: texte.optional() }).optional(),
    demo: z.boolean().default(false),
    options: z.array(z.string()).default([]),
    /* Style Immersif : animation du fond de l'accueil et voile sur l'image */
    fond: z.enum(['zoom', 'diaporama', 'parallaxe', 'degrade', 'video']).default('zoom'),
    voile: z.enum(['leger', 'moyen', 'fort']).default('moyen')
  }),
  praticien: z.object({
    prenom: texte,
    nom: texte,
    accord: z.enum(['f', 'm', 'n']).default('n'),
    profession: z.enum(['psychologue', 'sophrologue', 'coach', 'autre']),
    titre: texte,
    specialite: texte.optional(),
    specialiteCourte: texte.optional(),
    diplome: texte.optional(),
    depuis: z.number().int().optional(),
    adeli: texte.optional(),
    rpps: texte.optional(),
    siret: texte.optional(),
    statut: texte.optional(),
    ars: texte.optional(),
    public: texte.optional(),
    citation: texte.optional()
  }),
  contact: z.object({
    telephone: texte,
    telephoneNote: texte.optional(),
    email: z.string().email('adresse e-mail invalide'),
    emailNote: texte.optional(),
    rendezVous: z.object({ plateforme: texte, url: z.string().url() }).optional(),
    /* Adresses des services qui reçoivent les formulaires (rappel, lettre d'information) */
    formulaires: z.object({ rappel: z.string().url().optional(), newsletter: z.string().url().optional() }).optional()
  }),
  cabinet: z.object({
    adresse: texte,
    complement: texte.optional(),
    codePostal: texte,
    ville: texte,
    quartier: texte.optional(),
    zone: texte.optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    accessiblePMR: z.boolean().default(false),
    visio: z.boolean().default(false),
    horaires: z.object({ lundi: horaire, mardi: horaire, mercredi: horaire, jeudi: horaire, vendredi: horaire, samedi: horaire, dimanche: horaire }),
    horairesNote: texte.optional(),
    acces: z.array(element).default([])
  }),
  tarifs: z.array(z.object({ nom: texte, lieu: texte.optional(), prix: texte, duree: texte.optional(), texte: texte.optional(), miseEnAvant: z.boolean().optional() })).min(1, 'indiquez au moins un tarif'),
  motifs: z.array(element).default([]),
  pages: z.object({
    accueil: pageTextes,
    'a-propos': pageTextes,
    approche: pageTextes,
    consultations: pageTextes,
    faq: pageTextes.extend({
      groupes: z.array(z.object({ titre: texte, questions: z.array(z.object({ question: texte, reponse: paragraphes, urgence: z.boolean().optional() })) }))
    }),
    contact: pageTextes
  }),
  legal: z.object({
    miseAJour: texte,
    directeurPublication: texte.optional(),
    mediateur: texte.optional()
  })
});

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const JOURS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* « 9:00 » → « 9 h », « 12:30 » → « 12 h 30 » */
const heureLisible = (h) => {
  const [hh, mm] = h.trim().replace('h', ':').split(':');
  return `${Number(hh)} h${mm && mm !== '00' ? ' ' + mm : ''}`;
};
const heureIso = (h) => {
  const [hh, mm] = h.trim().replace('h', ':').split(':');
  return `${hh.padStart(2, '0')}:${mm}`;
};

function horaires(h) {
  const jours = JOURS.map((j, i) => ({
    jour: j,
    index: i,
    plages: (h[j] || '').split(',').map((p) => p.trim()).filter(Boolean).map((p) => p.split('-').map((x) => x.trim()))
  }));
  /* Regroupe les jours consécutifs identiques : « Lundi – vendredi » */
  const groupes = [];
  for (const j of jours) {
    const cle = JSON.stringify(j.plages);
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.cle === cle) dernier.jours.push(j);
    else groupes.push({ cle, jours: [j], plages: j.plages });
  }
  for (const g of groupes) {
    const a = g.jours[0].jour, b = g.jours[g.jours.length - 1].jour;
    g.libelle = g.jours.length === 1 ? majuscule(a) : g.jours.length === 2 ? `${majuscule(a)} et ${b}` : `${majuscule(a)} – ${b}`;
    g.texte = g.plages.length ? g.plages.map(([o, f]) => `${heureLisible(o)} – ${heureLisible(f)}`).join(', ') : 'Fermé';
    g.ferme = !g.plages.length;
  }
  /* Format schema.org pour les données structurées */
  const schema = groupes.filter((g) => !g.ferme).flatMap((g) => g.plages.map(([o, f]) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: g.jours.map((j) => JOURS_EN[j.index]),
    opens: heureIso(o),
    closes: heureIso(f)
  })));
  /* Format compact pour le statut d'ouverture en direct : [jour 0-6 (lundi = 0), [[début, fin] en minutes]] */
  const minutes = (x) => { const [hh, mm] = x.replace('h', ':').split(':'); return Number(hh) * 60 + Number(mm); };
  const compact = jours.map((j) => j.plages.map(([o, f]) => [minutes(o), minutes(f)]));
  return { jours, groupes, schema, compact };
}

function telephone(t) {
  const chiffres = t.replace(/[^\d+]/g, '');
  const international = chiffres.startsWith('+') ? chiffres : chiffres.startsWith('0') ? '+33' + chiffres.slice(1) : chiffres;
  return { affiche: t, lien: `tel:${international}`, international };
}

const METIERS = { psychologue: 'Psychologue', sophrologue: 'Sophrologue', coach: 'Coach', autre: '' };

export function chargerCabinet(id) {
  const dossier = join(process.cwd(), 'cabinets', id);
  const fichier = join(dossier, 'cabinet.json');
  if (!existsSync(fichier)) {
    throw new Error(`Fiche introuvable : cabinets/${id}/cabinet.json. Vérifiez le nom du dossier.`);
  }
  let brut;
  try {
    brut = JSON.parse(readFileSync(fichier, 'utf8'));
  } catch (e) {
    throw new Error(`cabinets/${id}/cabinet.json n'est pas un JSON valide (virgule ou guillemet manquant ?) : ${e.message}`);
  }
  const r = schema.safeParse(brut);
  if (!r.success) {
    const erreurs = r.error.issues.map((i) => `  • ${i.path.join(' › ')} : ${i.message}`).join('\n');
    throw new Error(`La fiche cabinets/${id}/cabinet.json contient des erreurs :\n${erreurs}`);
  }
  return enrichir(id, r.data);
}

function enrichir(id, d) {
  const p = d.praticien, c = d.cabinet;
  const e = p.accord === 'f' ? 'e' : p.accord === 'n' ? '·e' : '';
  const metier = METIERS[p.profession] || p.titre;
  return {
    ...d,
    id,
    nomComplet: `${p.prenom} ${p.nom}`,
    initiales: `${p.prenom[0]}${p.nom[0]}`.toUpperCase(),
    metier,
    estPsychologue: p.profession === 'psychologue',
    /* accord('diplômé') → « diplômée » si accord féminin */
    accord: (mot) => mot + e,
    tel: telephone(d.contact.telephone),
    adresse: {
      rue: c.adresse,
      complement: c.complement,
      ville: `${c.codePostal} ${c.ville}`,
      uneLigne: `${c.adresse}, ${c.codePostal} ${c.ville}`,
      geo: c.latitude != null && c.longitude != null ? { lat: c.latitude, lng: c.longitude } : null
    },
    lieuCourt: `${c.ville}${c.visio ? ' et visio' : ''}`,
    horaires: horaires(c.horaires),
    rdv: d.contact.rendezVous || null,
    options: new Set(d.site.options),
    a: (option) => d.site.options.includes(option),
    /* Bloc d'option à produire ? (toujours dans les démos, masqué si inactif) */
    bloc: (option, vitrine) => ({ rendre: d.site.options.includes(option) || Boolean(vitrine), cache: !d.site.options.includes(option) })
  };
}

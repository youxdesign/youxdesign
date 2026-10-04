/* ==========================================================================
   Finitions après la génération du site (dossier dist/) :
   - pages d'erreur 404 à l'emplacement attendu par Cloudflare Pages ;
   - fichier _headers : en-têtes de sécurité et de cache ;
   - fichier _redirects : anciennes adresses vers les nouvelles ;
   - fichiers propres au site youXdesign (logo, images de l'e-mail).
   ========================================================================== */
import { readdir, rename, rm, writeFile, cp, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Cloudflare Pages cherche « 404.html » dans le dossier le plus proche :
   on transforme chaque « …/404/index.html » en « …/404.html ». */
async function placer404(dossier) {
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    if (!entree.isDirectory()) continue;
    const chemin = join(dossier, entree.name);
    if (entree.name === '404') {
      await rename(join(chemin, 'index.html'), join(dossier, '404.html'));
      await rm(chemin, { recursive: true });
    } else {
      await placer404(chemin);
    }
  }
}

function enTetes({ vitrine, carte, formulaires = [] }) {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    vitrine ? "img-src 'self' blob:" : "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    carte ? "frame-src 'self' https://www.openstreetmap.org" : "frame-src 'self'",
    vitrine ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
    ["form-action 'self'", ...formulaires].join(' '),
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests'
  ].join('; ');
  const immuable = 'Cache-Control: public, max-age=31536000, immutable';
  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: ${vitrine ? 'SAMEORIGIN' : 'DENY'}
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()
  Strict-Transport-Security: max-age=31536000
  Cross-Origin-Opener-Policy: same-origin

/fonts/*
  ${immuable}
/css/*
  ${immuable}
/js/*
  ${immuable}
/_astro/*
  ${immuable}
`;
}

/* Anciennes adresses du site youXdesign (e-mails déjà envoyés, favoris) */
const REDIRECTIONS_VITRINE = `# Anciennes adresses -> nouvelles pages
/configurateur.html              /                            301
/demo/index.html                 /demo/                       301
/demo/Accueil.dc.html            /demo/                       301
/demo/A-propos.dc.html           /demo/a-propos/              301
/demo/Approche.dc.html           /demo/approche/              301
/demo/Consultations.dc.html      /demo/consultations/         301
/demo/FAQ.dc.html                /demo/faq/                   301
/demo/Contact.dc.html            /demo/contact/               301
/demo/Mentions-legales.dc.html   /demo/mentions-legales/      301
/demo/Confidentialite.dc.html    /demo/confidentialite/       301
/demo/Carte.html                 /demo/contact/               301
/demo/a-propos.html              /demo/a-propos/              301
/demo/approche.html              /demo/approche/              301
/demo/consultations.html         /demo/consultations/         301
/demo/faq.html                   /demo/faq/                   301
/demo/contact.html               /demo/contact/               301
/demo/mentions-legales.html      /demo/mentions-legales/      301
/demo/confidentialite.html       /demo/confidentialite/       301
`;

export default function youx({ mode, carte, formulaires = [] }) {
  return {
    name: 'youx-finitions',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const vitrine = mode === 'vitrine';
        await placer404(dist);
        await writeFile(join(dist, '_headers'), enTetes({ vitrine, carte, formulaires }));
        if (vitrine) {
          await writeFile(join(dist, '_redirects'), REDIRECTIONS_VITRINE);
          const statique = join(process.cwd(), 'youx-statique');
          if (await stat(statique).catch(() => null)) await cp(statique, dist, { recursive: true });
        } else {
          /* Site d'un cabinet : fichiers à télécharger (option « ressources ») */
          const fichiers = join(process.cwd(), 'cabinets', process.env.CABINET || '', 'fichiers');
          if (await stat(fichiers).catch(() => null)) await cp(fichiers, join(dist, 'fichiers'), { recursive: true });
        }
        logger.info(`Finitions : pages 404, _headers${vitrine ? ', _redirects et fichiers youXdesign' : ''}.`);
      }
    }
  };
}

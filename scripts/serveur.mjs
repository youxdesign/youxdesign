/* ==========================================================================
   Serveur d'aperçu local du dossier dist/, au plus près de Cloudflare Pages :
   applique _headers (dont la politique de sécurité) et _redirects, sert les
   pages 404 les plus proches et ajoute la barre finale aux adresses.
   Utilisation : npm run apercu   (puis ouvrir http://localhost:4321)
   ========================================================================== */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const RACINE = join(process.cwd(), process.argv[2] || 'dist');
const PORT = Number(process.env.PORT || 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon'
};

const lireTexte = (f) => readFile(join(RACINE, f), 'utf8').catch(() => '');

/* _headers : blocs « motif » suivis de lignes « Nom: valeur » indentées */
function analyserEnTetes(texte) {
  const regles = [];
  let courante = null;
  for (const ligne of texte.split('\n')) {
    if (!ligne.trim() || ligne.trim().startsWith('#')) continue;
    if (!/^\s/.test(ligne)) { courante = { motif: ligne.trim(), entetes: [] }; regles.push(courante); }
    else if (courante) { const i = ligne.indexOf(':'); courante.entetes.push([ligne.slice(0, i).trim(), ligne.slice(i + 1).trim()]); }
  }
  return regles;
}
const correspond = (motif, chemin) => new RegExp('^' + motif.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(chemin);

const regles = analyserEnTetes(await lireTexte('_headers'));
const redirections = (await lireTexte('_redirects')).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));

async function fichier(chemin) {
  const s = await stat(chemin).catch(() => null);
  return s && s.isFile() ? chemin : null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let chemin = decodeURIComponent(url.pathname);
  const redir = redirections.find(([de]) => de === chemin);
  if (redir) { res.writeHead(Number(redir[2] || 301), { Location: redir[1] }); return res.end(); }

  const sur = normalize(join(RACINE, chemin));
  if (!sur.startsWith(RACINE)) { res.writeHead(403); return res.end(); }
  let cible = await fichier(sur);
  if (!cible && !extname(chemin) && !chemin.endsWith('/') && await fichier(join(sur, 'index.html'))) {
    res.writeHead(308, { Location: chemin + '/' + url.search }); return res.end();
  }
  if (!cible) cible = await fichier(join(sur, 'index.html'));
  let statut = 200;
  if (!cible) {
    /* Page 404 du dossier le plus proche */
    statut = 404;
    const morceaux = chemin.split('/').filter(Boolean);
    while (morceaux.length >= 0 && !cible) {
      cible = await fichier(join(RACINE, ...morceaux, '404.html'));
      if (!morceaux.length) break;
      morceaux.pop();
    }
  }
  if (!cible) { res.writeHead(404); return res.end('Introuvable'); }
  const entetes = { 'Content-Type': TYPES[extname(cible)] || 'application/octet-stream' };
  for (const r of regles) if (correspond(r.motif, chemin)) for (const [n, v] of r.entetes) entetes[n] = v;
  let corps = await readFile(cible);
  /* Compression des fichiers texte, comme Cloudflare */
  const accepte = req.headers['accept-encoding'] || '';
  if (/^(text|application\/(json|xml)|image\/svg)/.test(entetes['Content-Type'])) {
    if (accepte.includes('br')) { corps = brotliCompressSync(corps, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }); entetes['Content-Encoding'] = 'br'; }
    else if (accepte.includes('gzip')) { corps = gzipSync(corps); entetes['Content-Encoding'] = 'gzip'; }
    entetes['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(statut, entetes);
  res.end(corps);
}).listen(PORT, () => console.log(`Aperçu : http://localhost:${PORT} (dossier ${RACINE})`));

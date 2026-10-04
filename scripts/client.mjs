/* ==========================================================================
   Génère le site d'un cabinet, prêt à mettre en ligne.

   Utilisation :
     npm run client -- dupont                 (fiche cabinets/dupont/cabinet.json)
     npm run client -- dupont --style terre   (essayer un autre style)

   Le site est créé dans clients/dupont/ : c'est ce dossier qu'il faut
   envoyer sur Cloudflare Pages (voir LISEZMOI).
   ========================================================================== */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const iStyle = args.indexOf('--style');
const style = iStyle >= 0 ? args[iStyle + 1] : null;

if (!id) {
  console.error('\nIndiquez le dossier du cabinet, par exemple : npm run client -- dupont\n');
  process.exit(1);
}
if (!existsSync(`cabinets/${id}/cabinet.json`)) {
  console.error(`\nFiche introuvable : cabinets/${id}/cabinet.json\n`);
  process.exit(1);
}

const sortie = `clients/${id}`;
console.log(`\nGénération du site « ${id} »${style ? ` (style ${style})` : ''}…\n`);
const r = spawnSync('npx', ['astro', 'build', '--outDir', sortie], {
  stdio: 'inherit',
  env: { ...process.env, CABINET: id, ...(style ? { STYLE: style } : {}) }
});
if (r.status !== 0) process.exit(r.status || 1);

console.log(`\n✓ Site prêt dans ${sortie}/`);
console.log('  Pour le voir : npm run apercu -- ' + sortie);
console.log('  Pour le mettre en ligne : glissez ce dossier dans Cloudflare Pages (voir LISEZMOI).\n');

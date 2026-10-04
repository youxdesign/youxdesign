/* ==========================================================================
   Carte d'accès : fabrique l'image du plan du quartier d'un cabinet.
   --------------------------------------------------------------------------
   Assemble une fois pour toutes les tuiles OpenStreetMap autour de l'adresse
   (latitude et longitude de la fiche) et enregistre le résultat dans
   cabinets/<cabinet>/images/carte.png. Le site affiche ensuite cette image,
   hébergée chez lui : aucune requête vers OpenStreetMap à l'affichage.

   Utilisation : node scripts/carte.mjs claire-morel
   Fond de carte © contributeurs OpenStreetMap (licence ODbL), mention
   ajoutée automatiquement sous la carte.
   ========================================================================== */
import { readFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const id = process.argv[2];
if (!id) {
  console.error('Indiquez le cabinet : node scripts/carte.mjs <dossier-du-cabinet>');
  process.exit(1);
}
const fiche = JSON.parse(await readFile(`cabinets/${id}/cabinet.json`, 'utf8'));
const { latitude: lat, longitude: lng } = fiche.cabinet;
if (lat == null || lng == null) {
  console.error('La fiche doit contenir cabinet.latitude et cabinet.longitude.');
  process.exit(1);
}

const ZOOM = 17, TUILE = 256, LARGEUR = 1280, HAUTEUR = 800;
const total = TUILE * 2 ** ZOOM;
const px = ((lng + 180) / 360) * total;
const rad = (lat * Math.PI) / 180;
const py = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * total;

const x0 = Math.floor(px - LARGEUR / 2), y0 = Math.floor(py - HAUTEUR / 2);
const tx0 = Math.floor(x0 / TUILE), ty0 = Math.floor(y0 / TUILE);
const tx1 = Math.floor((x0 + LARGEUR) / TUILE), ty1 = Math.floor((y0 + HAUTEUR) / TUILE);

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const morceaux = [];
for (let ty = ty0; ty <= ty1; ty++) {
  for (let tx = tx0; tx <= tx1; tx++) {
    const url = `https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`;
    const rep = await fetch(url, { headers: { 'User-Agent': 'youXdesign-carte/1.0 (contact.youxdesign@gmail.com)' } });
    if (!rep.ok) throw new Error(`Tuile indisponible (${rep.status}) : ${url}`);
    morceaux.push({ input: Buffer.from(await rep.arrayBuffer()), left: (tx - tx0) * TUILE, top: (ty - ty0) * TUILE });
    await pause(120);
  }
}

const mosaique = await sharp({
  create: { width: (tx1 - tx0 + 1) * TUILE, height: (ty1 - ty0 + 1) * TUILE, channels: 3, background: '#f2efe9' }
}).composite(morceaux).png().toBuffer();

await mkdir(`cabinets/${id}/images`, { recursive: true });
await sharp(mosaique)
  .extract({ left: x0 - tx0 * TUILE, top: y0 - ty0 * TUILE, width: LARGEUR, height: HAUTEUR })
  .png({ compressionLevel: 9 })
  .toFile(`cabinets/${id}/images/carte.png`);

console.log(`Plan enregistré : cabinets/${id}/images/carte.png (${morceaux.length} tuiles, centré sur ${lat}, ${lng})`);

// Reprojects an equirectangular (Plate Carrée) relief raster into the exact
// projection and frame the vector map uses, so the image lines up with the
// coastline paths pixel for pixel. No GDAL, no system tools — plain node.
//
//   node warp-relief.mjs <source.png> [--out relief.png] [--scale 2] [--tone dark|raw]
//
// The source must be a full-world equirectangular image covering
// lon -180..180, lat -90..90 (every Natural Earth raster is). Anything else
// and the geography will be wrong in a way that is hard to spot, so the script
// refuses a source whose aspect ratio is not 2:1.
//
// Output is written aligned to the 1200x750 viewBox at <scale>x, which is what
// the <image> element in the map SVG expects.

import fs from 'fs';
import { PNG } from 'pngjs';
import * as d3 from 'd3-geo';
import { feature, merge } from 'topojson-client';

const args = process.argv.slice(2);
const src = args[0];
const opt = (name, dflt) => {
  const i = args.indexOf('--' + name);
  return i === -1 ? dflt : args[i + 1];
};
if (!src) {
  console.error('usage: node warp-relief.mjs <source.png> [--out relief.png] [--scale 2] [--tone dark|raw]');
  process.exit(1);
}
const OUT = opt('out', 'relief.png');
const SCALE = Number(opt('scale', 2));
const TONE = opt('tone', 'dark');

const VW = 1200, VH = 750, PAD = 20, LEFT = 200;

const W = Math.round(VW * SCALE), H = Math.round(VH * SCALE);

const source = PNG.sync.read(fs.readFileSync(src));
const ratio = source.width / source.height;
if (Math.abs(ratio - 2) > 0.02) {
  console.error(`source is ${source.width}x${source.height} (ratio ${ratio.toFixed(3)}).`);
  console.error('Expected a full-world equirectangular image, ratio 2.000. Refusing to guess.');
  process.exit(1);
}

// Load the same land geometry as gen-map-paths.mjs to fit the projection identically
const usTopo = JSON.parse(fs.readFileSync('node_modules/us-atlas/states-10m.json'));
const worldTopo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const lower48 = merge(usTopo, usTopo.objects.states.geometries.filter(g => {
  const id = String(g.id).padStart(2, '0');
  return +id <= 56 && id !== '02' && id !== '15';
}));
const mexico = feature(worldTopo, worldTopo.objects.countries).features.find(c => c.properties.name === 'Mexico');
const LAND = [lower48, mexico];
const LAND_FC = { type: 'FeatureCollection', features: LAND.map(g => g.type === 'Feature' ? g : { type: 'Feature', geometry: g }) };

// same frame construction as the geometry generator, including the clockwise
// densified ring — a counter-clockwise ring makes d3 fit the whole globe
function frameProjection() {
  const ring = [];
  const bounds = d3.geoBounds(LAND_FC);
  const [[w, s], [e, n]] = bounds;
  const N = 40;
  for (let i = 0; i <= N; i++) ring.push([w, s + (n - s) * i / N]);
  for (let i = 0; i <= N; i++) ring.push([w + (e - w) * i / N, n]);
  for (let i = 0; i <= N; i++) ring.push([e, n - (n - s) * i / N]);
  for (let i = 0; i <= N; i++) ring.push([e - (e - w) * i / N, s]);
  const box = { type: 'Polygon', coordinates: [ring] };
  const proj = d3.geoConicEqualArea().parallels([22, 38]).rotate([101, 0]);
  proj.fitExtent([[PAD * SCALE + LEFT * SCALE, PAD * SCALE], [W - PAD * SCALE, H - PAD * SCALE]], LAND_FC);
  return proj;
}
const proj = frameProjection();

const out = new PNG({ width: W, height: H });
const sw = source.width, sh = source.height;
let painted = 0;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const o = (y * W + x) << 2;
    // inverse-project this output pixel back to lon/lat
    const ll = proj.invert([x + 0.5, y + 0.5]);
    if (!ll || !isFinite(ll[0]) || !isFinite(ll[1])) { out.data[o + 3] = 0; continue; }
    let [lon, lat] = ll;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) { out.data[o + 3] = 0; continue; }
    // equirectangular source: lon/lat map linearly to pixels
    const sx = Math.min(sw - 1, Math.max(0, Math.round((lon + 180) / 360 * sw - 0.5)));
    const sy = Math.min(sh - 1, Math.max(0, Math.round((90 - lat) / 180 * sh - 0.5)));
    const s = (sy * sw + sx) << 2;
    let r = source.data[s], g = source.data[s + 1], b = source.data[s + 2];

    if (TONE === 'dark') {
      // Pull the plate toward the site's night palette: drop the luminance,
      // desaturate hard, and tint blue. Keeps the relief structure, loses the
      // poster's paper-white brightness that would fight a dark section.
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const mixed = (c) => c * 0.28 + lum * 0.22;
      r = mixed(r) * 0.72 + 10;
      g = mixed(g) * 0.86 + 22;
      b = mixed(b) * 1.18 + 40;
    }
    out.data[o] = Math.max(0, Math.min(255, r));
    out.data[o + 1] = Math.max(0, Math.min(255, g));
    out.data[o + 2] = Math.max(0, Math.min(255, b));
    out.data[o + 3] = 255;
    painted++;
  }
}

fs.writeFileSync(OUT, PNG.sync.write(out));
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`wrote ${OUT} — ${W}x${H}, ${kb} KB, tone=${TONE}, ${(painted / (W * H) * 100).toFixed(1)}% of pixels inside the projection`);
console.log('Place it under the map SVG as:');
console.log(`  <image href="assets/${OUT}" x="0" y="0" width="${VW}" height="${VH}" preserveAspectRatio="none" clip-path="url(#opm-landclip)"/>`);

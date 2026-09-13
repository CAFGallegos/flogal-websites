// ONE-TIME DEV TOOL — not imported by any page, not part of the build.
// Regenerates paths.json (projected map geometry) from public-domain atlases.
// Requires packages that are NOT installed in this repo. To run:
//   mkdir -p /tmp/flogal-map && cd /tmp/flogal-map
//   npm init -y && npm i d3-geo topojson-client us-atlas world-atlas
//   cp <repo>/scripts/map/gen-map-paths.mjs . && node gen-map-paths.mjs
//   cp paths.json <repo>/scripts/map/
// paths.json is already committed, so you only need this if the frame,
// the city list or the partner list changes.
import fs from 'fs';
import * as d3 from 'd3-geo';
import { feature } from 'topojson-client';

const usTopo = JSON.parse(fs.readFileSync('node_modules/us-atlas/states-10m.json'));
const worldTopo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));

const usStates = feature(usTopo, usTopo.objects.states).features;
const coTopo = JSON.parse(fs.readFileSync('node_modules/us-atlas/counties-10m.json'));
const allCounties = feature(coTopo, coTopo.objects.counties).features;
// OK = state fips 40, TX = 48 (county ids are 5-digit, first 2 = state)
const okTxCounties = allCounties.filter(f => f.id && (String(f.id).startsWith('40') || String(f.id).startsWith('48')));
const landTopo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land = feature(landTopo, landTopo.objects.land);
const countries = feature(worldTopo, worldTopo.objects.countries).features;
const mexico = countries.find(c => c.properties.name === 'Mexico');
const canada = countries.find(c => c.properties.name === 'Canada');
const natTopo = JSON.parse(fs.readFileSync('node_modules/us-atlas/nation-10m.json'));
const usNation = feature(natTopo, natTopo.objects.nation);
const NA_NAMES = ['Canada','Mexico','Guatemala','Belize','Honduras','El Salvador','Nicaragua','Costa Rica','Panama','Cuba'];
const naCountries = countries.filter(c => NA_NAMES.includes(c.properties.name));

const CITIES = {
  'Oklahoma City': [-97.5164, 35.4676],
  'Tulsa': [-95.9928, 36.1540],
  'DFW': [-96.7970, 32.7767],
  'Austin': [-97.7431, 30.2672],
  'San Antonio': [-98.4936, 29.4241],
  'Houston': [-95.3698, 29.7604],
  'Midland': [-102.0779, 31.9973],
  'Laredo': [-99.5075, 27.5064],
  'El Paso': [-106.4850, 31.7619],
  'Memphis': [-90.0490, 35.1495],
};
const CITIES2 = {
  'Norman': [-97.4395, 35.2226], 'Lawton': [-98.3903, 34.6086],
  'Ardmore': [-97.1436, 34.1743], 'Enid': [-97.8784, 36.3956],
  'Amarillo': [-101.8313, 35.2220], 'Lubbock': [-101.8552, 33.5779],
  'Abilene': [-99.7331, 32.4487], 'Waco': [-97.1467, 31.5493],
  'Tyler': [-95.3011, 32.3513], 'Wichita Falls': [-98.4934, 33.9137],
  'Odessa': [-102.3676, 31.8457], 'Corpus Christi': [-97.3964, 27.8006],
  'McAllen': [-98.2300, 26.2034], 'Texarkana': [-94.0477, 33.4251],
  'Killeen': [-97.7278, 31.1171],
};
const PARTNERS = {
  'New Mexico': [-106.10, 34.40],
  'California': [-119.40, 36.80],
  'Texas': [-102.30, 30.30],
  'Jalisco': [-103.35, 20.66],
  'Estado de Mexico': [-99.63, 19.35],
};

function makeFrame({ bounds, width, height, pad }) {
  const [[w, s], [e, n]] = bounds;
  // Clockwise ring, densified. A counter-clockwise ring is read by d3 as the
  // complement of the box (the rest of the globe) and fitExtent silently
  // zooms out ~8x. Verified: ccw scale 190, cw scale 1531 on the same box.
  const ring = [];
  const N = 40;
  for (let i = 0; i <= N; i++) ring.push([w, s + (n - s) * i / N]);
  for (let i = 0; i <= N; i++) ring.push([w + (e - w) * i / N, n]);
  for (let i = 0; i <= N; i++) ring.push([e, n - (n - s) * i / N]);
  for (let i = 0; i <= N; i++) ring.push([e - (e - w) * i / N, s]);
  const frameBox = { type: 'Polygon', coordinates: [ring] };
  const proj = d3.geoConicEqualArea().parallels([22, 38]).rotate([101, 0]);
  proj.fitExtent([[pad, pad], [width - pad, height - pad]], frameBox);
  proj.clipExtent([[-70, -70], [width + 70, height + 70]]);
  return { proj, path: d3.geoPath(proj), bounds };
}

function inFrame(f, bounds) {
  const [[w, s], [e, n]] = bounds;
  const b = d3.geoBounds(f);
  return !(b[1][0] < w || b[0][0] > e || b[1][1] < s || b[0][1] > n);
}

const FRAMES = {
  reach: makeFrame({ bounds: [[-134, 15], [-62, 53]], width: 1200, height: 750, pad: 20 }),
  corridor: makeFrame({ bounds: [[-107, 25.8], [-93.3, 37.2]], width: 520, height: 470, pad: 16 }),
};

const R = d => d == null ? d : d.replace(/-?\d+\.\d+/g, m => (+m).toFixed(1));
const out = {};
for (const [name, F] of Object.entries(FRAMES)) {
  const states = usStates
    .filter(f => inFrame(f, F.bounds))
    .map(f => ({ name: f.properties.name, d: R(F.path(f)) }))
    .filter(f => f.d);
  const mx = R(F.path(mexico));
  const ca = R(F.path(canada));
  const land_ = R(F.path(land));
  const landNA = [usNation, ...naCountries].map(f => R(F.path(f))).filter(Boolean);
  const cities = Object.fromEntries(
    Object.entries(CITIES).map(([k, v]) => [k, F.proj(v).map(n => +n.toFixed(1))])
  );
  const partners = Object.fromEntries(
    Object.entries(PARTNERS).map(([k, v]) => [k, F.proj(v).map(n => +n.toFixed(1))])
  );
  const cities2 = Object.fromEntries(
    Object.entries(CITIES2).map(([k, v]) => [k, F.proj(v).map(n => +n.toFixed(1))])
  );
  const counties = okTxCounties.map(f => R(F.path(f))).filter(Boolean);
  out[name] = { states, mexico: mx, canada: ca, land: land_, landNA, cities, cities2, partners, counties };
  console.log(`${name}: ${counties.length} counties, ${states.length} states, mexico ${mx ? mx.length : 0}b, total ${(states.reduce((a, b) => a + b.d.length, 0) / 1024).toFixed(1)}KB`);
  console.log('   ' + states.map(s => s.name).join(', '));
}
fs.writeFileSync('paths.json', JSON.stringify(out));
console.log('OKC reach:', out.reach.cities['Oklahoma City'], ' corridor:', out.corridor.cities['Oklahoma City']);
console.log('Jalisco reach:', out.reach.partners['Jalisco']);

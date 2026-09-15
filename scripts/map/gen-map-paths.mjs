// ONE-TIME DEV TOOL — not imported by any page, not part of the build.
// Regenerates paths.json (projected map geometry) from public-domain atlases.
// Requires packages that are NOT installed in this repo. To run:
//   mkdir -p /tmp/flogal-map && cd /tmp/flogal-map
//   npm init -y && npm i d3-geo topojson-client topojson-server topojson-simplify us-atlas world-atlas
//   cp <repo>/scripts/map/gen-map-paths.mjs . && node gen-map-paths.mjs
//   cp paths.json <repo>/scripts/map/
// paths.json is already committed, so you only need this if the frame,
// the city list or the partner list changes.
//
// Mexican state lines additionally require the Natural Earth admin-1 file
// (ne_10m_admin_1_states_provinces.geojson, public domain), read from an
// absolute path outside the repo — it stays there, it is not gitignored,
// it must never be copied in. If it isn't at GEOJSON_PATH, stop; don't
// substitute a different atlas.
//
// That file ships at full float precision with no topology — every vertex of
// every one of Mexico's 32 states goes out over the wire as-is. us-atlas's US
// states are already a quantized, arc-shared TopoJSON (that's the whole
// reason us-atlas exists), which is why 50 US states cost less than 32 raw
// Mexican ones. MX_SIMPLIFY_WEIGHT runs the same kind of pass — topojson-server
// to build a topology, topojson-simplify's presimplify()+simplify() to drop
// low-weight (Visvalingam–Whyatt) vertices — before projecting. The threshold
// was picked by rendering the Jalisco and Estado de México zooms (the only
// place this layer is ever seen) and choosing the most aggressive value with
// no visible faceting on the coastline; see DONE summary for the comparison.
import fs from 'fs';
import * as d3 from 'd3-geo';
import { feature, merge } from 'topojson-client';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';

const MX_SIMPLIFY_WEIGHT = 0.01;
const US_SIMPLIFY_WEIGHT = 0.1;
const HI = new Set(['Oklahoma', 'Texas']);

const GEOJSON_PATH = '/home/flogal_dev/geodata/ne_10m_admin_1_states_provinces.geojson';

const usTopo = JSON.parse(fs.readFileSync('node_modules/us-atlas/states-10m.json'));
const worldTopo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));

// us-atlas states-10m.json is already a quantized, arc-shared TopoJSON — that
// alone made 50 states cheaper than 32 raw-GeoJSON Mexican ones (see header).
// But "cheaper than raw GeoJSON" isn't the same as "cheap": the 48 states
// that aren't Oklahoma/Texas render as their own line-hierarchy tier now (see
// build-map-section.mjs's `adm1`), and at full precision that tier alone was
// ~104 KB — the actual reason the page blew its budget was never just
// Mexico. Simplifying it the same way (presimplify + simplify) costs nothing
// visible: US state borders are mostly straight survey lines, not coastline,
// and even the wiggliest one in this frame (the Mississippi River border) is
// indistinguishable from full precision through Oklahoma/Texas's own terr
// highlight — where that highlight is Flogal's owned corridor, though, it
// gets no simplification at all: OK+TX are pulled from `usStatesRaw` (full
// precision) and spliced back in below, unsimplified, so the corridor-city
// zoom's own boundary is pixel-identical to before this pass.
const usStatesRaw = feature(usTopo, usTopo.objects.states).features;
const usTopoSimplified = simplify(presimplify(JSON.parse(JSON.stringify(usTopo))), US_SIMPLIFY_WEIGHT);
const usStatesSimplified = feature(usTopoSimplified, usTopoSimplified.objects.states).features;
const usStates = [
  ...usStatesRaw.filter(f => HI.has(f.properties.name)),
  ...usStatesSimplified.filter(f => !HI.has(f.properties.name)),
];
{
  const rawKB = JSON.stringify(usStatesRaw.map(f => f.geometry)).length / 1024;
  const mixedKB = JSON.stringify(usStates.map(f => f.geometry)).length / 1024;
  console.log(`US states simplified (weight ${US_SIMPLIFY_WEIGHT}, OK+TX excluded/kept full precision): ${rawKB.toFixed(1)}KB -> ${mixedKB.toFixed(1)}KB raw GeoJSON, ${usStates.length} states kept.`);
}

const coTopo = JSON.parse(fs.readFileSync('node_modules/us-atlas/counties-10m.json'));
const allCounties = feature(coTopo, coTopo.objects.counties).features;
// OK = state fips 40, TX = 48 (county ids are 5-digit, first 2 = state)
const okTxCounties = allCounties.filter(f => f.id && (String(f.id).startsWith('40') || String(f.id).startsWith('48')));
const countries = feature(worldTopo, worldTopo.objects.countries).features;
const mexico = countries.find(c => c.properties.name === 'Mexico');

// Mexican state lines. This file is admin-1 for the ENTIRE WORLD — every
// state, province, oblast and prefecture on Earth — so the filter is checked
// against the data, not assumed: adm0_a3, admin and iso_a2 all agree on the
// same 33 Mexico features. One of those 33 is a name-less "MEX-99 (Mexico
// minor island)" catch-all (area_sqkm 0, woe_id -99) — exactly the kind of
// stray geometry that wrecked a fit once before (us-atlas's states object
// carrying Guam and American Samoa). Requiring a real name drops it and
// leaves the 32 real states.
if (!fs.existsSync(GEOJSON_PATH)) {
  console.error(`Mexico admin-1 source not found at ${GEOJSON_PATH} — stopping, not substituting another atlas.`);
  process.exit(1);
}
const admin1 = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8')).features;
const mxStateFeaturesRaw = admin1.filter(f => f.properties.adm0_a3 === 'MEX' && f.properties.name);
console.log(`Mexico admin-1: ${admin1.filter(f => f.properties.adm0_a3 === 'MEX').length} raw features -> ${mxStateFeaturesRaw.length} named states.`);

// Simplify before projecting (see header). Quantization (1e5) only affects
// the intermediate integer grid topojson-server delta-encodes against — it
// is not the final coordinate precision, which is still the 1dp R() rounding
// applied later, same as every other layer.
const mxTopoPre = presimplify(topology({ mx: { type: 'FeatureCollection', features: mxStateFeaturesRaw } }, 1e5));
const mxTopoSimplified = simplify(mxTopoPre, MX_SIMPLIFY_WEIGHT);
const mxStateFeatures = feature(mxTopoSimplified, mxTopoSimplified.objects.mx).features;
{
  const rawKB = JSON.stringify(mxStateFeaturesRaw.map(f => f.geometry)).length / 1024;
  const simplifiedKB = JSON.stringify(mxStateFeatures.map(f => f.geometry)).length / 1024;
  console.log(`Mexico geometry simplified (weight ${MX_SIMPLIFY_WEIGHT}): ${rawKB.toFixed(1)}KB -> ${simplifiedKB.toFixed(1)}KB raw GeoJSON, ${mxStateFeatures.length} states kept.`);
}

// The map is the United States and Mexico, nothing else: the US–Canada border
// is the top edge and Mexico's southern border is the bottom edge. Drawing the
// rest of the continent made the frame a dark rectangle cut mid-land.
// Lower 48 (+DC) only, dissolved into one shape. us-atlas's `states` object also
// carries Alaska (02), Hawaii (15) and the territories (FIPS 60–78: Samoa, Guam,
// Marianas, Puerto Rico, Virgin Islands). Those are islands to this story, and a
// fit that includes Guam and Samoa spans the globe and collapses the map.
const lower48 = merge(usTopo, usTopo.objects.states.geometries.filter(g => {
  const id = String(g.id).padStart(2, '0');
  return +id <= 56 && id !== '02' && id !== '15';
}));
const LAND = [lower48, mexico];
const LAND_FC = { type: 'FeatureCollection', features: LAND.map(g => g.type === 'Feature' ? g : { type: 'Feature', geometry: g }) };

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

// Sanity check, before anything downstream trusts this data: the Jalisco and
// Estado de México partner markers (unprojected, both in lon/lat — this file
// uses the same lower-left-origin decimal-degree convention as PARTNERS, so
// no reprojection needed to compare them) must fall inside their own named
// state polygon. In this dataset "Estado de México" is just "México".
for (const [markerKey, stateName] of [['Jalisco', 'Jalisco'], ['Estado de Mexico', 'México']]) {
  const f = mxStateFeatures.find(s => s.properties.name === stateName);
  const contains = f ? d3.geoContains(f, PARTNERS[markerKey]) : false;
  console.log(`${stateName} polygon contains ${markerKey} partner marker: ${contains}`);
  if (!contains) {
    console.error(`${stateName} containment check FAILED — refusing to trust the projection. Stopping.`);
    process.exit(1);
  }
}

// `left` reserves a rail on the left of the frame (the partner callouts live
// there) so the land is fitted into the remaining width, not under them.
// `fit`, when given, is the geometry the projection is fitted to instead of the
// ring — the land itself, so the frame is as tight as the countries' outline.
function makeFrame({ bounds, width, height, pad, left = 0, fit = null }) {
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
  proj.fitExtent([[pad + left, pad], [width - pad, height - pad]], fit || frameBox);
  proj.clipExtent([[-70, -70], [width + 70, height + 70]]);
  return { proj, path: d3.geoPath(proj), bounds };
}

function inFrame(f, bounds) {
  const [[w, s], [e, n]] = bounds;
  const b = d3.geoBounds(f);
  return !(b[1][0] < w || b[0][0] > e || b[1][1] < s || b[0][1] > n);
}

const FRAMES = {
  reach: makeFrame({ bounds: d3.geoBounds(LAND_FC), fit: LAND_FC, width: 1200, height: 750, pad: 20, left: 200 }),
  corridor: makeFrame({ bounds: [[-107, 25.8], [-93.3, 37.2]], width: 520, height: 470, pad: 16 }),
};

const R = d => d == null ? d : d.replace(/-?\d+\.\d+/g, m => (+m).toFixed(1));
const out = {};
for (const [name, F] of Object.entries(FRAMES)) {
  const states = usStates
    .filter(f => inFrame(f, F.bounds))
    .map(f => ({ name: f.properties.name, d: R(F.path(f)) }))
    .filter(f => f.d);
  const mxstates = mxStateFeatures
    .filter(f => inFrame(f, F.bounds))
    .map(f => ({ name: f.properties.name, d: R(F.path(f)) }))
    .filter(f => f.d);
  const landNA = LAND.map(f => R(F.path(f))).filter(Boolean);
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
  out[name] = { states, mxstates, landNA, cities, cities2, partners, counties };
  console.log(`${name}: ${counties.length} counties, ${states.length} states, ${mxstates.length} mxstates, land ${(landNA.join('').length / 1024).toFixed(1)}KB, states ${(states.reduce((a, b) => a + b.d.length, 0) / 1024).toFixed(1)}KB, mxstates ${(mxstates.reduce((a, b) => a + b.d.length, 0) / 1024).toFixed(1)}KB`);
  console.log('   states: ' + states.map(s => s.name).join(', '));
  console.log('   mxstates: ' + mxstates.map(s => s.name).join(', '));
}
fs.writeFileSync('paths.json', JSON.stringify(out));
console.log('OKC reach:', out.reach.cities['Oklahoma City'], ' corridor:', out.corridor.cities['Oklahoma City']);
console.log('Jalisco reach:', out.reach.partners['Jalisco']);
console.log('reach bounds (lon/lat of the land):', JSON.stringify(FRAMES.reach.bounds.map(p => p.map(n => +n.toFixed(1)))));

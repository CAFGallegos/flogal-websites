// Builds the carriers map section from scripts/map/paths.json.
// Run:  cd scripts/map && node build-map-section.mjs            (no relief plate)
//       cd scripts/map && node build-map-section.mjs --relief   (with relief plate)
// Emits _map-section.html and _map-section.css next to itself. Those two files
// are scratch output to paste into the page and the stylesheet — do not ship them.
// No dependencies. Pure node.
import fs from 'fs';
const P = JSON.parse(fs.readFileSync('paths.json', 'utf8')).reach;

// CSS uses the repo's tokens; SVG presentation attributes keep literals because
// var() in an SVG attribute is not reliable across the browsers this site supports.
const T = {
  night: 'var(--op-night)', surface: 'var(--op-night-surface)', rule: 'var(--op-night-rule)',
  fg: 'var(--op-night-fg)', dim: 'var(--op-night-fg-dim)', faint: 'var(--op-night-fg-faint)',
  blue: 'var(--accent)', blueStrong: 'var(--op-night-blue-strong)', blueLt: '#9CC4EE',
};
const LIT = { night: '#050A12', fg: '#E8EEF6', dim: '#94A6BD', blue: '#4A90D9', blueLt: '#9CC4EE' };
const FONT = 'var(--font-sans)';
const MONO = 'var(--font-mono)';
const HI = new Set(['Oklahoma', 'Texas']);
const VW = 1200, VH = 750, CX = VW / 2, CY = VH / 2;
const C = P.cities, C2 = P.cities2, PR = P.partners;

const LANES = [
  { id: 'l1', a: 'DFW', b: 'Oklahoma City', bow: .05, k: 'p', label: 'Dallas–Fort Worth · Oklahoma City', note: 'Flatbed, dry van, bulk', tag: 'Primary' },
  { id: 'l2', a: 'Houston', b: 'Tulsa', bow: .09, k: 'a', label: 'Houston · Tulsa', note: 'Flatbed, heavy haul', tag: 'Active' },
  { id: 'l3', a: 'San Antonio', b: 'Austin', bow: 0, k: 'a', label: 'San Antonio · Austin', note: 'Bulk, aggregate', tag: 'Active' },
  { id: 'l4', a: 'Midland', b: 'DFW', bow: -.06, k: 'a', label: 'Midland–Odessa · Dallas', note: 'Flatbed, hot-shot', tag: 'Active' },
  { id: 'l5', a: 'DFW', b: 'Memphis', bow: -.06, k: 'a', label: 'Dallas · Memphis', note: 'Dry van', tag: 'Spot' },
  { id: 'l6', a: 'Houston', b: 'Laredo', bow: .07, k: 'x', label: 'Houston · Laredo', note: 'Cross-border dry van, via partner', tag: 'Partner' },
];
const PARTNERS = [
  { id: 'p0', key: 'New Mexico', names: ['DA Transport'], place: 'New Mexico, US' },
  { id: 'p1', key: 'California', names: ['Evolution', "Int'l Transport", 'Moreno Brothers'], place: 'California, US' },
  { id: 'p2', key: 'Texas', names: ['FLS Express'], place: 'Texas, US' },
  { id: 'p3', key: 'Jalisco', names: ['Odal'], place: 'Jalisco, MX' },
  { id: 'p4', key: 'Estado de Mexico', names: ['Olior'], place: 'Estado de México, MX' },
];
const CITY_STATE = {
  'Oklahoma City': 'Oklahoma', 'Tulsa': 'Oklahoma', 'DFW': 'Texas', 'Austin': 'Texas',
  'San Antonio': 'Texas', 'Houston': 'Texas', 'Midland': 'Texas', 'Laredo': 'Texas',
  'El Paso': 'Texas', 'Memphis': 'Tennessee',
};
const CITY_LONG = { 'DFW': 'Dallas–Fort Worth', 'Midland': 'Midland–Odessa' };
const C2_SIDE = {
  'Norman': 'r', 'Lawton': 'l', 'Ardmore': 'r', 'Enid': 'l', 'Amarillo': 'l',
  'Lubbock': 'l', 'Abilene': 'l', 'Waco': 'r', 'Tyler': 'r', 'Wichita Falls': 'l',
  'Corpus Christi': 'r', 'McAllen': 'l', 'Texarkana': 'r', 'Killeen': 'l',
};
// label anchor for each partner, in viewBox units, plus which side the text runs
const CALLOUT = {
  p1: { x: 46, y: 262, side: 'r' },   // California
  p0: { x: 46, y: 372, side: 'r' },   // New Mexico
  p2: { x: 46, y: 482, side: 'r' },   // Texas / FLS
  p3: { x: 46, y: 592, side: 'r' },   // Jalisco
  p4: { x: 46, y: 690, side: 'r' },   // Estado de Mexico
};
const CITY_SIDE = {
  'Oklahoma City': 'l', 'Tulsa': 'r', 'DFW': 'r', 'Austin': 'l', 'San Antonio': 'l',
  'Houston': 'r', 'Midland': 'l', 'Laredo': 'l', 'El Paso': 'l', 'Memphis': 'r',
};

function laneGeom(l) {
  const [x1, y1] = C[l.a], [x2, y2] = C[l.b];
  const mx = (x1 + x2) / 2 + (y2 - y1) * l.bow;
  const my = (y1 + y2) / 2 - (x2 - x1) * l.bow;
  return { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, cx: (x1 + 2 * mx + x2) / 4, cy: (y1 + 2 * my + y2) / 4, len: Math.hypot(x2 - x1, y2 - y1) };
}

// ---- focus table: id -> centre + scale ------------------------------
const FOCUS = [];
LANES.forEach(l => { const g = laneGeom(l); FOCUS.push({ id: l.id, cx: g.cx, cy: g.cy, s: Math.max(2.1, Math.min(3.2, 430 / Math.max(g.len, 72))) }); });
PARTNERS.forEach(p => FOCUS.push({ id: p.id, cx: PR[p.key][0], cy: PR[p.key][1], s: 2.3 }));
Object.keys(C).forEach((n, i) => FOCUS.push({ id: `c${i}`, cx: C[n][0], cy: C[n][1], s: n === 'Oklahoma City' ? 3.1 : 2.9 }));

const CORRIDOR_IDS = [...LANES.map(l => l.id), ...Object.keys(C).map((n, i) => `c${i}`)];

function css() {
  const o = [];
  // every target: hovering the map shape OR its index row drives the same focus
  FOCUS.forEach(f => {
    const tx = +(CX - f.s * f.cx).toFixed(1), ty = +(CY - f.s * f.cy).toFixed(1);
    const isP = f.id.startsWith('p');
    o.push(isP
      ? `.sec:has(.t-${f.id}:focus) .zoomable{transform:translate(${tx}px,${ty}px) scale(${f.s.toFixed(2)});}`
      : `.sec:has(.t-${f.id}:hover) .zoomable,.sec:has(.t-${f.id}:focus) .zoomable{transform:translate(${tx}px,${ty}px) scale(${f.s.toFixed(2)});}`);
    if (!isP) o.push(`.sec:has(.t-${f.id}:hover) .card-${f.id},.sec:has(.t-${f.id}:focus) .card-${f.id}{opacity:1;}`);
  });
  LANES.forEach(l => o.push(`.sec:has(.t-${l.id}:hover) .v-${l.id},.sec:has(.t-${l.id}:focus) .v-${l.id}{stroke-width:3.4;stroke-opacity:1;filter:drop-shadow(0 0 6px rgba(74,144,217,.65));}`));
  PARTNERS.forEach(p => o.push(`.sec:has(.t-${p.id}:hover) .v-${p.id},.sec:has(.t-${p.id}:focus) .v-${p.id}{stroke-opacity:1;stroke-width:2.4;filter:drop-shadow(0 0 7px rgba(74,144,217,.7));}`));
  // map -> index: hovering the map lights the matching row

  // territory + county detail only when the focus is inside the corridor
  const corr = CORRIDOR_IDS.map(id => `.sec:has(.t-${id}:hover),.sec:has(.t-${id}:focus)`).join(',');
  o.push(`${corr}{--terr:1;}`);
  Object.keys(C).forEach((n, i) => o.push(
    `.sec:has(.t-c${i}:hover) .z-c${i} circle,.sec:has(.t-c${i}:focus) .z-c${i} circle{fill:${T.blueLt};}
.sec:has(.t-c${i}:hover) .z-c${i} text,.sec:has(.t-c${i}:focus) .z-c${i} text{fill:${T.fg};}`));
  return o.join('\n');
}

// ---- svg pieces ------------------------------------------------------
function node(n, xy, { primary, side, fs, r, id = '', label = true }) {
  const [x, y] = xy, off = r + 9;
  return `<g${id ? ` class="${id}"` : ''}><circle cx="${x}" cy="${y}" r="${primary ? r : r - 1.3}" fill="${primary ? LIT.blue : 'rgba(232,238,246,.88)'}" stroke="${LIT.night}" stroke-width="1" vector-effect="non-scaling-stroke"/>${label ? `<text x="${side === 'l' ? x - off : x + off}" y="${y + fs * .34}" text-anchor="${side === 'l' ? 'end' : 'start'}" font-family="${MONO}" font-size="${fs}" font-weight="${primary ? 700 : 600}" fill="${primary ? LIT.fg : 'rgba(232,238,246,.6)'}" letter-spacing=".09em">${n.toUpperCase()}</text>` : ''}</g>`;
}
function card(id, lines) {
  const pad = 11, lh = 19, x = 24, y = 24;
  const bw = Math.max(...lines.map(l => l.t.length * (l.sm ? 6.3 : 8.1))) + pad * 2;
  const bh = lines.length * lh + pad * 2 - 3;
  const txt = lines.map((l, i) => `<text x="${x + pad}" y="${y + pad + lh * i + 14}" font-family="${l.sm ? MONO : FONT}" font-size="${l.sm ? 10.5 : 13}" font-weight="${l.sm ? 500 : 600}" fill="${l.sm ? LIT.dim : LIT.fg}"${l.sm ? ' letter-spacing=".05em"' : ''}>${l.t}</text>`).join('');
  return `<g class="card card-${id}"><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="#0C1B2B" fill-opacity=".98" stroke="#9CC4EE" stroke-opacity=".38" stroke-width="1" vector-effect="non-scaling-stroke"/>${txt}</g>`;
}

const RELIEF = process.argv.includes('--relief');
function mapSvg() {
  // The land silhouette is ~140 KB of path data. Emit it ONCE.
  // Without --relief: drawn directly, no clip path, no <image>, no dead asset ref.
  // With --relief: the paths live in the clipPath (each with an id) and the
  // visible land is <use> references to them.
  const landClip = RELIEF
    ? `<clipPath id="opm-landclip">${P.landNA.map((d, i) => `<path id="opm-landp${i}" d="${d}"/>`).join('')}</clipPath>`
    : '';
  const relief = RELIEF
    ? `<image class="relief" href="assets/carriers-relief.webp" x="0" y="0" width="${VW}" height="${VH}" preserveAspectRatio="none" clip-path="url(#opm-landclip)"/>`
    : '';
  const land = RELIEF
    ? `<g filter="url(#coast)">${P.landNA.map((d, i) => `<use href="#opm-landp${i}" fill="#17293D" stroke="#17293D" stroke-width=".7" vector-effect="non-scaling-stroke"/>`).join('')}</g>`
    : `<g filter="url(#coast)">${P.landNA.map(d => `<path d="${d}" fill="#17293D" stroke="#17293D" stroke-width=".7" vector-effect="non-scaling-stroke"/>`).join('')}</g>`;
  const terr = `<g class="terr">${P.states.filter(s => HI.has(s.name)).map(s =>
    `<path d="${s.d}" fill="rgba(74,144,217,.16)" stroke="#9CC4EE" stroke-opacity=".34" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('')}</g>`;
  const counties = `<g class="dco">${P.counties.map(d =>
    `<path d="${d}" fill="none" stroke="#9CC4EE" stroke-width=".5" stroke-opacity=".3" vector-effect="non-scaling-stroke"/>`).join('')}</g>`;

  const laneV = LANES.map(l => {
    const g = laneGeom(l);
    const st = l.k === 'p' ? LIT.blue : l.k === 'x' ? 'rgba(74,144,217,.78)' : 'rgba(232,238,246,.5)';
    return `<path class="ln v-${l.id}" d="${g.d}" fill="none" stroke="${st}" stroke-width="${l.k === 'p' ? 2.8 : 1.5}" stroke-linecap="round" vector-effect="non-scaling-stroke"${l.k === 'x' ? ' stroke-dasharray="5 5"' : ''}/>`;
  }).join('');

  const [hx, hy] = C['Oklahoma City'];
  const hq = `<g class="vhq"><circle cx="${hx}" cy="${hy}" r="13" fill="none" stroke="#9CC4EE" stroke-width="1" stroke-opacity=".4" vector-effect="non-scaling-stroke"/><circle cx="${hx}" cy="${hy}" r="13" fill="none" stroke="#9CC4EE" stroke-width="1" stroke-opacity=".15" stroke-dasharray="2 4" vector-effect="non-scaling-stroke"/></g>`;

  const restNodes = `<g class="rest">${Object.entries(C).map(([n, xy]) =>
    node(n, xy, { primary: n === 'Oklahoma City' || n === 'DFW', side: CITY_SIDE[n], fs: 12.5, r: 5, label: n === 'Oklahoma City' })).join('')}</g>`;

  const zoomNodes = `<g class="dcity">${Object.entries(C2).filter(([n]) => C2_SIDE[n]).map(([n, xy]) =>
    node(n, xy, { primary: false, side: C2_SIDE[n], fs: 5.6, r: 2.3 })).join('')
    + Object.entries(C).map(([n, xy], i) =>
      node(CITY_LONG[n] || n, xy, { primary: n === 'Oklahoma City' || n === 'DFW', side: CITY_SIDE[n], fs: 6, r: 2.7, id: `z-c${i}` })).join('')}</g>`;

  const partnerV = PARTNERS.map(p => {
    const [x, y] = PR[p.key], d = 6;
    return `<path class="dia v-${p.id}" d="M${x},${y - d} L${x + d},${y} L${x},${y + d} L${x - d},${y} Z" fill="rgba(74,144,217,.2)" stroke="#9CC4EE" stroke-opacity=".72" stroke-width="1.3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
  }).join('');

  // ---- partner callouts (static: leader lines stay true because nothing moves)
  const callouts = PARTNERS.map(p => {
    const [mx2, my2] = PR[p.key];
    const a = CALLOUT[p.id];
    const one = p.names.length === 1;
    const head = one ? p.names[0] : `${p.place.replace(/, (US|MX)$/, '')}`;
    const sub = one ? p.place : `${p.names.length} carriers`;
    const wC = Math.max(head.length * 8.4, sub.length * 6.6) + 26;
    const wE = Math.max(...p.names.map(n => n.length * 8.4), p.place.length * 6.6) + 26;
    const hE = p.names.length * 20 + 34;
    const bx = a.side === 'l' ? a.x - wC : a.x;
    const bxE = a.side === 'l' ? a.x - wE : a.x;
    const tie = a.side === 'l' ? a.x : a.x + wC;
    const tieE = a.side === 'l' ? a.x : a.x + wE;
    return `<g class="co co-${p.id} tgt tp t-${p.id}" tabindex="0" role="button" aria-label="${p.names.join(', ')} — ${p.place}">
<path class="tie" d="M${tie},${a.y} L${(tie + mx2) / 2},${a.y} L${mx2},${my2}" fill="none" stroke="#9CC4EE" stroke-opacity=".3" stroke-width="1" vector-effect="non-scaling-stroke"/>
<circle cx="${mx2}" cy="${my2}" r="14" fill="transparent"/>
<g class="co-c">
  <rect x="${bx}" y="${a.y - 21}" width="${wC}" height="42" rx="7" fill="#0C1B2B" fill-opacity=".9" stroke="#9CC4EE" stroke-opacity=".3" stroke-width="1" vector-effect="non-scaling-stroke"/>
  <text x="${bx + 13}" y="${a.y - 2}" font-family="${FONT}" font-size="13.5" font-weight="600" fill="#E8EEF6">${head}</text>
  <text x="${bx + 13}" y="${a.y + 14}" font-family="${MONO}" font-size="10" letter-spacing=".06em" fill="#5F7491">${sub.toUpperCase()}</text>
</g>
<g class="co-e">
  <rect x="${bxE}" y="${a.y - hE / 2}" width="${wE}" height="${hE}" rx="7" fill="#0C1B2B" fill-opacity=".98" stroke="#9CC4EE" stroke-opacity=".55" stroke-width="1" vector-effect="non-scaling-stroke"/>
  ${p.names.map((n, i) => `<text x="${bxE + 13}" y="${a.y - hE / 2 + 25 + i * 20}" font-family="${FONT}" font-size="13.5" font-weight="600" fill="#E8EEF6">${n}</text>`).join('')}
  <text x="${bxE + 13}" y="${a.y - hE / 2 + 25 + p.names.length * 20 + 2}" font-family="${MONO}" font-size="10" letter-spacing=".06em" fill="#5F7491">${p.place.toUpperCase()}</text>
</g></g>`;
  }).join('');

  // ---- static hit layer + cards (never transforms)
  const laneH = LANES.map(l => `<g class="tgt t-${l.id}" tabindex="0" role="button" aria-label="${l.label}. ${l.note}"><path d="${laneGeom(l).d}" fill="none" stroke="transparent" stroke-width="17" vector-effect="non-scaling-stroke"/></g>`).join('');
  const partnerH = '';
  const cityH = Object.entries(C).map(([n, xy], i) => {
    const [x, y] = xy, lab = n === 'Oklahoma City';
    const hx2 = lab ? (CITY_SIDE[n] === 'l' ? x - 112 : x - 14) : x - 15;
    return `<g class="tgt t-c${i}" tabindex="0" role="button" aria-label="${CITY_LONG[n] || n}, ${CITY_STATE[n]}"><rect x="${hx2}" y="${y - 15}" width="${lab ? 126 : 30}" height="30" fill="transparent"/></g>`;
  }).join('');

  const cards = [
    ...LANES.map(l => card(l.id, [{ t: l.label }, { t: l.note, sm: true }])),
    ...PARTNERS.map(p => card(p.id, [...p.names.map(t => ({ t })), { t: p.place, sm: true }])),
    ...Object.keys(C).map((n, i) => card(`c${i}`, n === 'Oklahoma City'
      ? [{ t: 'Flogal Holdings' }, { t: 'Oklahoma City, OK', sm: true }]
      : [{ t: CITY_LONG[n] || n }, { t: CITY_STATE[n], sm: true }])),
  ].join('');

  return `<svg class="viz" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" role="img" aria-label="Flogal owned corridor and partner network across North America">
<defs><filter id="coast" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#9CC4EE" flood-opacity=".4"/></filter><radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4A90D9" stop-opacity=".2"/><stop offset="1" stop-color="#4A90D9" stop-opacity="0"/></radialGradient></defs>
<defs>${landClip}</defs>
<g class="zoomable">${land}${relief}<ellipse class="pool" cx="${C['DFW'][0] - 6}" cy="${(C['DFW'][1] + C['Oklahoma City'][1]) / 2}" rx="116" ry="96" fill="url(#pool)"/>${terr}${counties}${zoomNodes}${laneV}${hq}${restNodes}${partnerV}</g>
</svg>
<svg class="hits" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%">
${laneH}${cityH}${partnerH}<g class="callouts">${callouts}</g>${cards}
</svg>`;
}

// ---- index rail ------------------------------------------------------
const SWATCH = {
  p: `<i style="width:15px;height:3px;border-radius:2px;background:${T.blue};flex:0 0 auto"></i>`,
  a: `<i style="width:15px;height:2px;border-radius:2px;background:rgba(232,238,246,.42);flex:0 0 auto"></i>`,
  x: `<i style="width:15px;height:2px;border-radius:2px;flex:0 0 auto;background:repeating-linear-gradient(90deg,${T.blue} 0 4px,transparent 4px 7px)"></i>`,
  d: `<i style="width:8px;height:8px;background:rgba(74,144,217,.2);border:1px solid ${T.blueLt};transform:rotate(45deg);flex:0 0 auto"></i>`,
};
function row(cls, swatch, name, meta) {
  return `<div class="row ${cls}" tabindex="0" role="button">
  <span style="display:flex;align-items:center;width:17px;flex:0 0 17px">${swatch}</span>
  <span class="rn" style="flex:1 1 auto;font-family:${FONT};font-size:13px;font-weight:500;color:rgba(232,238,246,.8);line-height:1.35">${name}</span>
  <span style="font-family:${MONO};font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${T.faint};white-space:nowrap;flex:0 0 auto">${meta}</span>
</div>`;
}
function groupHead(t) {
  return `<div style="font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:${T.faint};padding:0 0 8px 17px">${t}</div>`;
}


const CSSBODY_RAW = `
.sec{--terr:0;}
.stage{position:relative;width:100%;height:672px;overflow:hidden;background:transparent;
  -webkit-mask-image:radial-gradient(118% 122% at 50% 50%,#000 50%,rgba(0,0,0,.8) 74%,transparent 97%);
  mask-image:radial-gradient(118% 122% at 50% 50%,#000 50%,rgba(0,0,0,.8) 74%,transparent 97%);}
.zoomable{transform-box:view-box;transform-origin:0 0;will-change:transform;
  transition:transform 1080ms cubic-bezier(.2,.9,.24,1);}
.terr,.dco,.dcity{opacity:var(--terr);transition:opacity 620ms ease 280ms;}
.dco,.dcity{transition-delay:360ms;}
.rest,.vhq,.pool{transition:opacity 280ms ease;}
.sec:has(.tgt:not(.tp):hover) .pool,.sec:has(.tgt:not(.tp):focus) .pool,
.sec:has(.co:focus) .pool{opacity:0;}
.sec:has(.tgt:not(.tp):hover) .rest,.sec:has(.tgt:not(.tp):focus) .rest,
.sec:has(.co:focus) .rest,
.sec:has(.tgt:not(.tp):hover) .vhq,.sec:has(.tgt:not(.tp):focus) .vhq,
.sec:has(.co:focus) .vhq{opacity:0;}
.sec:has(.tgt:hover) .zhint,.sec:has(.tgt:focus) .zhint{opacity:0;}
.ln,.dia{transition:stroke-width 280ms,stroke-opacity 280ms,filter 280ms;}
.hits .tgt{cursor:pointer;outline:none;}
.card{opacity:0;transition:opacity 260ms ease 440ms;pointer-events:none;}
.zhint{position:absolute;right:26px;bottom:20px;display:inline-flex;align-items:center;gap:8px;
  font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:${T.faint};transition:opacity 300ms;pointer-events:none;}
.co{cursor:pointer;outline:none;}
.co,.co-c,.co-e,.tie{transition:opacity 240ms ease;}
.co-e{opacity:0;}
.co:hover .co-c,.co:focus .co-c{opacity:0;}
.co:hover .co-e,.co:focus .co-e{opacity:1;}
.co:hover .tie,.co:focus .tie{stroke-opacity:.75;}
.callouts{transition:opacity 300ms ease;}
/* a zoom to anything on the map invalidates the leader lines, so they leave */
.sec:has(.tgt:not(.tp):hover) .callouts,.sec:has(.tgt:not(.tp):focus) .callouts,
.sec:has(.co:focus) .co:not(:focus){opacity:0;}
.co:focus .tie{opacity:0;}
;}
@media (prefers-reduced-motion:reduce){.zoomable{transition:none;}}
`;

// ---------------------------------------------------------------- emit
// Class names are prefixed opm- (Op Map) and every rule is scoped under
// .op-lanes so nothing here can reach the rest of the site.
const RENAME = {
  sec: 'op-lanes', stage: 'opm-stage', zoomable: 'opm-zoom', viz: 'opm-viz', hits: 'opm-hits',
  terr: 'opm-terr', dco: 'opm-dco', dcity: 'opm-dcity', rest: 'opm-rest', vhq: 'opm-vhq',
  pool: 'opm-pool', ln: 'opm-ln', dia: 'opm-dia', tgt: 'opm-tgt', tp: 'opm-tp',
  card: 'opm-card', co: 'opm-co', 'co-c': 'opm-co-c', 'co-e': 'opm-co-e',
  tie: 'opm-tie', callouts: 'opm-callouts', zhint: 'opm-zhint', relief: 'opm-relief',
};
function rename(str) {
  let out = str;
  for (const [from, to] of Object.entries(RENAME)) {
    out = out.replace(new RegExp('(?<=class=")' + from + '(?=[ "])', 'g'), to);
    out = out.replace(new RegExp('(?<=class="[^"]*?[ ])' + from + '(?=[ "])', 'g'), to);
    // ')' counts as a selector boundary — without it :not(.tp) stays unprefixed
    // and every hover, partners included, blanks the corridor layer.
    out = out.replace(new RegExp('\\.' + from + '(?=[ ,:.{>)])', 'g'), '.' + to);
  }
  // dynamic families. The RENAME pass above has already prefixed the first token
  // of each class attribute, so these anchor to the prefixed form to avoid
  // producing 'opm-opm-card'.
  out = out.replace(/\.t-/g, '.opm-t-').replace(/class="((?:[^"]*? )?)t-/g, 'class="$1opm-t-');
  out = out.replace(/\.v-/g, '.opm-v-').replace(/class="((?:[^"]*? )?)v-/g, 'class="$1opm-v-');
  out = out.replace(/\.card-/g, '.opm-card-').replace(/opm-card card-/g, 'opm-card opm-card-');
  out = out.replace(/\.z-c/g, '.opm-z-c').replace(/class="z-c/g, 'class="opm-z-c');
  out = out.replace(/\.co-p/g, '.opm-co-p').replace(/opm-co co-p/g, 'opm-co opm-co-p');
  return out;
}

const SECTION = `<section class="op-lanes" id="lanes">
  <div class="op-wrap">
   <div class="op-lanes-frame">

    <div class="op-lanes-head">
      <div class="op-lanes-head-copy">
        <span class="op-eyebrow">Network &amp; active lanes</span>
        <h2 class="op-h2">Built around the TX–OK corridor — extended by partners we know.</h2>
        <p class="op-section-sub">Our owned capacity runs densely on the Dallas–Oklahoma City spine, with secondary lanes feeding in from Houston, San Antonio, and West Texas. Beyond that, a vetted network of U.S. and Mexico carrier partners extends our reach.</p>
      </div>
      <div class="op-lanes-head-cta">
        <button type="button" class="op-btn op-btn-blue">Request a Quote</button>
        <span class="op-lanes-cta-lead">One reply from the ops desk — no broker queue.</span>
      </div>
    </div>

    <div class="opm-stage">
${mapSvg()}
      <div class="opm-zhint">Hover a lane, a city or a partner · click to hold</div>
    </div>

    <div class="op-lanes-foot">
      <div class="op-lanes-contact">
        <a href="tel:+19724761988" class="op-lanes-tel">+1 (972) 476-1988</a>
        <a href="mailto:carriers@flogalhq.com">carriers@flogalhq.com</a>
        <span class="op-lanes-serving">Serving Oklahoma and Texas.</span>
      </div>
      <span class="op-lanes-count">Seven partner carriers · five states · two countries</span>
    </div>

   </div>
  </div>
</section>`;

const CSSBODY = CSSBODY_RAW + "\n" + css();
const CSS = `/* ---- Network & active lanes: map ----------------------------------- */
.op-lanes{padding:96px 0;}
.op-lanes-frame{border:1px solid ${T.rule};border-radius:2px;padding:44px 44px 36px;}
.relief{opacity:.92;mix-blend-mode:screen;}
.op-lanes-head{display:flex;align-items:flex-end;justify-content:space-between;gap:56px;margin-bottom:34px;}
.op-lanes-head-copy{max-width:63ch;display:flex;flex-direction:column;gap:14px;flex:1 1 auto;}
.op-lanes-head-cta{display:flex;flex-direction:column;align-items:flex-end;gap:11px;flex:0 0 auto;}
.op-lanes-cta-lead{font-size:11.5px;color:${T.dim};text-align:right;max-width:214px;line-height:1.45;}
.op-lanes-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:48px;
  margin-top:34px;padding-top:22px;border-top:1px solid ${T.rule};}
.op-lanes-contact{display:flex;align-items:baseline;gap:26px;flex-wrap:wrap;}
.op-lanes-contact a{text-decoration:none;color:${T.blueStrong};font-size:14px;}
.op-lanes-contact a:hover{color:#9CC4EE;}
.op-lanes-tel{font-family:${MONO};font-size:15px;font-weight:600;letter-spacing:.01em;}
.op-lanes-serving{font-size:12.5px;color:${T.faint};}
.op-lanes-count{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${T.faint};}

${CSSBODY}

/* Without :has() the map is a static silhouette with compact callouts —
   no zoom, no expansion. That is an acceptable floor, not a broken page. */
`;

fs.writeFileSync('_map-section.html', rename(SECTION));
fs.writeFileSync('_map-section.css', rename(CSS));
console.log('wrote _map-section.html and _map-section.css');

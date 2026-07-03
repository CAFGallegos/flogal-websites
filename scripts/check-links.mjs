#!/usr/bin/env node
// Link checker for flogal-websites.
// Scans every HTML file under sites/<site>/ (excluding apps/, which is not
// a static site) and reports: internal links to missing files, empty
// hrefs, buttons with no handler/target, and mailto:/tel: links.
//
// Usage: node scripts/check-links.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITES_DIR = path.join(ROOT, 'sites');

// Only the five public static sites this repo actually serves.
const SITES = ['flogalhq', 'sales', 'carriers', 'properties', 'admin'];

function findHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function extractTags(html, tagNames) {
  const re = new RegExp(`<(${tagNames.join('|')})\\b([^>]*)>`, 'gi');
  const tags = [];
  let m;
  while ((m = re.exec(html))) {
    const tagName = m[1].toLowerCase();
    const attrsRaw = m[2];
    const attrs = {};
    const attrRe = /([\w-]+)\s*=\s*"([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(attrsRaw))) {
      attrs[am[1].toLowerCase()] = am[2];
    }
    const hasOnclick = /\bonclick\s*=/.test(attrsRaw);
    const hasOnsubmit = /\bonsubmit\s*=/.test(attrsRaw);
    const line = html.slice(0, m.index).split('\n').length;
    tags.push({ tagName, attrs, raw: m[0], hasOnclick, hasOnsubmit, line });
  }
  return tags;
}

function classifyHref(href) {
  if (href == null) return 'missing-attr';
  const h = href.trim();
  if (h === '' || h === '#' || /^javascript:/i.test(h)) return 'empty';
  if (/^mailto:/i.test(h)) return 'mailto';
  if (/^tel:/i.test(h)) return 'tel';
  if (/^https?:\/\//i.test(h)) return 'external';
  if (/^#/.test(h)) return 'anchor';
  if (/^(data|blob):/i.test(h)) return 'data';
  return 'internal';
}

function resolveInternal(href, fileDir, siteDir) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '') return null; // pure anchor already filtered
  const target = clean.startsWith('/')
    ? path.join(siteDir, clean.slice(1))
    : path.resolve(fileDir, clean);
  return target;
}

function fileExistsLoose(target) {
  if (fs.existsSync(target)) return true;
  // allow directory index resolution (foo/ -> foo/index.html)
  if (fs.existsSync(target + '.html')) return true;
  if (fs.existsSync(path.join(target, 'index.html'))) return true;
  return false;
}

const report = {};

for (const site of SITES) {
  const siteDir = path.join(SITES_DIR, site);
  if (!fs.existsSync(siteDir)) continue;
  const files = findHtmlFiles(siteDir);
  const siteReport = {
    brokenLinks: [],
    emptyHrefs: [],
    deadButtons: [],
    mailtoLinks: [],
    telLinks: [],
    brokenAssets: [],
  };

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const fileDir = path.dirname(file);
    const relFile = path.relative(ROOT, file);

    // Links
    for (const tag of extractTags(html, ['a'])) {
      const href = tag.attrs.href;
      const cls = classifyHref(href);
      if (cls === 'empty') {
        siteReport.emptyHrefs.push({ file: relFile, line: tag.line, href: href ?? '(none)', hasOnclick: tag.hasOnclick });
      } else if (cls === 'mailto') {
        siteReport.mailtoLinks.push({ file: relFile, line: tag.line, href });
      } else if (cls === 'tel') {
        siteReport.telLinks.push({ file: relFile, line: tag.line, href });
      } else if (cls === 'internal') {
        const target = resolveInternal(href, fileDir, siteDir);
        if (target && !fileExistsLoose(target)) {
          siteReport.brokenLinks.push({ file: relFile, line: tag.line, href, resolvedTo: path.relative(ROOT, target) });
        }
      }
    }

    // Buttons with no visible handler/target
    for (const tag of extractTags(html, ['button'])) {
      const type = (tag.attrs.type || '').toLowerCase();
      const hasId = !!tag.attrs.id;
      const disabled = /\bdisabled\b/.test(tag.raw);
      if (disabled) continue;
      if (type === 'submit') continue; // wired via form onsubmit
      if (tag.hasOnclick) continue;
      if (hasId) {
        // Likely wired via addEventListener elsewhere — flag as "verify" not "dead"
        siteReport.deadButtons.push({ file: relFile, line: tag.line, note: `id="${tag.attrs.id}" — no inline onclick; verify a script wires this id`, certain: false });
      } else {
        siteReport.deadButtons.push({ file: relFile, line: tag.line, note: 'no onclick, no id, not type=submit — likely inert', certain: true });
      }
    }

    // Assets (img/link/script) pointing at missing local files
    for (const tag of extractTags(html, ['img', 'link', 'script'])) {
      const src = tag.attrs.src ?? tag.attrs.href;
      if (!src) continue;
      if (src.includes('${')) continue; // JS template literal, not static markup
      const cls = classifyHref(src);
      if (cls !== 'internal') continue;
      const target = resolveInternal(src, fileDir, siteDir);
      if (target && !fileExistsLoose(target)) {
        siteReport.brokenAssets.push({ file: relFile, line: tag.line, tag: tag.tagName, src, resolvedTo: path.relative(ROOT, target) });
      }
    }
  }

  report[site] = siteReport;
}

// ---- Print ----
let totalBroken = 0;
for (const site of SITES) {
  const r = report[site];
  if (!r) continue;
  console.log(`\n=== ${site} ===`);
  console.log(`  Broken internal links: ${r.brokenLinks.length}`);
  r.brokenLinks.forEach(b => console.log(`    ${b.file}:${b.line}  href="${b.href}"  -> missing ${b.resolvedTo}`));
  console.log(`  Broken asset refs (img/link/script): ${r.brokenAssets.length}`);
  r.brokenAssets.forEach(b => console.log(`    ${b.file}:${b.line}  <${b.tag}> src/href="${b.src}"  -> missing ${b.resolvedTo}`));
  console.log(`  Empty hrefs: ${r.emptyHrefs.length}`);
  r.emptyHrefs.forEach(b => console.log(`    ${b.file}:${b.line}  href="${b.href}"  onclick=${b.hasOnclick}`));
  console.log(`  Buttons with no direct handler/target: ${r.deadButtons.length}`);
  r.deadButtons.forEach(b => console.log(`    ${b.file}:${b.line}  ${b.note}`));
  console.log(`  mailto: links: ${r.mailtoLinks.length}`);
  r.mailtoLinks.forEach(b => console.log(`    ${b.file}:${b.line}  ${b.href}`));
  console.log(`  tel: links: ${r.telLinks.length}`);
  r.telLinks.forEach(b => console.log(`    ${b.file}:${b.line}  ${b.href}`));
  totalBroken += r.brokenLinks.length + r.brokenAssets.length;
}

console.log(`\n${totalBroken === 0 ? 'GREEN' : 'RED'} — ${totalBroken} broken internal link(s)/asset(s) found.`);
process.exit(totalBroken === 0 ? 0 : 1);

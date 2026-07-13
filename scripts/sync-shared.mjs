#!/usr/bin/env node
// Copies root shared/ into every site's shared/ mirror (sites/<site>/shared/).
// Node-native, no dependencies. Never deletes — files present only in a
// mirror (not in root) are left alone and reported as warnings.
// Usage: node scripts/sync-shared.mjs

import { readdirSync, statSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const rootShared = join(repoRoot, 'shared');
const sitesDir = join(repoRoot, 'sites');

const sites = readdirSync(sitesDir).filter((name) => {
  try {
    return statSync(join(sitesDir, name)).isDirectory() && statSync(join(sitesDir, name, 'shared')).isDirectory();
  } catch {
    return false;
  }
});

function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
    } else if (entry.isFile()) {
      out.push(relative(base, full));
    }
  }
  return out;
}

const rootFiles = walk(rootShared);
let copied = 0;
let unchanged = 0;
const extrasBySite = {};

for (const site of sites) {
  const mirrorShared = join(sitesDir, site, 'shared');

  for (const relPath of rootFiles) {
    const srcPath = join(rootShared, relPath);
    const destPath = join(mirrorShared, relPath);
    const destDir = join(mirrorShared, relPath, '..');
    mkdirSync(destDir, { recursive: true });

    let needsCopy = true;
    try {
      const srcBuf = readFileSync(srcPath);
      const destBuf = readFileSync(destPath);
      needsCopy = !srcBuf.equals(destBuf);
    } catch {
      needsCopy = true;
    }

    if (needsCopy) {
      copyFileSync(srcPath, destPath);
      copied++;
    } else {
      unchanged++;
    }
  }

  const mirrorFiles = walk(mirrorShared);
  const rootSet = new Set(rootFiles);
  const extras = mirrorFiles.filter((f) => !rootSet.has(f));
  if (extras.length) extrasBySite[site] = extras;
}

console.log(`sync-shared: ${sites.length} site mirror(s) — ${copied} file(s) copied, ${unchanged} already in sync.`);

const extraSites = Object.keys(extrasBySite);
if (extraSites.length) {
  console.log('\nWARN — mirror-only files (present in a site mirror, absent from root shared/; left untouched):');
  for (const site of extraSites) {
    for (const f of extrasBySite[site]) {
      console.log(`  sites/${site}/shared/${f}`);
    }
  }
} else {
  console.log('No mirror-only extras found.');
}

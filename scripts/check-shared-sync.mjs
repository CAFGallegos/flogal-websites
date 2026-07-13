#!/usr/bin/env node
// Verifies every site's shared/ mirror is byte-identical to root shared/.
// Node-native, no dependencies. Exits nonzero and prints a per-file report
// if any mirror file is missing or differs from root. Mirror-only extras
// (files present in a mirror but not in root) are reported as warnings and
// do not affect exit status.
// Usage: node scripts/check-shared-sync.mjs

import { readdirSync, statSync, readFileSync } from 'node:fs';
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
const rootSet = new Set(rootFiles);

let missing = 0;
let differing = 0;
let extras = 0;
const report = [];

for (const site of sites) {
  const mirrorShared = join(sitesDir, site, 'shared');
  const mirrorFiles = walk(mirrorShared);
  const mirrorSet = new Set(mirrorFiles);

  for (const relPath of rootFiles) {
    const destPath = join(mirrorShared, relPath);
    if (!mirrorSet.has(relPath)) {
      report.push(`MISSING  sites/${site}/shared/${relPath}`);
      missing++;
      continue;
    }
    const srcBuf = readFileSync(join(rootShared, relPath));
    const destBuf = readFileSync(destPath);
    if (!srcBuf.equals(destBuf)) {
      report.push(`DIFFERS  sites/${site}/shared/${relPath}`);
      differing++;
    }
  }

  for (const relPath of mirrorFiles) {
    if (!rootSet.has(relPath)) {
      report.push(`EXTRA    sites/${site}/shared/${relPath} (not in root shared/)`);
      extras++;
    }
  }
}

if (report.length) {
  console.log(report.join('\n'));
  console.log('');
}

console.log(
  `check-shared-sync: ${sites.length} mirror(s) checked — ${missing} missing, ${differing} differing, ${extras} extra.`
);

if (missing > 0 || differing > 0) {
  console.log('RED — shared/ mirrors are out of sync with root. Run scripts/sync-shared.mjs.');
  process.exit(1);
}

console.log('GREEN — all shared/ mirrors byte-match root shared/. (extras above are warnings only)');

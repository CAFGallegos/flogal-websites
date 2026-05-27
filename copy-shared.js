/**
 * Build-step script: copies repo-root shared/ into the current site's directory.
 *
 * Usage:
 *   From a site dir  (e.g. sites/carriers/):  node ../../copy-shared.js
 *   From repo root   (flogalhq project):       node copy-shared.js
 */
const fs   = require("fs");
const path = require("path");

const repoRoot = __dirname;
const cwd      = process.cwd();
const src      = path.join(repoRoot, "shared");

// When run from repo root (flogalhq project), target sites/flogalhq/shared/.
// Otherwise target the current working directory's shared/ subfolder.
const dest = (cwd === repoRoot)
  ? path.join(repoRoot, "sites", "flogalhq", "shared")
  : path.join(cwd, "shared");

fs.cpSync(src, dest, { recursive: true });
console.log(`shared/ → ${path.relative(repoRoot, dest)}`);

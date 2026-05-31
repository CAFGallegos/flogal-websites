/**
 * Copies shared logos from sites/apps/shared/logos/ into public/
 * so Next.js can serve them at /maintenance/logo-*.png.
 * Run via: npm run copy-logos (or automatically via prebuild).
 * The output files are .gitignored — only the script is committed.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../../shared/logos');
const DEST = path.resolve(__dirname, '../public');

const FILES = [
  ['flogal-symbol-white.png', 'logo-white.png'],
  ['flogal-symbol-navy.png',  'logo-navy.png'],
  ['flogal-symbol-grey.png',  'logo-grey.png'],
];

for (const [src, dest] of FILES) {
  const srcPath  = path.join(SRC, src);
  const destPath = path.join(DEST, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} → public/${dest}`);
  } else {
    console.warn(`Warning: ${srcPath} not found`);
  }
}

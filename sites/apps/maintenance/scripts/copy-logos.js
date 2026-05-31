/**
 * Copies shared logos from sites/apps/shared/logos/ into public/.
 * Runs automatically via npm run dev / npm run build.
 * Output files are .gitignored — only this script is committed.
 *
 * Destinations:
 *   public/logo-*.png           — maintenance app shell (Sidebar)
 *   public/logos/flogal-symbol-*.png — portal login + dashboard
 */
const fs = require('fs');
const path = require('path');

const SRC  = path.resolve(__dirname, '../../shared/logos');
const DEST = path.resolve(__dirname, '../public');

// Ensure the logos sub-directory exists
const LOGOS_DIR = path.join(DEST, 'logos');
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR, { recursive: true });

const FILES = [
  // [source filename, ...destination filenames]
  ['flogal-symbol-white.png', 'logo-white.png', 'logos/flogal-symbol-white.png'],
  ['flogal-symbol-navy.png',  'logo-navy.png'],
  ['flogal-symbol-grey.png',  'logo-grey.png'],
];

for (const [src, ...dests] of FILES) {
  const srcPath = path.join(SRC, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: ${srcPath} not found`);
    continue;
  }
  for (const dest of dests) {
    const destPath = path.join(DEST, dest);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} → public/${dest}`);
  }
}

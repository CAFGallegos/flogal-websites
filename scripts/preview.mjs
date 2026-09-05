#!/usr/bin/env node
// Local preview server for flogal-websites.
//
// Serves each site EXACTLY the way its Vercel project is rooted, so that
// `../../shared/...` references clamp at the site root and hit that site's
// LOCAL shared/ mirror — the same file that serves in production. This is
// the strict (production) serving model; it deliberately does NOT expose the
// repo root, so a reference that only works under `npx serve` from the repo
// root will 404 here (that is the site-isolation check working).
//
//   flogalhq   -> sites/flogalhq   (prod: repo root + rewrite /(.*) -> /sites/flogalhq/$1,
//                                   which is equivalent to rooting at the folder)
//   sales      -> sites/sales
//   carriers   -> sites/carriers
//   properties -> sites/properties
//   admin      -> sites/admin      (prod rewrite: / -> /login.html)
//
// Usage:  node scripts/preview.mjs [--port-base 3000]
// Then open the URLs it prints. No dependencies. Ctrl-C to stop.
//
// Behavior mirrors Vercel's default static serving as closely as a plain
// server can: exact file -> serve; directory -> its index.html (a missing
// trailing slash is redirected so relative paths resolve the same as prod);
// extensionless path -> tries path + ".html"; otherwise 404.

import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SITES = [
  { name: 'flogalhq',   root: 'sites/flogalhq' },
  { name: 'sales',      root: 'sites/sales' },
  { name: 'carriers',   root: 'sites/carriers' },
  { name: 'properties', root: 'sites/properties' },
  { name: 'admin',      root: 'sites/admin', rewrites: { '/': '/login.html' } },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

const args = process.argv.slice(2);
const portBaseIdx = args.indexOf('--port-base');
const PORT_BASE = portBaseIdx !== -1 ? Number(args[portBaseIdx + 1]) : 3000;
if (!Number.isInteger(PORT_BASE) || PORT_BASE < 1 || PORT_BASE > 65530) {
  console.error('--port-base must be an integer between 1 and 65530');
  process.exit(1);
}

async function statOrNull(p) {
  try { return await fs.stat(p); } catch { return null; }
}

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function makeHandler(site) {
  const siteRoot = path.join(REPO, site.root);
  return async (req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      return send(res, 400, 'Bad request');
    }
    if (site.rewrites && site.rewrites[urlPath]) urlPath = site.rewrites[urlPath];

    // Clamp like a browser + web server: normalize away any '..' escapes.
    const normalized = path.posix.normalize(urlPath);
    const fsPath = path.join(siteRoot, normalized);
    if (!fsPath.startsWith(siteRoot + path.sep) && fsPath !== siteRoot) {
      return send(res, 403, 'Forbidden');
    }

    let target = fsPath;
    let st = await statOrNull(target);

    if (st && st.isDirectory()) {
      if (!urlPath.endsWith('/')) {
        res.writeHead(308, { Location: encodeURI(urlPath) + '/' });
        return res.end();
      }
      target = path.join(target, 'index.html');
      st = await statOrNull(target);
    } else if (!st && !path.extname(target)) {
      target = target + '.html';
      st = await statOrNull(target);
    }

    if (!st || !st.isFile()) {
      return send(res, 404, `404 — ${site.name}: ${urlPath} is not in ${site.root}/`);
    }

    const type = MIME[path.extname(target).toLowerCase()] || 'application/octet-stream';
    try {
      const body = await fs.readFile(target);
      send(res, 200, body, type);
    } catch (err) {
      send(res, 500, `500 — ${err.message}`);
    }
  };
}

const servers = SITES.map((site, i) => {
  const port = PORT_BASE + i;
  const server = http.createServer(makeHandler(site));
  server.listen(port, '127.0.0.1');
  server.on('error', (err) => {
    console.error(`${site.name}: cannot listen on ${port} — ${err.message}`);
    process.exit(1);
  });
  return { site, port, server };
});

console.log('flogal-websites preview (strict per-site roots, 127.0.0.1)\n');
for (const { site, port } of servers) {
  console.log(`  ${site.name.padEnd(11)} http://127.0.0.1:${port}/   <- ${site.root}/`);
}
console.log('\nCtrl-C to stop.');

process.on('SIGINT', () => {
  for (const { server } of servers) server.close();
  process.exit(0);
});

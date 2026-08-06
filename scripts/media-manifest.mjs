// Finds every Base44/Wix-hosted image referenced by the exported data or the source,
// and writes base44-export/_media.json mapping each URL to the key it will get in R2.
//
//   node scripts/media-manifest.mjs
//   node scripts/media-manifest.mjs --selftest
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'base44-export');
const MANIFEST = path.join(EXPORT_DIR, '_media.json');
const MEDIA_HOSTS = ['media.base44.com', 'static.wixstatic.com'];
const URL_RE = /https?:\/\/(?:media\.base44\.com|static\.wixstatic\.com)\/[^\s"'`)\\]+/g;

export function collectUrls(value, found = new Set()) {
  if (typeof value === 'string') {
    if (MEDIA_HOSTS.some((host) => value.includes(host))) {
      for (const match of value.match(URL_RE) ?? []) found.add(match);
    }
    return found;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, found);
    return found;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectUrls(item, found);
  }
  return found;
}

// Keep Base44's own filenames - they already carry a unique hash prefix, so collisions
// are not a concern and old->new URLs stay trivially greppable.
export function r2KeyFor(url) {
  const { hostname, pathname } = new URL(url);
  const parts = pathname.split('/').filter(Boolean);
  const publicAt = parts.indexOf('public');
  // media.base44.com/images/public/<appId>/<file> -> images/<file>
  if (hostname === 'media.base44.com' && publicAt !== -1) {
    return [...parts.slice(0, publicAt), ...parts.slice(publicAt + 2)].join('/');
  }
  return `${hostname.split('.')[0]}/${parts.join('/')}`;
}

function walkFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(full, extensions);
    return extensions.some((ext) => entry.name.endsWith(ext)) ? [full] : [];
  });
}

function selftest() {
  assert.deepEqual(
    [...collectUrls({ a: 'https://media.base44.com/images/public/APP/x_1.png', b: 2 })],
    ['https://media.base44.com/images/public/APP/x_1.png']
  );
  assert.equal(collectUrls({ a: 'https://example.com/x.png' }).size, 0, 'other hosts are ignored');
  assert.equal(
    collectUrls([{ page_images: ['https://media.base44.com/images/public/APP/a.png'] }]).size,
    1,
    'nested arrays are searched'
  );
  assert.equal(
    r2KeyFor('https://media.base44.com/images/public/6a68/0cfd04dc3_1.png'),
    'images/0cfd04dc3_1.png'
  );
  assert.equal(
    r2KeyFor('https://static.wixstatic.com/media/abc.jpg'),
    'static/media/abc.jpg'
  );
  const dupes = collectUrls(['https://media.base44.com/images/public/APP/a.png', 'https://media.base44.com/images/public/APP/a.png']);
  assert.equal(dupes.size, 1, 'duplicates collapse');
  console.log('media-manifest selftest: ok');
}

function main() {
  if (process.argv.includes('--selftest')) return selftest();
  if (!fs.existsSync(EXPORT_DIR)) throw new Error('base44-export/ not found - run scripts/export-base44.mjs first');

  const found = new Set();
  const byEntity = {};

  for (const file of walkFiles(EXPORT_DIR, ['.json']).filter((f) => path.basename(f) !== '_media.json')) {
    const urls = collectUrls(JSON.parse(fs.readFileSync(file, 'utf8')));
    if (urls.size) byEntity[path.basename(file, '.json')] = urls.size;
    for (const url of urls) found.add(url);
  }

  // Some assets are hardcoded in the frontend rather than stored in an entity.
  let hardcoded = 0;
  for (const file of walkFiles(path.join(ROOT, 'src'), ['.js', '.jsx'])) {
    const urls = collectUrls(fs.readFileSync(file, 'utf8'));
    for (const url of urls) {
      if (!found.has(url)) hardcoded += 1;
      found.add(url);
    }
  }

  const manifest = [...found].sort().map((url) => ({ url, key: r2KeyFor(url) }));
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  for (const [entity, count] of Object.entries(byEntity).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${entity.padEnd(24)} ${String(count).padStart(4)} images`);
  }
  console.log(`  ${'(hardcoded in src)'.padEnd(24)} ${String(hardcoded).padStart(4)} images`);

  const keys = new Set(manifest.map((m) => m.key));
  console.log(`\n${manifest.length} unique URLs -> ${keys.size} R2 keys`);
  if (keys.size !== manifest.length) console.log('WARNING: key collision, two URLs map to one key');
  console.log(`Manifest written to ${MANIFEST}`);
}

main();

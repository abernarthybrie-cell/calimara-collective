// Downloads every image in base44-export/_media.json and pushes it to Cloudflare R2.
//
//   node scripts/migrate-media.mjs --selftest
//   node scripts/migrate-media.mjs --download          # fetch to media-cache/
//   node scripts/migrate-media.mjs --upload            # push media-cache/ to R2
//   node scripts/migrate-media.mjs                     # both
//
// Both phases are resumable: already-downloaded files are skipped, and uploads are
// idempotent. Credentials come from .secrets/credentials.env (gitignored).
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'base44-export', '_media.json');
const MAP_FILE = path.join(ROOT, 'base44-export', '_media-map.json');
const CACHE = path.join(ROOT, 'media-cache');
const CONCURRENCY = 6;

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  );
}

export async function pool(items, limit, worker) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

export function publicUrlFor(key, mediaBaseUrl) {
  return `${mediaBaseUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}

async function downloadOne({ url, key }) {
  const dest = path.join(CACHE, key);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return { key, skipped: true };
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${key}: HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (!bytes.length) throw new Error(`${key}: empty response`);
  fs.writeFileSync(dest, bytes);
  return { key, bytes: bytes.length };
}

async function uploadOne({ key }, bucket, env) {
  const file = path.join(CACHE, key);
  if (!fs.existsSync(file)) throw new Error(`${key}: not downloaded`);
  // --remote is required or wrangler writes to the local simulator instead of real R2.
  await execFileAsync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['wrangler', 'r2', 'object', 'put', `${bucket}/${key}`, '--file', file, '--remote'],
    // shell:true because Node refuses to spawn npx.cmd directly on Windows.
    { env: { ...process.env, ...env }, maxBuffer: 10 * 1024 * 1024, shell: true }
  );
  return { key };
}

function selftest() {
  assert.equal(publicUrlFor('images/a.png', 'https://media.calimara.online'), 'https://media.calimara.online/images/a.png');
  assert.equal(publicUrlFor('/images/a.png', 'https://media.calimara.online/'), 'https://media.calimara.online/images/a.png');

  return pool([1, 2, 3, 4, 5], 2, async (n) => n * 2).then((doubled) => {
    assert.deepEqual(doubled, [2, 4, 6, 8, 10], 'pool preserves input order');
    let peak = 0;
    let active = 0;
    return pool(Array(10).fill(0), 3, async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active -= 1;
    }).then(() => {
      assert.ok(peak <= 3, `concurrency limit exceeded: ${peak}`);
      console.log('migrate-media selftest: ok');
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();

  const env = { ...readEnvFile(path.join(ROOT, '.secrets', 'credentials.env')), ...process.env };
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const doDownload = args.includes('--download') || !args.includes('--upload');
  const doUpload = args.includes('--upload') || !args.includes('--download');

  if (doDownload) {
    console.log(`Downloading ${manifest.length} images to media-cache/`);
    let done = 0;
    let failed = 0;
    await pool(manifest, CONCURRENCY, async (item) => {
      try {
        await downloadOne(item);
      } catch (error) {
        failed += 1;
        console.log(`  FAILED ${error.message}`);
      }
      if (++done % 25 === 0) console.log(`  ${done}/${manifest.length}`);
    });
    console.log(`Downloaded ${done - failed}/${manifest.length} (${failed} failed)\n`);
    if (failed) throw new Error('some downloads failed - rerun to retry the missing ones');
  }

  if (doUpload) {
    const bucket = env.R2_BUCKET || 'calimara-media';
    if (!env.CLOUDFLARE_API_TOKEN) throw new Error('CLOUDFLARE_API_TOKEN is required for the upload phase');
    console.log(`Uploading ${manifest.length} objects to r2://${bucket}`);
    let done = 0;
    const failures = [];
    await pool(manifest, 4, async (item) => {
      try {
        await uploadOne(item, bucket, {
          CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: env.R2_ACCOUNT_ID
        });
      } catch (error) {
        failures.push(`${item.key}: ${error.message.split('\n')[0]}`);
      }
      if (++done % 25 === 0) console.log(`  ${done}/${manifest.length}`);
    });
    if (failures.length) {
      console.log(`\n${failures.length} uploads failed:`);
      failures.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
      throw new Error('upload incomplete');
    }
    console.log('All objects uploaded\n');
  }

  const mediaBaseUrl = env.MEDIA_BASE_URL || 'https://media.calimara.online';
  const map = Object.fromEntries(manifest.map(({ url, key }) => [url, publicUrlFor(key, mediaBaseUrl)]));
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  console.log(`Wrote old->new URL map for ${Object.keys(map).length} images to ${MAP_FILE}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

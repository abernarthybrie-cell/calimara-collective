// One-shot export of every Base44 entity to base44-export/<Entity>.json
//
//   node scripts/export-base44.mjs            # export
//   node scripts/export-base44.mjs --selftest # check the URL derivation only
//
// Reads credentials from .secrets/credentials.env (gitignored).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'base44-export');
const PAGE_SIZE = 100;

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const at = line.indexOf('=');
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
      })
  );
}

// The Builder may talk to a different host or use an environment segment we can't guess,
// so prefer the shape of a real request the user copied over our own reconstruction.
export function entityBaseFrom(sampleUrl, appId) {
  if (sampleUrl) {
    const marker = sampleUrl.indexOf('/entities/');
    if (marker !== -1) return sampleUrl.slice(0, marker);
    const apps = sampleUrl.match(/^(https?:\/\/[^/]+(?:\/[^/]+)*?\/apps\/[^/?#]+)/);
    if (apps) return apps[1];
    const origin = new URL(sampleUrl).origin;
    return `${origin}/api/apps/${appId}`;
  }
  return `https://app.base44.com/api/apps/${appId}`;
}

function entityNames() {
  const dir = path.join(ROOT, 'base44', 'entities');
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.jsonc'))
    .map((f) => path.basename(f, '.jsonc'))
    .sort();
}

export function authHeaders({ appId, apiKey, token }) {
  const headers = { Accept: 'application/json', 'X-App-Id': appId };
  if (apiKey) headers.api_key = apiKey;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// The API returns either a bare array or a wrapper such as { items: [...] }.
export function rowsFrom(parsed) {
  if (Array.isArray(parsed)) return parsed;
  for (const key of ['items', 'data', 'records', 'results']) {
    if (Array.isArray(parsed?.[key])) return parsed[key];
  }
  throw new Error(`expected an array, got ${JSON.stringify(parsed).slice(0, 120)}`);
}

async function fetchPage(base, name, headers, skip) {
  const url = `${base}/entities/${name}?limit=${PAGE_SIZE}&skip=${skip}`;
  const res = await fetch(url, { headers });
  const body = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`);
  return rowsFrom(JSON.parse(body));
}

async function exportEntity(base, name, headers) {
  const rows = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const page = await fetchPage(base, name, headers, skip);
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    if (rows.length > 50000) throw new Error('aborting: more than 50k rows, pagination looks stuck');
  }
  return rows;
}

function selftest() {
  assert.equal(
    entityBaseFrom('https://app.base44.com/api/apps/X/entities/Issue?limit=1', 'X'),
    'https://app.base44.com/api/apps/X'
  );
  assert.equal(
    entityBaseFrom('https://app.base44.com/api/apps/X/dev/entities/Issue', 'X'),
    'https://app.base44.com/api/apps/X/dev',
    'an environment segment before /entities/ must be preserved'
  );
  assert.equal(
    entityBaseFrom('https://app.base44.com/api/apps/X/integrations/Core/UploadFile', 'X'),
    'https://app.base44.com/api/apps/X'
  );
  assert.equal(
    entityBaseFrom('https://app.base44.com/api/something-else', 'X'),
    'https://app.base44.com/api/apps/X',
    'unrecognised sample URLs fall back to the documented shape'
  );
  assert.equal(entityBaseFrom('', 'X'), 'https://app.base44.com/api/apps/X');

  assert.deepEqual(rowsFrom([{ id: 1 }]), [{ id: 1 }]);
  assert.deepEqual(rowsFrom({ items: [{ id: 2 }] }), [{ id: 2 }], 'wrapped payloads are unwrapped');
  assert.throws(() => rowsFrom({ message: 'nope' }), /expected an array/);

  assert.equal(authHeaders({ appId: 'A', apiKey: 'K' }).api_key, 'K');
  assert.equal(authHeaders({ appId: 'A', token: 'T' }).Authorization, 'Bearer T');
  assert.equal(authHeaders({ appId: 'A', apiKey: 'K' }).Authorization, undefined);

  console.log('export-base44 selftest: ok');
}

async function main() {
  if (process.argv.includes('--selftest')) return selftest();

  const env = { ...readEnvFile(path.join(ROOT, '.secrets', 'credentials.env')), ...process.env };
  const appId = env.BASE44_APP_ID;
  const apiKey = env.BASE44_API_KEY;
  const token = env.BASE44_ACCESS_TOKEN;
  if (!appId) throw new Error('BASE44_APP_ID is empty - fill in .secrets/credentials.env');
  if (!apiKey && !token) throw new Error('Set BASE44_API_KEY or BASE44_ACCESS_TOKEN in .secrets/credentials.env');

  const base = entityBaseFrom(env.BASE44_SAMPLE_URL, appId);
  const headers = authHeaders({ appId, apiKey, token });
  console.log(`Exporting from ${base}\n`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const failures = [];
  for (const name of entityNames()) {
    try {
      const rows = await exportEntity(base, name, headers);
      fs.writeFileSync(path.join(OUT_DIR, `${name}.json`), JSON.stringify(rows, null, 2));
      console.log(`  ${name.padEnd(24)} ${String(rows.length).padStart(5)} records`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.log(`  ${name.padEnd(24)}   FAILED  ${error.message}`);
    }
  }

  console.log(`\nWrote JSON to ${OUT_DIR}`);
  if (failures.length) {
    console.log(`\n${failures.length} entities failed:`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

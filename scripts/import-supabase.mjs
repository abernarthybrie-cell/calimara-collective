// Applies supabase/schema.sql and loads base44-export/*.json into the new database.
//
//   node scripts/import-supabase.mjs --selftest
//   node scripts/import-supabase.mjs --schema-only
//   node scripts/import-supabase.mjs                  # schema + data
//
// Safe to re-run: tables use "create table if not exists" and rows are upserted by id.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { snakeCase } from './generate-schema.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'base44-export');
const SCHEMA_FILE = path.join(ROOT, 'supabase', 'schema.sql');
const MEDIA_MAP = path.join(EXPORT_DIR, '_media-map.json');
const SKIP_FILES = new Set(['_media.json', '_media-map.json', 'User.json']);

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

export function rewriteMedia(value, map) {
  if (typeof value === 'string') {
    if (!value.includes('media.base44.com') && !value.includes('static.wixstatic.com')) return value;
    let out = value;
    for (const [from, to] of Object.entries(map)) {
      if (out.includes(from)) out = out.split(from).join(to);
    }
    return out;
  }
  if (Array.isArray(value)) return value.map((v) => rewriteMedia(v, map));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteMedia(v, map)]));
  }
  return value;
}

export function coerce(value, dataType) {
  if (value === undefined) return null;
  if (dataType === 'jsonb') return value === null ? null : JSON.stringify(value);
  // Base44 uses '' where Postgres wants NULL for dates and numbers.
  if (value === '' && dataType !== 'text') return null;
  return value;
}

export function buildUpsert(table, columns) {
  const cols = columns.map((c) => `"${c}"`).join(', ');
  const params = columns.map((_, i) => `$${i + 1}`).join(', ');
  const updates = columns.filter((c) => c !== 'id').map((c) => `"${c}" = excluded."${c}"`).join(', ');
  return `insert into public.${table} (${cols}) values (${params}) on conflict (id) do update set ${updates}`;
}

// Semicolons split statements, except inside strings, line comments or $$ bodies.
export function splitSql(sql) {
  const statements = [];
  const token = /--[^\n]*|'(?:[^']|'')*'|\$[A-Za-z_0-9]*\$|;/g;
  let start = 0;
  let match;
  while ((match = token.exec(sql))) {
    if (match[0] === ';') {
      statements.push(sql.slice(start, match.index));
      start = token.lastIndex;
    } else if (match[0][0] === '$') {
      const end = sql.indexOf(match[0], match.index + match[0].length);
      if (end === -1) break;
      token.lastIndex = end + match[0].length;
    }
  }
  statements.push(sql.slice(start));
  return statements
    .map((s) => s.trim())
    .filter((s) => s && !s.split('\n').every((l) => !l.trim() || l.trim().startsWith('--')));
}

function selftest() {
  const map = { 'https://media.base44.com/images/public/APP/a.png': 'https://media.calimara.online/images/a.png' };
  assert.equal(
    rewriteMedia('https://media.base44.com/images/public/APP/a.png', map),
    'https://media.calimara.online/images/a.png'
  );
  assert.deepEqual(
    rewriteMedia({ page_images: ['https://media.base44.com/images/public/APP/a.png'] }, map),
    { page_images: ['https://media.calimara.online/images/a.png'] }
  );
  assert.equal(rewriteMedia('plain text', map), 'plain text');
  assert.equal(rewriteMedia(null, map), null);

  assert.equal(coerce('', 'date'), null, 'empty dates become null');
  assert.equal(coerce('', 'text'), '', 'empty strings stay empty for text');
  assert.equal(coerce(['a'], 'jsonb'), '["a"]');
  assert.equal(coerce(null, 'jsonb'), null);
  assert.equal(coerce(undefined, 'text'), null);

  assert.equal(
    buildUpsert('issue', ['id', 'title']),
    'insert into public.issue ("id", "title") values ($1, $2) on conflict (id) do update set "title" = excluded."title"'
  );

  assert.deepEqual(splitSql('create table a();\nselect 1;'), ['create table a()', 'select 1']);
  assert.deepEqual(
    splitSql('create function f() as $$ begin x; end; $$;\nselect 2;'),
    ['create function f() as $$ begin x; end; $$', 'select 2'],
    'semicolons inside a $$ body do not split'
  );
  assert.deepEqual(splitSql("select ';' as semi;"), ["select ';' as semi"]);
  assert.deepEqual(splitSql('-- label\nselect 3;'), ['-- label\nselect 3'], 'a leading comment keeps its statement');
  assert.deepEqual(splitSql('-- trailing comment only\n'), []);
  console.log('import-supabase selftest: ok');
}

async function main() {
  if (process.argv.includes('--selftest')) return selftest();

  const env = { ...readEnvFile(path.join(ROOT, '.secrets', 'credentials.env')), ...process.env };
  for (const key of ['PGHOST', 'PGUSER', 'PGPASSWORD']) {
    if (!env[key]) throw new Error(`${key} missing from .secrets/credentials.env`);
  }

  const client = new pg.Client({
    host: env.PGHOST,
    port: Number(env.PGPORT || 5432),
    database: env.PGDATABASE || 'postgres',
    user: env.PGUSER,
    password: env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log(`Connected to ${env.PGHOST}\n`);

  try {
    console.log('Applying schema...');
    // Policies have no "if not exists", so a re-run would fail on them; ignore only that.
    for (const sql of splitSql(fs.readFileSync(SCHEMA_FILE, 'utf8'))) {
      try {
        await client.query(sql);
      } catch (error) {
        if (error.code === '42710') continue; // duplicate_object: policy already exists
        throw new Error(`${error.message}\n  in: ${sql.slice(0, 120)}`);
      }
    }
    console.log('Schema applied\n');

    if (process.argv.includes('--schema-only')) return;

    const mediaMap = fs.existsSync(MEDIA_MAP) ? JSON.parse(fs.readFileSync(MEDIA_MAP, 'utf8')) : {};
    console.log(`Rewriting media URLs using ${Object.keys(mediaMap).length} mappings\n`);

    const files = fs.readdirSync(EXPORT_DIR).filter((f) => f.endsWith('.json') && !SKIP_FILES.has(f));
    let totalRows = 0;
    let totalRewrites = 0;

    for (const file of files.sort()) {
      const entity = path.basename(file, '.json');
      const table = snakeCase(entity);
      const rows = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, file), 'utf8'));

      const { rows: colInfo } = await client.query(
        'select column_name, data_type from information_schema.columns where table_schema = $1 and table_name = $2',
        ['public', table]
      );
      if (!colInfo.length) {
        console.log(`  ${entity.padEnd(24)} SKIPPED (no table ${table})`);
        continue;
      }
      const types = Object.fromEntries(colInfo.map((c) => [c.column_name, c.data_type]));

      let inserted = 0;
      const droppedFields = new Set();
      for (const raw of rows) {
        const before = JSON.stringify(raw);
        const row = rewriteMedia(raw, mediaMap);
        if (JSON.stringify(row) !== before) totalRewrites += 1;

        for (const key of Object.keys(row)) if (!(key in types)) droppedFields.add(key);
        const columns = Object.keys(row).filter((key) => key in types);
        if (!columns.includes('id')) throw new Error(`${entity}: a record has no id`);

        const values = columns.map((key) => coerce(row[key], types[key]));
        await client.query(buildUpsert(table, columns), values);
        inserted += 1;
      }

      totalRows += inserted;
      const note = droppedFields.size ? `  (ignored: ${[...droppedFields].join(', ')})` : '';
      console.log(`  ${entity.padEnd(24)} ${String(inserted).padStart(4)} rows -> ${table}${note}`);
    }

    console.log(`\nImported ${totalRows} rows; ${totalRewrites} records had media URLs rewritten.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

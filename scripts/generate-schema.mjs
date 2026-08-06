// Turns base44/entities/*.jsonc into supabase/schema.sql.
//
//   node scripts/generate-schema.mjs
//   node scripts/generate-schema.mjs --selftest
//
// Conventions:
//   - table name = snake_case of the entity name, singular (Issue -> issue,
//     MemberMessage -> member_message). No pluralisation rules to get wrong.
//   - Base44 ids are 24-char hex strings and are kept verbatim as the primary key,
//     so every slug/name cross-reference in the data keeps working untouched.
//   - arrays and objects become jsonb so they round-trip exactly as exported.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENTITY_DIR = path.join(ROOT, 'base44', 'entities');
const OUT_FILE = path.join(ROOT, 'supabase', 'schema.sql');

// Internal editorial data. Base44 left most of these world-readable; the app only ever
// shows them behind /members, so we restrict reads to signed-in users here.
const MEMBERS_ONLY = new Set(['Deadline', 'Meeting', 'TeamNotice', 'MemberMessage']);
// Handled by a purpose-built profile table wired to auth.users instead.
const SKIP = new Set(['User']);

export function snakeCase(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // FAQItem -> FAQ_Item
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // MemberMessage -> Member_Message
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toLowerCase();
}

export function stripJsonComments(text) {
  let out = '';
  let inString = false;
  let escaped = false;
  let comment = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (comment === 'line') {
      if (ch === '\n') { comment = null; out += ch; }
      continue;
    }
    if (comment === 'block') {
      if (ch === '*' && next === '/') { comment = null; i += 1; }
      continue;
    }
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; out += ch; continue; }
    if (ch === '/' && next === '/') { comment = 'line'; i += 1; continue; }
    if (ch === '/' && next === '*') { comment = 'block'; i += 1; continue; }
    out += ch;
  }
  return out;
}

export function sqlType(prop) {
  if (prop.type === 'number' || prop.type === 'integer') return 'numeric';
  if (prop.type === 'boolean') return 'boolean';
  if (prop.type === 'array' || prop.type === 'object') return 'jsonb';
  if (prop.type === 'string' && prop.format === 'date') return 'date';
  if (prop.type === 'string' && prop.format === 'date-time') return 'timestamptz';
  return 'text';
}

export function sqlLiteral(value) {
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function columnSql(name, prop) {
  // Quoted so entity fields that collide with SQL keywords (order, type) stay usable.
  const col = `"${name}"`;
  const parts = [`  ${col} ${sqlType(prop)}`];
  if (prop.default !== undefined) parts.push(`default ${sqlLiteral(prop.default)}`);
  if (Array.isArray(prop.enum) && prop.enum.length) {
    const allowed = prop.enum.map(sqlLiteral).join(', ');
    parts.push(`constraint "${name}_allowed" check (${col} is null or ${col} in (${allowed}))`);
  }
  return parts.join(' ');
}

function readEntities() {
  return fs.readdirSync(ENTITY_DIR)
    .filter((f) => f.endsWith('.jsonc'))
    .map((f) => JSON.parse(stripJsonComments(fs.readFileSync(path.join(ENTITY_DIR, f), 'utf8'))))
    .filter((e) => !SKIP.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function isAdminOnly(rule) {
  return rule?.user_condition?.role === 'admin';
}

function policiesFor(entity, table) {
  const rls = entity.rls ?? {};
  const readExpr = isAdminOnly(rls.read)
    ? 'public.is_admin()'
    : MEMBERS_ONLY.has(entity.name) ? 'auth.role() = \'authenticated\'' : 'true';
  // Base44 only expressed "anyone" or "admin"; anything not explicitly opened stays admin-only.
  const writeExpr = (rule) => (rule && Object.keys(rule).length === 0 ? 'true' : 'public.is_admin()');

  const lines = [
    `create policy "${table}_select" on public.${table} for select using (${readExpr});`,
    `create policy "${table}_insert" on public.${table} for insert with check (${writeExpr(rls.create)});`,
    `create policy "${table}_update" on public.${table} for update using (${writeExpr(rls.update)}) with check (${writeExpr(rls.update)});`,
    `create policy "${table}_delete" on public.${table} for delete using (${writeExpr(rls.delete)});`
  ];

  if (entity.name === 'MemberMessage') {
    // Chat: any signed-in member may post, and may remove their own line.
    lines[1] = `create policy "${table}_insert" on public.${table} for insert with check (auth.role() = 'authenticated');`;
    lines[3] = `create policy "${table}_delete" on public.${table} for delete using (author_id = auth.uid()::text or public.is_admin());`;
  }
  return lines;
}

function tableSql(entity) {
  const table = snakeCase(entity.name);
  const columns = Object.entries(entity.properties ?? {}).map(([name, prop]) => columnSql(name, prop));
  const body = [
    '  id text primary key',
    ...columns,
    '  created_date timestamptz',
    '  updated_date timestamptz',
    '  created_by_id text',
    '  is_sample boolean default false'
  ].join(',\n');

  return [
    `-- ${entity.name}`,
    `create table if not exists public.${table} (`,
    body,
    ');',
    `alter table public.${table} enable row level security;`,
    ...policiesFor(entity, table),
    ''
  ].join('\n');
}

const PREAMBLE = `-- Generated by scripts/generate-schema.mjs - do not edit by hand.
-- Mirrors the Base44 entity definitions in base44/entities/.

create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' constraint profile_role_allowed check (role in ('user', 'admin')),
  created_date timestamptz not null default now()
);
alter table public.profile enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profile where id = auth.uid() and role = 'admin');
$$;

create policy "profile_select_self" on public.profile for select using (id = auth.uid() or public.is_admin());
create policy "profile_update_self" on public.profile for update using (id = auth.uid()) with check (id = auth.uid());

-- Every new signup gets a profile row so is_admin() has something to read.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
`;

function selftest() {
  assert.equal(snakeCase('MemberMessage'), 'member_message');
  assert.equal(snakeCase('Issue'), 'issue');
  assert.equal(snakeCase('FAQItem'), 'faq_item');

  assert.equal(sqlType({ type: 'number' }), 'numeric');
  assert.equal(sqlType({ type: 'array', items: { type: 'string' } }), 'jsonb');
  assert.equal(sqlType({ type: 'string', format: 'date' }), 'date');
  assert.equal(sqlType({ type: 'string' }), 'text');

  assert.equal(sqlLiteral("it's"), "'it''s'", 'quotes are escaped');
  assert.equal(sqlLiteral(false), 'false');

  assert.match(columnSql('status', { type: 'string', enum: ['draft', 'published'], default: 'published' }),
    /"status" text default 'published' constraint "status_allowed" check \("status" is null or "status" in \('draft', 'published'\)\)/);
  assert.equal(columnSql('order', { type: 'number' }), '  "order" numeric', 'SQL keywords stay usable as columns');

  assert.equal(stripJsonComments('{"a":1} // note'), '{"a":1} ');
  assert.equal(stripJsonComments('{"a":"//not a comment"}'), '{"a":"//not a comment"}',
    'comment markers inside strings survive');
  assert.deepEqual(JSON.parse(stripJsonComments('{\n/* x */ "a": 1\n}')), { a: 1 });

  console.log('generate-schema selftest: ok');
}

function main() {
  if (process.argv.includes('--selftest')) return selftest();
  const entities = readEntities();
  const sql = [PREAMBLE, ...entities.map(tableSql)].join('\n');
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, sql);
  console.log(`${entities.length} tables written to ${OUT_FILE}`);
  entities.forEach((e) => console.log(`  ${e.name.padEnd(24)} -> ${snakeCase(e.name)}`));
}

main();

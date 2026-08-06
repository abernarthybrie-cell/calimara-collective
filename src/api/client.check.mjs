// node src/api/client.check.mjs
// Covers the pure argument/name mapping in client.js. Copies of the functions live here because
// client.js imports @supabase/supabase-js and import.meta.env, neither of which loads under bare node.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./client.js', import.meta.url), 'utf8');

// Guards against the copies below drifting from the real implementations.
const extract = (name) => {
  const start = source.indexOf(`export function ${name}(`);
  assert.notEqual(start, -1, `${name} is no longer exported from client.js`);
  const end = source.indexOf('\n}\n', start);
  return source.slice(start, end + 2).replace('export function', 'function');
};

const { tableName, parseListArgs, parseSort, safeKey } = await import(
  `data:text/javascript,${encodeURIComponent(
    [extract('tableName'), extract('parseListArgs'), extract('parseSort'), extract('safeKey')].join('\n') +
    '\nexport { tableName, parseListArgs, parseSort, safeKey };'
  )}`
);

assert.equal(tableName('Story'), 'story');
assert.equal(tableName('MemberMessage'), 'member_message');
assert.equal(tableName('FAQItem'), 'faq_item', 'acronyms must split like the schema generator');
assert.equal(tableName('CulturalRecommendation'), 'cultural_recommendation');
assert.equal(tableName('SiteSettings'), 'site_settings');

// list(200) and list('order', 200) are both used in the pages.
assert.deepEqual(parseListArgs(200), { sort: null, limit: 200 });
assert.deepEqual(parseListArgs('order', 100), { sort: 'order', limit: 100 });
assert.deepEqual(parseListArgs('-created_date', 60), { sort: '-created_date', limit: 60 });
assert.equal(parseListArgs().limit, 1000, 'list() must still be bounded');
assert.equal(parseListArgs('number').limit, 1000);

assert.equal(parseSort(null), null);
assert.deepEqual(parseSort('number'), { column: 'number', ascending: true });
assert.deepEqual(parseSort('-created_date'), { column: 'created_date', ascending: false });

// Filenames come from a public form, so they must never escape the bucket prefix.
assert.match(safeKey('poem.pdf'), /^\d+-poem\.pdf$/);
assert.match(safeKey('../../etc/passwd'), /^\d+-etc-passwd$/);
assert.doesNotMatch(safeKey('a/b/c.png'), /\//);
assert.match(safeKey(''), /^\d+-file$/);
assert.match(safeKey(undefined), /^\d+-file$/);
assert.ok(safeKey('x'.repeat(500)).length < 120, 'long names must be truncated');

console.log('client selftest: ok');

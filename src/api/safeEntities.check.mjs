// Run: node src/api/safeEntities.check.mjs
import assert from 'node:assert/strict';
import { withArrayResults } from './safeEntities.js';

const html = '<!doctype html><html></html>';
const raw = {
  Story: {
    list: async () => html,
    filter: async () => [{ id: 1 }],
    get: async (id) => ({ id }),
    subscribe: () => 'unsub'
  }
};

const safe = withArrayResults(raw);

assert.deepEqual(await safe.Story.list(), [], 'HTML string must become an empty array');
assert.deepEqual(await safe.Story.filter({}), [{ id: 1 }], 'arrays pass through untouched');
assert.deepEqual(await safe.Story.get(7), { id: 7 }, 'non-list methods are untouched');
assert.equal(safe.Story.subscribe(), 'unsub', 'subscribe still works');
assert.equal(safe.Story, safe.Story, 'entity proxies are stable across reads');

await assert.rejects(
  withArrayResults({ E: { list: async () => { throw new Error('boom'); } } }).E.list(),
  /boom/,
  'rejections still propagate so callers keep their own error handling'
);

console.log('safeEntities: ok');

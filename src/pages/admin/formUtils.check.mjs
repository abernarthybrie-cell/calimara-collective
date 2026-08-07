// node src/pages/admin/formUtils.check.mjs
import assert from 'node:assert/strict';
import { fromFormValue, toFormValue, formToPayload, slugify } from './formUtils.js';

const lines = { name: 'page_images', type: 'json-lines' };
assert.deepEqual(fromFormValue(lines, 'a\nb\n'), ['a', 'b']);
assert.equal(toFormValue(lines, ['a', 'b']), 'a\nb');

const csv = { name: 'tags', type: 'json-csv' };
assert.deepEqual(fromFormValue(csv, 'a, b, c'), ['a', 'b', 'c']);

const nums = { name: 'artifact_page_numbers', type: 'json-csv' };
assert.deepEqual(fromFormValue(nums, '1, 2, 3'), [1, 2, 3]);

assert.equal(fromFormValue({ type: 'number' }, ''), null);
assert.equal(fromFormValue({ type: 'number' }, '12'), 12);
assert.equal(fromFormValue({ type: 'boolean' }, true), true);

assert.deepEqual(
  formToPayload([{ name: 'title', type: 'text' }], { title: 'Hello' }),
  { title: 'Hello' }
);

assert.equal(slugify('Romantismul ca Relicvă'), 'romantismul-ca-relicva');
assert.equal(slugify('  Issue 01 '), 'issue-01');

console.log('formUtils selftest: ok');

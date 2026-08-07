// node supabase/functions/transcribe-story-pages/pageRange.check.mjs
import assert from 'node:assert/strict';
import { pageRange } from './pageRange.js';

// Default: from this story's page through the page before the next story, capped at 6 pages.
assert.deepEqual(pageRange(10, 20, 80), { startPage: 10, endPage: 15 });
assert.deepEqual(pageRange(10, 12, 80), { startPage: 10, endPage: 11 });
assert.deepEqual(pageRange(78, null, 80), { startPage: 78, endPage: 80 });

// Explicit overrides.
assert.deepEqual(pageRange(10, 20, 80, 12, 14), { startPage: 12, endPage: 14 });

// Rejected ranges.
assert.equal(pageRange(0, 5, 80).error, 'Page range must contain 1 to 6 pages');
assert.equal(pageRange(10, 20, 80, 14, 12).error, 'Page range must contain 1 to 6 pages');
assert.equal(pageRange(10, 20, 80, 10, 16).error, 'Page range must contain 1 to 6 pages');

console.log('pageRange selftest: ok');

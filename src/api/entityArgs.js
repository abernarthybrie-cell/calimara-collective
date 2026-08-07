// Pure argument/name mapping for the Supabase client. Kept free of imports so entityArgs.check.mjs
// can load it under bare node, where import.meta.env does not exist.

// Supabase caps an unbounded select at 1000 rows anyway; be explicit about it.
export const DEFAULT_LIMIT = 1000;

// Must match snakeCase() in scripts/generate-schema.mjs, which named the tables.
export function tableName(entity) {
  return entity
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toLowerCase();
}

// Base44's signature is list(sort, limit), but plenty of call sites use the list(limit) shorthand.
export function parseListArgs(first, second) {
  if (typeof first === 'number') return { sort: null, limit: first };
  return { sort: first ?? null, limit: typeof second === 'number' ? second : DEFAULT_LIMIT };
}

export function parseSort(sort) {
  if (!sort) return null;
  const descending = sort.startsWith('-');
  return { column: descending ? sort.slice(1) : sort, ascending: !descending };
}

// Storage keys are attacker-controlled via the public submission form.
export function safeKey(filename) {
  const cleaned = String(filename || 'file')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[.-]+/, '')
    .slice(-80);
  return `${Date.now()}-${cleaned || 'file'}`;
}

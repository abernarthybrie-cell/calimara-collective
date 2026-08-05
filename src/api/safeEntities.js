const ARRAY_RESULT_METHODS = new Set(['list', 'filter']);

const toArray = (value) => (Array.isArray(value) ? value : []);

function wrapEntity(entity) {
  return new Proxy(entity, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function' || !ARRAY_RESULT_METHODS.has(prop)) return value;
      return (...args) => Promise.resolve(value.apply(target, args)).then(toArray);
    }
  });
}

// ponytail: every page assumes list/filter resolve to arrays. Served statically, /api falls
// through to index.html, so they resolve with an HTML string and `.map` blows up mid-render.
// Coercing once here beats guarding ~35 call sites. Ceiling: only list/filter are covered;
// add method names here if new array-returning APIs appear.
export function withArrayResults(entities) {
  const cache = new Map();
  return new Proxy(entities, {
    get(target, prop, receiver) {
      const entity = Reflect.get(target, prop, receiver);
      if (!entity || typeof entity !== 'object') return entity;
      if (!cache.has(prop)) cache.set(prop, wrapEntity(entity));
      return cache.get(prop);
    }
  });
}

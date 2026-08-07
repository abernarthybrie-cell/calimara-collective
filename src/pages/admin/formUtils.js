/** Serialize / parse form values for jsonb and typed columns. */

export function toFormValue(field, value) {
  if (field.type === 'boolean') return Boolean(value);
  if (value == null) return field.type === 'boolean' ? false : '';
  if (field.type === 'json-lines') {
    return Array.isArray(value) ? value.join('\n') : String(value);
  }
  if (field.type === 'json-csv') {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }
  return value;
}

export function fromFormValue(field, raw) {
  if (field.type === 'boolean') return Boolean(raw);
  if (field.type === 'number') {
    if (raw === '' || raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (field.type === 'json-lines') {
    const lines = String(raw || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines;
  }
  if (field.type === 'json-csv') {
    const parts = String(raw || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    // artifact_page_numbers and issue_numbers should be numbers when possible
    if (field.name.includes('number')) {
      return parts.map((p) => (Number.isFinite(Number(p)) ? Number(p) : p));
    }
    return parts;
  }
  if (raw === '') return null;
  return raw;
}

export function rowToForm(fields, row) {
  const form = {};
  for (const field of fields) {
    form[field.name] = toFormValue(field, row?.[field.name]);
  }
  return form;
}

export function formToPayload(fields, form) {
  const payload = {};
  for (const field of fields) {
    payload[field.name] = fromFormValue(field, form[field.name]);
  }
  return payload;
}

export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

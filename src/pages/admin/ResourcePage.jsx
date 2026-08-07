import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { db } from '@/api/client';
import { RESOURCES } from '@/pages/admin/resources';
import { formToPayload, rowToForm, slugify } from '@/pages/admin/formUtils';

export default function ResourcePage({ resourceKey }) {
  const params = useParams();
  const key = resourceKey || params.resource;
  const config = RESOURCES[key];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [q, setQ] = useState('');

  const load = async () => {
    if (!config) return;
    setLoading(true);
    setError('');
    try {
      const data = await db.entities[config.entity].list(config.sort, 500);
      setRows(data);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [key]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      config.listColumns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(needle))
    );
  }, [rows, q, config]);

  if (!config) {
    return <p className="font-body text-faded-red">Unknown resource.</p>;
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete “${row.title || row.name || row.question || row.id}”?`)) return;
    try {
      await db.entities[config.entity].delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono text-dusty-yellow">— {config.eyebrow.toUpperCase()} —</p>
          <h1 className="font-heading text-5xl mt-2">{config.title}</h1>
          <p className="font-body text-archive-fg/70 mt-1">{rows.length} records</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="label-mono bg-dusty-yellow text-ink px-4 py-2.5 hover:bg-cyanotype hover:text-paper focus-ring inline-flex items-center gap-2"
        >
          <Plus size={14} /> NEW
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter…"
        className="w-full max-w-md bg-archive-bg2 border border-archive-line px-3 py-2 text-archive-fg focus-ring"
      />

      {error && <p className="label-mono text-faded-red">{error}</p>}
      {loading && <p className="label-mono text-archive-muted">loading…</p>}

      {!loading && (
        <div className="border border-archive-line overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-archive-bg2 border-b border-archive-line">
              <tr>
                {config.listColumns.map((col) => (
                  <th key={col.key} className="label-mono text-archive-muted px-3 py-2 font-normal">{col.label}</th>
                ))}
                <th className="label-mono text-archive-muted px-3 py-2 font-normal w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-archive-line hover:bg-archive-bg2/60">
                  {config.listColumns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5 font-body text-sm">
                      {formatCell(row[col.key])}
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditing(row)} className="focus-ring text-cyanotype hover:text-dusty-yellow" aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => remove(row)} className="focus-ring text-archive-muted hover:text-faded-red" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={config.listColumns.length + 1} className="px-3 py-8 font-body text-archive-muted">
                    No records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditorDrawer
          config={config}
          row={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function formatCell(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (Array.isArray(value)) return value.slice(0, 3).join(', ') + (value.length > 3 ? '…' : '');
  return String(value);
}

function EditorDrawer({ config, row, onClose, onSaved }) {
  const [form, setForm] = useState(() => rowToForm(config.fields, row || {}));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const payload = formToPayload(config.fields, form);
      if (!payload.slug && payload.title) payload.slug = slugify(payload.title);
      if (!payload.slug && payload.name) payload.slug = slugify(payload.name);
      if (row) await db.entities[config.entity].update(row.id, payload);
      else await db.entities[config.entity].create(payload);
      onSaved();
    } catch (error) {
      setErr(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-archive-bg/80 flex justify-end">
      <div className="bg-archive-bg2 border-l border-archive-line w-full max-w-xl h-full overflow-y-auto shadow-2xl">
        <header className="sticky top-0 bg-archive-bg2 border-b border-archive-line px-5 py-4 flex items-center justify-between gap-3 z-10">
          <div>
            <p className="label-mono text-dusty-yellow">{row ? 'EDIT' : 'NEW'}</p>
            <h2 className="font-heading text-2xl">{config.title.replace(/s$/, '')}</h2>
          </div>
          <button type="button" onClick={onClose} className="focus-ring p-1" aria-label="Close"><X size={18} /></button>
        </header>
        <form onSubmit={save} className="p-5 space-y-4">
          {config.fields.map((field) => (
            <Field key={field.name} field={field} value={form[field.name]} onChange={(v) => set(field.name, v)} />
          ))}
          {err && <p className="label-mono text-faded-red">{err}</p>}
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-archive-bg2 py-4 border-t border-archive-line">
            <button type="submit" disabled={saving} className="label-mono bg-cyanotype text-paper px-5 py-2.5 hover:bg-dusty-yellow hover:text-ink focus-ring disabled:opacity-50 inline-flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              SAVE
            </button>
            <button type="button" onClick={onClose} className="label-mono border border-archive-line px-5 py-2.5 focus-ring">CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const inputClass = 'w-full bg-archive-bg border border-archive-line px-3 py-2 text-archive-fg focus-ring';
  return (
    <label className="block space-y-1">
      <span className="label-mono text-archive-muted text-[0.65rem]">
        {field.label}{field.required ? ' *' : ''}
      </span>
      {field.type === 'textarea' || field.type === 'json-lines' ? (
        <textarea
          rows={field.type === 'json-lines' ? 6 : 4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        />
      ) : field.type === 'boolean' ? (
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="accent-dusty-yellow" />
      ) : field.type === 'select' ? (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={field.required} className={inputClass}>
          <option value="">—</option>
          {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        />
      )}
      {field.hint && <span className="block font-body text-xs text-archive-muted">{field.hint}</span>}
    </label>
  );
}

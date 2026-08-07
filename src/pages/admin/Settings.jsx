import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '@/api/client';

const FIELDS = [
  { name: 'tagline', label: 'Tagline', type: 'text' },
  { name: 'about_text', label: 'About', type: 'textarea' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'founded_year', label: 'Founded year', type: 'text' },
  { name: 'email', label: 'Public email', type: 'text' },
  { name: 'editor_email', label: 'Editor email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'instagram_url', label: 'Instagram URL', type: 'text' },
  { name: 'notion_url', label: 'Notion URL', type: 'text' },
  { name: 'google_form_url', label: 'Google Form URL', type: 'text' },
  { name: 'join_intro', label: 'Join intro', type: 'textarea' },
  { name: 'submit_intro', label: 'Submit intro', type: 'textarea' },
  { name: 'submit_guidelines', label: 'Submit guidelines (one per line)', type: 'json-lines' },
  { name: 'submission_types', label: 'Submission types (comma-separated)', type: 'json-csv' },
  { name: 'join_steps', label: 'Join steps (one per line)', type: 'json-lines' },
  { name: 'shipping_price', label: 'Shipping price', type: 'number' },
  { name: 'numbers_countries_reached', label: 'Numbers · countries reached', type: 'number' },
  { name: 'numbers_years_active', label: 'Numbers · years active', type: 'number' },
  { name: 'manual_pages_printed', label: 'Numbers · pages printed', type: 'number' },
];

function toForm(row) {
  const form = {};
  for (const f of FIELDS) {
    const v = row?.[f.name];
    if (f.type === 'json-lines') form[f.name] = Array.isArray(v) ? v.join('\n') : (v || '');
    else if (f.type === 'json-csv') form[f.name] = Array.isArray(v) ? v.join(', ') : (v || '');
    else if (f.type === 'number') form[f.name] = v ?? '';
    else form[f.name] = v ?? '';
  }
  return form;
}

function toPayload(form) {
  const payload = {};
  for (const f of FIELDS) {
    const raw = form[f.name];
    if (f.type === 'json-lines') {
      payload[f.name] = String(raw || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    } else if (f.type === 'json-csv') {
      payload[f.name] = String(raw || '').split(',').map((s) => s.trim()).filter(Boolean);
    } else if (f.type === 'number') {
      payload[f.name] = raw === '' || raw == null ? null : Number(raw);
    } else {
      payload[f.name] = raw === '' ? null : raw;
    }
  }
  return payload;
}

export default function Settings() {
  const [row, setRow] = useState(null);
  const [form, setForm] = useState(() => toForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    db.entities.SiteSettings.list(5)
      .then((rows) => {
        const r = rows[0] || null;
        setRow(r);
        setForm(toForm(r));
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(''); setErr('');
    try {
      const payload = toPayload(form);
      let saved;
      if (row?.id) saved = await db.entities.SiteSettings.update(row.id, payload);
      else saved = await db.entities.SiteSettings.create(payload);
      setRow(saved);
      setForm(toForm(saved));
      setMsg('Saved.');
    } catch (e2) {
      setErr(e2.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="label-mono text-archive-muted">loading…</p>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <p className="label-mono text-dusty-yellow">— SITE —</p>
        <h1 className="font-heading text-5xl mt-2">Site settings</h1>
        <p className="font-body text-archive-fg/70 mt-1">Singleton row used across Join, Submit, footer, and Numbers.</p>
      </div>

      <form onSubmit={save} className="space-y-4 border border-archive-line bg-archive-bg2 p-5">
        {FIELDS.map((field) => (
          <label key={field.name} className="block space-y-1">
            <span className="label-mono text-archive-muted text-[0.65rem]">{field.label}</span>
            {field.type === 'textarea' || field.type === 'json-lines' ? (
              <textarea
                rows={field.type === 'json-lines' ? 5 : 4}
                value={form[field.name] ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={form[field.name] ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
              />
            )}
          </label>
        ))}
        {msg && <p className="label-mono text-forest">{msg}</p>}
        {err && <p className="label-mono text-faded-red">{err}</p>}
        <button type="submit" disabled={saving} className="label-mono bg-cyanotype text-paper px-5 py-2.5 focus-ring disabled:opacity-50 inline-flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          SAVE SETTINGS
        </button>
      </form>
    </div>
  );
}

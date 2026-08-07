import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '@/api/client';

const STATUSES = ['new', 'under_review', 'shortlisted', 'accepted', 'needs_editing', 'rejected', 'withdrawn'];

export default function Submissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    db.entities.Submission.list('-created_date', 300)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  const save = async (patch) => {
    if (!active) return;
    setSaving(true);
    try {
      const updated = await db.entities.Submission.update(active.id, patch);
      setActive(updated);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      alert(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete submission from ${row.submitter_name || row.email}?`)) return;
    try {
      await db.entities.Submission.delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (active?.id === row.id) setActive(null);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— INBOX —</p>
        <h1 className="font-heading text-5xl mt-2">Submissions</h1>
        <p className="font-body text-archive-fg/70 mt-1">
          Public form entries. Update status and notes here — writers never see internal fields.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['new', 'under_review', 'shortlisted', 'accepted', 'all'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`label-mono px-3 py-1.5 focus-ring ${filter === s ? 'bg-dusty-yellow text-ink' : 'border border-archive-line'}`}
          >
            {s.replace('_', ' ')}
            {s !== 'all' ? ` (${rows.filter((r) => r.status === s).length})` : ` (${rows.length})`}
          </button>
        ))}
      </div>

      {loading && <p className="label-mono text-archive-muted">loading…</p>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-archive-line divide-y divide-archive-line max-h-[70vh] overflow-y-auto">
          {filtered.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setActive(row)}
              className={`w-full text-left px-4 py-3 focus-ring hover:bg-archive-bg2 ${active?.id === row.id ? 'bg-archive-bg2 border-l-2 border-dusty-yellow' : ''}`}
            >
              <p className="font-heading text-xl">{row.title || 'Untitled'}</p>
              <p className="label-mono text-archive-muted mt-1">
                {row.submitter_name} · {row.category || '—'} · {row.status}
              </p>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="px-4 py-8 font-body text-archive-muted">Nothing in this queue.</p>
          )}
        </div>

        <div className="border border-archive-line bg-archive-bg2 p-5 min-h-[20rem]">
          {!active && <p className="font-body text-archive-muted">Select a submission.</p>}
          {active && (
            <div className="space-y-4">
              <div>
                <p className="label-mono text-dusty-yellow">{active.status}</p>
                <h2 className="font-heading text-3xl mt-1">{active.title}</h2>
                <p className="font-body text-archive-fg/80 mt-2">
                  {active.submitter_name} · {active.email}
                  {active.age ? ` · ${active.age}` : ''}
                  {active.school ? ` · ${active.school}` : ''}
                </p>
              </div>
              {active.description && <p className="font-body whitespace-pre-line">{active.description}</p>}
              {active.note && <p className="font-body text-archive-muted italic">{active.note}</p>}
              <div className="flex flex-wrap gap-3 label-mono text-sm">
                {active.file_url && <a href={active.file_url} target="_blank" rel="noreferrer" className="text-cyanotype underline">FILE</a>}
                {active.portfolio_link && <a href={active.portfolio_link} target="_blank" rel="noreferrer" className="text-cyanotype underline">PORTFOLIO</a>}
                {active.instagram && <span>@{active.instagram}</span>}
              </div>

              <label className="block space-y-1">
                <span className="label-mono text-archive-muted text-[0.65rem]">STATUS</span>
                <select
                  value={active.status || 'new'}
                  onChange={(e) => save({ status: e.target.value })}
                  className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="label-mono text-archive-muted text-[0.65rem]">ASSIGNED EDITOR</span>
                <input
                  defaultValue={active.assigned_editor || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (active.assigned_editor || '')) save({ assigned_editor: e.target.value || null });
                  }}
                  className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
                />
              </label>

              <label className="block space-y-1">
                <span className="label-mono text-archive-muted text-[0.65rem]">INTERNAL NOTES</span>
                <textarea
                  defaultValue={active.internal_notes || ''}
                  rows={4}
                  onBlur={(e) => {
                    if (e.target.value !== (active.internal_notes || '')) save({ internal_notes: e.target.value || null });
                  }}
                  className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
                />
              </label>

              <div className="flex items-center gap-3 pt-2">
                {saving && <Loader2 size={14} className="animate-spin text-archive-muted" />}
                <button type="button" onClick={() => remove(active)} className="label-mono text-faded-red focus-ring">DELETE</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

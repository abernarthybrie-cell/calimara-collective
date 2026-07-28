import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Search as SearchIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const match = (val, q) => {
  if (!val) return false;
  return String(val).toLowerCase().includes(q.toLowerCase());
};

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const reqId = useRef(0);

  const run = useCallback(async (query) => {
    const id = ++reqId.current;
    setQ(query);
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const [issues, stories, illus, people, rubrici] = await Promise.all([
        base44.entities.Issue.list(),
        base44.entities.Story.list(),
        base44.entities.Illustration.list(),
        base44.entities.Person.list(),
        base44.entities.Rubrica.list(),
      ]);
      if (id !== reqId.current) return;
      const out = [];
      issues.forEach((r) => match(r.title, query) || match(r.theme, query) ? out.push({ type: 'Issue', label: `ISSUE ${String(r.number).padStart(2,'0')}`, title: r.title, meta: r.theme, to: `/archive/issue-${String(r.number).padStart(2,'0')}` }) : null);
      stories.forEach((r) => match(r.title, query) || match(r.author_name, query) || (r.tags||[]).some(t=>match(t,query)) ? out.push({ type: 'Story', label: r.category?.toUpperCase() || 'STORY', title: r.title, meta: `${r.author_name} · Issue ${String(r.issue_number).padStart(2,'0')}, p.${r.page_number}`, to: `/archive/issue-${String(r.issue_number).padStart(2,'0')}/story/${r.slug}` }) : null);
      illus.forEach((r) => match(r.title, query) || match(r.illustrator_name, query) ? out.push({ type: 'Illustration', label: 'ILLUSTRATION', title: r.title, meta: `${r.illustrator_name} · Issue ${String(r.issue_number).padStart(2,'0')}, p.${r.page_number}`, to: `/archive/issue-${String(r.issue_number).padStart(2,'0')}` }) : null);
      people.forEach((r) => match(r.name, query) || match(r.primary_role, query) ? out.push({ type: 'Person', label: (r.primary_role||'CONTRIBUTOR').toUpperCase(), title: r.name, meta: r.primary_role, to: `/people/${encodeURIComponent(r.name)}` }) : null);
      rubrici.forEach((r) => match(r.name, query) ? out.push({ type: 'Rubrică', label: 'RUBRICĂ', title: r.name, meta: r.content_type, to: `/join#rubrica-${r.slug}` }) : null);
      setResults(out);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-20 bg-paper border border-ink/20 shadow-2xl animate-rise-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink/15">
          <SearchIcon size={18} className="text-burgundy" />
          <input
            autoFocus
            value={q}
            onChange={(e) => run(e.target.value)}
            placeholder="Search stories, poems, authors, issues…"
            className="flex-1 bg-transparent outline-none font-body text-lg placeholder:text-ink-soft/50"
          />
          <button onClick={onClose} aria-label="Close search" className="focus-ring p-1 text-ink hover:text-burgundy"><X size={20} /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && <p className="px-5 py-6 label-mono text-ink-soft">searching the archive…</p>}
          {!loading && searched && results.length === 0 && (
            <p className="px-5 py-6 font-hand text-lg text-ink-soft">Nothing found in the drawer. Try another word.</p>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-ink/10">
              {results.map((r, i) => (
                <li key={i}>
                  <Link to={r.to} onClick={onClose} className="block px-5 py-4 hover:bg-paper-deep transition-colors group">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="label-mono text-burgundy">{r.label}</span>
                      <span className="label-mono text-ink-soft/60 text-[0.6rem] group-hover:text-cyanotype">{r.meta}</span>
                    </div>
                    <p className="font-heading text-xl mt-0.5 group-hover:ink-underline">{r.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!loading && !searched && (
            <p className="px-5 py-6 label-mono text-ink-soft/70">FOUND IN: archive · people · rubrici · stories · issues</p>
          )}
        </div>
      </div>
    </div>
  );
}
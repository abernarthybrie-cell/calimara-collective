import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export default function ContentsFilters({ authors, issues, author, issue, onAuthor, onIssue }) {
  const [open, setOpen] = useState(false);
  const active = Boolean(author || issue);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="stamp text-burgundy inline-flex items-center gap-1 focus-ring">
        <Filter size={11} /> FILTER{active ? ' · ON' : ''}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-3 w-72 bg-paper border-2 border-ink/40 p-4 shadow-xl space-y-4">
          <label className="block">
            <span className="label-mono text-ink-soft">FILTER BY AUTHOR</span>
            <select value={author} onChange={(event) => onAuthor(event.target.value)} className="mt-1 w-full border border-ink/30 bg-paper px-3 py-2 font-body text-base focus-ring">
              <option value="">All authors</option>
              {authors.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label-mono text-ink-soft">FILTER BY ISSUE</span>
            <select value={issue} onChange={(event) => onIssue(event.target.value)} className="mt-1 w-full border border-ink/30 bg-paper px-3 py-2 font-body text-base focus-ring">
              <option value="">All issues</option>
              {issues.map((number) => <option key={number} value={number}>Issue {String(number).padStart(2, '0')}</option>)}
            </select>
          </label>
          {active && <button type="button" onClick={() => { onAuthor(''); onIssue(''); }} className="label-mono text-burgundy inline-flex items-center gap-1 focus-ring"><X size={12} /> CLEAR FILTERS</button>}
        </div>
      )}
    </div>
  );
}
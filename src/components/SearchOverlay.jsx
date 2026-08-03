import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Search as SearchIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const match = (val, q) => normalize(val).includes(normalize(q));
const matchesAny = (values, q) => values.flat().some((value) => match(value, q));

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
      const [allIssues, stories] = await Promise.all([
        base44.entities.Issue.list('number', 100),
        base44.entities.Story.list('page_number', 500),
      ]);
      if (id !== reqId.current) return;

      const issues = allIssues.filter((issue) => issue.status === 'published');
      const issueBySlug = new Map(issues.map((issue) => [issue.slug, issue]));
      const issueByNumber = new Map(issues.map((issue) => [Number(issue.number), issue]));
      const publishedIssueFor = (item) => issueBySlug.get(item.issue_slug) || issueByNumber.get(Number(item.issue_number));
      const publishedStories = stories.filter((story) => Boolean(publishedIssueFor(story)));
      const out = [];

      issues.forEach((issue) => {
        if (matchesAny([issue.title, issue.theme, issue.description, issue.contributor_names || []], query)) {
          out.push({ type: 'Issue', label: `ISSUE ${String(issue.number).padStart(2, '0')}`, title: issue.title, meta: issue.theme, to: `/archive/issue/${issue.slug}` });
        }
      });
      publishedStories.forEach((story) => {
        const searchable = [story.title, story.subtitle, story.author_name, story.category, story.rubrica, story.excerpt, story.full_text, story.tags || [], story.mood_tags || [], story.topic_tags || [], story.form];
        if (matchesAny(searchable, query)) {
          const issue = publishedIssueFor(story);
          const authorMatch = match(story.author_name, query);
          out.push({ type: 'Story', label: authorMatch ? 'AUTHOR' : (story.rubrica || story.category || 'STORY').toUpperCase(), title: story.title, meta: `${story.author_name || 'Author awaiting catalogue'} · Issue ${String(issue.number).padStart(2, '0')}${story.page_number ? `, p.${story.page_number}` : ''}`, to: `/archive/issue/${issue.slug}/story/${story.slug}` });
        }
      });
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
            placeholder="Search stories, authors, topics, issues…"
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
            <p className="px-5 py-6 label-mono text-ink-soft/70">SEARCH ALL PUBLISHED ISSUES · STORIES · AUTHORS · TOPICS</p>
          )}
        </div>
      </div>
    </div>
  );
}
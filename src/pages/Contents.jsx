import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Stamp from '@/components/Stamp';
import ContentsFilters from '@/components/ContentsFilters';
import ArtifactPagePicker from '@/components/ArtifactPagePicker';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];

export default function Contents() {
  const [stories, setStories] = useState([]);
  const [rubrici, setRubrici] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorFilter, setAuthorFilter] = useState('');
  const [issueFilter, setIssueFilter] = useState('');

  useEffect(() => {
    Promise.all([
    base44.entities.Story.list('page_number', 500),
    base44.entities.Rubrica.list('order', 100),
    base44.entities.Issue.list('number', 100)]
    ).then(([s, r, i]) => {
      setStories(s);
      setRubrici(r);
      setIssues(i);
      setLoading(false);
    }).catch(() => setLoading(false));
    base44.auth.isAuthenticated().then((authenticated) => authenticated ? base44.auth.me() : null).
    then((user) => setIsAdmin(user?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  const authorOptions = useMemo(() => [...new Set(stories.flatMap((story) =>
  (story.author_name || '').split('&').map((name) => name.trim()).filter(Boolean)
  ))].sort(), [stories]);
  const issueOptions = useMemo(() => [...new Set(stories.map((story) => story.issue_number).filter(Boolean))].sort((a, b) => a - b), [stories]);
  const filteredStories = useMemo(() => stories.filter((story) => {
    const authors = (story.author_name || '').split('&').map((name) => name.trim());
    return (!authorFilter || authors.includes(authorFilter)) && (!issueFilter || String(story.issue_number) === issueFilter);
  }), [stories, authorFilter, issueFilter]);

  // Group stories by rubrica. Known rubrici come first (in their defined order),
  // then any rubrica names that appear on stories but aren't in the entity,
  // then a final bucket for stories with no rubrica at all.
  const sections = useMemo(() => {
    const known = [...rubrici].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const knownNames = new Set(known.map((r) => r.name));
    const byRubrica = {};
    const noRubrica = [];
    filteredStories.forEach((s) => {
      if (!s.rubrica) {noRubrica.push(s);return;}
      (byRubrica[s.rubrica] = byRubrica[s.rubrica] || []).push(s);
    });
    const extra = Object.keys(byRubrica).filter((n) => !knownNames.has(n)).sort();
    const ordered = [
    ...known.map((r) => ({ name: r.name, description: r.description, stories: byRubrica[r.name] || [] })),
    ...extra.map((n) => ({ name: n, description: '', stories: byRubrica[n] })).filter((sec) => sec.stories.length > 0)];

    if (noRubrica.length) ordered.push({ name: 'Fără rubrică', description: '', stories: noRubrica });
    ordered.forEach((sec) => sec.stories.sort(
      (a, b) => (a.issue_number || 0) - (b.issue_number || 0) || (a.page_number || 0) - (b.page_number || 0)
    ));
    return ordered;
  }, [filteredStories, rubrici]);

  const authorCount = useMemo(() => new Set(
    stories.flatMap((story) => (story.author_name || '').split('&').map((name) => name.trim()).filter(Boolean))
  ).size, [stories]);
  const filtersActive = Boolean(authorFilter || issueFilter);
  const displaySections = filtersActive ? sections.filter((section) => section.stories.length > 0) : sections;

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the contents…</div>;

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-paper grain">
      {/* header — the front-matter card */}
      <section className="pt-14 pb-10">
        <div className="mx-auto max-w-[900px] px-6 lg:px-10">
          <div className="relative bg-paper-deep border border-ink/15 p-8 md:p-12 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 tape" />
            <p className="label-mono text-burgundy">— TABLE OF CONTENTS —</p>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.9] mt-2">Cuprins</h1>
            <p className="font-heading italic text-xl text-ink-soft mt-4 max-w-xl leading-snug">
              Every story we've published, gathered by rubric — browse the magazine by theme, the way you'd flip through a book's front matter.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Stamp className="text-burgundy">{stories.length} PIECES</Stamp>
              <Stamp className="text-cyanotype">{authorCount} AUTHORS</Stamp>
              <Stamp className="text-cyanotype">{sections.length} RUBRICS</Stamp>
              <ContentsFilters
                authors={authorOptions}
                issues={issueOptions}
                author={authorFilter}
                issue={issueFilter}
                onAuthor={setAuthorFilter}
                onIssue={setIssueFilter} />
              
            </div>
          </div>
        </div>
      </section>

      {/* the contents itself */}
      <section className="pb-20">
        <div className="mx-auto max-w-[900px] px-6 lg:px-10">
          {displaySections.length === 0 ?
          <p className="font-hand text-2xl text-ink-soft text-center py-16">{filtersActive ? 'No pieces match these filters.' : 'The contents are still being catalogued — check back soon.'}</p> :

          <div className="space-y-12">
              {displaySections.map((sec, i) =>
            <div key={sec.name} className="relative">
                  <div className="mb-4 pb-2 border-b-2 border-ink/20">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-xl md:text-2xl text-burgundy leading-none">{ROMAN[i] || i + 1}.</span>
                      <h2 className="font-heading text-3xl md:text-4xl leading-none">{sec.name}</h2>
                      <span className="ml-auto label-mono text-ink-soft/50">{sec.stories.length}</span>
                    </div>
                    {sec.description && <p className="font-body text-sm text-ink-soft mt-2 max-w-lg">{sec.description}</p>}
                  </div>
                  <ul className="space-y-0">
                    {sec.stories.length === 0 &&
                <li className="py-3 px-1">
                        <p className="font-hand text-lg text-ink-soft/50 italic">Nothing filed here yet — the first piece in this rubric is waiting to be written.</p>
                      </li>
                }
                    {sec.stories.map((s) => {
                  const issueSlug = s.issue_slug || `issue-${String(s.issue_number || 1).padStart(2, '0')}`;
                  const meta = [s.issue_number ? `№${String(s.issue_number).padStart(2, '0')}` : null, s.page_number ? `p.${s.page_number}` : null].filter(Boolean).join(' · ');
                  return (
                    <li key={s.id}>
                          <div className="flex items-center gap-2">
                            <Link
                          to={`/archive/issue/${issueSlug}/story/${s.slug}`}
                          className="group flex flex-1 items-center gap-3 py-2 hover:bg-paper-deep/60 transition-colors focus-ring px-1 [font-family:'EB_Garamond',_serif] font-bold">
                              <span className="text-lg leading-tight group-hover:text-burgundy transition-colors font-normal [font-family:'LUCKY_TYPEWRITER',_sans-serif] uppercase">{s.title.replace(/\bplaceholder\b/gi, '').trim()}</span>
                              {s.author_name && s.author_name.split('&').map((n, i) =>
                          <span key={i} className="text-base text-ink-soft/70 whitespace-nowrap [font-family:'Impact_Label',_sans-serif] font-normal">{n.trim()}{i < s.author_name.split('&').length - 1 ? ' &' : ''}</span>
                          )}
                              <span className="flex-1 border-b border-dotted border-ink/20 mb-[3px] min-w-[20px]" />
                              {meta && <span className="label-mono text-ink-soft/70 whitespace-nowrap [font-family:'Impact_Label_Reversed',_sans-serif] font-normal">{meta}</span>}
                            </Link>
                            {isAdmin && <button onClick={() => setEditingStory(s)} className="label-mono border border-ink/25 px-2 py-1 hover:bg-paper-deep focus-ring whitespace-nowrap">EDIT PAGES</button>}
                          </div>
                        </li>);

                })}
                  </ul>
                </div>
            )}
            </div>
          }
        </div>
      </section>
      {editingStory && <ArtifactPagePicker
        story={editingStory}
        issue={issues.find((issue) => issue.slug === editingStory.issue_slug || issue.number === editingStory.issue_number)}
        onClose={() => setEditingStory(null)}
        onSaved={(updated) => {setStories((items) => items.map((item) => item.id === updated.id ? updated : item));setEditingStory(null);}} />
      }
    </div>);

}
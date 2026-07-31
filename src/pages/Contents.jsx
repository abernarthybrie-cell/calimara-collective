import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { hasImage } from '@/lib/calimara';
import Stamp from '@/components/Stamp';
import ScanImage from '@/components/ScanImage';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];

export default function Contents() {
  const [stories, setStories] = useState([]);
  const [rubrici, setRubrici] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
    base44.entities.Story.list(500),
    base44.entities.Rubrica.list('order', 100),
    base44.entities.Issue.list('number', 100)]
    ).then(([s, r, iss]) => {
      setStories(s);
      setRubrici(r);
      setIssues(iss);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Resolve the original printed page for a story from its issue's uploaded scans
  const pageImageFor = useMemo(() => {
    const byNum = {};
    const bySlug = {};
    issues.forEach((iss) => {
      byNum[iss.number] = iss.page_images || [];
      bySlug[iss.slug] = iss.page_images || [];
    });
    return (story) => {
      const imgs = (story.issue_slug && bySlug[story.issue_slug]) || byNum[story.issue_number] || [];
      const idx = (story.page_number || 0) - 1;
      return idx >= 0 && idx < imgs.length ? imgs[idx] : null;
    };
  }, [issues]);

  // Group stories by rubrica. Known rubrici come first (in their defined order),
  // then any rubrica names that appear on stories but aren't in the entity,
  // then a final bucket for stories with no rubrica at all.
  const sections = useMemo(() => {
    const known = [...rubrici].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const knownNames = new Set(known.map((r) => r.name));
    const byRubrica = {};
    const noRubrica = [];
    stories.forEach((s) => {
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
  }, [stories, rubrici]);

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
              <Stamp className="text-cyanotype">{sections.length} RUBRICS</Stamp>
            </div>
          </div>
        </div>
      </section>

      {/* the contents itself */}
      <section className="pb-20">
        <div className="mx-auto max-w-[900px] px-6 lg:px-10">
          {sections.length === 0 ?
          <p className="font-hand text-2xl text-ink-soft text-center py-16">The contents are still being catalogued — check back soon.</p> :

          <div className="space-y-12">
              {sections.map((sec, i) =>
            <div key={sec.name} className="relative">
                  <div className="mb-4 pb-2 border-b-2 border-ink/20">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-xl md:text-2xl text-burgundy leading-none">{ROMAN[i] || i + 1}</span>
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
                  const pageImage = pageImageFor(s);
                  return (
                    <li key={s.id}>
                          <Link
                        to={`/archive/issue/${issueSlug}/story/${s.slug}`}
                        className="group flex items-center gap-3 py-2 hover:bg-paper-deep/60 transition-colors focus-ring px-1">
                            {pageImage && hasImage(pageImage) ? (
                              <span className="shrink-0 w-10 aspect-[210/297] overflow-hidden border border-ink/20 shadow-sm bg-white">
                                <ScanImage src={pageImage} alt={`page ${s.page_number} of issue ${s.issue_number}`} className="w-full h-full" fittingType="fill" />
                              </span>
                            ) : null}
                            <span className="text-lg leading-tight group-hover:text-burgundy transition-colors [font-family:'Impact_Label',_sans-serif] font-normal">{s.title}</span>
                            {s.author_name && s.author_name.split('&').map((n, i) => (
                              <span key={i} className="text-base text-ink-soft/70 whitespace-nowrap [font-family:'Impact_Label',_sans-serif] font-normal">{n.trim()}{i < s.author_name.split('&').length - 1 ? ' &' : ''}</span>
                            ))}
                            <span className="flex-1 border-b border-dotted border-ink/20 mb-[3px] min-w-[20px]" />
                            {meta && <span className="label-mono text-ink-soft/70 whitespace-nowrap [font-family:'Impact_Label_Reversed',_sans-serif] font-normal">{meta}</span>}
                          </Link>
                        </li>);

                })}
                  </ul>
                </div>
            )}
            </div>
          }
        </div>
      </section>
    </div>);

}
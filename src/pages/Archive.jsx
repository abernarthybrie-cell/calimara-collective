import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';
import Stamp from '@/components/Stamp';

export default function Archive() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Issue.filter({ status: 'published' }, '-number', 100)
      .then(setIssues).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-14 sm:pt-16">
      {/* header */}
      <section className="bg-archive-bg text-archive-fg grain pt-16 pb-14">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="label-mono text-dusty-yellow mb-3">— THE INFINITE SHELF —</p>
          <h1 className="font-heading text-6xl md:text-8xl">Archive</h1>
          <p className="font-heading italic text-xl md:text-2xl text-archive-fg/70 mt-4 max-w-xl">
            Every issue is a physical object. Pull one forward to open it.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Stamp className="text-dusty-yellow">{issues.length} ISSUES · CATALOGUED</Stamp>
            <span className="label-mono text-archive-muted">SHELF A · ROW 1 · BUCHAREST</span>
          </div>
        </div>
      </section>

      {/* shelf — horizontal scroll */}
      <section className="bg-archive-bg-2 py-14">
        <div className="mx-auto max-w-[1400px]">
          {loading && <p className="px-6 label-mono text-archive-muted">opening the shelf…</p>}
          {!loading && issues.length === 0 && (
            <p className="px-6 font-hand text-2xl text-archive-fg/70">No issues catalogued yet. The first one will appear here.</p>
          )}
          <div className="flex gap-8 overflow-x-auto no-scrollbar px-6 pb-6 snap-x">
            {issues.map((it, i) => (
              <IssueOnShelf key={it.id} issue={it} featured={i === 0} />
            ))}
          </div>
          <p className="px-6 mt-2 label-mono text-archive-muted/60">← swipe to browse the shelf →</p>
        </div>
      </section>

      {/* catalogue list (mobile-friendly + reference) */}
      <section className="py-16 bg-paper grain-light">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-6">— CATALOGUE CARDS —</p>
          <div className="grid md:grid-cols-2 gap-6">
            {issues.map((it) => (
              <Link key={it.id} to={`/archive/issue-${String(it.number).padStart(2,'0')}`} className="group block bg-paper-deep border border-ink/15 p-6 hover:border-burgundy transition-colors focus-ring">
                <div className="flex gap-5">
                  <ScanImage src={it.cover_image} alt={it.title} objectNumber={`ISSUE ${String(it.number).padStart(2,'0')}`} className="aspect-[3/4] w-24 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="label-mono text-ink-soft/60">ISSUE {String(it.number).padStart(2,'0')} · {formatDate(it.publication_date)}</p>
                    <h3 className="font-heading text-2xl mt-1 group-hover:text-burgundy">{it.title}</h3>
                    <p className="label-mono text-burgundy mt-1">THEME · {it.theme}</p>
                    <p className="font-body text-ink-soft mt-2 line-clamp-3">{it.description}</p>
                    <p className="label-mono text-ink-soft/60 mt-3">{it.page_count} pp · {(it.contributor_names||[]).length} contributors · condition: lived-in</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function IssueOnShelf({ issue, featured }) {
  const [hover, setHover] = useState(false);
  const num = String(issue.number).padStart(2, '0');
  return (
    <Link
      to={`/archive/issue-${num}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`snap-center shrink-0 w-64 md:w-72 block focus-ring transition-transform duration-500 ${hover ? '-translate-y-4 scale-105 z-10' : ''} ${featured ? 'md:ml-10' : ''}`}
    >
      <div className="relative">
        {/* spine */}
        <div className="absolute -left-3 top-2 bottom-2 w-3 bg-ink/80" aria-hidden />
        <ScanImage src={issue.cover_image} alt={issue.title} objectNumber={`ISSUE ${num}`} className="aspect-[3/4] w-full shadow-2xl" />
        {hover && (
          <div className="absolute -right-6 top-6 bg-paper text-ink border border-ink/20 p-3 w-52 shadow-xl z-20 animate-fade-in">
            <p className="label-mono text-burgundy">CATALOGUE CARD</p>
            <p className="font-mono-c text-[0.65rem] text-ink-soft mt-1.5 leading-relaxed">
              ISSUE {num}<br/>
              THEME: {issue.theme}<br/>
              {issue.page_count} PAGES<br/>
              {(issue.contributor_names||[]).length} CONTRIBUTORS<br/>
              {formatDate(issue.publication_date)}<br/>
              CONDITION: PRISTINE
            </p>
            <p className="label-mono text-cyanotype mt-2">OPEN →</p>
          </div>
        )}
      </div>
      <div className="mt-3 text-archive-fg">
        <p className="label-mono text-dusty-yellow">ISSUE {num}</p>
        <p className="font-heading text-lg mt-0.5">{issue.title}</p>
      </div>
    </Link>
  );
}
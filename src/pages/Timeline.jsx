import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { formatDate, formatDateShort } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';
import Stamp from '@/components/Stamp';

const STATUS_COLOR = {
  past: 'text-ink-soft',
  current: 'text-burgundy',
  upcoming: 'text-cyanotype',
};

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    base44.entities.TimelineEvent.list('-date', 200).then((rows) => {
      setEvents(rows.sort((a,b) => new Date(a.date) - new Date(b.date)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const upcoming = events.filter((e) => e.status !== 'past');

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-archive-bg text-archive-fg grain pt-14 pb-10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="label-mono text-dusty-yellow mb-3">— THE FILM STRIP —</p>
          <h1 className="font-heading text-6xl md:text-8xl">Timeline</h1>
          <p className="font-heading italic text-xl md:text-2xl text-archive-fg/70 mt-4 max-w-xl">
            Everything that has happened, frame by frame.
          </p>
          <div className="mt-5 flex gap-3">
            <Stamp className="text-dusty-yellow">EST. 2024</Stamp>
            <span className="label-mono text-archive-muted">{events.length} ENTRIES CATALOGUED</span>
          </div>
        </div>
      </section>

      {/* upcoming events */}
      {upcoming.length > 0 && (
        <section className="bg-paper-deep py-12 grain-light">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="label-mono text-burgundy mb-5">— UPCCOMING / CURRENT —</p>
            <div className="space-y-4">
              {upcoming.map((e) => (
                <div key={e.id} className="bg-paper border-l-4 border-cyanotype p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="stamp text-cyanotype">{e.status.toUpperCase()}</span>
                      <span className="label-mono text-ink-soft">{e.type.toUpperCase()}</span>
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl mt-2">{e.title}</h3>
                    <p className="label-mono text-ink-soft mt-1">{formatDate(e.date)} · {e.location || 'TBA'}</p>
                    <p className="font-body text-ink-soft mt-2 max-w-xl">{e.description}</p>
                    {e.who_can_attend && <p className="font-hand text-lg text-burgundy mt-1">who can attend: {e.who_can_attend}</p>}
                  </div>
                  {e.registration_url && (
                    <a href={e.registration_url} target="_blank" rel="noreferrer" className="label-mono bg-ink text-paper px-5 py-3 hover:bg-burgundy focus-ring shrink-0 self-start">REGISTER →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* film strip timeline — desktop horizontal, mobile vertical */}
      <section className="bg-archive-bg-2 py-14 grain">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="label-mono text-dusty-yellow mb-6">— THE CHRONOLOGY —</p>
          {loading && <p className="label-mono text-archive-muted">spooling the film…</p>}

          {/* desktop horizontal film strip */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6">
                {events.map((e) => (
                  <button key={e.id} onClick={()=>setActive(e)} className="snap-center shrink-0 w-64 text-left focus-ring group">
                    <div className="bg-ink p-2">
                      <div className="flex justify-between py-1">
                        <span className="label-mono text-paper/40 text-[0.5rem]">FRAME</span>
                        <span className="label-mono text-paper/40 text-[0.5rem]">{formatDateShort(e.date)}</span>
                      </div>
                      <div className="relative aspect-[4/3] bg-archive-bg border-y-4 border-ink">
                        <ScanImage src={(e.images||[])[0]} alt={e.title} objectNumber={e.type.toUpperCase()} className="w-full h-full" />
                        <span className={`absolute top-1 left-1 stamp text-[0.5rem] ${STATUS_COLOR[e.status]}`}>{e.status}</span>
                      </div>
                    </div>
                    <p className="font-heading text-lg mt-2 group-hover:text-dusty-yellow leading-tight">{e.title}</p>
                    <p className="label-mono text-archive-muted text-[0.6rem]">{e.location || '—'}</p>
                  </button>
                ))}
              </div>
            </div>
            <p className="label-mono text-archive-muted/60 mt-1">← scroll the strip →</p>
          </div>

          {/* mobile vertical */}
          <div className="md:hidden relative pl-6 border-l-2 border-archive-line space-y-6">
            {events.map((e) => (
              <button key={e.id} onClick={()=>setActive(e)} className="block text-left w-full focus-ring group">
                <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-dusty-yellow" />
                <p className="label-mono text-dusty-yellow text-[0.6rem]">{formatDateShort(e.date)} · {e.status.toUpperCase()}</p>
                <p className="font-heading text-2xl group-hover:text-dusty-yellow">{e.title}</p>
                <p className="font-body text-archive-fg/70 text-sm">{e.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* event detail modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={()=>setActive(null)} />
          <div className="relative w-full max-w-lg bg-paper border border-ink/20 shadow-2xl p-6 animate-rise-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="stamp text-burgundy">{active.status.toUpperCase()}</span>
              <button onClick={()=>setActive(null)} aria-label="Close" className="focus-ring p-1 text-ink">✕</button>
            </div>
            <p className="label-mono text-ink-soft">{formatDate(active.date)} · {active.location || 'TBA'} · {active.type}</p>
            <h2 className="font-heading text-3xl md:text-4xl mt-1">{active.title}</h2>
            <p className="font-body text-lg text-ink-soft mt-3 leading-relaxed">{active.description}</p>
            {(active.highlights||[]).length > 0 && (
              <div className="mt-4">
                <p className="label-mono text-burgundy">HIGHLIGHTS</p>
                <ul className="list-disc list-inside font-body text-ink-soft mt-1">{active.highlights.map((h,i)=><li key={i}>{h}</li>)}</ul>
              </div>
            )}
            {(active.images||[]).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {active.images.map((im,i)=><ScanImage key={i} src={im} alt="" className="aspect-square w-full border border-ink/15" />)}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2 items-center">
              {active.related_issue_number && <Link to={`/archive/issue-${String(active.related_issue_number).padStart(2,'0')}`} className="stamp text-cyanotype">ISSUE {String(active.related_issue_number).padStart(2,'0')}</Link>}
              {(active.related_people||[]).map((n)=><Link key={n} to={`/people/${encodeURIComponent(n)}`} className="stamp text-burgundy">{n}</Link>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
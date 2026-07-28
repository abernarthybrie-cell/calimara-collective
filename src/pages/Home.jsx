import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/lib/calimara';
import ScrapbookSheet from '@/components/ScrapbookSheet';
import Polaroid from '@/components/Polaroid';
import Tape from '@/components/Tape';
import Stamp from '@/components/Stamp';
import ScanImage from '@/components/ScanImage';

export default function Home() {
  const { settings, loading } = useSettingsSafe();
  const { openDrawer } = useOutletContext() || {};
  const [stats, setStats] = useState(null);
  const [newest, setNewest] = useState(null);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Issue.filter({ status: 'published' }, 'number', 100),
      base44.entities.Person.list(50),
      base44.entities.Story.list(200),
      base44.entities.Illustration.list(200),
      base44.entities.TimelineEvent.list(50),
    ]).then(([issues, ppl, stories, illus, events]) => {
      setStats({
        issues: issues.length,
        people: ppl.length,
        stories: stories.length,
        illustrations: illus.length,
        events: events.length,
      });
      setNewest(issues[issues.length - 1] || issues[0] || null);
      setPeople(ppl.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <div className="pt-14 sm:pt-16">
      {/* ===== HERO SCRAPBOOK ===== */}
      <ScrapbookSheet className="relative overflow-hidden grain" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="absolute inset-0 bg-paper" />
        {/* decorative collage — desktop only */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
            <div data-depth="0.6" data-base-transform="rotate(3deg)" className="absolute top-[18%] left-[6%] w-44 rotate-3">
              <Polaroid src={people[0]?.polaroid_photo} objectNumber="P-01" alt="Contributor" caption={people[0]?.name || 'a contributor'} />
            </div>
            <div data-depth="0.3" data-base-transform="rotate(-2deg)" className="absolute top-[12%] right-[10%] w-56 rotate-[-2deg]">
              <Tape className="absolute -top-3 left-1/2 -translate-x-1/2" />
              <ScanImage src={newest?.cover_image} alt="Newest issue" objectNumber={newest ? `ISSUE ${String(newest.number).padStart(2,'0')}` : ''} className="aspect-[3/4] w-full shadow-xl" />
            </div>
            <div data-depth="0.9" className="absolute bottom-[16%] left-[12%] w-64">
              <p className="font-hand text-2xl text-ink leading-snug">
                “write it badly<br/>first.”<br/><span className="label-mono text-xs text-burgundy">— margin note, issue 01</span>
              </p>
            </div>
            <div data-depth="0.4" className="absolute bottom-[12%] right-[8%] w-72 rotate-[2deg]">
              <Stamp className="text-burgundy">ARCHIVE · BUCHAREST</Stamp>
              <p className="font-mono-c text-xs text-ink-soft mt-3 leading-relaxed">
                FILE / 2024–∞<br/>CAT. CĂLIMARA<br/>SHELF A · ROW 1<br/>CONDITION: LIVED-IN
              </p>
            </div>
            {/* film strip fragment */}
            <div data-depth="0.2" className="absolute top-[42%] left-[40%] w-72 rotate-[-4deg] opacity-90">
              <div className="bg-ink p-2 flex gap-1">
                {[0,1,2,3].map(i => <div key={i} className="flex-1 aspect-square bg-paper-deep" />)}
              </div>
              <p className="font-hand text-sm text-ink-soft mt-1">frames 7–12 · launch night</p>
            </div>
        </div>

        {/* central content */}
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-20 md:py-28 text-center min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
          <p className="label-mono text-burgundy mb-5 animate-fade-in">INDEPENDENT STUDENT MAGAZINE · BUCHAREST</p>
          <h1 className="font-heading text-[18vw] md:text-[12rem] leading-[0.85] tracking-tight animate-rise-in">CĂLIMARA</h1>
          <p className="font-heading italic text-2xl md:text-3xl text-ink-soft mt-6 max-w-2xl mx-auto animate-fade-in">
            {settings?.tagline || 'A magazine made by young people who have something to say.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link to="/archive" className="group bg-ink text-paper px-7 py-3.5 hover:bg-burgundy transition-colors focus-ring inline-flex items-center gap-2">
              <span className="label-mono">ENTER THE ARCHIVE</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={openDrawer} className="label-mono text-ink hover:text-burgundy focus-ring underline underline-offset-4">
              SHOW ME SOMETHING RANDOM →
            </button>
          </div>

          <p className="font-hand text-lg text-ink-soft/70 mt-8">↓ scroll into the desk</p>
        </div>
      </ScrapbookSheet>

      {/* ===== WHAT IS CĂLIMARA ===== */}
      <section className="bg-paper-deep py-20 md:py-28 grain-light">
        <div className="mx-auto max-w-3xl px-6">
          <p className="label-mono text-burgundy mb-4">— WHAT IS CĂLIMARA? —</p>
          <p className="font-heading text-2xl md:text-3xl leading-relaxed text-ink">
            {settings?.about_text || 'Călimara is a student-created creative magazine where literature, visual art, photography, cinema, and the strange little things that make us human meet on paper.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Stamp className="text-cyanotype">EST. {settings?.founded_year || '2024'}</Stamp>
            <span className="font-mono-c text-xs text-ink-soft">{settings?.city || 'Bucharest'} · printed in small runs · stapled by hand</span>
          </div>
        </div>
      </section>

      {/* ===== CURRENTLY ===== */}
      <section className="bg-archive-bg text-archive-fg py-20 md:py-24 grain">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-heading text-4xl md:text-5xl">Călimara, currently</h2>
            <span className="label-mono text-archive-muted">UPDATED FROM THE DATABASE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-archive-line">
            {[
              { n: stats?.issues ?? '—', l: 'ISSUES PUBLISHED' },
              { n: stats?.people ?? '—', l: 'CONTRIBUTORS' },
              { n: stats?.stories ?? '—', l: 'STORIES' },
              { n: stats?.illustrations ?? '—', l: 'ILLUSTRATIONS' },
              { n: stats?.events ?? '—', l: 'EVENTS' },
            ].map((s) => (
              <div key={s.l} className="bg-archive-bg p-6 md:p-8">
                <p className="font-heading text-5xl md:text-6xl text-dusty-yellow">{s.n}</p>
                <p className="label-mono text-archive-muted mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWEST ISSUE ===== */}
      {newest && (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Tape className="absolute -top-3 left-8 z-10" />
              <Link to={`/archive/issue-${String(newest.number).padStart(2,'0')}`} className="block focus-ring">
                <ScanImage src={newest.cover_image} alt={newest.title} objectNumber={`ISSUE ${String(newest.number).padStart(2,'0')}`} className="aspect-[3/4] w-full max-w-sm mx-auto shadow-2xl" />
              </Link>
            </div>
            <div>
              <p className="label-mono text-burgundy">THE LATEST · ISSUE {String(newest.number).padStart(2,'0')}</p>
              <h3 className="font-heading text-4xl md:text-5xl mt-3">{newest.title}</h3>
              <p className="label-mono text-ink-soft mt-2">THEME · {newest.theme} · {newest.page_count} PAGES</p>
              <p className="font-body text-lg text-ink-soft mt-5 leading-relaxed max-w-md">{newest.description}</p>
              <Link to={`/archive/issue-${String(newest.number).padStart(2,'0')}`} className="inline-flex items-center gap-2 mt-6 label-mono text-burgundy hover:text-ink focus-ring">
                BROWSE THE ISSUE <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== ENTRY POINTS ===== */}
      <section className="bg-paper-deep py-20 grain-light">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="font-hand text-2xl text-burgundy mb-8">where you can fall in next —</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15">
            {[
              { to: '/archive', n: '01', t: 'Archive', d: 'Browse the issues as physical objects on a shelf.' },
              { to: '/people', n: '02', t: 'People', d: 'Meet the contributors. They are the magazine.' },
              { to: '/timeline', n: '03', t: 'Timeline', d: 'A film strip of everything that has happened.' },
              { to: '/join', n: '04', t: 'Join Us', d: 'Applications are open. Make something with us.' },
              { to: '/shop', n: '05', t: 'Shop', d: 'Print, paper, and small objects. By mail.' },
              { to: '#drawer', n: '06', t: 'The Drawer', d: 'Open a random fragment from the archive.', onClick: openDrawer },
            ].map((c) => (
              c.onClick ? (
                <button key={c.n} onClick={c.onClick} className="text-left bg-paper p-7 hover:bg-paper-deep transition-colors group focus-ring">
                  <span className="label-mono text-ink-soft/50">{c.n}</span>
                  <p className="font-heading text-3xl mt-1 group-hover:text-burgundy">{c.t}</p>
                  <p className="font-body text-ink-soft mt-2">{c.d}</p>
                </button>
              ) : (
                <Link key={c.n} to={c.to} className="bg-paper p-7 hover:bg-paper-deep transition-colors group focus-ring">
                  <span className="label-mono text-ink-soft/50">{c.n}</span>
                  <p className="font-heading text-3xl mt-1 group-hover:text-burgundy">{c.t}</p>
                  <p className="font-body text-ink-soft mt-2">{c.d}</p>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function useSettingsSafe() {
  try { return useSettings(); } catch { return { settings: null, loading: true }; }
}
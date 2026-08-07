import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { db } from '@/api/client';
import { useSettings } from '@/lib/calimara';
import Stamp from '@/components/Stamp';

export default function Numbers() {
  const { settings } = useSettings();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      db.entities.Issue.filter({ status: 'published' }, 'number', 200),
      db.entities.Person.list(500),
      db.entities.Story.list(500),
      db.entities.Illustration.list(500),
      db.entities.TimelineEvent.list(200),
      db.entities.Rubrica.list(200),
    ]).then(([issues, people, stories, illus, events, rubrici]) => {
      const pagesPrinted = settings?.manual_pages_printed || issues.reduce((sum, i) => sum + (i.page_count || 0), 0);
      const poems = stories.filter((s) => {
        const f = (s.rubrica || s.form || '').toLowerCase();
        return f.includes('poez') || f.includes('poem');
      }).length;
      setStats({
        issues: issues.length,
        people: people.length,
        stories: stories.length,
        illustrations: illus.length,
        events: events.length,
        rubrici: rubrici.length,
        pages: pagesPrinted,
        poems,
        years: settings?.numbers_years_active || null,
        countries: settings?.numbers_countries_reached || null,
      });
    }).catch(() => {});
  }, [settings]);

  const tiles = [
    { n: stats?.issues ?? '—', label: 'ISSUES PUBLISHED', to: '/archive' },
    { n: stats?.people ?? '—', label: 'CONTRIBUTORS', to: '/people' },
    { n: stats?.stories ?? '—', label: 'STORIES', to: '/reading-room' },
    { n: stats?.poems ?? '—', label: 'POEMS', to: '/reading-room' },
    { n: stats?.illustrations ?? '—', label: 'ILLUSTRATIONS', to: '/reading-room' },
    { n: stats?.pages ?? '—', label: 'PAGES PRINTED', to: '/archive' },
    { n: stats?.events ?? '—', label: 'EVENTS', to: '/timeline' },
    { n: stats?.rubrici ?? '—', label: 'RUBRICI', to: '/join' },
  ];
  if (stats?.years) tiles.push({ n: stats.years, label: 'YEARS OF CĂLIMARA', to: '/timeline' });
  if (stats?.countries) tiles.push({ n: stats.countries, label: 'COUNTRIES REACHED', to: '/shop' });

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-paper-deep grain pt-14 pb-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— CĂLIMARA IN NUMBERS —</p>
          <h1 className="font-heading text-6xl md:text-8xl leading-[0.9]">How much has happened.</h1>
          <p className="font-heading italic text-xl md:text-2xl text-ink-soft mt-5 max-w-2xl leading-snug">
            Not a dashboard. A count of what's been made — pulled live from the archive. Click any number to walk into that part of Călimara.
          </p>
        </div>
      </section>

      <section className="py-16 bg-paper grain">
        <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-ink/15">
            {tiles.map((t) => (
              <Link key={t.label} to={t.to} className="bg-paper p-6 md:p-8 hover:bg-paper-deep transition-colors group focus-ring">
                <p className="font-heading text-6xl md:text-7xl text-burgundy group-hover:translate-x-1 transition-transform">{t.n}</p>
                <p className="label-mono text-ink-soft mt-2">{t.label}</p>
                <p className="font-mono-c text-[0.6rem] text-ink-soft/40 mt-1 group-hover:text-burgundy">ENTER → {t.to.replace('/', '').toUpperCase() || 'HOME'}</p>
              </Link>
            ))}
          </div>
          <p className="font-hand text-xl text-ink-soft/70 mt-8 text-center">every number above is counted from the live archive — nothing invented.</p>
        </div>
      </section>

      <section className="bg-ink text-paper py-14 grain">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 text-center">
          <Stamp className="text-dusty-yellow">COUNTED BY HAND</Stamp>
          <p className="font-heading text-3xl md:text-4xl mt-4 leading-snug">A small magazine becomes a small universe.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link to="/reading-room" className="inline-flex items-center gap-2 label-mono text-dusty-yellow hover:text-paper focus-ring underline underline-offset-4">ENTER THE READING ROOM <ArrowRight size={14} /></Link>
            <Link to="/shelf" className="inline-flex items-center gap-2 label-mono text-dusty-yellow hover:text-paper focus-ring underline underline-offset-4">THE SHELF <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
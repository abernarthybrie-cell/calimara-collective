import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Instagram, Phone } from 'lucide-react';
import { db } from '@/api/client';
import { useSettings } from '@/lib/calimara';
import Stamp from '@/components/Stamp';

export default function JoinUs() {
  const { settings } = useSettings();
  const [roles, setRoles] = useState([]);
  const [rubrici, setRubrici] = useState([]);
  const [people, setPeople] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    Promise.all([
      db.entities.Role.list('order', 100),
      db.entities.Rubrica.list('order', 100),
      db.entities.Person.list(200),
      db.entities.Story.list(200),
    ]).then(([r, ru, p, s]) => { setRoles(r); setRubrici(ru); setPeople(p); setStories(s); }).catch(()=>{});
  }, []);

  const formUrl = settings?.google_form_url || '#';

  const storiesByRubrica = useMemo(() => {
    const map = {};
    stories.forEach((s) => { const k = s.rubrica || 'Uncategorised'; (map[k] = map[k] || []).push(s); });
    return map;
  }, [stories]);

  return (
    <div className="pt-14 sm:pt-16">
      {/* hero */}
      <section className="bg-paper-deep grain-light pt-14 pb-14">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— OPEN INVITATION —</p>
          <h1 className="font-heading text-6xl md:text-8xl leading-[0.9]">Join us</h1>
          <p className="font-heading italic text-2xl md:text-3xl text-ink-soft mt-5 max-w-2xl leading-snug">
            {settings?.join_intro || 'There is no test. If you make things — or want to start — there is a place at the table.'}
          </p>
          <a href={formUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 bg-ink text-paper px-7 py-4 hover:bg-burgundy transition-colors focus-ring">
            <span className="label-mono">REGISTER YOUR INTEREST</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* how it works */}
      <section className="py-16 bg-paper grain">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-6">— HOW DOES JOINING WORK? —</p>
          <ol className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(settings?.join_steps||[]).map((step, i) => (
              <li key={i} className="bg-paper-deep border border-ink/15 p-5">
                <p className="font-heading text-5xl text-burgundy/40">{String(i+1).padStart(2,'0')}</p>
                <p className="font-body text-lg mt-2">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* roles */}
      <section className="py-16 bg-archive-bg text-archive-fg grain">
        <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
          <p className="label-mono text-dusty-yellow mb-3">— ROLES —</p>
          <h2 className="font-heading text-4xl md:text-6xl mb-8">What can you do at Călimara?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-archive-line">
            {roles.map((r) => {
              const holders = people.filter((p) => (p.roles||[]).includes(r.name) || p.primary_role === r.name).slice(0,4);
              const examples = stories.filter((s) => (r.rubrici||[]).includes(s.rubrica)).slice(0,3);
              return (
                <div key={r.id} className="bg-archive-bg p-6 flex flex-col">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-2xl">{r.name}</h3>
                    {r.open ? <Stamp className="text-dusty-yellow">OPEN</Stamp> : <span className="label-mono text-archive-muted">FULL</span>}
                  </div>
                  <p className="font-body text-archive-fg/80 mt-2">{r.description}</p>
                  <p className="label-mono text-dusty-yellow mt-4">WHAT YOU DO</p>
                  <ul className="font-body text-sm text-archive-fg/70 mt-1 space-y-0.5 list-disc list-inside">
                    {(r.responsibilities||[]).map((x,i)=><li key={i}>{x}</li>)}
                  </ul>
                  <p className="label-mono text-dusty-yellow mt-4">SKILLS</p>
                  <p className="font-body text-sm text-archive-fg/70 mt-1">{(r.skills||[]).join(' · ')}</p>
                  {holders.length > 0 && (
                    <div className="mt-4">
                      <p className="label-mono text-archive-muted">PEOPLE WHO HAVE DONE THIS</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {holders.map((h) => <Link key={h.id} to={`/people/${encodeURIComponent(h.slug||h.name)}`} className="stamp text-cyanotype hover:text-dusty-yellow">{h.name}</Link>)}
                      </div>
                    </div>
                  )}
                  {examples.length > 0 && (
                    <div className="mt-4">
                      <p className="label-mono text-archive-muted">WORK THEY CONTRIBUTED TO</p>
                      <ul className="mt-1 space-y-0.5">
                        {examples.map((s) => <li key={s.id}><Link to={`/archive/issue-${String(s.issue_number).padStart(2,'0')}/story/${s.slug}`} className="font-body text-sm text-archive-fg/70 hover:text-dusty-yellow">{s.title}</Link></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* rubrici */}
      <section className="py-16 bg-paper grain">
        <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— RUBRICI —</p>
          <h2 className="font-heading text-4xl md:text-6xl mb-8">The columns of the magazine</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/15">
            {rubrici.map((r) => {
              const works = storiesByRubrica[r.name] || [];
              return (
                <div key={r.id} id={`rubrica-${r.slug}`} className="bg-paper-deep p-5">
                  <h3 className="font-heading text-2xl">{r.name}</h3>
                  <p className="label-mono text-ink-soft/60 mt-1">{r.content_type}</p>
                  <p className="font-body text-ink-soft mt-2 text-sm">{r.description}</p>
                  {works.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3">
                      {works.slice(0,3).map((s) => (
                        <li key={s.id}><Link to={`/archive/issue-${String(s.issue_number).padStart(2,'0')}/story/${s.slug}`} className="font-body text-sm hover:text-burgundy focus-ring">{s.title}</Link></li>
                      ))}
                    </ul>
                  )}
                  <span className="label-mono text-ink-soft/40 mt-3 block">{works.length} works · click a title to read</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Q&A */}
      <section className="py-16 bg-ink text-paper grain">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="label-mono text-dusty-yellow mb-3">— QUESTIONS? —</p>
            <h2 className="font-heading text-4xl md:text-6xl leading-[0.95]">Before you join</h2>
            <p className="font-body text-paper/70 mt-3 max-w-lg">Everything you might want to know before you raise your hand.</p>
          </div>
          <Link to="/qa" className="inline-flex items-center gap-2 border border-paper/30 px-6 py-3 label-mono text-paper hover:bg-paper hover:text-ink transition-colors focus-ring">READ THE Q&A <ArrowRight size={14}/></Link>
        </div>
      </section>

      {/* contact */}
      <section className="py-16 bg-paper-deep grain-light">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 grid md:grid-cols-2 gap-10">
          <div>
            <p className="label-mono text-burgundy mb-3">— CONTACT —</p>
            <h2 className="font-heading text-4xl md:text-5xl">Get in touch</h2>
            <div className="mt-5 space-y-3 font-body text-lg">
              {settings?.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-3 hover:text-burgundy focus-ring"><Mail size={18}/> {settings.email}</a>}
              {settings?.editor_email && <a href={`mailto:${settings.editor_email}`} className="flex items-center gap-3 hover:text-burgundy focus-ring"><Mail size={18}/> editor · {settings.editor_email}</a>}
              {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-burgundy focus-ring"><Instagram size={18}/> @calimara</a>}
              {settings?.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-3 hover:text-burgundy focus-ring"><Phone size={18}/> {settings.phone}</a>}
            </div>
          </div>
          <div className="bg-paper border border-ink/15 p-6">
            <p className="font-hand text-3xl text-burgundy leading-tight">Make something with us.</p>
            <p className="font-body text-ink-soft mt-2">Applications are open. We read everything.</p>
            <a href={formUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4">REGISTER YOUR INTEREST <ArrowRight size={14}/></a>
          </div>
        </div>
      </section>
    </div>
  );
}
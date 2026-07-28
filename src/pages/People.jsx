import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScanImage from '@/components/ScanImage';
import Polaroid from '@/components/Polaroid';

export default function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('All');

  useEffect(() => {
    base44.entities.Person.list(200).then(setPeople).finally(() => setLoading(false));
  }, []);

  const allRoles = useMemo(() => {
    const s = new Set(['All']);
    people.forEach((p) => { (p.roles||[]).forEach(r => s.add(r)); if (p.primary_role) s.add(p.primary_role); });
    return [...s];
  }, [people]);

  const founder = people.find((p) => p.is_founder);
  const filtered = people.filter((p) => !p.is_founder && (role === 'All' || (p.roles||[]).includes(role) || p.primary_role === role));

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-paper-deep grain-light pt-14 pb-12">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— THE CONTACT SHEET —</p>
          <h1 className="font-heading text-6xl md:text-8xl">People</h1>
          <p className="font-heading italic text-xl md:text-2xl text-ink-soft mt-4 max-w-xl">
            The contributors are the magazine. This is everyone who has ever put something on the page.
          </p>
        </div>
      </section>

      {/* founder */}
      {founder && (
        <section className="py-16 bg-paper grain">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="label-mono text-burgundy mb-6">— FOUNDER —</p>
            <Link to={`/people/${encodeURIComponent(founder.slug || founder.name)}`} className="group block focus-ring">
              <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center bg-paper-deep border border-ink/15 p-8 hover:border-burgundy transition-colors">
                <Polaroid src={founder.polaroid_photo} objectNumber="FOUNDER" alt={founder.name} caption={founder.name} rotate="rotate-2" className="w-40 md:w-48" />
                <div>
                  <p className="font-heading text-4xl group-hover:text-burgundy">{founder.name}</p>
                  <p className="label-mono text-ink-soft">{founder.primary_role} · joined {founder.date_joined}</p>
                  <p className="font-body text-ink-soft mt-3 max-w-md line-clamp-3">{founder.biography}</p>
                  <p className="font-hand text-xl text-burgundy mt-3">“{founder.why_joined}”</p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* role filter */}
      <section className="bg-archive-bg text-archive-fg py-14 grain">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-wrap gap-2 mb-8">
            {allRoles.map((r) => (
              <button key={r} onClick={()=>setRole(r)} className={`label-mono px-3 py-1.5 focus-ring ${role===r ? 'bg-dusty-yellow text-ink' : 'border border-archive-line text-archive-fg/80 hover:bg-archive-bg2'}`}>{r}</button>
            ))}
          </div>

          {loading && <p className="label-mono text-archive-muted">loading the contact sheet…</p>}

          {/* contact sheet */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-archive-line">
            {filtered.map((p, i) => (
              <Link key={p.id} to={`/people/${encodeURIComponent(p.slug || p.name)}`} className="group bg-archive-bg p-4 hover:bg-archive-bg2 transition-colors focus-ring">
                <div className="relative aspect-square overflow-hidden border border-archive-line mb-2">
                  <ScanImage src={p.polaroid_photo || p.profile_photo} alt={p.name} objectNumber={`P-${String(i+1).padStart(2,'0')}`} className="w-full h-full" />
                  <span className="absolute top-1 left-1 label-mono text-dusty-yellow text-[0.5rem]">P-{String(i+1).padStart(2,'0')}</span>
                </div>
                <p className="font-heading text-lg group-hover:text-dusty-yellow leading-tight">{p.name}</p>
                <p className="label-mono text-archive-muted text-[0.6rem]">{p.primary_role}</p>
                <p className="font-hand text-base text-archive-fg/70 mt-1 leading-tight line-clamp-1">{p.why_joined}</p>
              </Link>
            ))}
          </div>
          {!loading && filtered.length === 0 && <p className="font-hand text-2xl text-archive-fg/70">No one in that role yet — maybe you.</p>}
        </div>
      </section>
    </div>
  );
}
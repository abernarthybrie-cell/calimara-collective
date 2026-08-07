import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/api/client';
import ScanImage from '@/components/ScanImage';
import Polaroid from '@/components/Polaroid';
import Stamp from '@/components/Stamp';
import Tape from '@/components/Tape';

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await db.entities.Person.list(300);
        setPeople(all);
        const p = all.find((x) => x.slug === id || x.name === decodeURIComponent(id));
        setPerson(p || null);
        if (p) {
          const [st, il] = await Promise.all([
            db.entities.Story.filter({ author_name: p.name }, 'page_number', 200),
            db.entities.Illustration.filter({ illustrator_name: p.name }, 'page_number', 200),
          ]);
          setStories(st);
          setIllus(il);
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  // cultural associations
  const associations = useMemo(() => {
    if (!person || !people.length) return [];
    const fields = ['favorite_book','favorite_album','favorite_film'];
    const out = [];
    fields.forEach((f) => {
      const val = person[f];
      if (!val || val.startsWith('[Placeholder')) return;
      const count = people.filter((p) => p[f] === val).length;
      if (count > 1) out.push({ field: f.replace('favorite_',''), value: val, count });
    });
    return out;
  }, [person, people]);

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the folder…</div>;
  if (!person) return <div className="pt-32 px-6 font-hand text-2xl">That person isn't in the archive.</div>;

  return (
    <div className="pt-14 sm:pt-16">
      <div className="py-12">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <Link to="/people" className="label-mono text-burgundy hover:text-ink focus-ring inline-flex items-center gap-1"><ArrowLeft size={14}/> CONTACT SHEET</Link>

          {/* scrapbook header */}
          <div className="mt-8 grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="relative w-48 md:w-56">
              <Tape className="absolute -top-3 left-10 z-10" />
              <Polaroid src={person.polaroid_photo} objectNumber={person.slug?.toUpperCase()} alt={person.name} caption={person.primary_role} rotate="rotate-1" className="w-full" />
            </div>
            <div>
              {person.is_founder && <Stamp className="text-burgundy mb-3">FOUNDER</Stamp>}
              <h1 className="font-heading text-5xl md:text-7xl leading-[0.95]">{person.name}</h1>
              <p className="label-mono text-ink-soft mt-2">{(person.roles||[]).join(' · ')}</p>
              <p className="label-mono text-ink-soft/70 mt-1">JOINED {person.date_joined || '—'} · {person.status === 'past' ? 'PAST CONTRIBUTOR' : 'ACTIVE'}</p>
              <p className="font-body text-lg text-ink-soft mt-4 max-w-xl leading-relaxed">{person.biography}</p>
            </div>
          </div>

          {/* why they joined */}
          {person.why_joined && (
            <div className="mt-10 max-w-md bg-paper-deep border-l-2 border-burgundy pl-5 py-4">
              <p className="label-mono text-burgundy">WHY I JOINED</p>
              <p className="font-hand text-2xl text-ink mt-1 leading-snug">{person.why_joined}</p>
            </div>
          )}

          {/* founder founding story */}
          {person.is_founder && person.founding_story && (
            <FounderStory person={person} />
          )}

          {/* cultural DNA */}
          <section className="mt-12">
            <p className="label-mono text-burgundy mb-4">— CULTURAL DNA —</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-ink/15">
              <Dna label="BOOK" value={person.favorite_book} />
              <Dna label="ALBUM" value={person.favorite_album} />
              <Dna label="FILM" value={person.favorite_film} />
              <Dna label="ARTIST" value={person.favorite_artist} />
              <Dna label="QUOTE" value={person.favorite_quote} hand />
              <Dna label="INTERESTS" value={(person.interests||[]).join(', ')} />
            </div>
            {associations.length > 0 && (
              <div className="mt-4 space-y-1">
                {associations.map((a) => (
                  <p key={a.field} className="font-hand text-lg text-cyanotype">
                    ✶ {a.count} Călimara contributors have “{a.value}” in their archive.
                  </p>
                ))}
              </div>
            )}
          </section>

          {/* additional photos — contact sheet */}
          {(person.additional_photos||[]).length > 0 && (
            <section className="mt-12">
              <p className="label-mono text-burgundy mb-4">— FROM THE FOLDER —</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {person.additional_photos.map((im, i) => (
                  <ScanImage key={i} src={im} alt={`${person.name} ${i+1}`} objectNumber={`F-${String(i+1).padStart(2,'0')}`} className="aspect-square w-full border border-ink/15" />
                ))}
              </div>
            </section>
          )}

          {/* selected works */}
          <section className="mt-12">
            <p className="label-mono text-burgundy mb-4">— WORKS —</p>
            {stories.length === 0 && illus.length === 0 && <p className="font-hand text-xl text-ink-soft">Nothing linked to them yet. Add stories or illustrations with this author to fill the folder.</p>}
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {stories.map((s) => (
                <li key={s.id} className="py-3 flex items-baseline justify-between gap-4">
                  <Link to={`/archive/issue-${String(s.issue_number).padStart(2,'0')}/story/${s.slug}`} className="font-heading text-xl hover:text-burgundy focus-ring">{s.title}</Link>
                  <span className="label-mono text-ink-soft/60 text-right shrink-0">{s.category} · Issue {String(s.issue_number).padStart(2,'0')}, p.{s.page_number}</span>
                </li>
              ))}
              {illus.map((il) => (
                <li key={il.id} className="py-3 flex items-center gap-4">
                  <ScanImage src={il.image} alt={il.title} objectNumber={`p.${il.page_number}`} className="w-14 aspect-square border border-ink/15 shrink-0" />
                  <div>
                    <p className="font-heading text-lg">{il.title}</p>
                    <span className="label-mono text-ink-soft/60">Illustration · Issue {String(il.issue_number).padStart(2,'0')}, p.{il.page_number}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* issues */}
          {(person.issue_numbers||[]).length > 0 && (
            <section className="mt-12">
              <p className="label-mono text-burgundy mb-4">— CONTRIBUTED TO —</p>
              <div className="flex flex-wrap gap-2">
                {person.issue_numbers.map((n) => (
                  <Link key={n} to={`/archive/issue-${String(n).padStart(2,'0')}`} className="stamp text-cyanotype hover:text-burgundy focus-ring">ISSUE {String(n).padStart(2,'0')}</Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Dna({ label, value, hand }) {
  const empty = !value || value.startsWith('[Placeholder');
  return (
    <div className="bg-paper p-4">
      <p className="label-mono text-ink-soft/60">{label}</p>
      {empty ? <p className="font-hand text-lg text-ink-soft/40 mt-1">— to be filled —</p>
        : <p className={`${hand ? 'font-hand text-xl' : 'font-body text-base'} text-ink mt-1 leading-snug`}>{value}</p>}
    </div>
  );
}

function FounderStory({ person }) {
  return (
    <section className="mt-14 bg-archive-bg text-archive-fg grain p-8 md:p-12">
      <p className="label-mono text-dusty-yellow mb-3">— THE FOUNDING —</p>
      <h2 className="font-heading text-3xl md:text-5xl mb-6">How Călimara began</h2>
      <div className="max-w-2xl space-y-5 font-body text-lg leading-relaxed text-archive-fg/90 whitespace-pre-line">
        {person.founding_story}
      </div>
      {(person.additional_photos||[]).length > 0 && (
        <div className="mt-8 flex flex-wrap gap-4">
          {person.additional_photos.slice(0,3).map((im, i) => (
            <ScanImage key={i} src={im} alt={`Early photograph ${i+1}`} objectNumber={`EARLY-${i+1}`} className="w-40 aspect-[4/5] border border-archive-line" />
          ))}
        </div>
      )}
    </section>
  );
}
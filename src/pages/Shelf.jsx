import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Stamp from '@/components/Stamp';
import ScanImage from '@/components/ScanImage';

const TYPE_HEADINGS = {
  book: 'BOOKS OUR CONTRIBUTORS LOVE',
  film: 'FILMS WE KEEP TALKING ABOUT',
  album: 'ALBUMS PLAYING WHILE WE WORK',
  song: 'SONGS ON REPEAT',
  artist: 'ARTISTS WE LOOK TO',
  photographer: 'PHOTOGRAPHERS WE RETURN TO',
  poet: 'POETS WE KEEP CLOSE',
  writer: 'WRITERS WE UNDERLINE',
  quote: 'WORDS WE KEEP',
  place: 'PLACES WE CARRY',
  other: 'OBJECTS WE LOVE',
};

export default function Shelf() {
  const [recs, setRecs] = useState([]);
  const [people, setPeople] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [surprise, setSurprise] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.CulturalRecommendation.list('order', 300),
      base44.entities.Person.list(300),
    ]).then(([r, p]) => { setRecs(r); setPeople(p); }).catch(() => {});
  }, []);

  const personName = (id) => people.find((p) => p.id === id)?.name;

  const types = useMemo(() => Array.from(new Set(recs.map((r) => r.type).filter(Boolean))), [recs]);
  const shown = typeFilter === 'all' ? recs : recs.filter((r) => r.type === typeFilter);
  const grouped = useMemo(() => {
    const map = {};
    shown.forEach((r) => { const k = r.type || 'other'; (map[k] = map[k] || []).push(r); });
    return map;
  }, [shown]);

  const pickSurprise = () => { if (recs.length) setSurprise(recs[Math.floor(Math.random() * recs.length)]); };

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-archive-bg text-archive-fg grain pt-14 pb-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <p className="label-mono text-dusty-yellow mb-3">— CĂLIMARA RECOMMENDS —</p>
          <h1 className="font-heading text-6xl md:text-8xl leading-[0.9]">The Călimara Shelf</h1>
          <p className="font-heading italic text-xl md:text-2xl text-archive-fg/70 mt-5 max-w-2xl leading-snug">
            A collective bookshelf. The books, films, albums, artists and words that the people behind Călimara keep close — and why.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={pickSurprise} className="inline-flex items-center gap-2 border border-paper/30 px-4 py-2 label-mono text-paper hover:bg-paper hover:text-ink transition-colors focus-ring">
              <Shuffle size={14} /> SHOW ME SOMETHING
            </button>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTypeFilter('all')} className={`label-mono px-3 py-2 border transition-colors focus-ring ${typeFilter === 'all' ? 'bg-dusty-yellow text-ink border-dusty-yellow' : 'border-paper/25 text-paper/70 hover:text-paper'}`}>ALL</button>
              {types.map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`label-mono px-3 py-2 border transition-colors focus-ring ${typeFilter === t ? 'bg-dusty-yellow text-ink border-dusty-yellow' : 'border-paper/25 text-paper/70 hover:text-paper'}`}>{(t || 'other').toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {surprise && (
        <section className="py-10 bg-paper-deep grain-light">
          <div className="mx-auto max-w-[700px] px-6 lg:px-10 text-center">
            <p className="label-mono text-burgundy mb-3">FROM THE SHELF</p>
            <Link to={`/shelf/${surprise.slug || surprise.id}`} className="block bg-paper border border-ink/15 p-6 hover:bg-paper-shadow transition-colors focus-ring">
              <ScanImage src={surprise.cover_image} objectNumber={surprise.type} alt={surprise.title} className="aspect-[3/4] w-40 mx-auto" />
              <h3 className="font-heading text-3xl mt-4">{surprise.title}</h3>
              <p className="font-hand text-lg text-ink-soft">{surprise.creator}</p>
            </Link>
          </div>
        </section>
      )}

      <section className="py-14 bg-paper grain">
        <div className="mx-auto max-w-[1300px] px-6 lg:px-10 space-y-14">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <p className="label-mono text-burgundy mb-2">— {TYPE_HEADINGS[type] || type.toUpperCase()} —</p>
              <h2 className="font-heading text-3xl md:text-4xl mb-6">{items.length} on the shelf</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {items.map((r) => {
                  const names = (r.recommended_by_names || []).length
                    ? r.recommended_by_names
                    : (r.recommended_by_ids || []).map(personName).filter(Boolean);
                  return (
                    <Link key={r.id} to={`/shelf/${r.slug || r.id}`} className="group focus-ring">
                      <div className="relative">
                        <ScanImage src={r.cover_image} objectNumber={r.type} alt={r.title} className="aspect-[3/4] w-full shadow-lg group-hover:shadow-2xl transition-shadow" />
                      </div>
                      <h3 className="font-heading text-xl leading-tight mt-2 group-hover:text-burgundy">{r.title}</h3>
                      <p className="font-hand text-base text-ink-soft">{r.creator}</p>
                      <p className="label-mono text-ink-soft/50 mt-1">
                        {names.length > 1 ? `RECOMMENDED BY ${names.length}` : names[0] ? `RECOMMENDED BY ${names[0].split(' ')[0]}` : '—'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="font-hand text-2xl text-ink-soft text-center">The shelf is still being stocked. Come back soon.</p>}
        </div>
      </section>

      <section className="bg-ink text-paper py-12 grain">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 text-center">
          <p className="font-heading italic text-2xl">Want to meet the people behind the recommendations?</p>
          <Link to="/people" className="mt-4 inline-flex items-center gap-2 label-mono text-dusty-yellow hover:text-paper focus-ring underline underline-offset-4">MEET THE PEOPLE <ArrowRight size={14} /></Link>
        </div>
      </section>
    </div>
  );
}
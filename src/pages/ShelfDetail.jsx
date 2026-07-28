import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Stamp from '@/components/Stamp';
import ScanImage from '@/components/ScanImage';

export default function ShelfDetail() {
  const { slug } = useParams();
  const [rec, setRec] = useState(null);
  const [people, setPeople] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.CulturalRecommendation.filter({ slug }, 'order', 5),
      base44.entities.Person.list(300),
      base44.entities.Story.list(300),
    ]).then(([r, p, s]) => {
      setRec(r[0] || null); setPeople(p); setStories(s); setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32 text-center font-hand text-2xl text-ink-soft">opening the shelf…</div>;
  if (!rec) return (
    <div className="pt-32 pb-20 text-center">
      <p className="font-heading text-4xl">Not on the shelf.</p>
      <Link to="/shelf" className="mt-6 inline-flex items-center gap-2 label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4"><ArrowLeft size={14} /> BACK TO THE SHELF</Link>
    </div>
  );

  const recommenders = (rec.recommended_by_ids || [])
    .map((id) => people.find((p) => p.id === id))
    .filter(Boolean);
  const byName = (rec.recommended_by_names || []).filter(Boolean);
  const theirWork = recommenders.length
    ? stories.filter((s) => recommenders.some((p) => s.author_name === p.name)).slice(0, 4)
    : [];

  return (
    <div className="pt-14 sm:pt-16">
      <section className="py-12 bg-paper-deep grain-light">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <Link to="/shelf" className="label-mono text-burgundy hover:text-ink focus-ring inline-flex items-center gap-1 mb-6"><ArrowLeft size={14} /> THE SHELF</Link>
          <div className="grid md:grid-cols-[280px_1fr] gap-10">
            <div>
              <ScanImage src={rec.cover_image} objectNumber={rec.type} alt={rec.title} className="aspect-[3/4] w-full shadow-xl" />
              <div className="mt-3 flex flex-wrap gap-2">
                {rec.year && <Stamp className="text-burgundy">{rec.year}</Stamp>}
                {rec.related_issue_number && <Link to="/archive" className="stamp text-cyanotype hover:text-burgundy">ISSUE {String(rec.related_issue_number).padStart(2,'0')}</Link>}
              </div>
            </div>
            <div>
              <p className="label-mono text-burgundy mb-2">— {rec.type?.toUpperCase() || 'OBJECT'} —</p>
              <h1 className="font-heading text-5xl md:text-6xl leading-[0.95]">{rec.title}</h1>
              {rec.creator && <p className="font-heading italic text-2xl text-ink-soft mt-2">{rec.creator}</p>}
              {rec.description && <p className="font-body text-lg text-ink-soft mt-5 leading-relaxed max-w-prose">{rec.description}</p>}
              {rec.recommendation_text && (
                <div className="mt-6 bg-paper border-l-4 border-burgundy pl-5 py-3">
                  <p className="label-mono text-burgundy mb-2">WHY WE RECOMMEND IT</p>
                  <p className="font-heading italic text-xl leading-snug">{rec.recommendation_text}</p>
                </div>
              )}
              <div className="mt-6">
                <p className="label-mono text-ink-soft mb-2">RECOMMENDED BY {recommenders.length || byName.length} CĂLIMARA CONTRIBUTOR{(recommenders.length || byName.length) > 1 ? 'S' : ''}</p>
                <div className="flex flex-wrap gap-2">
                  {recommenders.length ? recommenders.map((p) => (
                    <Link key={p.id} to={`/people/${encodeURIComponent(p.slug || p.name)}`} className="stamp text-cyanotype hover:text-burgundy">{p.name}</Link>
                  )) : byName.map((n, i) => <span key={i} className="stamp text-cyanotype">{n}</span>)}
                </div>
              </div>
              {recommenders[0] && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to={`/people/${encodeURIComponent(recommenders[0].slug || recommenders[0].name)}`} className="inline-flex items-center gap-2 label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4">
                    MEET {recommenders[0].name.split(' ')[0].toUpperCase()} <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {theirWork.length > 0 && (
        <section className="py-12 bg-paper grain">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
            <p className="label-mono text-burgundy mb-4">— THEIR WORK IN CĂLIMARA —</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {theirWork.map((s) => (
                <Link key={s.id} to={`/archive/issue/${s.issue_slug || 'issue-' + String(s.issue_number||1).padStart(2,'0')}/story/${s.slug}`} className="bg-paper-deep border border-ink/15 p-4 hover:bg-paper-shadow transition-colors focus-ring group">
                  <p className="label-mono text-ink-soft/60">ISSUE {String(s.issue_number||'—').padStart(2,'0')}</p>
                  <h3 className="font-heading text-2xl group-hover:text-burgundy">{s.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
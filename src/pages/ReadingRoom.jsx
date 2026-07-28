import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Stamp from '@/components/Stamp';
import ScanImage from '@/components/ScanImage';
import StoryCard from '@/components/StoryCard';

const LENGTHS = [
  { id: 5, label: '5 MIN', sub: 'I have five minutes', cap: 5 },
  { id: 10, label: '10 MIN', sub: 'A quiet ten', cap: 10 },
  { id: 15, label: '15 MIN', sub: 'A quarter hour', cap: 15 },
  { id: 30, label: '30 MIN', sub: 'Settle in', cap: 30 },
  { id: 999, label: 'TAKE YOUR TIME', sub: 'No rush at all', cap: 999 },
];

const MODES = [
  { id: 'mood', label: 'Read by mood' },
  { id: 'topic', label: 'By topic' },
  { id: 'form', label: 'By form' },
  { id: 'length', label: 'By length' },
  { id: 'collections', label: 'Curated' },
  { id: 'surprise', label: 'Surprise me' },
];

export default function ReadingRoom() {
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [tags, setTags] = useState([]);
  const [collections, setCollections] = useState([]);
  const [rubrici, setRubrici] = useState([]);
  const [mode, setMode] = useState('mood');
  const [selected, setSelected] = useState(null);
  const [surprise, setSurprise] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Story.list(300),
      base44.entities.Illustration.list(300),
      base44.entities.ReadingTag.list('order', 200),
      base44.entities.ReadingCollection.list('order', 100),
      base44.entities.Rubrica.list('order', 100),
    ]).then(([s, i, t, c, r]) => {
      setStories(s); setIllus(i); setTags(t); setCollections(c); setRubrici(r);
    }).catch(() => {});
  }, []);

  const moodTags = tags.filter((t) => t.type === 'mood');
  const topicTags = tags.filter((t) => t.type === 'topic');

  const forms = useMemo(() => {
    const set = new Set();
    rubrici.forEach((r) => set.add(r.name));
    stories.forEach((s) => { if (s.form) set.add(s.form); if (s.rubrica) set.add(s.rubrica); });
    return Array.from(set);
  }, [rubrici, stories]);

  const filtered = useMemo(() => {
    if (!selected) return [];
    if (mode === 'mood') return stories.filter((s) => (s.mood_tags || []).includes(selected));
    if (mode === 'topic') return stories.filter((s) => (s.topic_tags || []).includes(selected));
    if (mode === 'form') return stories.filter((s) => (s.form || s.rubrica) === selected);
    if (mode === 'length') {
      const bucket = LENGTHS.find((l) => l.id === selected);
      if (!bucket) return [];
      const idx = LENGTHS.indexOf(bucket);
      const lower = idx > 0 ? LENGTHS[idx - 1].cap : 0;
      return stories.filter((s) => s.reading_time_min && s.reading_time_min > lower && s.reading_time_min <= bucket.cap);
    }
    if (mode === 'collections') {
      const col = collections.find((c) => c.slug === selected);
      if (!col) return [];
      return stories.filter((s) => (col.story_slugs || []).includes(s.slug));
    }
    return [];
  }, [mode, selected, stories, collections]);

  const countForTag = (name) => stories.filter((s) => (s.mood_tags || []).includes(name) || (s.topic_tags || []).includes(name)).length;
  const countForForm = (f) => stories.filter((s) => (s.form || s.rubrica) === f).length;

  const pickSurprise = () => {
    const pool = [
      ...stories.map((s) => ({ kind: 'story', item: s })),
      ...illus.map((i) => ({ kind: 'illustration', item: i })),
    ];
    if (!pool.length) return;
    setSurprise(pool[Math.floor(Math.random() * pool.length)]);
  };

  useEffect(() => { if (mode === 'surprise' && !surprise) pickSurprise(); }, [mode]);

  const switchMode = (m) => { setMode(m); setSelected(null); };

  return (
    <div className="pt-14 sm:pt-16">
      {/* header */}
      <section className="bg-paper-deep grain pt-14 pb-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— THE READING ROOM —</p>
          <h1 className="font-heading text-6xl md:text-8xl leading-[0.9]">What do you want to read?</h1>
          <p className="font-heading italic text-xl md:text-2xl text-ink-soft mt-5 max-w-2xl leading-snug">
            The Archive keeps everything we published, in order. The Reading Room is for finding something to read right now — by mood, by topic, by form, or by how much time you have.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => switchMode(m.id)} className={`label-mono px-3 py-2 border transition-colors focus-ring ${mode === m.id ? 'bg-ink text-paper border-ink' : 'border-ink/25 text-ink hover:bg-ink hover:text-paper'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MOOD */}
      {mode === 'mood' && (
        <section className="py-12 bg-paper grain">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="font-hand text-2xl text-burgundy mb-5">How are you feeling? —</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {moodTags.map((t) => (
                <button key={t.id} onClick={() => setSelected(selected === t.name ? null : t.name)} className={`text-left bg-paper-deep border p-4 hover:bg-paper-shadow transition-colors focus-ring ${selected === t.name ? 'border-burgundy border-2' : 'border-ink/15'}`}>
                  <p className="font-heading text-2xl">{t.name}</p>
                  {t.description && <p className="font-body text-sm text-ink-soft mt-1">{t.description}</p>}
                  <p className="label-mono text-ink-soft/50 mt-2">{countForTag(t.name)} PIECES</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOPIC */}
      {mode === 'topic' && (
        <section className="py-12 bg-paper grain">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="font-hand text-2xl text-burgundy mb-5">What's on your mind? —</p>
            <div className="flex flex-wrap gap-2">
              {topicTags.map((t) => (
                <button key={t.id} onClick={() => setSelected(selected === t.name ? null : t.name)} className={`label-mono px-3 py-2 border transition-colors focus-ring ${selected === t.name ? 'bg-burgundy text-paper border-burgundy' : 'border-ink/25 text-ink hover:bg-ink hover:text-paper'}`}>
                  {t.name} · {countForTag(t.name)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FORM */}
      {mode === 'form' && (
        <section className="py-12 bg-paper grain">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="font-hand text-2xl text-burgundy mb-5">What shape of thing? —</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {forms.map((f) => (
                <button key={f} onClick={() => setSelected(selected === f ? null : f)} className={`text-left bg-paper-deep border p-4 hover:bg-paper-shadow transition-colors focus-ring ${selected === f ? 'border-burgundy border-2' : 'border-ink/15'}`}>
                  <p className="font-heading text-2xl">{f}</p>
                  <p className="label-mono text-ink-soft/50 mt-2">{countForForm(f)} PIECES</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LENGTH */}
      {mode === 'length' && (
        <section className="py-12 bg-paper grain">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="font-hand text-2xl text-burgundy mb-5">How much time do you have? —</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
              {LENGTHS.map((l) => (
                <button key={l.id} onClick={() => setSelected(selected === l.id ? null : l.id)} className={`text-left bg-paper-deep border p-4 hover:bg-paper-shadow transition-colors focus-ring ${selected === l.id ? 'border-burgundy border-2' : 'border-ink/15'}`}>
                  <Stamp className="text-burgundy">{l.label}</Stamp>
                  <p className="font-body text-sm text-ink-soft mt-2">{l.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COLLECTIONS */}
      {mode === 'collections' && (
        <section className="py-12 bg-paper grain">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <p className="font-hand text-2xl text-burgundy mb-5">Handmade recommendation lists —</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((c) => (
                <button key={c.id} onClick={() => setSelected(selected === c.slug ? null : c.slug)} className={`text-left bg-paper-deep border p-4 hover:bg-paper-shadow transition-colors focus-ring ${selected === c.slug ? 'border-burgundy border-2' : 'border-ink/15'}`}>
                  <ScanImage src={c.cover_image} objectNumber={c.type} alt={c.title} className="aspect-[4/3] w-full mb-3" />
                  <h3 className="font-heading text-2xl leading-tight">{c.title}</h3>
                  {c.description && <p className="font-body text-sm text-ink-soft mt-1">{c.description}</p>}
                  <p className="label-mono text-ink-soft/50 mt-2">{(c.story_slugs || []).length} STORIES</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RESULTS for mood/topic/form/length/collections */}
      {['mood', 'topic', 'form', 'length', 'collections'].includes(mode) && selected && (
        <section className="py-12 bg-paper-deep grain-light">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="flex items-baseline justify-between mb-6">
              <p className="label-mono text-burgundy">{filtered.length} PIECES</p>
              <button onClick={() => setSelected(null)} className="label-mono text-ink-soft hover:text-ink focus-ring underline underline-offset-4">← back to all</button>
            </div>
            {filtered.length === 0 ? (
              <p className="font-hand text-2xl text-ink-soft">Nothing here yet — but we're still cataloguing. Try another shelf.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((s) => <StoryCard key={s.id} story={s} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SURPRISE */}
      {mode === 'surprise' && (
        <section className="py-16 bg-paper grain min-h-[60vh]">
          <div className="mx-auto max-w-[800px] px-6 lg:px-10 text-center">
            <p className="label-mono text-burgundy mb-3">TODAY'S CĂLIMARA DISCOVERY</p>
            {surprise ? (
              <div className="bg-paper-deep border border-ink/15 p-8 mt-4">
                <Stamp className="text-burgundy">{surprise.kind === 'story' ? 'A STORY' : 'AN ILLUSTRATION'}</Stamp>
                <h3 className="font-heading text-4xl mt-4">{surprise.item.title}</h3>
                <p className="font-hand text-xl text-ink-soft mt-1">
                  {surprise.kind === 'story' ? surprise.item.author_name : surprise.item.illustrator_name}
                </p>
                {surprise.item.excerpt && <p className="font-body text-ink-soft mt-4 italic">{surprise.item.excerpt}</p>}
                <div className="flex items-center justify-center gap-4 mt-8">
                  {surprise.kind === 'story' ? (
                    <Link to={`/archive/issue/${surprise.item.issue_slug || 'issue-' + String(surprise.item.issue_number||1).padStart(2,'0')}/story/${surprise.item.slug}`} className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 hover:bg-burgundy transition-colors focus-ring">
                      <span className="label-mono">READ THIS</span><ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link to={`/archive/issue/${surprise.item.issue_slug || 'issue-' + String(surprise.item.issue_number||1).padStart(2,'0')}`} className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 hover:bg-burgundy transition-colors focus-ring">
                      <span className="label-mono">VIEW IT</span><ArrowRight size={16} />
                    </Link>
                  )}
                  <button onClick={pickSurprise} className="inline-flex items-center gap-2 label-mono text-ink hover:text-burgundy focus-ring underline underline-offset-4">
                    <Shuffle size={14} /> ANOTHER ONE
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={pickSurprise} className="bg-ink text-paper px-7 py-4 hover:bg-burgundy transition-colors focus-ring inline-flex items-center gap-2">
                <Shuffle size={16} /><span className="label-mono">I DON'T KNOW WHAT I WANT</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* footer cross-link */}
      <section className="bg-ink text-paper py-12 grain">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 text-center">
          <p className="font-heading italic text-2xl">Prefer to browse by issue?</p>
          <Link to="/archive" className="mt-4 inline-flex items-center gap-2 label-mono text-dusty-yellow hover:text-paper focus-ring underline underline-offset-4">ENTER THE ARCHIVE <ArrowRight size={14} /></Link>
        </div>
      </section>
    </div>
  );
}
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, FileText, Download, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';
import Stamp from '@/components/Stamp';
import Tape from '@/components/Tape';

export default function IssueDetail() {
  const { issueSlug } = useParams();
  const [issue, setIssue] = useState(null);
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [mode, setMode] = useState('browse'); // browse | pdf
  const [annotation, setAnnotation] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.Issue.filter({ slug: issueSlug }, 'number', 50),
      base44.entities.Story.filter({ issue_slug: issueSlug }, 'page_number', 200),
      base44.entities.Illustration.filter({ issue_slug: issueSlug }, 'page_number', 200),
    ]).then(([iss, st, il]) => {
      setIssue(iss[0] || null);
      setStories(st);
      setIllus(il);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [issueSlug]);

  const pageCount = issue?.page_count || 1;
  const pageImages = issue?.page_images || [];
  const num = issue ? String(issue.number).padStart(2,'0') : '—';

  // Annotations for the current page
  const pageStory = useMemo(() => stories.find((s) => s.page_number === page), [stories, page]);
  const pageIllus = useMemo(() => illus.filter((i) => i.page_number === page), [illus, page]);

  const annotations = useMemo(() => {
    const a = [];
    if (pageStory) {
      a.push({ x: 70, y: 22, label: 'WHO WROTE THIS?', kind: 'author', data: pageStory });
      a.push({ x: 22, y: 70, label: 'WHY DID WE PUBLISH THIS?', kind: 'editor', data: pageStory });
      if (pageStory.inspiration) a.push({ x: 80, y: 60, label: 'INSPIRED BY…', kind: 'inspiration', data: pageStory });
    }
    pageIllus.forEach((il) => a.push({ x: 35, y: 40, label: 'ILLUSTRATION BY…', kind: 'illustration', data: il }));
    return a;
  }, [pageStory, pageIllus]);

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the issue…</div>;
  if (!issue) return <div className="pt-32 px-6 font-hand text-2xl">That issue isn't in the archive.</div>;

  return (
    <div className="pt-14 sm:pt-16">
      {/* header */}
      <section className="bg-archive-bg text-archive-fg grain pt-14 pb-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <Link to="/archive" className="label-mono text-dusty-yellow hover:text-paper">← BACK TO SHELF</Link>
          <div className="grid md:grid-cols-[auto_1fr] gap-8 mt-6 items-start">
            <div className="relative w-44 md:w-56">
              <Tape className="absolute -top-3 left-6 z-10" />
              <ScanImage src={issue.cover_image} alt={issue.title} objectNumber={`ISSUE ${num}`} className="aspect-[3/4] w-full shadow-2xl" />
            </div>
            <div>
              <p className="label-mono text-dusty-yellow">ISSUE {num} · {formatDate(issue.publication_date)}</p>
              <h1 className="font-heading text-5xl md:text-7xl mt-2">{issue.title}</h1>
              <p className="label-mono text-archive-fg/70 mt-3">THEME · {issue.theme} · {issue.page_count} PAGES</p>
              <p className="font-body text-lg text-archive-fg/80 mt-4 max-w-xl leading-relaxed">{issue.description}</p>
              {issue.editorial_note && (
                <p className="font-hand text-xl text-dusty-yellow mt-4 max-w-xl">“{issue.editorial_note}”</p>
              )}
              <div className="flex flex-wrap gap-2 mt-5">
                <ModeBtn active={mode==='browse'} onClick={()=>setMode('browse')} icon={<BookOpen size={13}/>} label="BROWSE THE ISSUE" />
                <ModeBtn active={mode==='pdf'} onClick={()=>setMode('pdf')} icon={<FileText size={13}/>} label="VIEW ORIGINAL PDF" />
                {issue.allow_download && issue.pdf_url && (
                  <a href={issue.pdf_url} download className="label-mono border border-archive-line px-3 py-2 hover:bg-archive-bg2 focus-ring inline-flex items-center gap-1.5"><Download size={13}/> DOWNLOAD PDF</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE MODE */}
      {mode === 'browse' && (
        <section className="bg-paper py-12 grain-light">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="flex items-center justify-between mb-6">
              <p className="label-mono text-burgundy">ISSUE {num} · PAGE {page} / {pageCount}</p>
              <button onClick={()=>setContentsOpen(true)} className="label-mono text-ink hover:text-burgundy focus-ring underline underline-offset-4">CONTENTS</button>
            </div>

            {/* page stage */}
            <div className="relative mx-auto max-w-2xl">
              <div className="relative aspect-[3/4] bg-white shadow-2xl">
                <ScanImage src={pageImages[page-1]} alt={`Issue ${num} page ${page}`} objectNumber={`PAGE ${page}`} className="w-full h-full" fittingType="fit" />
                {/* annotations */}
                {annotations.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => setAnnotation(a)}
                    className="absolute focus-ring group"
                    style={{ left: `${a.x}%`, top: `${a.y}%` }}
                    aria-label={a.label}
                  >
                    <span className="block w-5 h-5 rounded-full border-2 border-burgundy bg-paper/80 group-hover:bg-burgundy group-hover:scale-125 transition-all shadow" />
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap font-hand text-sm text-burgundy bg-paper px-1.5 border border-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity">{a.label}</span>
                  </button>
                ))}
                {/* page metadata corner */}
                <span className="absolute bottom-2 right-3 label-mono text-ink-soft/50 text-[0.55rem]">{num} · p.{page}</span>
              </div>

              {/* nav arrows */}
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} aria-label="Previous page" className="absolute -left-4 sm:-left-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-paper border border-ink/20 shadow flex items-center justify-center hover:bg-burgundy hover:text-paper disabled:opacity-30 focus-ring"><ChevronLeft size={20}/></button>
              <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page>=pageCount} aria-label="Next page" className="absolute -right-4 sm:-right-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-paper border border-ink/20 shadow flex items-center justify-center hover:bg-burgundy hover:text-paper disabled:opacity-30 focus-ring"><ChevronRight size={20}/></button>
            </div>

            {/* film strip */}
            <div className="mt-10">
              <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={()=>setPage(p)} aria-label={`Go to page ${p}`} className={`shrink-0 w-14 aspect-[3/4] border ${p===page?'border-burgundy' : 'border-ink/15'} scan-placeholder text-center flex items-center justify-center focus-ring`}>
                    <span className="label-mono text-[0.6rem] text-ink-soft">{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* contents list */}
            <div className="mt-12">
              <p className="label-mono text-burgundy mb-4">TABLE OF CONTENTS</p>
              <ol className="divide-y divide-ink/10 border-y border-ink/10">
                {stories.map((s) => (
                  <li key={s.id} className="py-3 flex items-baseline justify-between gap-4">
                    <Link to={`/archive/issue-${num}/story/${s.slug}`} className="font-heading text-xl hover:text-burgundy focus-ring">
                      {s.title}
                    </Link>
                    <span className="label-mono text-ink-soft/60 text-right shrink-0">{s.author_name} · {s.category} · p.{s.page_number}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* contributors + illustrations */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div>
                <p className="label-mono text-burgundy mb-3">CONTRIBUTORS</p>
                <ul className="space-y-1.5">
                  {(issue.contributor_names||[]).map((n) => (
                    <li key={n}><Link to={`/people/${encodeURIComponent(n)}`} className="font-body text-lg hover:text-burgundy focus-ring">{n}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label-mono text-burgundy mb-3">ILLUSTRATIONS</p>
                <div className="grid grid-cols-3 gap-3">
                  {illus.map((il) => (
                    <Link key={il.id} to={`/people/${encodeURIComponent(il.illustrator_name)}`} className="block focus-ring">
                      <ScanImage src={il.image} alt={il.title} objectNumber={`p.${il.page_number}`} className="aspect-square w-full border border-ink/15" />
                      <p className="font-hand text-sm mt-1">{il.title}</p>
                    </Link>
                  ))}
                  {illus.length === 0 && <p className="font-body text-ink-soft text-sm">None catalogued yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PDF MODE */}
      {mode === 'pdf' && (
        <section className="bg-archive-bg-2 py-12">
          <div className="mx-auto max-w-[1100px] px-6">
            {issue.pdf_url ? (
              <iframe title="Original PDF" src={issue.pdf_url} className="w-full h-[80vh] bg-paper" />
            ) : (
              <div className="bg-paper p-10 text-center border border-ink/15">
                <FileText size={40} className="mx-auto text-burgundy" />
                <p className="font-heading text-2xl mt-4">The original PDF hasn't been uploaded yet.</p>
                <p className="label-mono text-ink-soft mt-2">Upload a PDF to the issue in the CMS to show it here.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contents drawer */}
      {contentsOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={()=>setContentsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-paper shadow-2xl overflow-y-auto animate-fade-in p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="label-mono text-burgundy">CONTENTS · ISSUE {num}</p>
              <button onClick={()=>setContentsOpen(false)} aria-label="Close contents" className="focus-ring p-1"><X size={20}/></button>
            </div>
            <ol className="space-y-4">
              {stories.map((s) => (
                <li key={s.id}>
                  <Link to={`/archive/issue-${num}/story/${s.slug}`} className="block group">
                    <p className="font-heading text-xl group-hover:text-burgundy">{s.title}</p>
                    <p className="label-mono text-ink-soft/60">{s.author_name} · {s.category} · p.{s.page_number}</p>
                  </Link>
                </li>
              ))}
              {stories.length === 0 && <p className="font-hand text-lg text-ink-soft">No stories linked to this issue yet.</p>}
            </ol>
          </div>
        </div>
      )}

      {/* Annotation popup */}
      {annotation && <AnnotationPopup note={annotation} issueNum={num} onClose={()=>setAnnotation(null)} />}
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`label-mono px-3 py-2 inline-flex items-center gap-1.5 focus-ring ${active ? 'bg-burgundy text-paper' : 'border border-archive-line text-archive-fg hover:bg-archive-bg2'}`}>
      {icon} {label}
    </button>
  );
}

function AnnotationPopup({ note, issueNum, onClose }) {
  const d = note.data;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-paper border border-ink/20 shadow-2xl p-6 animate-rise-in" style={{ transform: 'rotate(-0.8deg)' }}>
        <div className="flex items-start justify-between">
          <span className="label-mono text-burgundy">{note.label}</span>
          <button onClick={onClose} aria-label="Close note" className="focus-ring p-1"><X size={18}/></button>
        </div>
        {note.kind === 'author' && (
          <div className="mt-4">
            <p className="font-heading text-2xl">{d.author_name}</p>
            <p className="label-mono text-ink-soft">{d.category} · {d.rubrica}</p>
            {d.editorial_note && <p className="font-body text-ink-soft mt-3 italic">“{d.editorial_note}”</p>}
            <div className="mt-4 flex gap-3">
              <Link to={`/people/${encodeURIComponent(d.author_name)}`} onClick={onClose} className="label-mono text-cyanotype hover:text-burgundy focus-ring">MEET THE CONTRIBUTOR →</Link>
              <Link to={`/archive/issue-${issueNum}/story/${d.slug}`} onClick={onClose} className="label-mono text-cyanotype hover:text-burgundy focus-ring">READ THE STORY →</Link>
            </div>
          </div>
        )}
        {note.kind === 'editor' && (
          <p className="font-hand text-2xl mt-4 leading-snug">{d.editorial_note || 'We publish what makes us quiet for a second.'}</p>
        )}
        {note.kind === 'inspiration' && (
          <p className="font-body text-lg mt-4 italic text-ink-soft">{d.inspiration}</p>
        )}
        {note.kind === 'illustration' && (
          <div className="mt-4">
            <ScanImage src={d.image} alt={d.title} objectNumber={`p.${d.page_number}`} className="aspect-[4/3] w-full mb-3 border border-ink/15" />
            <p className="font-heading text-xl">{d.title}</p>
            <p className="label-mono text-ink-soft">{d.illustrator_name}</p>
            {d.description && <p className="font-body text-ink-soft mt-2 text-sm">{d.description}</p>}
            <Link to={`/people/${encodeURIComponent(d.illustrator_name)}`} onClick={onClose} className="label-mono text-cyanotype hover:text-burgundy focus-ring mt-3 inline-block">MEET THE ILLUSTRATOR →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
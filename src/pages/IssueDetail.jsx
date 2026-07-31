import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';

export default function IssueDetail() {
  const { issueSlug } = useParams();
  const [issue, setIssue] = useState(null);
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spread, setSpread] = useState(1);
  const [leftMargin, setLeftMargin] = useState(null);
  const [rightMargin, setRightMargin] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLeftMargin(null);
    setRightMargin(null);
    setSpread(1);
    Promise.all([
      base44.entities.Issue.filter({ slug: issueSlug }, 'number', 50),
      base44.entities.Story.filter({ issue_slug: issueSlug }, 'page_number', 200),
      base44.entities.Illustration.filter({ issue_slug: issueSlug }, 'page_number', 200)
    ]).then(([iss, st, il]) => {
      setIssue(iss[0] || null);
      setStories(st);
      setIllus(il);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [issueSlug]);

  const pageCount = issue?.page_count || 1;
  const pageImages = issue?.page_images || [];
  const num = issue ? String(issue.number).padStart(2, '0') : '—';
  const spreadCount = Math.max(1, Math.ceil(pageCount / 2));

  // left page = first page of the spread, right page = second
  const leftPageNo = spread * 2 - 1;
  const rightPageNo = spread * 2;
  const leftStory = stories.find((s) => s.page_number === leftPageNo);
  const rightStory = stories.find((s) => s.page_number === rightPageNo);
  const leftIllus = illus.filter((i) => i.page_number === leftPageNo);
  const rightIllus = illus.filter((i) => i.page_number === rightPageNo);

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the issue…</div>;
  if (!issue) return <div className="pt-32 px-6 font-hand text-2xl">That issue isn't in the archive.</div>;

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-archive-bg text-archive-fg grain">
      {/* header */}
      <header className="pt-12 pb-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Link to="/archive" className="label-mono text-dusty-yellow hover:text-paper">← BACK TO THE FOLDERS</Link>
          <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="label-mono text-dusty-yellow">ISSUE {num} · {formatDate(issue.publication_date)}</p>
              <h1 className="font-heading text-4xl md:text-6xl mt-2">{issue.title}</h1>
              <p className="label-mono text-archive-fg/60 mt-2">THEME · {issue.theme} · {issue.page_count} PAGES</p>
            </div>
            {issue.allow_download && issue.pdf_url && (
              <a href={issue.pdf_url} download className="label-mono border border-archive-line px-3 py-2 hover:bg-archive-bg2 focus-ring inline-flex items-center gap-1.5">
                <Download size={13} /> DOWNLOAD PDF
              </a>
            )}
          </div>
        </div>
      </header>

      {/* the reader — open magazine spread flanked by annotation margins */}
      <section className="pb-16">
        <div className="mx-auto max-w-[1400px] px-4 md:px-10">
          <div className="grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-6 items-center">
            <MarginPanel side="left" annotation={leftMargin} />

            {/* book spread */}
            <div className="relative mx-auto" style={{ perspective: 2200 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={spread}
                  initial={{ rotateY: -16, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 16, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex shadow-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Page
                    side="left"
                    pageNo={leftPageNo}
                    image={pageImages[leftPageNo - 1]}
                    story={leftStory}
                    illus={leftIllus}
                    onAnnotate={setLeftMargin}
                  />
                  <div className="w-px bg-ink/30" style={{ boxShadow: '0 0 14px rgba(0,0,0,0.35)' }} />
                  <Page
                    side="right"
                    pageNo={rightPageNo}
                    image={pageImages[rightPageNo - 1]}
                    story={rightStory}
                    illus={rightIllus}
                    onAnnotate={setRightMargin}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <MarginPanel side="right" annotation={rightMargin} />
          </div>

          {/* page navigation */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => { setLeftMargin(null); setRightMargin(null); setSpread((p) => Math.max(1, p - 1)); }}
              disabled={spread <= 1}
              aria-label="Previous spread"
              className="w-11 h-11 bg-archive-bg2 border border-archive-line flex items-center justify-center hover:bg-burgundy hover:text-paper disabled:opacity-30 focus-ring"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="label-mono text-archive-muted">SPREAD {spread} / {spreadCount}</p>
            <button
              onClick={() => { setLeftMargin(null); setRightMargin(null); setSpread((p) => Math.min(spreadCount, p + 1)); }}
              disabled={spread >= spreadCount}
              aria-label="Next spread"
              className="w-11 h-11 bg-archive-bg2 border border-archive-line flex items-center justify-center hover:bg-burgundy hover:text-paper disabled:opacity-30 focus-ring"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="mt-4 text-center font-hand text-lg text-archive-fg/40">the interactive magazine reader — content will be filed in soon</p>
        </div>
      </section>
    </div>
  );
}

function Page({ side, pageNo, image, story, illus, onAnnotate }) {
  return (
    <div
      className={`relative w-[42vw] max-w-[400px] aspect-[3/4] bg-white`}
      style={{
        boxShadow: side === 'left' ? 'inset -12px 0 22px -12px rgba(0,0,0,0.3)' : 'inset 12px 0 22px -12px rgba(0,0,0,0.3)'
      }}
    >
      {image ? (
        <ScanImage src={image} alt={`page ${pageNo}`} className="w-full h-full" fittingType="fit" />
      ) : (
        <div className="w-full h-full scan-placeholder flex items-center justify-center">
          <span className="label-mono text-ink-soft/60">PAGE {pageNo}</span>
        </div>
      )}

      {/* interactive hotspots — wired to real data, ready for more */}
      {story && (
        <Hotspot
          x={68}
          y={28}
          label="THE TEXT"
          onClick={() => onAnnotate({ label: 'THE TEXT', title: story.title, meta: `written by ${story.author_name}`, text: story.excerpt || story.editorial_note || '' })}
        />
      )}
      {illus.map((il, i) => (
        <Hotspot
          key={il.id}
          x={28 + i * 12}
          y={62}
          label="THE IMAGE"
          onClick={() => onAnnotate({ label: 'THE IMAGE', title: il.title, meta: `by ${il.illustrator_name}`, text: il.description || '' })}
        />
      ))}

      <span className="absolute bottom-2 right-3 label-mono text-ink-soft/40 text-[0.55rem]">p.{pageNo}</span>

      {/* animated page-turn corner curl */}
      <span className={`page-curl ${side === 'left' ? 'left' : ''}`} aria-hidden="true" />
    </div>
  );
}

function Hotspot({ x, y, label, onClick }) {
  return (
    <button onClick={onClick} className="absolute focus-ring group" style={{ left: `${x}%`, top: `${y}%` }} aria-label={label}>
      <span className="block w-5 h-5 rounded-full border-2 border-burgundy bg-paper/70 group-hover:bg-burgundy group-hover:scale-125 transition-all shadow" />
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap font-hand text-sm text-burgundy bg-paper px-1.5 border border-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </button>
  );
}

function MarginPanel({ side, annotation }) {
  return (
    <aside className={`hidden md:block ${side === 'left' ? 'text-right' : 'text-left'}`}>
      <p className="label-mono text-dusty-yellow mb-3">{side === 'left' ? 'LEFT MARGIN' : 'RIGHT MARGIN'}</p>
      {annotation ? (
        <div className="bg-archive-bg2 border border-archive-line p-5 animate-fade-in">
          <p className="label-mono text-burgundy">{annotation.label}</p>
          {annotation.title && <p className="font-heading text-xl mt-2">{annotation.title}</p>}
          {annotation.meta && <p className="label-mono text-archive-muted mt-1">{annotation.meta}</p>}
          {annotation.text && <p className="font-body text-archive-fg/80 mt-3 leading-relaxed">{annotation.text}</p>}
        </div>
      ) : (
        <p className="font-hand text-lg text-archive-fg/40 leading-snug">
          {side === 'left'
            ? 'click an element in the magazine — its story appears here'
            : 'contextual notes for the right page will appear here'}
        </p>
      )}
    </aside>
  );
}
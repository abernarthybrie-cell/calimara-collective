import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [turn, setTurn] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLeftMargin(null);
    setRightMargin(null);
    setSpread(1);
    setTurn(null);
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

  const pageContent = (pageNo) => ({ pageNo, image: pageImages[pageNo - 1] });

  const goNext = () => {
    if (spread >= spreadCount || turn) return;
    const target = spread + 1;
    setTurn({ dir: 1, target, side: 'right', front: pageContent(rightPageNo), back: pageContent(target * 2 - 1) });
  };
  const goPrev = () => {
    if (spread <= 1 || turn) return;
    const target = spread - 1;
    setTurn({ dir: -1, target, side: 'left', front: pageContent(leftPageNo), back: pageContent(target * 2) });
  };
  const onTurnDone = () => {
    setSpread(turn.target);
    setLeftMargin(null);
    setRightMargin(null);
    setTurn(null);
  };

  const turning = !!turn;
  const dispLeftNo = turning ? (turn.dir === 1 ? leftPageNo : turn.target * 2 - 1) : leftPageNo;
  const dispRightNo = turning ? (turn.dir === 1 ? turn.target * 2 : rightPageNo) : rightPageNo;

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the issue…</div>;
  if (!issue) return <div className="pt-32 px-6 font-hand text-2xl">That issue isn't in the archive.</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mx-auto max-w-[1100px] w-full px-4 md:px-10 pt-6 pb-3 flex items-center justify-between gap-4 flex-wrap">
        <Link to="/archive" className="label-mono text-ink-soft hover:text-ink">← BACK TO THE FOLDERS</Link>
        <p className="label-mono text-ink-soft">ISSUE {num} · {issue.title}</p>
      </div>
      <div className="flex-1 mx-auto max-w-[1100px] w-full px-4 md:px-10 pb-10">
        <div className="relative w-full h-full min-h-[70vh] shadow-2xl overflow-hidden">
          <iframe
            src="https://heyzine.com/flip-book/7cdee8cce9.html"
            title={`${issue.title} — flipbook`}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allow="autoplay; fullscreen; clipboard-write"
            allowFullScreen
          />
        </div>
      </div>
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
    </div>
  );
}

function PageFace({ pageNo, image }) {
  return (
    <div className="relative w-full h-full bg-white">
      {image ? (
        <ScanImage src={image} alt={`page ${pageNo}`} className="w-full h-full" fittingType="fit" />
      ) : (
        <div className="w-full h-full scan-placeholder flex items-center justify-center">
          <span className="label-mono text-ink-soft/60">PAGE {pageNo}</span>
        </div>
      )}
      <span className="absolute bottom-2 right-3 label-mono text-ink-soft/40 text-[0.55rem]">p.{pageNo}</span>
    </div>
  );
}

function TurningPage({ turn, onDone }) {
  const { dir, side, front, back } = turn;
  const origin = side === 'right' ? '0% 50%' : '100% 50%';
  const posClass = side === 'right' ? 'left-1/2' : 'left-0';
  const spineSide = side === 'right' ? 'left' : 'right';
  const backSpineSide = side === 'right' ? 'right' : 'left';
  const curlEase = [0.45, 0, 0.25, 1];
  return (
    <div
      className={`absolute top-0 ${posClass} w-[42vw] max-w-[400px] aspect-[3/4] z-30`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d', transformOrigin: origin }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: dir === 1 ? -180 : 180 }}
        transition={{ duration: 0.9, ease: curlEase }}
        onAnimationComplete={onDone}
      >
        {/* front face — the page being turned */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <PageFace pageNo={front.pageNo} image={front.image} />
          {/* curl shadow — darkens toward the spine as the page lifts, peaks mid-turn */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to ${spineSide}, rgba(0,0,0,0) 28%, rgba(0,0,0,0.6) 100%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.9, ease: curlEase }}
          />
          {/* specular sheen along the curl ridge */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to ${spineSide}, rgba(255,250,238,0.55) 0%, transparent 16%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            transition={{ duration: 0.9, ease: curlEase }}
          />
        </div>
        {/* back face — revealed as the page curls over */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <PageFace pageNo={back.pageNo} image={back.image} />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to ${backSpineSide}, rgba(0,0,0,0) 40%, rgba(0,0,0,0.42) 100%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.65] }}
            transition={{ duration: 0.9, ease: curlEase }}
          />
        </div>
      </motion.div>
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
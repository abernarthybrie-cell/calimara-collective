import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatMonthYear } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';
import PageZoom from '@/components/PageZoom';
import SpreadThumbnails from '@/components/SpreadThumbnails';
import TurningPage from '@/components/flipbook/TurningPage';
import PageBookmarkButton from '@/components/PageBookmarkButton';
import SavedPageBookmark from '@/components/SavedPageBookmark';

export default function IssueDetail() {
  const { issueSlug } = useParams();
  const [issue, setIssue] = useState(null);
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spread, setSpread] = useState(1);
  const [mobilePage, setMobilePage] = useState(1);
  const [singlePage, setSinglePage] = useState(false);
  const [leftMargin, setLeftMargin] = useState(null);
  const [rightMargin, setRightMargin] = useState(null);
  const [turn, setTurn] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [bookmarkedPage, setBookmarkedPage] = useState(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setSinglePage(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(`calimara:issue-bookmark:${issueSlug}`));
    setBookmarkedPage(saved > 0 ? saved : null);
  }, [issueSlug]);

  useEffect(() => {
    setLoading(true);
    setLeftMargin(null);
    setRightMargin(null);
    setSpread(1);
    setMobilePage(1);
    setTurn(null);
    Promise.all([
    base44.entities.Issue.filter({ slug: issueSlug }, 'number', 50),
    base44.entities.Story.filter({ issue_slug: issueSlug }, 'page_number', 200),
    base44.entities.Illustration.filter({ issue_slug: issueSlug }, 'page_number', 200)]
    ).then(([iss, st, il]) => {
      setIssue(iss[0] || null);
      setStories(st);
      setIllus(il);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [issueSlug]);

  const pageCount = issue?.page_count || 1;
  const pageImages = issue?.page_images || [];
  const num = issue ? String(issue.number).padStart(2, '0') : '—';
  // spread 1 is the cover alone (right page only); spreads 2+ are two-page spreads
  const pagesForSpread = (s) => s === 1 ? { left: null, right: 1 } : { left: (s - 1) * 2, right: (s - 1) * 2 + 1 };
  const spreadCount = 1 + Math.max(0, Math.ceil((pageCount - 1) / 2));

  const cap = (n) => n && n <= pageCount ? n : null;
  const { left: rawLeft, right: rawRight } = pagesForSpread(spread);
  const leftPageNo = cap(rawLeft);
  const rightPageNo = cap(rawRight);

  const pageContent = (pageNo) => ({ pageNo, image: pageNo ? pageImages[pageNo - 1] : null });

  const goNext = () => {
    if (turn || (singlePage ? mobilePage >= pageCount : spread >= spreadCount)) return;
    if (singlePage) {
      const target = mobilePage + 1;
      setTurn({ dir: 1, target, side: 'right', front: pageContent(mobilePage), back: pageContent(target), singlePage: true });
      return;
    }
    const target = spread + 1;
    const cur = pagesForSpread(spread);
    const nxt = pagesForSpread(target);
    setTurn({ dir: 1, target, side: 'right', front: pageContent(cur.right), back: pageContent(nxt.left) });
  };
  const goPrev = () => {
    if (turn || (singlePage ? mobilePage <= 1 : spread <= 1)) return;
    if (singlePage) {
      const target = mobilePage - 1;
      setTurn({ dir: -1, target, side: 'left', front: pageContent(mobilePage), back: pageContent(target), singlePage: true });
      return;
    }
    const target = spread - 1;
    const cur = pagesForSpread(spread);
    const prv = pagesForSpread(target);
    setTurn({ dir: -1, target, side: 'left', front: pageContent(cur.left), back: pageContent(prv.right) });
  };
  const onTurnDone = () => {
    if (turn.singlePage) setMobilePage(turn.target);else
    setSpread(turn.target);
    setLeftMargin(null);
    setRightMargin(null);
    setTurn(null);
  };
  const openZoom = (pageNo, image) => setZoom({ pageNo, image, title: issue?.title });
  const saveBookmark = (pageNo) => {
    window.localStorage.setItem(`calimara:issue-bookmark:${issueSlug}`, String(pageNo));
    setBookmarkedPage(pageNo);
  };
  const clearBookmark = () => {
    window.localStorage.removeItem(`calimara:issue-bookmark:${issueSlug}`);
    setBookmarkedPage(null);
  };
  const jumpToBookmark = () => {
    if (!bookmarkedPage || bookmarkedPage > pageCount) return;
    setTurn(null);
    setLeftMargin(null);
    setRightMargin(null);
    if (singlePage) setMobilePage(bookmarkedPage);else
    setSpread(bookmarkedPage === 1 ? 1 : Math.floor(bookmarkedPage / 2) + 1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (zoom) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') goNext();else
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spread, spreadCount, mobilePage, pageCount, singlePage, turn, zoom]);

  const turning = !!turn;
  const curPages = pagesForSpread(spread);
  const turnPages = turning ? pagesForSpread(turn.target) : null;
  const dispLeftNo = cap(turning ? turn.dir === 1 ? curPages.left : turnPages.left : curPages.left);
  const dispRightNo = cap(turning ? turn.dir === 1 ? turnPages.right : curPages.right : curPages.right);
  const dispMobileNo = cap(turning ? turn.target : mobilePage);

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the issue…</div>;
  if (!issue) return <div className="pt-32 px-6 font-hand text-2xl">That issue isn't in the archive.</div>;

  return (
    <div className="pt-14 sm:pt-16 min-h-screen text-archive-fg grain bg-[hsl(var(--archive-bg))]">
      {/* header */}
      <header className="pt-12 pb-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Link to="/archive" className="label-mono text-dusty-yellow hover:text-paper">← BACK TO THE FOLDERS</Link>
          <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="label-mono text-dusty-yellow">ISSUE {num} · {formatMonthYear(issue.publication_date)}</p>
              <h1 className="font-heading text-4xl md:text-6xl mt-2">{issue.title}</h1>
              <p className="label-mono text-archive-fg/60 mt-2">THEME · {issue.theme} · {issue.page_count} PAGES</p>
            </div>
            {issue.allow_download && issue.pdf_url &&
            <a href={issue.pdf_url} download className="label-mono border border-archive-line px-3 py-2 hover:bg-archive-bg2 focus-ring inline-flex items-center gap-1.5">
                <Download size={13} /> DOWNLOAD PDF
              </a>
            }
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
              <div className="relative flex shadow-2xl" style={{ transformStyle: 'preserve-3d' }}>
                {singlePage ?
                <Page
                  side="right" pageNo={dispMobileNo} image={dispMobileNo ? pageImages[dispMobileNo - 1] : null}
                  story={stories.find((s) => s.page_number === dispMobileNo)} illus={illus.filter((i) => i.page_number === dispMobileNo)}
                  onAnnotate={setRightMargin} onZoom={openZoom}
                  bookmarkedPage={bookmarkedPage} onBookmark={saveBookmark}
                  onTurn={(e) => {
                    const bounds = e.currentTarget.getBoundingClientRect();
                    e.clientX - bounds.left < bounds.width * 0.35 ? goPrev() : goNext();
                  }} /> :


                <>
                    {dispLeftNo === null ? <div className="w-[46vw] max-w-[540px] aspect-[210/297]" aria-hidden="true" /> :
                  <Page side="left" pageNo={dispLeftNo} image={pageImages[dispLeftNo - 1]}
                  story={stories.find((s) => s.page_number === dispLeftNo)} illus={illus.filter((i) => i.page_number === dispLeftNo)}
                  onAnnotate={setLeftMargin} onZoom={openZoom} onTurn={goPrev}
                  bookmarkedPage={bookmarkedPage} onBookmark={saveBookmark} />
                  }
                    <div className="w-px bg-ink/30" style={{ boxShadow: '0 0 14px rgba(0,0,0,0.35)' }} />
                    <Page side="right" pageNo={dispRightNo} image={dispRightNo ? pageImages[dispRightNo - 1] : null}
                  story={stories.find((s) => s.page_number === dispRightNo)} illus={illus.filter((i) => i.page_number === dispRightNo)}
                  onAnnotate={setRightMargin} onZoom={openZoom} onTurn={goNext}
                  bookmarkedPage={bookmarkedPage} onBookmark={saveBookmark} />
                  </>
                }
              </div>
              {turn && <TurningPage turn={turn} onDone={onTurnDone} singlePage={singlePage} />}
            </div>

            <MarginPanel side="right" annotation={rightMargin} />
          </div>

          {/* page navigation */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={goPrev}
              disabled={(singlePage ? mobilePage <= 1 : spread <= 1) || !!turn}
              aria-label="Previous spread"
              className="w-11 h-11 bg-archive-bg2 border border-archive-line flex items-center justify-center hover:bg-burgundy hover:text-paper disabled:opacity-30 focus-ring">
              
              <ChevronLeft size={20} />
            </button>
            <p className="label-mono text-archive-muted">{singlePage ? `PAGE ${mobilePage} / ${pageCount}` : `SPREAD ${spread} / ${spreadCount}`}</p>
            <button
              onClick={goNext}
              disabled={(singlePage ? mobilePage >= pageCount : spread >= spreadCount) || !!turn}
              aria-label="Next spread"
              className="w-11 h-11 bg-archive-bg2 border border-archive-line flex items-center justify-center hover:bg-burgundy hover:text-paper disabled:opacity-30 focus-ring">
              
              <ChevronRight size={20} />
            </button>
          </div>
          <SavedPageBookmark pageNo={bookmarkedPage} onReturn={jumpToBookmark} onClear={clearBookmark} />
          <p className="mt-4 text-center font-hand text-lg text-archive-fg/40">the interactive magazine reader — content will be filed in soon</p>

          <SpreadThumbnails
            pageImages={pageImages}
            pageCount={pageCount}
            currentSpread={spread}
            currentPage={mobilePage}
            singlePage={singlePage}
            onJump={(target) => {singlePage ? setMobilePage(target) : setSpread(target);setLeftMargin(null);setRightMargin(null);}} />
          
        </div>
      </section>

      {zoom &&
      <PageZoom
        pageNo={zoom.pageNo}
        image={zoom.image}
        title={zoom.title}
        onClose={() => setZoom(null)} />

      }
    </div>);

}

function Page({ side, pageNo, image, story, illus, onAnnotate, onZoom, onTurn, bookmarkedPage, onBookmark }) {
  const blank = pageNo === null;
  return (
    <div
      className={`relative w-[88vw] md:w-[46vw] max-w-[540px] aspect-[210/297] ${blank ? 'bg-archive-bg2' : 'bg-white'} ${blank ? '' : 'cursor-pointer'}`}
      style={{
        boxShadow: blank ? 'none' : side === 'left' ? 'inset -12px 0 22px -12px rgba(0,0,0,0.3)' : 'inset 12px 0 22px -12px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => !blank && onTurn?.(e)}
      onDoubleClick={() => !blank && image && onZoom(pageNo, image)}>
      
      {blank ? null : image ?
      <ScanImage src={image} alt={`page ${pageNo}`} className="w-full h-full align-top" fittingType="fill" /> :

      <div className="w-full h-full scan-placeholder flex items-center justify-center">
          <span className="label-mono text-ink-soft/60">PAGE {pageNo}</span>
        </div>
      }

      {!blank && <PageBookmarkButton pageNo={pageNo} active={bookmarkedPage === pageNo} onSave={onBookmark} />}

      {/* interactive hotspots — wired to real data, ready for more */}
      {!blank && story &&
      <Hotspot
        x={68}
        y={28}
        label="THE TEXT"
        onClick={() => onAnnotate({ label: 'THE TEXT', title: story.title, meta: `written by ${story.author_name}`, text: story.excerpt || story.editorial_note || '' })} />

      }
      {!blank && illus.map((il, i) =>
      <Hotspot
        key={il.id}
        x={28 + i * 12}
        y={62}
        label="THE IMAGE"
        onClick={() => onAnnotate({ label: 'THE IMAGE', title: il.title, meta: `by ${il.illustrator_name}`, text: il.description || '' })} />

      )}

      {!blank && <span className="absolute bottom-2 right-3 label-mono text-ink-soft/40 text-[0.55rem]">p.{pageNo}</span>}
    </div>);

}

function Hotspot({ x, y, label, onClick }) {
  return (
    <button onClick={(e) => {e.stopPropagation();onClick();}} className="absolute focus-ring group" style={{ left: `${x}%`, top: `${y}%` }} aria-label={label}>
      <span className="block w-5 h-5 rounded-full border-2 border-burgundy bg-paper/70 group-hover:bg-burgundy group-hover:scale-125 transition-all shadow" />
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap font-hand text-sm text-burgundy bg-paper px-1.5 border border-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </button>);

}

function MarginPanel({ side, annotation }) {
  return (
    <aside className={`hidden md:block ${side === 'left' ? 'text-right' : 'text-left'}`}>
      <p className="label-mono text-dusty-yellow mb-3">{side === 'left' ? 'LEFT MARGIN' : 'RIGHT MARGIN'}</p>
      {annotation ?
      <div className="bg-archive-bg2 border border-archive-line p-5 animate-fade-in">
          <p className="label-mono text-burgundy">{annotation.label}</p>
          {annotation.title && <p className="font-heading text-xl mt-2">{annotation.title}</p>}
          {annotation.meta && <p className="label-mono text-archive-muted mt-1">{annotation.meta}</p>}
          {annotation.text && <p className="font-body text-archive-fg/80 mt-3 leading-relaxed">{annotation.text}</p>}
        </div> :

      <p className="font-hand text-lg text-archive-fg/40 leading-snug">
          {side === 'left' ?
        'click an element in the magazine — its story appears here' :
        'contextual notes for the right page will appear here'}
        </p>
      }
    </aside>);

}
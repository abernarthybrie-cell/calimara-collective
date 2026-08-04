import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';
import Stamp from '@/components/Stamp';
import ReadingProgress from '@/components/ReadingProgress';
import PageZoom from '@/components/PageZoom';
import StoryPageStack from '@/components/StoryPageStack';

export default function StoryDetail() {
  const { issueSlug, slug } = useParams();
  const [story, setStory] = useState(null);
  const [issue, setIssue] = useState(null);
  const [related, setRelated] = useState([]);
  const [issueStories, setIssueStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showText, setShowText] = useState(false);
  const [pageZoom, setPageZoom] = useState(false);
  const [artifactPage, setArtifactPage] = useState(0);
  const readingRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setArtifactPage(0);
    Promise.all([
    base44.entities.Story.filter({ slug }, 'page_number', 50),
    base44.entities.Issue.filter({ slug: issueSlug }, 'number', 50)]
    ).then(async ([st, iss]) => {
      const s = st[0] || null;
      setStory(s);
      setIssue(iss[0] || null);
      if (s) {
        const num = String(s.issue_number).padStart(2, '0');
        const [allStories, allIllus] = await Promise.all([
        base44.entities.Story.filter({ issue_slug: `issue-${num}` }, 'page_number', 200),
        base44.entities.Illustration.filter({ related_story_slug: slug }, 'page_number', 50)]
        );
        setIssueStories(allStories);
        setRelated(allStories.filter((x) => x.slug !== slug).slice(0, 4));
        setIllus(allIllus);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [issueSlug, slug]);

  if (loading) return <div className="pt-32 px-6 label-mono text-ink-soft">opening the page…</div>;
  if (!story) return <div className="pt-32 px-6 font-hand text-2xl">That story isn't in the archive.</div>;

  const num = String(story.issue_number).padStart(2, '0');
  // Consecutive printed pages assigned to this story, ending before the next story begins.
  const issuePages = issue && issue.page_images || [];
  const nextStory = issueStories.find((item) => Number(item.page_number) > Number(story.page_number));
  const storyEndPage = nextStory ? Number(nextStory.page_number) - 1 : issuePages.length;
  const derivedPages = story.page_number ?
  issuePages.slice(Number(story.page_number) - 1, storyEndPage).filter(Boolean) :
  [];
  const originalPages = story.artifact_pages?.length ? [...story.artifact_pages] : derivedPages;
  if (!originalPages.length && story.page_scan) originalPages.push(story.page_scan);
  const artifactStartPage = Number(story.artifact_start_page || story.page_number);
  const originalPage = originalPages[artifactPage];

  return (
    <div className="story-paper-texture grain grain-light min-h-screen pt-14 sm:pt-16">
      <article className="py-14">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <Link to="/contents" className="label-mono text-burgundy hover:text-ink focus-ring inline-flex items-center gap-1"><ArrowLeft size={14} /> BACK TO CONTENTS</Link>

          <div className="mt-8 grid md:grid-cols-[1fr_20rem] gap-12">
            {/* main reading column */}
            <div ref={readingRef}>
              <p className="label-mono text-burgundy">{story.category || story.rubrica || 'UNCATALOGUED'}{story.category && story.rubrica ? ` · ${story.rubrica}` : ''} · p.{story.page_number}</p>
              <h1 className="text-4xl md:text-6xl mt-3 leading-[1.05] font-normal [font-family:'Impact_Label_Reversed',_sans-serif]">{story.title}</h1>
              <p className={`font-heading italic text-2xl mt-2 ${story.subtitle ? 'text-ink-soft' : 'text-ink-soft/45'}`}>
                {story.subtitle || 'subtitle awaiting catalogue'}
              </p>
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <Link to={`/people/${encodeURIComponent(story.author_name)}`} className="font-body text-lg text-burgundy hover:ink-underline focus-ring">by {story.author_name}</Link>
                <span className="label-mono text-ink-soft/60">· {story.publication_date ? formatDate(story.publication_date) : 'DATE AWAITING CATALOGUE'}</span>
              </div>

              {/* description — written by the author or the editor */}
              <p className={`mt-6 font-body text-lg italic leading-relaxed max-w-prose border-l-2 pl-4 ${story.excerpt ? 'text-ink-soft border-burgundy/40' : 'text-ink-soft/45 border-ink/20'}`}>
                {story.excerpt || 'Excerpt awaiting transcription from the printed issue.'}
              </p>

              {/* read the plain text */}
              <div className="mt-8">
                <button
                  onClick={() => story.full_text && setShowText((v) => !v)}
                  disabled={!story.full_text}
                  className="label-mono border border-ink/30 px-4 py-2 hover:bg-paper-deep focus-ring inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:text-ink-soft/45 disabled:border-ink/15">
                  
                  {story.full_text ? showText ? 'HIDE THE PLAIN TEXT' : 'READ THE PLAIN TEXT' : 'PLAIN TEXT AWAITING TRANSCRIPTION'}
                </button>
                {showText && story.full_text &&
                <div className="mt-6 font-body text-xl leading-[1.75] text-ink whitespace-pre-line max-w-prose animate-fade-in">
                    {story.full_text}
                  </div>
                }
              </div>

              {/* illustrations within */}
              <div className="mt-10 grid sm:grid-cols-2 gap-4">
                {illus.length > 0 ? illus.map((il) =>
                <figure key={il.id}>
                    <ScanImage src={il.image} alt={il.title} objectNumber={`p.${il.page_number}`} className="aspect-[4/3] w-full border border-ink/15" />
                    <figcaption className="font-hand text-base mt-1">{il.title} — {il.illustrator_name}</figcaption>
                  </figure>
                ) :
                <figure>
                    <ScanImage src="" alt="Illustration awaiting scan" objectNumber={`p.${story.page_number}`} className="aspect-[4/3] w-full border border-ink/15" />
                    <figcaption className="font-hand text-base text-ink-soft/50 mt-1">illustration and credit awaiting catalogue</figcaption>
                  </figure>
                }
              </div>

              {/* supporting photos */}
              {(story.images || []).length > 0 &&
              <div className="mt-8 grid grid-cols-3 gap-3">
                  {story.images.map((im, i) => <ScanImage key={i} src={im} alt="" className="aspect-square w-full border border-ink/15" />)}
                </div>
              }
            </div>

            {/* marginalia / artifact column */}
            <aside className="space-y-8">
              <div>
                <p className="label-mono text-ink-soft/60 mb-2">ORIGINAL PAGE · ARTIFACT</p>
                {originalPages.length > 0 ?
                <StoryPageStack
                  pages={originalPages}
                  index={artifactPage}
                  onChange={setArtifactPage}
                  onZoom={() => setPageZoom(true)}
                  startPage={artifactStartPage}
                  pageNumbers={story.artifact_page_numbers} /> :


                <ScanImage src="" alt="Original page scan awaiting upload" objectNumber={`p.${story.page_number}`} className="aspect-[210/297] w-full shadow-xl border-4 border-ink/60" fittingType="fit" />
                }
                <p className="font-hand text-sm text-ink-soft mt-2">as it appears in the printed issue</p>
              </div>

              <Marginalia title="BEHIND THE PAGE" body={story.behind_the_scenes || 'Production notes awaiting the editorial archive.'} placeholder={!story.behind_the_scenes} />
              <Marginalia title="INSPIRED BY" body={story.inspiration || 'The contributor’s note of inspiration is awaiting catalogue.'} placeholder={!story.inspiration} />
              <Marginalia title="EDITORIAL NOTE" body={story.editorial_note || 'Editorial note awaiting transcription.'} hand placeholder={!story.editorial_note} />

              <div>
                <p className="label-mono text-ink-soft/60 mb-2">TAGS</p>
                <div className="flex flex-wrap gap-2">
                  {(story.tags || []).length > 0 ?
                  story.tags.map((t) => <span key={t} className="stamp text-cyanotype">{t}</span>) :
                  <span className="stamp text-ink-soft/45">AWAITING TAGS</span>}
                </div>
              </div>
            </aside>
          </div>

          {/* related */}
          {related.length > 0 &&
          <section className="mt-16 pt-10 border-t border-ink/15">
              <p className="label-mono text-burgundy mb-5">FALL IN FURTHER — RELATED WORK</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((r) =>
              <Link key={r.id} to={`/archive/issue-${String(r.issue_number).padStart(2, '0')}/story/${r.slug}`} className="group focus-ring">
                    <ScanImage src={r.cover_image || r.page_scan} alt={r.title} objectNumber={`ISSUE ${String(r.issue_number).padStart(2, '0')}`} className="aspect-[3/4] w-full border border-ink/15 group-hover:border-burgundy" />
                    <p className="font-heading text-lg mt-2 group-hover:text-burgundy">{r.title}</p>
                    <p className="label-mono text-ink-soft/60">{r.author_name}</p>
                  </Link>
              )}
              </div>
            </section>
          }
        </div>
      </article>
      <ReadingProgress targetRef={readingRef} />
      {pageZoom && originalPage &&
      <PageZoom pageNo={story.artifact_page_numbers?.[artifactPage] || artifactStartPage + artifactPage} image={originalPage} title={story.title} onClose={() => setPageZoom(false)} />
      }
    </div>);

}

function Marginalia({ title, body, hand, placeholder }) {
  return (
    <div className={`bg-paper-deep border-l-2 pl-4 py-2 ${placeholder ? 'border-ink/20' : 'border-burgundy'}`}>
      <p className={`label-mono ${placeholder ? 'text-ink-soft/55' : 'text-burgundy'}`}>{title}</p>
      <p className={`${hand ? 'font-hand text-xl' : 'font-body text-base'} ${placeholder ? 'text-ink-soft/50 italic' : 'text-ink'} mt-1 leading-snug`}>{body}</p>
    </div>);

}
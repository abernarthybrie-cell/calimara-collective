import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/lib/calimara';
import Polaroid from '@/components/Polaroid';
import Tape from '@/components/Tape';
import Stamp from '@/components/Stamp';
import ScanImage from '@/components/ScanImage';
import PhysicalObject from '@/components/PhysicalObject';
import Reveal from '@/components/Reveal';
import ObjectModal from '@/components/ObjectModal';
import FilmStrip from '@/components/FilmStrip';
import LaceTrim from '@/components/LaceTrim';
import Bow from '@/components/Bow';

export default function Home() {
  const { settings } = useSettingsSafe();
  const { openDrawer } = useOutletContext() || {};
  const [stats, setStats] = useState(null);
  const [newest, setNewest] = useState(null);
  const [people, setPeople] = useState([]);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    Promise.all([
    base44.entities.Issue.filter({ status: 'published' }, 'number', 100),
    base44.entities.Person.list(50),
    base44.entities.Story.list(200),
    base44.entities.Illustration.list(200),
    base44.entities.TimelineEvent.list(50)]
    ).then(([issues, ppl, stories, illus, events]) => {
      setStats({ issues: issues.length, people: ppl.length, stories: stories.length, illustrations: illus.length, events: events.length });
      setNewest(issues[issues.length - 1] || issues[0] || null);
      setPeople(ppl.slice(0, 4));
    }).catch(() => {});
  }, []);

  const issueLink = newest ? `/archive/issue/${newest.slug}` : '/archive';

  return (
    <div className="pt-14 sm:pt-16">
      {/* ===== HERO DESK ===== */}
      <section className="relative overflow-hidden bg-paper grain" style={{ perspective: 1000, minHeight: 'calc(100vh - 4rem)' }}>
        {/* LAYER 1 — faded background photocopy */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden>
          <div className="absolute top-[10%] left-[-5%] w-[60%] font-heading text-[40vw] leading-none text-ink select-none">Călimara</div>
        </div>

        {/* LAYER 4/5 — scattered clickable objects (desktop) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          {/* contributor polaroid */}
          <PhysicalObject to="/people" depth={0.55} rotate={-4} tilt={9} hoverLabel="MEET THE PEOPLE"
          outerClassName="pointer-events-auto" style={{ position: 'absolute', top: '12%', left: '6%', width: '11rem' }}>
            <Tape className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" />
            <Polaroid src={people[0]?.polaroid_photo} objectNumber="P-01" alt="A contributor" caption={people[0]?.name || 'a contributor'} />
          </PhysicalObject>

          {/* issue cover */}
          <PhysicalObject to={issueLink} depth={0.28} rotate={3} tilt={7} hoverLabel={newest ? `READ ISSUE ${String(newest.number).padStart(2, '0')}` : 'ARCHIVE'}
          outerClassName="pointer-events-auto" style={{ position: 'absolute', top: '8%', right: '8%', width: '15rem' }}>
            <Tape className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" />
            <ScanImage src={newest?.cover_image} alt={newest?.title} objectNumber={newest ? `ISSUE ${String(newest.number).padStart(2, '0')}` : ''} className="aspect-[3/4] w-full shadow-xl" />
          </PhysicalObject>

          {/* handwritten note — what is cǎlimara? */}
          <PhysicalObject onClick={() => setAboutOpen(true)} depth={0.7} rotate={-2} tilt={6} hoverLabel="WHAT IS THIS?"
          outerClassName="pointer-events-auto" style={{ position: 'absolute', bottom: '14%', left: '10%', width: '14rem' }}>
            <div className="bg-[#fdfaf2] p-5 shadow-lg border border-ink/10">
              <p className="font-hand text-2xl text-ink leading-snug">what is<br />Călimara?</p>
              <p className="label-mono text-[0.6rem] text-burgundy mt-2">— turn me over —</p>
            </div>
          </PhysicalObject>

          {/* film strip */}
          <PhysicalObject depth={0.15} rotate={-4} tilt={4} outerClassName="pointer-events-auto"
          style={{ position: 'absolute', top: '44%', left: '38%', width: '16rem' }}>
            <FilmStrip frames={people.slice(0, 4).map((p) => p.polaroid_photo)} label="frames 7–12 · launch night" />
          </PhysicalObject>

          {/* archive stamp block */}
          <PhysicalObject depth={0.5} rotate={2} tilt={5} outerClassName="pointer-events-auto"
          style={{ position: 'absolute', bottom: '10%', right: '9%', width: '16rem' }}>
            <Stamp className="text-burgundy">ARCHIVE · BUCHAREST</Stamp>
            <p className="font-mono-c text-xs text-ink-soft mt-3 leading-relaxed">
              FILE / 2024–∞<br />CAT. CĂLIMARA<br />SHELF A · ROW 1<br />CONDITION: LIVED-IN
            </p>
          </PhysicalObject>
        </div>

        {/* LAYER 3 — central content */}
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-20 md:py-28 text-center min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
          <p className="label-mono text-burgundy mb-5 animate-fade-in">INDEPENDENT STUDENT MAGAZINE · BUCHAREST</p>
          <h1 className="leading-[0.82] tracking-tight animate-rise-in font-normal [font-family:'HawtFriend',_sans-serif] text-[185px] md:text-[185px]">Calimara colective</h1>
          <p className="italic text-2xl md:text-3xl text-ink-soft mt-6 max-w-2xl mx-auto animate-fade-in font-normal [font-family:'Made_Of_Scars',_sans-serif]">
            {settings?.tagline || 'A magazine made by young people who have something to say.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link to="/archive" className="group bg-ink text-paper px-7 py-3.5 hover:bg-burgundy transition-colors focus-ring inline-flex items-center gap-2">
              <span className="label-mono [font-family:'Punktype',_sans-serif] font-normal">ENTER THE ARCHIVE</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={openDrawer} className="label-mono text-ink hover:text-burgundy focus-ring underline underline-offset-4">
              SHOW ME SOMETHING RANDOM →
            </button>
          </div>
          <p className="text-lg text-ink-soft/70 mt-8 font-normal [font-family:'EB_Garamond',_serif]">↓ scroll into the desk · things move</p>
        </div>
      </section>

      {/* ===== WHAT IS CĂLIMARA ===== */}
      <section className="relative py-20 md:py-28 grain-light overflow-hidden bg-[hsl(var(--paper-deep))]">
        <div className="absolute -left-10 top-10 w-72 h-72 bg-paper rotate-6 opacity-60 pointer-events-none" aria-hidden />
        <Reveal className="relative mx-auto max-w-3xl px-6">
          <p className="label-mono text-burgundy mb-4">— WHAT IS CĂLIMARA? —</p>
          <p className="font-heading text-2xl md:text-3xl leading-relaxed text-ink">
            {settings?.about_text || 'Călimara is a student-created creative magazine where literature, visual art, photography, cinema, and the strange little things that make us human meet on paper.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Stamp className="text-cyanotype">EST. {settings?.founded_year || '2024'}</Stamp>
            <button onClick={() => setAboutOpen(true)} className="label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4">read the full note →</button>
            <span className="font-mono-c text-xs text-ink-soft">{settings?.city || 'Bucharest'} · printed in small runs · stapled by hand</span>
          </div>
        </Reveal>
      </section>

      {/* ===== CURRENTLY ===== */}
      <section className="py-20 md:py-24 grain text-[hsl(var(--forest))] bg-[hsl(var(--paper-deep))]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal className="flex items-baseline justify-between mb-10">
            <h2 className="font-heading text-4xl md:text-5xl text-[hsl(var(--mauve))]">Călimara, currently</h2>
            <span className="label-mono text-archive-muted">UPDATED FROM THE DATABASE</span>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-archive-line">
            {[
            { n: stats?.issues ?? '—', l: 'ISSUES PUBLISHED' },
            { n: stats?.people ?? '—', l: 'CONTRIBUTORS' },
            { n: stats?.stories ?? '—', l: 'STORIES' },
            { n: stats?.illustrations ?? '—', l: 'ILLUSTRATIONS' },
            { n: stats?.events ?? '—', l: 'EVENTS' }].
            map((s, i) =>
            <Reveal key={s.l} delay={i * 60} className="bg-archive-bg p-6 md:p-8">
                <p className="font-heading text-5xl md:text-6xl text-[hsl(var(--archive-line))]">{s.n}</p>
                <p className="label-mono text-archive-muted mt-2">{s.l}</p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ===== NEWEST ISSUE ===== */}
      {newest &&
      <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-paper-deep -rotate-3 opacity-50 pointer-events-none" aria-hidden />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="relative" style={{ perspective: 800 }}>
                <Tape className="absolute -top-3 left-8 z-10" />
                <Bow className="absolute -bottom-4 -right-4 z-20" color="hsl(var(--faded-red))" />
                <PhysicalObject to={issueLink} depth={0.3} rotate={-2} tilt={8} hoverLabel="OPEN THIS ISSUE" className="block"
              style={{ width: '100%', maxWidth: '20rem', margin: '0 auto' }}>
                  <ScanImage src={newest.cover_image} alt={newest.title} objectNumber={`ISSUE ${String(newest.number).padStart(2, '0')}`} className="aspect-[3/4] w-full shadow-2xl" />
                </PhysicalObject>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="label-mono text-burgundy">THE LATEST · ISSUE {String(newest.number).padStart(2, '0')}</p>
              <h3 className="font-heading text-4xl md:text-5xl mt-3">{newest.title}</h3>
              <p className="label-mono text-ink-soft mt-2">THEME · {newest.theme} · {newest.page_count} PAGES</p>
              <p className="font-body text-lg text-ink-soft mt-5 leading-relaxed max-w-md">{newest.description}</p>
              <Link to={issueLink} className="inline-flex items-center gap-2 mt-6 label-mono text-burgundy hover:text-ink focus-ring">
                BROWSE THE ISSUE <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
        </section>
      }

      {/* ===== DISCOVERY DESK ===== */}
      <section className="relative bg-paper-deep py-20 md:py-28 grain-light overflow-hidden" style={{ perspective: 1000 }}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="font-hand text-3xl text-burgundy mb-2">a desk you can walk through —</p>
            <p className="label-mono text-ink-soft mb-12">PICK THINGS UP. EVERY OBJECT IS A DOOR.</p>
          </Reveal>

          {/* mobile grid / desktop scatter */}
          <LaceTrim className="mb-10 opacity-70" />
          <div className="grid grid-cols-2 gap-6 md:block md:h-[760px]">
            {/* stack of papers → Archive */}
            <PhysicalObject to="/archive" depth={0.4} rotate={-4} tilt={8} hoverLabel="ENTER THE ARCHIVE"
            outerClassName="md:absolute md:top-[2%] md:left-[3%]" className="block">
              <div className="relative w-full md:w-48">
                <div className="absolute inset-0 bg-paper shadow-md rotate-3 translate-x-2 translate-y-1" />
                <div className="absolute inset-0 bg-paper shadow-md -rotate-2" />
                <div className="relative bg-paper p-5 shadow-lg border border-ink/10">
                  <p className="label-mono text-burgundy">ISSUE 01 — ∞</p>
                  <p className="font-heading text-2xl mt-1">Archive</p>
                  <p className="font-hand text-base text-ink-soft mt-1">every issue, on a shelf</p>
                </div>
              </div>
            </PhysicalObject>

            {/* book → Shelf */}
            <PhysicalObject to="/shelf" depth={0.6} rotate={5} tilt={9} hoverLabel="WHAT ARE WE READING?"
            outerClassName="md:absolute md:top-[6%] md:left-[34%]" className="block">
              <div className="w-full md:w-44 bg-ink text-paper p-5 shadow-xl flex flex-col" style={{ aspectRatio: '3/4' }}>
                <p className="label-mono text-dusty-yellow">CĂLIMARA</p>
                <p className="font-heading text-3xl mt-6 leading-tight">Recommends</p>
                <p className="font-hand text-lg text-paper/70 mt-auto">books · films · albums</p>
              </div>
            </PhysicalObject>

            {/* postcard → Q&A */}
            <PhysicalObject to="/qa" depth={0.3} rotate={-3} tilt={7} hoverLabel="WRITE TO US"
            outerClassName="md:absolute md:top-[2%] md:right-[5%]" className="block">
              <div className="w-full md:w-56 bg-[#fdfaf2] p-5 shadow-lg border border-ink/10">
                <div className="flex justify-between items-start">
                  <p className="font-hand text-xl text-ink">a postcard</p>
                  <Stamp className="text-faded-red">25 · ROMÂNIA</Stamp>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="border-b border-ink/20" />
                  <div className="border-b border-ink/20" />
                  <div className="border-b border-ink/20 w-2/3" />
                </div>
                <p className="font-mono-c text-[0.6rem] text-ink-soft mt-3">Q&amp;A · letters · questions</p>
              </div>
            </PhysicalObject>

            {/* notebook → Join Us */}
            <PhysicalObject to="/join" depth={0.5} rotate={4} tilt={8} hoverLabel="WANT TO JOIN?"
            outerClassName="md:absolute md:top-[42%] md:left-[7%]" className="block">
              <div className="w-full md:w-44 bg-paper p-5 shadow-lg border-l-4 border-burgundy">
                <div className="flex gap-1.5 mb-3">
                  {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-ink/30" />)}
                </div>
                <p className="font-heading text-2xl">Join Us</p>
                <p className="font-hand text-base text-ink-soft mt-1">a blank notebook · your page</p>
                <p className="label-mono text-burgundy mt-3">ROLES OPEN</p>
              </div>
            </PhysicalObject>

            {/* piece of paper → Submit */}
            <PhysicalObject to="/submit" depth={0.35} rotate={-5} tilt={7} hoverLabel="SUBMIT YOUR WORK"
            outerClassName="md:absolute md:top-[46%] md:left-[37%]" className="block">
              <div className="w-full md:w-48 bg-paper p-5 shadow-lg border border-ink/10">
                <p className="font-mono-c text-xs text-ink">SUBMISSION FORM</p>
                <p className="font-mono-c text-xs text-ink-soft mt-2">name: ____________</p>
                <p className="font-mono-c text-xs text-ink-soft">title: ____________</p>
                <p className="font-mono-c text-xs text-ink-soft">work: [ attach ]</p>
                <p className="font-hand text-base text-burgundy mt-3">→ send it our way</p>
              </div>
            </PhysicalObject>

            {/* receipt → Shop */}
            <PhysicalObject to="/shop" depth={0.45} rotate={3} tilt={8} hoverLabel="TAKE SOMETHING HOME"
            outerClassName="md:absolute md:top-[40%] md:right-[6%]" className="block">
              <div className="w-full md:w-40 bg-[#fdfaf2] py-4 px-3 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 92% 96%, 84% 100%, 76% 96%, 68% 100%, 60% 96%, 52% 100%, 44% 96%, 36% 100%, 28% 96%, 20% 100%, 12% 96%, 4% 100%, 0 96%)' }}>
                <p className="label-mono text-center text-burgundy">CĂLIMARA · SHOP</p>
                <div className="font-mono-c text-[0.6rem] text-ink-soft mt-2 space-y-0.5">
                  <p className="flex justify-between"><span>issue 03</span><span>25.00</span></p>
                  <p className="flex justify-between"><span>sticker</span><span>5.00</span></p>
                  <p className="border-t border-dashed border-ink/30 my-1" />
                  <p className="flex justify-between"><span>TOTAL</span><span>30.00</span></p>
                </div>
                <p className="font-hand text-sm text-ink-soft text-center mt-2">take it home</p>
              </div>
            </PhysicalObject>

            {/* ticket → Timeline */}
            <PhysicalObject to="/timeline" depth={0.5} rotate={-2} tilt={7} hoverLabel="EVERYTHING THAT HAPPENED"
            outerClassName="md:absolute md:top-[72%] md:left-[27%]" className="block">
              <div className="w-full md:w-52 bg-paper shadow-lg flex">
                <div className="border-r-2 border-dashed border-ink/30 py-3 px-2 flex flex-col justify-center items-center">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-ink/40 my-0.5" />)}
                </div>
                <div className="p-3">
                  <p className="label-mono text-burgundy">ADMIT ONE</p>
                  <p className="font-heading text-xl leading-tight">Timeline</p>
                  <p className="font-hand text-sm text-ink-soft">a scrapbook of milestones</p>
                </div>
              </div>
            </PhysicalObject>

            {/* envelope → Drawer (random) */}
            <PhysicalObject onClick={openDrawer} depth={0.25} rotate={2} tilt={8} hoverLabel="OPEN THE DRAWER"
            outerClassName="md:absolute md:top-[68%] md:right-[5%]" className="block">
              <div className="relative w-full md:w-52 bg-[#fdfaf2] shadow-lg p-4 border border-ink/10">
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[104px] border-r-[104px] border-t-[40px] border-l-transparent border-r-transparent border-t-paper-deep/80" />
                <p className="font-hand text-xl text-ink mt-6">to: whoever opens this</p>
                <Stamp className="text-faded-red mt-2">UNSORTED</Stamp>
                <p className="font-mono-c text-[0.6rem] text-ink-soft mt-2">a random fragment from the archive</p>
              </div>
            </PhysicalObject>
          </div>

          <Reveal delay={120} className="mt-14 text-center">
            <p className="font-hand text-xl text-ink-soft/70">every object above is a real door — hover to lift it, click to walk through.</p>
          </Reveal>
        </div>
      </section>

      <ObjectModal open={aboutOpen} onClose={() => setAboutOpen(false)} stamp="A NOTE" title="What is Călimara?">
        {settings?.about_text || 'Călimara is a student-created creative magazine where literature, visual art, photography, cinema, and the strange little things that make us human meet on paper — printed in small runs, stapled by hand, in Bucharest.'}
        <div className="mt-4">
          <Link to="/qa" className="label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4 inline-flex items-center gap-1">more in Q&amp;A <ArrowRight size={12} /></Link>
        </div>
      </ObjectModal>
    </div>);

}

function useSettingsSafe() {
  try {return useSettings();} catch {return { settings: null, loading: true };}
}
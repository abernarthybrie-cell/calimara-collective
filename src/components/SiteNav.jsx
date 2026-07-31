import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '@/lib/calimara';

const PRIMARY = [
{ to: '/archive', label: 'Archive', no: '01' },
{ to: '/people', label: 'People', no: '02' },
{ to: '/join', label: 'Join', no: '03' },
{ to: '/shop', label: 'Shop', no: '04' }];


const SECONDARY = [
{ to: '/reading-room', label: 'Reading Room' },
{ to: '/shelf', label: 'Călimara Recommends' },
{ to: '/timeline', label: 'Timeline' },
{ to: '/numbers', label: 'In Numbers' },
{ to: '/submit', label: 'Submit Your Work' },
{ to: '/qa', label: 'About & Q&A' }];


function IndexRow({ to, no, label, onClick }) {
  return (
    <li>
      <Link to={to} onClick={onClick} className="group flex items-baseline gap-4 py-2.5 border-b border-ink/10 hover:pl-2 transition-all focus-ring">
        {no && <span className="label-mono text-ink-soft/50 w-8">{no}</span>}
        <span className="font-heading text-2xl md:text-3xl leading-none group-hover:text-burgundy transition-colors">{label}</span>
        <span className="ml-auto label-mono text-ink-soft/30 group-hover:text-burgundy transition-colors">→</span>
      </Link>
    </li>);

}

export default function SiteNav({ onOpenSearch, onOpenDrawer }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();
  const loc = useLocation();

  useEffect(() => {setOpen(false);}, [loc.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {document.body.style.overflow = '';};
  }, [open]);

  const year = settings?.founded_year || '2024';
  const city = settings?.city || 'Bucharest';

  return (
    <>
      {/* floating catalogue label */}
      <header className="fixed top-3 left-3 z-40 select-none">
        <div
          className={`flex items-center gap-3 pl-3 pr-2 py-2 transition-all duration-300 ${scrolled ? 'bg-paper/90 backdrop-blur-sm shadow-md border border-ink/10' : 'bg-transparent'}`}
          style={{ transform: 'rotate(-1deg)' }}>
          
          <Link to="/" className="font-heading text-lg leading-none tracking-tight focus-ring" aria-label="Călimara home">C A L I M A R A</Link>
          <span className="hidden sm:inline w-px h-4 bg-ink/20" />
          <nav className="hidden sm:flex items-center gap-3">
            {PRIMARY.map((l) =>
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link focus-ring transition-colors ${loc.pathname === l.to ? 'text-burgundy' : 'text-ink/60 hover:text-burgundy'}`}>
              
                {l.label}
              </Link>
            )}
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="stamp text-burgundy hover:text-ink focus-ring"
            aria-label="Open the full index">
            
            INDEX
          </button>
        </div>
      </header>

      {/* INDEX overlay — a pulled-out archive card */}
      {open &&
      <div className="fixed inset-0 z-[70] flex items-start justify-center" role="dialog" aria-modal="true" aria-label="Site index">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl mx-3 mt-6 md:mt-10 max-h-[92vh] overflow-y-auto bg-paper shadow-2xl animate-rise-in grain">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 tape" />
            <div className="p-6 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-mono text-burgundy">— INDEX —</p>
                  <h2 className="font-display text-5xl md:text-6xl leading-none mt-1">Călimara</h2>
                  <p className="label-mono text-ink-soft mt-1">{city} · EST. {year} · INDEPENDENT STUDENT MAGAZINE</p>
                </div>
                <button onClick={() => setOpen(false)} className="stamp text-burgundy hover:text-ink focus-ring whitespace-nowrap" aria-label="Close index">CLOSE ✕</button>
              </div>

              <div className="mt-8">
                <p className="label-mono text-ink-soft mb-1">PRIMARY SHELF</p>
                <ul>
                  <IndexRow to="/" no="00" label="Călimara" onClick={() => setOpen(false)} />
                  {PRIMARY.map((l) => <IndexRow key={l.to} {...l} onClick={() => setOpen(false)} />)}
                </ul>
              </div>

              <div className="mt-6">
                <p className="label-mono text-ink-soft mb-1">SECONDARY SHELF</p>
                <ul>
                  {SECONDARY.map((l, i) => <IndexRow key={l.to} to={l.to} no={String(i + 5).padStart(2, '0')} label={l.label} onClick={() => setOpen(false)} />)}
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => {setOpen(false);onOpenSearch?.();}} className="stamp text-cyanotype hover:text-burgundy focus-ring">SEARCH</button>
                <button onClick={() => {setOpen(false);onOpenDrawer?.();}} className="stamp text-faded-red hover:text-burgundy focus-ring">THE DRAWER · RANDOM</button>
              </div>
            </div>
          </div>
        </div>
      }
    </>);

}
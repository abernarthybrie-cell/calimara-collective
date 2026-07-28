import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useSettings } from '@/lib/calimara';

const LINKS = [
  { to: '/', label: 'Călimara' },
  { to: '/archive', label: 'Archive' },
  { to: '/reading-room', label: 'Reading Room' },
  { to: '/people', label: 'People' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/join', label: 'Join Us' },
  { to: '/shop', label: 'Shop' },
];

export default function SiteNav({ onOpenSearch }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const year = settings?.founded_year || '2024';
  const city = settings?.city || 'Bucharest';

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${scrolled ? 'bg-paper/85 backdrop-blur-sm border-b border-ink/10' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 flex items-center justify-between h-14 sm:h-16">
        {/* Wordmark — archival stamp */}
        <Link to="/" className="group flex flex-col leading-none focus-ring" aria-label="Călimara home">
          <span className="font-heading text-xl sm:text-2xl tracking-tight">CĂLIMARA</span>
          <span className="label-mono text-[0.55rem] text-ink-soft mt-0.5 hidden sm:block">
            {city} · EST. {year} · INDEPENDENT STUDENT MAGAZINE
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => {
            const active = l.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={`nav-link focus-ring transition-colors ${active ? 'text-burgundy' : 'text-ink hover:text-burgundy'}`}>
                {l.label}
              </Link>
            );
          })}
          <button onClick={onOpenSearch} aria-label="Search the archive" className="nav-link focus-ring text-ink hover:text-burgundy flex items-center gap-1">
            <Search size={13} /> Search
          </button>
          <Link to="/members" className="nav-link focus-ring border border-ink/30 px-3 py-1.5 text-ink hover:bg-ink hover:text-paper transition-colors">Members</Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden focus-ring p-2 -mr-2"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-paper animate-fade-in z-30 overflow-y-auto">
          <nav className="flex flex-col px-6 pt-8 gap-1">
            {LINKS.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-heading text-4xl py-3 border-b border-ink/10 animate-rise-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/members" className="font-heading text-4xl py-3 border-b border-ink/10 text-burgundy">Members</Link>
            <button onClick={() => { setOpen(false); onOpenSearch?.(); }} className="font-heading text-4xl py-3 text-left text-burgundy flex items-center gap-2">
              <Search size={22} /> Search
            </button>
          </nav>
          <div className="px-6 mt-10 label-mono text-ink-soft space-y-1">
            <p>{city} · EST. {year}</p>
            <p>INDEPENDENT STUDENT MAGAZINE</p>
          </div>
        </div>
      )}
    </header>
  );
}
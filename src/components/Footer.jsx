import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { useSettings, useReducedMotion } from '@/lib/calimara';
import LogoMark from '@/components/LogoMark';

export default function Footer() {
  const { settings } = useSettings();
  const { reduced, toggle } = useReducedMotion();
  const year = settings?.founded_year || '2024';

  return (
    <footer className="bg-ink text-paper mt-24 border-t border-ink">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <LogoMark size={64} rotate={-3} className="mb-3" />
          <p className="font-heading text-3xl">CĂLIMARA</p>
          <p className="label-mono text-paper/60 mt-2">BUCHAREST · EST. {year}</p>
          <p className="font-hand text-xl text-paper/70 mt-4 max-w-sm leading-snug">
            A magazine made by young people who have something to say.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="label-mono text-paper/50 mb-3">Index</p>
          <ul className="space-y-2 font-ui text-sm">
            <li><Link to="/archive" className="hover:text-dusty-yellow">Archive</Link></li>
            <li><Link to="/people" className="hover:text-dusty-yellow">People</Link></li>
            <li><Link to="/timeline" className="hover:text-dusty-yellow">Timeline</Link></li>
            <li><Link to="/join" className="hover:text-dusty-yellow">Join Us</Link></li>
            <li><Link to="/shop" className="hover:text-dusty-yellow">Shop</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="label-mono text-paper/50 mb-3">Contact</p>
          {settings?.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 font-ui text-sm hover:text-dusty-yellow">
              <Mail size={14} /> {settings.email}
            </a>
          )}
          {settings?.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-ui text-sm mt-2 hover:text-dusty-yellow">
              <Instagram size={14} /> @calimara
            </a>
          )}
          {settings?.editor_email && (
            <p className="font-mono-c text-xs text-paper/50 mt-3">editor · {settings.editor_email}</p>
          )}

          <button onClick={toggle} className="mt-5 label-mono text-paper/60 hover:text-dusty-yellow focus-ring inline-block">
            {reduced ? '〇 reduced motion: on — turn off' : '〇 reduced motion: off — turn on'}
          </button>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 label-mono text-paper/40 text-[0.6rem]">
          <span>© {new Date().getFullYear()} CĂLIMARA · INDEPENDENT STUDENT MAGAZINE</span>
          <span>PRINTED IN BUCHAREST · SET IN GARAMOND & IBM PLEX MONO</span>
        </div>
      </div>
    </footer>
  );
}
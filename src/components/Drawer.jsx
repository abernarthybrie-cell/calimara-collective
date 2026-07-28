import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useReducedMotion, formatDate } from '@/lib/calimara';
import ScanImage from './ScanImage';

export default function Drawer({ open, onClose }) {
  const { reduced } = useReducedMotion();
  const [fragments, setFragments] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await base44.entities.Fragment.list('-created_date', 60);
      setFragments(rows);
      if (rows.length) setCurrent(rows[Math.floor(Math.random() * rows.length)]);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (open && !fragments.length) load(); }, [open]);

  const another = useCallback(() => {
    if (!fragments.length) return;
    let next = current;
    let guard = 0;
    while (next?.id === current?.id && guard++ < 8) {
      next = fragments[Math.floor(Math.random() * fragments.length)];
    }
    setCurrent(next);
  }, [fragments, current]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={`relative w-full max-w-md bg-archive-bg text-archive-fg border border-archive-line shadow-2xl ${reduced ? '' : 'animate-rise-in'}`}
        style={{ transform: reduced ? 'none' : 'rotate(-0.6deg)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-archive-line">
          <span className="label-mono text-dusty-yellow">THE DRAWER · FRAGMENT</span>
          <button onClick={onClose} aria-label="Close drawer" className="focus-ring p-1 text-archive-fg hover:text-dusty-yellow"><X size={18} /></button>
        </div>

        {loading && <div className="px-6 py-16 text-center label-mono text-archive-muted">opening the drawer…</div>}

        {current && !loading && (
          <div className="p-6">
            {current.image ? (
              <ScanImage src={current.image} alt={current.title} objectNumber={current.object_number} className="aspect-[4/3] w-full mb-4 border border-archive-line" />
            ) : (
              <div className="border border-archive-line p-6 mb-4 bg-archive-bg2 min-h-[8rem] flex items-center justify-center">
                <p className="font-hand text-2xl text-archive-fg/90 text-center leading-snug">“{current.text}”</p>
              </div>
            )}

            <div className="space-y-1.5 label-mono text-archive-muted text-[0.7rem]">
              <p><span className="text-dusty-yellow">OBJECT</span> {current.object_number}</p>
              {current.contributor_name && <p><span className="text-dusty-yellow">CONTRIBUTOR</span> {current.contributor_name}</p>}
              {current.issue_number && <p><span className="text-dusty-yellow">FOUND IN</span> Issue {String(current.issue_number).padStart(2, '0')}</p>}
              {current.date && <p><span className="text-dusty-yellow">DATE</span> {formatDate(current.date)}</p>}
              <p><span className="text-dusty-yellow">STATUS</span> {current.status}</p>
            </div>

            <h3 className="font-heading text-2xl mt-4">{current.title}</h3>
            {current.description && <p className="font-body text-base text-archive-fg/80 mt-2 leading-relaxed">{current.description}</p>}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-archive-line">
              {current.related_story_slug ? (
                <Link to={`/archive/issue-${String(current.issue_number).padStart(2,'0')}/story/${current.related_story_slug}`} onClick={onClose} className="label-mono text-cyanotype hover:text-dusty-yellow">
                  TRACE SOURCE →
                </Link>
              ) : current.contributor_name ? (
                <Link to={`/people/${encodeURIComponent(current.contributor_name)}`} onClick={onClose} className="label-mono text-cyanotype hover:text-dusty-yellow">
                  MEET THE CONTRIBUTOR →
                </Link>
              ) : <span />}
              <button onClick={another} className="label-mono text-dusty-yellow flex items-center gap-1.5 hover:text-paper focus-ring">
                <RefreshCw size={13} /> ANOTHER FRAGMENT →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
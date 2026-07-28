import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ObjectModal — on-brand overlay for short notes, quotes, archival fragments.
 */
export default function ObjectModal({ open, onClose, stamp, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-paper border border-ink/20 shadow-2xl max-w-lg w-full p-8 animate-rise-in grain-light">
        {stamp && <span className="stamp text-burgundy">{stamp}</span>}
        {title && <h3 className="font-heading text-3xl mt-3 leading-tight">{title}</h3>}
        <div className="font-body text-ink-soft mt-4 leading-relaxed text-lg">{children}</div>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 focus-ring hover:text-burgundy" aria-label="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
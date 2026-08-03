import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScanImage from '@/components/ScanImage';

export default function StoryPageStack({ pages, index, onChange, onZoom, startPage }) {
  const pageNumber = startPage + index;
  const hasMany = pages.length > 1;

  return (
    <div>
      <div className="relative mb-4">
        {hasMany && <div className="absolute inset-0 translate-x-2 translate-y-2 bg-paper-deep border border-ink/15" />}
        {pages.length > 2 && <div className="absolute inset-0 translate-x-4 translate-y-4 bg-paper-shadow border border-ink/10" />}
        <button
          type="button"
          onClick={onZoom}
          aria-label={`Enlarge original page ${pageNumber}`}
          className="relative block w-full cursor-zoom-in bg-paper focus-ring"
        >
          <ScanImage src={pages[index]} alt={`Original printed page ${pageNumber}`} objectNumber={`p.${pageNumber}`} className="aspect-[210/297] w-full shadow-xl border border-ink/15" fittingType="fit" />
        </button>
      </div>
      {hasMany && (
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => onChange(index - 1)} disabled={index === 0} className="focus-ring disabled:opacity-30" aria-label="Previous story page"><ChevronLeft size={18} /></button>
          <span className="label-mono text-ink-soft">PAGE {index + 1} / {pages.length}</span>
          <button type="button" onClick={() => onChange(index + 1)} disabled={index === pages.length - 1} className="focus-ring disabled:opacity-30" aria-label="Next story page"><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
}
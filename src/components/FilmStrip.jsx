import React from 'react';
import ScanImage from '@/components/ScanImage';

// A tactile film-strip frame: sprocket holes top + bottom, four frames inside.
// Pass real photo URLs via `frames`; with none it shows "awaiting scan" frames.
export default function FilmStrip({ frames = [], label, className = '' }) {
  const list = frames.length ? frames.slice(0, 4) : [null, null, null, null];
  const Holes = () => (
    <div className="flex justify-between px-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="w-1.5 h-1 bg-[#2a2a2a] rounded-sm" />
      ))}
    </div>
  );
  return (
    <div className={className}>
      <div className="bg-[#1a1a1a] p-1.5 shadow-lg">
        <Holes />
        <div className="flex gap-1 my-1">
          {list.map((src, i) => (
            <div key={i} className="flex-1 aspect-square bg-paper-deep overflow-hidden">
              <ScanImage src={src} alt="" className="w-full h-full" />
            </div>
          ))}
        </div>
        <Holes />
      </div>
      {label && <p className="font-hand text-sm text-ink-soft mt-1">{label}</p>}
    </div>
  );
}
import React from 'react';
import { hasImage } from '@/lib/calimara';

// Maps a printed page number to the spread that contains it.
// Spread 1 = cover alone (page 1); spreads 2+ = two-page spreads.
const spreadForPage = (p) => (p === 1 ? 1 : Math.floor(p / 2) + 1);

export default function SpreadThumbnails({ pageImages, pageCount, currentSpread, onJump }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="mt-8 border-t border-archive-line pt-5">
      <p className="label-mono text-dusty-yellow mb-3 text-center">JUMP TO A SPREAD</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {pages.map((p) => {
          const img = pageImages[p - 1];
          const spread = spreadForPage(p);
          const active = spread === currentSpread;
          return (
            <button
              key={p}
              onClick={() => onJump(spread)}
              aria-label={`Jump to page ${p}`}
              className={`relative shrink-0 w-11 sm:w-12 aspect-[210/297] border bg-archive-bg2 transition-all focus-ring ${
                active
                  ? 'border-dusty-yellow ring-2 ring-dusty-yellow/70 z-10'
                  : 'border-archive-line hover:border-burgundy hover:-translate-y-0.5'
              }`}
            >
              {hasImage(img) ? (
                <img
                  src={img}
                  alt={`page ${p}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center label-mono text-ink-soft/40 text-[0.5rem]">
                  {p}
                </span>
              )}
              <span className="absolute bottom-0.5 right-1 label-mono text-[0.5rem] text-archive-fg/80 bg-archive-bg/70 px-0.5 leading-none">
                {p}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
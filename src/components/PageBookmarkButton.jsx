import React from 'react';
import { Bookmark } from 'lucide-react';

export default function PageBookmarkButton({ pageNo, active, onSave }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSave(pageNo);
      }}
      aria-label={active ? `Page ${pageNo} is bookmarked` : `Bookmark page ${pageNo}`}
      title={active ? 'Bookmarked page' : 'Bookmark this page'}
      className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center border shadow-md transition-colors focus-ring ${active ? 'border-burgundy bg-burgundy text-paper' : 'border-ink/20 bg-paper/90 text-burgundy hover:bg-paper-deep'}`}
    >
      <Bookmark size={17} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
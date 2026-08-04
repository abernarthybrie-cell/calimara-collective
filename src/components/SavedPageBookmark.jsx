import React from 'react';
import { BookmarkCheck, X } from 'lucide-react';

export default function SavedPageBookmark({ pageNo, onReturn, onClear }) {
  if (!pageNo) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onReturn}
        className="label-mono inline-flex items-center gap-2 border border-dusty-yellow/60 px-3 py-2 text-dusty-yellow hover:bg-archive-bg2 focus-ring"
      >
        <BookmarkCheck size={14} /> RETURN TO BOOKMARK · P.{pageNo}
      </button>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove bookmark for page ${pageNo}`}
        className="flex h-9 w-9 items-center justify-center border border-archive-line text-archive-muted hover:text-paper focus-ring"
      >
        <X size={14} />
      </button>
    </div>
  );
}
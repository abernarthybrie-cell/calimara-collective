import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function PageZoom({ pageNo, image, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-archive-bg/95 backdrop-blur-sm grain flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-archive-line shrink-0">
        <p className="label-mono text-dusty-yellow">
          {title ? `${title} · ` : ''}PAGE {pageNo}
        </p>
        <button
          onClick={onClose}
          className="label-mono text-archive-fg hover:text-paper border border-archive-line px-3 py-2 flex items-center gap-1.5 focus-ring"
        >
          <X size={14} /> CLOSE
        </button>
      </div>
      <div className="flex-1 overflow-auto overscroll-contain p-4 md:p-8 touch-pan-y">
        <div className="mx-auto" style={{ width: 'min(92vw, 1100px)' }}>
          <Image
            src={image}
            alt={`page ${pageNo}`}
            fittingType="fit"
            originWidth={210}
            originHeight={297}
            className="w-full shadow-2xl bg-white"
          />
        </div>
      </div>
    </div>
  );
}
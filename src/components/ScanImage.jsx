import React from 'react';
import { Image } from '@/components/ui/image';
import { hasImage } from '@/lib/calimara';

export default function ScanImage({ src, alt = '', objectNumber = '', label = 'AWAITING SCAN', className = '', fittingType = 'fill' }) {
  if (hasImage(src)) {
    return (
      <Image
        src={src}
        alt={alt || ''}
        fittingType={fittingType}
        loading="lazy"
        className={`bg-paper-deep ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt || label}
      className={`scan-placeholder flex flex-col items-center justify-center text-center p-4 select-none ${className}`}
    >
      <span className="label-mono text-ink-soft/70">{objectNumber ? `OBJECT ${objectNumber}` : label}</span>
      <span className="font-hand text-lg text-ink-soft/60 mt-1 leading-tight">awaiting scan</span>
      <span className="label-mono text-ink-soft/40 mt-2 text-[0.6rem]">— upload to replace —</span>
    </div>
  );
}
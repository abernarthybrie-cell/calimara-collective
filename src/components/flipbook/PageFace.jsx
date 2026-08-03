import React from 'react';
import ScanImage from '@/components/ScanImage';

export default function PageFace({ pageNo, image }) {
  return (
    <div className="relative w-full h-full bg-paper overflow-hidden">
      {image ? (
        <ScanImage src={image} alt={`page ${pageNo}`} className="w-full h-full align-top" fittingType="fill" />
      ) : (
        <div className="w-full h-full scan-placeholder flex items-center justify-center">
          <span className="label-mono text-ink-soft/60">PAGE {pageNo}</span>
        </div>
      )}
      <span className="absolute bottom-2 right-3 label-mono text-ink-soft/40 text-[0.55rem]">p.{pageNo}</span>
    </div>
  );
}
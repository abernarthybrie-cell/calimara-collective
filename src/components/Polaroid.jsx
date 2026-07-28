import React from 'react';
import ScanImage from './ScanImage';

export default function Polaroid({ src, alt, caption, objectNumber = '', rotate = '', className = '' }) {
  return (
    <figure className={`polaroid ${rotate} ${className}`}>
      <ScanImage src={src} alt={alt} objectNumber={objectNumber} className="aspect-[4/5] w-full" />
      {caption && (
        <figcaption className="font-hand text-base text-ink text-center mt-1 px-1 leading-tight">{caption}</figcaption>
      )}
    </figure>
  );
}
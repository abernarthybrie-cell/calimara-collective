import React from 'react';

// Scallop-edged lace trim — use horizontally (default) or vertically (orientation="v").
export default function LaceTrim({ orientation = 'h', className = '', style }) {
  return (
    <div
      aria-hidden
      className={`${orientation === 'v' ? 'lace-trim-v' : 'lace-trim'} ${className}`}
      style={style}
    />
  );
}
import React from 'react';

// A fabric bow decoration pinned onto a collage element. `color` is any CSS color.
export default function Bow({ className = '', color = 'hsl(var(--faded-red))' }) {
  return (
    <span aria-hidden className={`bow ${className}`} style={{ color }}>
      <span className="bow-knot" />
    </span>
  );
}
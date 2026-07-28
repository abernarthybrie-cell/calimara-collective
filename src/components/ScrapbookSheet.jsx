import React, { useRef } from 'react';
import { useReducedMotion } from '@/lib/calimara';

/**
 * ScrapbookSheet — a parallax collage container.
 * Children declare their own absolute/relative positions via inline style
 * and an optional `depth` (0..1) controlling parallax amplitude.
 * Pass children as elements with a `data-depth` attribute to opt into parallax.
 */
export default function ScrapbookSheet({ className = '', children, style = {} }) {
  const { reduced } = useReducedMotion();
  const ref = useRef(null);

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.querySelectorAll('[data-depth]').forEach((el) => {
      const d = parseFloat(el.getAttribute('data-depth') || 0);
      const amp = 14 * d;
      el.style.transform = `${el.getAttribute('data-base-transform') || ''} translate(${(-x * amp).toFixed(1)}px, ${(-y * amp).toFixed(1)}px)`;
    });
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.querySelectorAll('[data-depth]').forEach((el) => {
      el.style.transform = el.getAttribute('data-base-transform') || '';
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
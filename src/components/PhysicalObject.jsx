import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '@/lib/calimara';
import { useScrollParallax } from '@/lib/useScrollParallax';

/**
 * PhysicalObject — a tactile, depth-aware collage element.
 * - scrolls at its own `depth` (parallax layer)
 * - tilts toward the cursor on desktop (cursor interaction)
 * - lifts, scales and shadows on hover
 * - renders as a router Link (`to`), a button (`onClick`), or a plain div
 * - respects prefers-reduced-motion / the site's reduce-motion toggle
 */
export default function PhysicalObject({
  children, to, onClick, depth = 0.2, rotate = 0, tilt = 6, lift = 10, scale = 1.03,
  className = '', outerClassName = '', style = {}, hoverLabel, shadow = 'shadow-lg', ...rest
}) {
  const { reduced } = useReducedMotion();
  const parallaxRef = useScrollParallax(depth);
  const innerRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const apply = (rx = 0, ry = 0) => {
    if (!innerRef.current) return;
    const t = reduced
      ? `rotate(${rotate}deg)`
      : `rotate(${rotate}deg) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${hovered ? -lift : 0}px) scale(${hovered ? scale : 1})`;
    innerRef.current.style.transform = t;
  };

  useEffect(() => { apply(); }, [hovered, rotate, lift, scale, reduced]);

  const onMove = (e) => {
    if (reduced || tilt === 0 || !innerRef.current) return;
    const r = innerRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    apply((-py * tilt).toFixed(2), (px * tilt).toFixed(2));
  };
  const onLeave = () => { setHovered(false); apply(); };

  const Tag = to ? Link : onClick ? 'button' : 'div';
  const tagProps = to ? { to, ...rest } : onClick ? { onClick, type: 'button', ...rest } : rest;

  return (
    <div ref={parallaxRef} className={`relative will-change-transform ${outerClassName}`} style={style}>
      <Tag
        ref={innerRef}
        {...tagProps}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        className={`block transition-[transform,box-shadow] duration-300 ease-out [transform-style:preserve-3d] ${hovered ? `${shadow} shadow-2xl` : shadow} ${(to || onClick) ? 'cursor-pointer' : ''} ${className}`}
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {children}
      </Tag>
      {hoverLabel && (
        <span className={`absolute left-1/2 -translate-x-1/2 label-mono text-burgundy whitespace-nowrap pointer-events-none transition-opacity duration-200 ${hovered ? 'opacity-100 -bottom-6' : 'opacity-0 -bottom-2'}`}>
          {hoverLabel}
        </span>
      )}
    </div>
  );
}
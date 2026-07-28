import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/calimara';

/**
 * Reveal — scroll-triggered fade + rise. Reduced motion: shown immediately.
 */
export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0, y = 28, once = true, style = {} }) {
  const { reduced } = useReducedMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(reduced);

  useEffect(() => {
    if (reduced) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setShown(true); if (once) io.disconnect(); }
        else if (!once) setShown(false);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, once]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
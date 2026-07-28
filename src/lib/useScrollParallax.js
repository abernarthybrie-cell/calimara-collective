import { useRef, useEffect } from 'react';
import { useReducedMotion } from '@/lib/calimara';

/**
 * useScrollParallax — GPU-only scroll-driven depth.
 * Returns a ref to attach to the element that should drift.
 * `depth` (0..1) controls amplitude; negative reverses direction.
 * Respects reduced-motion (no transform applied).
 */
export function useScrollParallax(depth = 0.2, amplitude = 140) {
  const ref = useRef(null);
  const { reduced } = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const span = vh / 2 + rect.height / 2;
      const delta = span ? (center - vh / 2) / span : 0; // -1 (below) .. +1 (above)
      const shift = -delta * amplitude * depth;
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, depth, amplitude]);

  return ref;
}
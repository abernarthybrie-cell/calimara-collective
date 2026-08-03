import React, { useEffect, useState } from 'react';

export default function ReadingProgress({ targetRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const target = targetRef.current;
      if (!target) return;
      const start = target.getBoundingClientRect().top + window.scrollY;
      const finish = start + target.offsetHeight - window.innerHeight * 0.65;
      const value = finish <= start ? 1 : (window.scrollY - start) / (finish - start);
      setProgress(Math.min(1, Math.max(0, value)));
    };
    const observer = new ResizeObserver(update);
    if (targetRef.current) observer.observe(targetRef.current);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetRef]);

  const percent = Math.round(progress * 100);
  return (
    <div className="fixed right-3 bottom-3 sm:right-5 sm:bottom-5 z-40 w-28 bg-paper-deep border border-ink/20 px-3 py-2 shadow-md" aria-label={`${percent}% of story read`}>
      <div className="flex justify-between label-mono text-[0.55rem] text-ink-soft"><span>READING</span><span>{percent}%</span></div>
      <div className="mt-1.5 h-1 bg-paper-shadow/60 overflow-hidden"><div className="h-full bg-burgundy transition-[width] duration-150" style={{ width: `${percent}%` }} /></div>
    </div>
  );
}
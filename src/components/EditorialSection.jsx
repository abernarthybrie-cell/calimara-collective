import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Minimal archive-style section: a collage on one side, a script heading +
// monospaced body + directional olive arrow on the other, separated by a
// faint rule. `direction` = which way the arrow points (collage sits opposite).
export default function EditorialSection({
  heading, body, to, direction = 'right', label, children, className = '',
}) {
  const Arrow = direction === 'left' ? ArrowLeft : ArrowRight;
  const text = (
    <div>
      {label && <p className="label-mono text-ink-soft mb-2">{label}</p>}
      <h2 className="font-heading italic text-4xl md:text-5xl text-olive leading-tight">{heading}</h2>
      <p className="font-mono-c text-sm text-ink/80 mt-5 leading-relaxed max-w-md">{body}</p>
      {to && (
        <Link to={to} className="inline-flex items-center gap-2 mt-7 text-olive hover:text-burgundy focus-ring group">
          <Arrow
            size={22}
            className={direction === 'left' ? 'group-hover:-translate-x-1 transition-transform' : 'group-hover:translate-x-1 transition-transform'}
          />
          <span className="label-mono">ENTER</span>
        </Link>
      )}
    </div>
  );
  const collage = <div>{children}</div>;
  return (
    <section className={`border-t border-ink/10 ${className}`}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {direction === 'left' ? <>{text}{collage}</> : <>{collage}{text}</>}
      </div>
    </section>
  );
}
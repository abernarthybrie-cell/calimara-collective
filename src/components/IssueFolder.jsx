import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScanImage from '@/components/ScanImage';

// bright palette colors — cycled per issue
const FOLDER_COLORS = [
  { bg: 'hsl(var(--latte))',      ink: 'hsl(var(--cafe-noir))', dark: false },
  { bg: 'hsl(var(--mauve))',      ink: 'hsl(var(--linen))',    dark: true },
  { bg: 'hsl(var(--cedar))',      ink: 'hsl(var(--cafe-noir))', dark: false },
  { bg: 'hsl(var(--weathered))',  ink: 'hsl(var(--cafe-noir))', dark: false },
  { bg: 'hsl(var(--clockwork))',  ink: 'hsl(var(--linen))',    dark: true },
  { bg: 'hsl(var(--deep-olive))', ink: 'hsl(var(--linen))',    dark: true }
];

// five photos per folder — scattered to the sides, sitting between the two covers
const PHOTO_SLOTS = [
  { top: -18, left: 3,  w: 150, rot: -4 },
  { top: -10, left: 64, w: 132, rot: 5 },
  { top: 6,   left: 30, w: 108, rot: -2 },
  { top: 16,  left: 7,  w: 120, rot: 3 },
  { top: 20,  left: 60, w: 104, rot: -3 }
];

// the paper sheet tucked inside, peeking out the top
const PAPER_SLOT = { top: -22, left: 40, w: 128, rot: 1 };

// ratios cycle per issue so different pictures get different shapes
const RATIO_SET = ['3/4', '4/6', '1/1', '3/6'];

const ASPECT_CLASS = {
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  '4/5': 'aspect-[4/5]',
  '4/6': 'aspect-[4/6]',
  '3/6': 'aspect-[3/6]'
};

export default function IssueFolder({ issue, stories, illustrations, layout }) {
  const { top, left, width, height, rotate, z } = layout;
  const [hovered, setHovered] = useState(false);
  const color = FOLDER_COLORS[(issue.number || 0) % FOLDER_COLORS.length];
  const num = String(issue.number).padStart(2, '0');
  const tabRight = (issue.number || 0) % 2 === 1;

  // pool of real images for this issue
  const pool = [
    issue.cover_image,
    ...illustrations.map((i) => i.image),
    ...stories.map((s) => s.cover_image || s.page_scan)
  ].filter(Boolean);

  return (
    <Link
      to={`/archive/issue/${issue.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block focus-ring"
      style={{
        position: 'absolute',
        top,
        left: `${left}%`,
        width: `${width}%`,
        height,
        zIndex: hovered ? 60 : z,
        transform: `rotate(${rotate}deg)`,
        transition: 'z-index 0s'
      }}
    >
      <div className="h-full flex flex-col transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.02]">
        {/* tab — left or right depending on the issue */}
        <div
          className={`relative inline-block px-5 py-3 md:px-7 md:py-4 rounded-t-2xl shadow-[0_8px_20px_rgba(0,0,0,0.25)] ${tabRight ? 'self-end' : 'self-start'}`}
          style={{ background: color.bg, color: color.ink, boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.25)' }}
        >
          <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
            <span className="label-mono opacity-70">ISSUE {num}</span>
            <h2 className="font-heading text-xl md:text-3xl leading-tight">{issue.title}</h2>
          </div>
        </div>

        {/* folder assembly — back cover, contents between, front cover */}
        <div className="relative flex-1">
          {/* back cover — peeks at the bottom (the other cover) */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ background: color.bg, transform: 'translateY(16px) rotate(1deg)', boxShadow: '0 14px 34px rgba(0,0,0,0.3)' }}
          />

          {/* contents between the covers — paper sheet + scattered photos */}
          <PaperSheet {...PAPER_SLOT} issue={issue} ink={color.ink} />
          {PHOTO_SLOTS.map((slot, i) => (
            <PhotoSlot
              key={i}
              {...slot}
              aspect={RATIO_SET[(issue.number + i) % RATIO_SET.length]}
              src={pool[i] || null}
              alt={issue.title}
            />
          ))}

          {/* front cover — lower panel, rounded bottom, leaves the contents exposed above */}
          <div
            className="absolute inset-x-0 bottom-0 rounded-b-2xl rounded-t-md"
            style={{ top: '60%', background: color.bg, color: color.ink, boxShadow: '0 18px 40px rgba(0,0,0,0.32), inset 0 2px 4px rgba(0,0,0,0.10)' }}
          >
            {/* spine crease */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-current opacity-15" />
            <span className="absolute bottom-2 left-3 label-mono text-[0.55rem] opacity-60">{issue.page_count} pp</span>
            <span className="absolute bottom-2 right-3 label-mono text-[0.55rem] opacity-60">OPEN →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PhotoSlot({ top, left, w, rot, aspect, src, alt }) {
  return (
    <div
      className="fragment absolute z-10"
      style={{ top: `${top}%`, left: `${left}%`, width: w, '--rot': `${rot}deg` }}
    >
      <ScanImage src={src} alt={alt} className={`${ASPECT_CLASS[aspect] || 'aspect-[3/4]'} w-full shadow-lg`} />
    </div>
  );
}

function PaperSheet({ top, left, w, rot, issue, ink }) {
  return (
    <div
      className="fragment absolute z-[8]"
      style={{ top: `${top}%`, left: `${left}%`, width: w, '--rot': `${rot}deg` }}
    >
      <div
        className="bg-[#fdfaf2] shadow-lg p-3"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 86%, 90% 100%, 0 100%)' }}
      >
        <p className="label-mono text-[0.55rem]" style={{ color: 'hsl(var(--burgundy))' }}>ISSUE {String(issue.number).padStart(2, '0')}</p>
        <p className="font-hand text-sm leading-tight mt-1" style={{ color: ink }}>{issue.title}</p>
        <div className="mt-2 space-y-1">
          <div className="border-b border-ink/15 w-full" />
          <div className="border-b border-ink/15 w-4/5" />
          <div className="border-b border-ink/15 w-3/5" />
        </div>
      </div>
    </div>
  );
}
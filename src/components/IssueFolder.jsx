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

// six photo slots per folder — varied position, size, aspect, rotation
const PHOTO_SLOTS = [
  { top: 4,  left: 3,  w: 140, rot: -3, aspect: '3/4', caption: true },
  { top: 6,  left: 58, w: 110, rot: 5,  aspect: '1/1', caption: false },
  { top: 28, left: 30, w: 90,  rot: 2,  aspect: '3/4', caption: false },
  { top: 46, left: 5,  w: 120, rot: -2, aspect: '4/5', caption: false },
  { top: 48, left: 64, w: 100, rot: 4,  aspect: '1/1', caption: false },
  { top: 70, left: 36, w: 85,  rot: -4, aspect: '3/4', caption: false }
];

const HIDDEN_SLOTS = [
  { top: 88, left: 20, w: 90, rot: 6, aspect: '3/4' },
  { top: 90, left: 60, w: 80, rot: -5, aspect: '1/1' }
];

const ASPECT_CLASS = {
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  '4/5': 'aspect-[4/5]'
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
          className={`relative inline-block px-5 py-3 md:px-7 md:py-4 shadow-[0_8px_20px_rgba(0,0,0,0.25)] ${tabRight ? 'self-end' : 'self-start'}`}
          style={{ background: color.bg, color: color.ink, boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.25)' }}
        >
          <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
            <span className="label-mono opacity-70">ISSUE {num}</span>
            <h2 className="font-heading text-xl md:text-3xl leading-tight">{issue.title}</h2>
          </div>
        </div>

        {/* body — scattered photos from this issue */}
        <div
          className="relative flex-1 shadow-[0_14px_34px_rgba(0,0,0,0.3)]"
          style={{ background: color.bg, color: color.ink }}
        >
          {PHOTO_SLOTS.map((slot, i) => (
            <PhotoSlot
              key={i}
              {...slot}
              src={pool[i] || null}
              alt={issue.title}
              caption={slot.caption ? issue.theme : null}
              ink={color.ink}
            />
          ))}

          {/* hidden photos — emerge from behind on hover */}
          {HIDDEN_SLOTS.map((slot, i) => (
            <div
              key={`h-${i}`}
              className="folder-hidden absolute bg-white p-1 pb-4 shadow-lg"
              style={{ top: `${slot.top}%`, left: `${slot.left}%`, width: slot.w, zIndex: 10, '--rot': `${slot.rot}deg` }}
            >
              <ScanImage src={pool[PHOTO_SLOTS.length + i] || null} alt={issue.title} className={`${ASPECT_CLASS[slot.aspect] || 'aspect-[3/4]'} w-full`} />
            </div>
          ))}

          {/* small theme tag + open hint */}
          <span className="absolute bottom-2 left-3 label-mono text-[0.55rem] opacity-60 z-30">{issue.page_count} pp</span>
          <span className="absolute bottom-2 right-3 label-mono text-[0.55rem] opacity-60 z-30">OPEN →</span>
        </div>
      </div>
    </Link>
  );
}

function PhotoSlot({ top, left, w, rot, aspect, caption, src, alt, ink }) {
  return (
    <div
      className="fragment absolute z-20"
      style={{ top: `${top}%`, left: `${left}%`, width: w, '--rot': `${rot}deg` }}
    >
      <div className="bg-white p-1 pb-4 shadow-lg">
        <ScanImage src={src} alt={alt} className={`${ASPECT_CLASS[aspect] || 'aspect-[3/4]'} w-full`} />
        {caption && <p className="font-hand text-[0.7rem] mt-1 text-center leading-tight" style={{ color: ink }}>{caption}</p>}
      </div>
    </div>
  );
}
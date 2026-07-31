import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScanImage from '@/components/ScanImage';
import Polaroid from '@/components/Polaroid';

// bright palette colors — cycled per issue
const FOLDER_COLORS = [
  { bg: 'hsl(var(--latte))',      ink: 'hsl(var(--cafe-noir))', dark: false },
  { bg: 'hsl(var(--mauve))',      ink: 'hsl(var(--linen))',    dark: true },
  { bg: 'hsl(40 62% 66%)',        ink: 'hsl(var(--cafe-noir))', dark: false },
  { bg: 'hsl(var(--weathered))',  ink: 'hsl(var(--cafe-noir))', dark: false },
  { bg: 'hsl(var(--clockwork))',  ink: 'hsl(var(--linen))',    dark: true },
  { bg: 'hsl(var(--deep-olive))', ink: 'hsl(var(--linen))',    dark: true }
];

// five photos per folder — two portrait up top, three landscape below, scattered with space between
const PHOTO_SLOTS = [
  { top: 5,  left: 2,  w: 150, rot: -3, aspect: '3/4' },
  { top: 8,  left: 66, w: 130, rot: 4,  aspect: '4/6' },
  { top: 28, left: 5,  w: 180, rot: -2, aspect: '4/3' },
  { top: 46, left: 54, w: 170, rot: 3,  aspect: '3/2' },
  { top: 64, left: 30, w: 160, rot: -3, aspect: '6/4' }
];

const ASPECT_CLASS = {
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  '4/5': 'aspect-[4/5]',
  '4/6': 'aspect-[4/6]',
  '3/6': 'aspect-[3/6]',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '6/4': 'aspect-[6/4]'
};

export default function IssueFolder({ issue, stories, illustrations, layout, polaroid }) {
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
        {/* tab — left or right depending on the issue; rounded where it meets the body */}
        <div
          className={`relative inline-block px-5 py-3 md:px-7 md:py-4 rounded-b-[12px] ${tabRight ? 'self-end' : 'self-start'}`}
          style={{ background: color.bg, color: color.ink, boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.25)' }}
        >
          <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
            <span className="label-mono opacity-70">ISSUE {num}</span>
            <h2 className="font-heading text-xl md:text-3xl leading-tight">{issue.title}</h2>
          </div>
        </div>

        {/* front cover — photos sit between this and the back cover */}
        <div
          className="relative flex-1 rounded-t-[12px] shadow-[0_14px_34px_rgba(0,0,0,0.3)]"
          style={{ background: color.bg, color: color.ink }}
        >
          {PHOTO_SLOTS.map((slot, i) => (
            <PhotoSlot
              key={i}
              {...slot}
              src={pool[i] || null}
              alt={issue.title}
            />
          ))}

          {/* polaroid — only on the top and bottom folder */}
          {polaroid && (
            <div
              className="fragment absolute z-20"
              style={{ top: '68%', left: '40%', width: 112, '--rot': '-2deg' }}
            >
              <Polaroid src={pool[PHOTO_SLOTS.length] || null} alt={issue.title} caption={issue.theme} objectNumber={`ISSUE ${num}`} />
            </div>
          )}

          {/* small theme tag + open hint */}
          <span className="absolute bottom-2 left-3 label-mono text-[0.55rem] opacity-60 z-30">{issue.page_count} pp</span>
          <span className="absolute bottom-2 right-3 label-mono text-[0.55rem] opacity-60 z-30">OPEN →</span>

          {/* back cover — the other cover, peeks below the front cover */}
          <div
            className="absolute -left-2 -right-2 -bottom-2 h-3 rounded-b-[10px] z-0"
            style={{ background: color.bg, boxShadow: '0 6px 14px rgba(0,0,0,0.22)' }}
          />
          {/* blank white page — the file inside, peeks below the back cover */}
          <div className="absolute -left-1 -right-1 -bottom-5 h-3 bg-[#fdfaf2] rounded-b-[8px] z-0 shadow-md" />
        </div>
      </div>
    </Link>
  );
}

function PhotoSlot({ top, left, w, rot, aspect, src, alt }) {
  return (
    <div
      className="fragment absolute z-20"
      style={{ top: `${top}%`, left: `${left}%`, width: w, '--rot': `${rot}deg` }}
    >
      <ScanImage src={src} alt={alt} className={`${ASPECT_CLASS[aspect] || 'aspect-[3/4]'} w-full shadow-lg`} />
    </div>
  );
}
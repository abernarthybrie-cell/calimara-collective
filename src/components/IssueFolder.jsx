import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Paperclip } from 'lucide-react';
import ScanImage from '@/components/ScanImage';
import Tape from '@/components/Tape';

// dusty, editorial tones drawn from the site's own palette tokens
const FOLDER_COLORS = [
  { bg: 'hsl(var(--latte))',        tab: 'hsl(34 36% 66%)',  ink: 'hsl(27 32% 18%)' },
  { bg: 'hsl(var(--weathered))',   tab: 'hsl(28 16% 46%)',  ink: 'hsl(30 10% 12%)' },
  { bg: 'hsl(var(--cedar))',        tab: 'hsl(54 10% 36%)',  ink: 'hsl(40 20% 90%)' },
  { bg: 'hsl(var(--mauve))',        tab: 'hsl(0 14% 32%)',   ink: 'hsl(40 20% 90%)' },
  { bg: 'hsl(var(--dusty-yellow))', tab: 'hsl(38 28% 36%)',  ink: 'hsl(27 30% 14%)' },
  { bg: 'hsl(var(--cyanotype))',   tab: 'hsl(152 8% 40%)',  ink: 'hsl(30 10% 12%)' }
];

// loose no-frame photo slots — positions relative to the folder body (px). Some extend beyond edges.
const PHOTO_SLOTS = [
  { top: -22, left: -26, w: 116, rot: -4 },
  { top: 16,  right: -34, w: 104, rot: 5 },
  { top: 118, left: 34, w: 92, rot: -2 }
];

export default function IssueFolder({ issue, stories, illustrations, layout }) {
  const { top, left, width, height, rotate, z, tabSide } = layout;
  const [hovered, setHovered] = useState(false);
  const color = FOLDER_COLORS[(issue.number || 0) % FOLDER_COLORS.length];
  const num = String(issue.number).padStart(2, '0');

  const photoSources = [
    issue.cover_image,
    ...illustrations.slice(0, 3).map((i) => i.image),
    ...stories.slice(0, 3).map((s) => s.cover_image || s.page_scan)
  ];
  const rotShift = (issue.number || 0) % 2 ? 3 : -3;

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
      <div className="h-full transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.02]">
        {/* tab — sticks out to one side beyond the body, stays visible above the pile */}
        <div
          className="absolute z-40"
          style={
            tabSide === 'right'
              ? { top: -6, right: -90, width: 250 }
              : { top: -6, left: -90, width: 250 }
          }
        >
          <div className="px-4 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.3)]" style={{ background: color.tab, color: color.ink }}>
            <span className="label-mono opacity-70 block leading-none mb-1">ISSUE {num}</span>
            <h2 className="font-heading text-lg md:text-xl leading-tight">{issue.title}</h2>
          </div>
        </div>

        {/* body */}
        <div
          className="relative h-full shadow-[0_14px_34px_rgba(0,0,0,0.32)]"
          style={{ background: color.bg, color: color.ink, overflow: 'visible' }}
        >
          <Tape className="absolute -top-3 left-1/2 -translate-x-1/2 z-30" />

          {/* loose no-frame photographs — varied scale, rotation, layering; some extend beyond edges */}
          {PHOTO_SLOTS.map((slot, i) => {
            const src = photoSources[i];
            const style = { position: 'absolute', width: slot.w, zIndex: 20 - i, '--rot': `${slot.rot + rotShift}deg` };
            if (slot.top != null) style.top = slot.top;
            if (slot.left != null) style.left = slot.left;
            if (slot.right != null) style.right = slot.right;
            if (slot.bottom != null) style.bottom = slot.bottom;
            return (
              <div key={`ph-${i}`} className="fragment" style={style}>
                <div className="shadow-lg">
                  <ScanImage src={src} alt="" className="aspect-[3/4] w-full" />
                </div>
              </div>
            );
          })}

          {/* one polaroid for variety */}
          <div className="fragment absolute bottom-4 right-6 w-24 z-22" style={{ '--rot': '4deg' }}>
            <div className="bg-white p-1.5 pb-5 shadow-lg">
              <ScanImage src={photoSources[3]} alt="" className="aspect-square w-full" />
              <p className="font-hand text-[0.6rem] mt-0.5 text-center" style={{ color: color.ink }}>{issue.theme}</p>
            </div>
          </div>

          {/* handwritten note */}
          <div
            className="fragment absolute bottom-6 left-1/2 -ml-16 w-32 z-18 bg-[#fdfaf2] p-2.5 shadow-md border"
            style={{ '--rot': '-2deg', borderColor: 'hsl(var(--ink) / 0.15)' }}
          >
            <p className="font-hand text-sm leading-snug" style={{ color: color.ink }}>{issue.theme}</p>
            <p className="label-mono text-[0.5rem] mt-1 opacity-60">{issue.page_count} pp</p>
          </div>

          {/* hidden fragments — emerge from behind on hover */}
          {illustrations[1] && (
            <div className="folder-hidden absolute -bottom-1 left-[24%] w-24 z-10 bg-white p-1.5 shadow-lg" style={{ '--rot': '5deg' }}>
              <ScanImage src={illustrations[1].image} alt={illustrations[1].title} className="aspect-square w-full" />
            </div>
          )}

          {/* paperclip + open hint */}
          <div className="absolute top-2 right-2 z-30 opacity-70" aria-hidden>
            <Paperclip size={22} strokeWidth={1.5} />
          </div>
          <span className="absolute bottom-2 left-3 label-mono text-[0.55rem] opacity-50 z-30">OPEN →</span>
        </div>
      </div>
    </Link>
  );
}
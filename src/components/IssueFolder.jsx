import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ArchiveEphemera from '@/components/ArchiveEphemera';

const FOLDER_COLORS = [
  { bg: 'hsl(var(--mauve))', ink: 'hsl(var(--linen))' },
  { bg: 'hsl(var(--dusty-yellow))', ink: 'hsl(var(--linen))' },
  { bg: 'hsl(var(--weathered))', ink: 'hsl(var(--cafe-noir))' },
  { bg: 'hsl(var(--cyanotype))', ink: 'hsl(var(--linen))' }
];

export default function IssueFolder({ issue, stories, illustrations, layout, isLast }) {
  const { top, left, width, height, rotate, z } = layout;
  const [hovered, setHovered] = useState(false);
  const color = isLast ? FOLDER_COLORS[3] : FOLDER_COLORS[(Math.max(1, issue.number || 1) - 1) % 3];
  const num = String(issue.number).padStart(2, '0');
  const tabRight = (issue.number || 0) % 2 === 0;
  const images = [
    issue.cover_image,
    ...(issue.page_images || []),
    ...illustrations.map((item) => item.image),
    ...stories.map((story) => story.cover_image || story.page_scan)
  ].filter(Boolean);

  return (
    <Link
      to={`/archive/issue/${issue.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block focus-ring"
      style={{ position: 'absolute', top, left: `${left}%`, width: `${width}%`, height, zIndex: hovered ? 60 : z, transform: `rotate(${rotate}deg)` }}
    >
      {/* back cover and its long alternating tab */}
      <div className="folder-paper absolute inset-x-0 top-8 bottom-3 rounded-[10px] shadow-[0_18px_38px_rgba(0,0,0,0.42)]" style={{ background: color.bg }}>
        <div className={`folder-paper absolute -top-11 h-14 w-[78%] px-5 md:px-7 rounded-t-[10px] flex items-center ${tabRight ? 'right-0 justify-end text-right' : 'left-0 justify-start text-left'}`} style={{ backgroundColor: color.bg, color: color.ink }}>
          <div className="flex items-baseline gap-3 min-w-0"><span className="label-mono opacity-70 shrink-0">ISSUE {num}</span><h2 className="font-mono text-[0.62rem] sm:text-xs md:text-sm leading-none whitespace-nowrap">{issue.title}</h2></div>
        </div>
      </div>

      {/* documents, photographs and small found objects */}
      <ArchiveEphemera images={images} issueNumber={num} />

      {/* front cover, lowered to reveal the archive between both covers */}
      <div className="archive-front folder-paper absolute inset-x-0 top-[47%] bottom-0 z-30 rounded-[8px] border-t border-ink/15 shadow-[0_-7px_18px_rgba(0,0,0,0.24),0_18px_34px_rgba(0,0,0,0.42)]" style={{ backgroundColor: color.bg, color: color.ink }}>
        <span className="absolute bottom-3 left-4 label-mono text-[0.55rem] opacity-65">{issue.page_count} PP · FILED</span>
        <span className="absolute bottom-3 right-4 label-mono text-[0.55rem] opacity-65">OPEN →</span>
      </div>
    </Link>
  );
}
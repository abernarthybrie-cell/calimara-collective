import React from 'react';
import { Link } from 'react-router-dom';
import { Paperclip } from 'lucide-react';
import ScanImage from '@/components/ScanImage';
import Tape from '@/components/Tape';

const FOLDER_COLORS = [
  { bg: 'hsl(40 16% 82%)', tab: 'hsl(40 16% 76%)', ink: 'hsl(30 12% 20%)' },
  { bg: 'hsl(355 26% 80%)', tab: 'hsl(355 26% 74%)', ink: 'hsl(355 30% 22%)' },
  { bg: 'hsl(210 20% 78%)', tab: 'hsl(210 20% 72%)', ink: 'hsl(210 30% 20%)' },
  { bg: 'hsl(95 15% 74%)', tab: 'hsl(95 15% 68%)', ink: 'hsl(95 20% 20%)' },
  { bg: 'hsl(34 34% 76%)', tab: 'hsl(34 34% 70%)', ink: 'hsl(28 30% 22%)' }
];

export default function IssueFolder({ issue, stories, illustrations, index }) {
  const color = FOLDER_COLORS[index % FOLDER_COLORS.length];
  const num = String(issue.number).padStart(2, '0');
  const illus = illustrations.slice(0, 3);
  const storyFrags = stories.filter((s) => s.cover_image || s.page_scan).slice(0, 2);

  return (
    <Link to={`/archive/issue/${issue.slug}`} className="group block focus-ring">
      <div
        className="relative transition-transform duration-500 group-hover:-translate-y-1"
        style={{ transform: `rotate(${index % 2 ? 0.5 : -0.5}deg)` }}
      >
        {/* tab */}
        <div
          className="relative inline-block px-5 py-3 md:px-7 md:py-4 shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
          style={{ background: color.tab, color: color.ink }}
        >
          <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
            <span className="label-mono opacity-70">ISSUE {num}</span>
            <h2 className="font-heading text-xl md:text-3xl leading-tight">{issue.title}</h2>
          </div>
        </div>

        {/* body — collage of fragments from this issue */}
        <div
          className="relative h-64 md:h-72 shadow-[0_14px_34px_rgba(0,0,0,0.3)]"
          style={{ background: color.bg, color: color.ink }}
        >
          <Tape className="absolute -top-3 left-1/2 -translate-x-1/2 z-30" />

          {/* cover polaroid */}
          <div className="fragment absolute top-4 left-3 md:left-6 w-28 md:w-32 z-20" style={{ '--rot': '-3deg' }}>
            <div className="bg-white p-1.5 pb-5 shadow-lg">
              <ScanImage src={issue.cover_image} alt={issue.title} objectNumber={`ISSUE ${num}`} className="aspect-[3/4] w-full" />
              <p className="font-hand text-xs mt-1 text-center" style={{ color: color.ink }}>{issue.theme}</p>
            </div>
          </div>

          {/* illustration fragment */}
          {illus[0] && (
            <div className="fragment absolute top-5 right-4 md:right-8 w-24 md:w-28 z-20 bg-white p-1.5 shadow-lg" style={{ '--rot': '4deg' }}>
              <ScanImage src={illus[0].image} alt={illus[0].title} className="aspect-square w-full" />
            </div>
          )}

          {/* theme note */}
          <div
            className="fragment absolute bottom-5 left-1/2 -ml-[5.5rem] w-44 z-20 bg-[#fdfaf2] p-3 shadow-md border"
            style={{ '--rot': '-1deg', borderColor: 'hsl(var(--ink) / 0.15)' }}
          >
            <p className="font-hand text-lg leading-snug" style={{ color: color.ink }}>{issue.theme}</p>
            <p className="label-mono text-[0.55rem] mt-1 opacity-60">{issue.page_count} pp · {(issue.contributor_names || []).length} contributors</p>
          </div>

          {/* story fragment */}
          {storyFrags[0] && (
            <div className="fragment absolute bottom-6 right-5 md:right-10 w-28 z-20 bg-white p-1.5 shadow-md" style={{ '--rot': '3deg' }}>
              <ScanImage src={storyFrags[0].cover_image || storyFrags[0].page_scan} alt={storyFrags[0].title} className="aspect-[3/4] w-full" />
              <p className="font-hand text-[0.7rem] mt-1 leading-tight" style={{ color: color.ink }}>{storyFrags[0].title}</p>
            </div>
          )}

          {/* hidden fragments — emerge from behind on hover */}
          {illus[1] && (
            <div className="folder-hidden absolute -bottom-1 left-[22%] w-24 z-10 bg-white p-1.5 shadow-lg" style={{ '--rot': '5deg' }}>
              <ScanImage src={illus[1].image} alt={illus[1].title} className="aspect-square w-full" />
            </div>
          )}
          {storyFrags[1] && (
            <div className="folder-hidden absolute -bottom-0.5 right-[24%] w-24 z-10 bg-white p-1.5 shadow-lg" style={{ '--rot': '-4deg' }}>
              <ScanImage src={storyFrags[1].cover_image || storyFrags[1].page_scan} alt={storyFrags[1].title} className="aspect-[3/4] w-full" />
            </div>
          )}

          {/* paperclip + open hint */}
          <div className="absolute top-2 right-2 z-30 opacity-70" aria-hidden>
            <Paperclip size={24} strokeWidth={1.5} />
          </div>
          <span className="absolute bottom-2 right-3 label-mono text-[0.55rem] opacity-50 z-30">OPEN →</span>
        </div>
      </div>
    </Link>
  );
}
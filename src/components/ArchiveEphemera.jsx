import React from 'react';
import ScanImage from '@/components/ScanImage';

const PHOTO_SLOTS = [
  { cls: 'left-[3%] top-10 w-[22%] aspect-[3/4]', rot: '-4deg', dx: '-5px', dy: '-10px' },
  { cls: 'left-[22%] top-16 w-[24%] aspect-[4/3]', rot: '2deg', dx: '-2px', dy: '-8px' },
  { cls: 'right-[24%] top-9 w-[21%] aspect-[4/5]', rot: '-2deg', dx: '4px', dy: '-11px' },
  { cls: 'right-[4%] top-20 w-[22%] aspect-[3/2]', rot: '4deg', dx: '6px', dy: '-7px' }
];

const movement = (rot, dx, dy) => ({ '--rot': rot, '--dx': dx, '--dy': dy });

export default function ArchiveEphemera({ images = [], issueNumber }) {
  return (
    <div className="absolute inset-0" aria-label={`Contents of issue ${issueNumber}`}>
      <div className="archive-object absolute left-[31%] top-2 h-40 w-[38%] bg-linen p-3 shadow-xl border border-ink/15" style={movement('1deg', '1px', '-12px')}>
        <p className="label-mono text-burgundy">DECORATIVE FILE</p><div className="mt-3 space-y-2"><i className="block h-px bg-ink/25"/><i className="block h-px w-4/5 bg-ink/20"/><i className="block h-px w-2/3 bg-ink/20"/></div>
      </div>
      {PHOTO_SLOTS.map((slot, i) => (
        <div key={i} className={`archive-object absolute shadow-xl ${slot.cls}`} style={movement(slot.rot, slot.dx, slot.dy)}>
          <ScanImage src={images[i]} alt={`Archive photograph ${i + 1}`} label="PHOTO PLACEHOLDER" className="h-full w-full" />
        </div>
      ))}
      <div className="archive-object absolute left-[8%] top-28 h-28 w-[14%] bg-linen p-2 shadow-lg" style={movement('-2deg', '-5px', '-7px')}><p className="label-mono text-[0.5rem]">RECEIPT</p><div className="mt-2 border-t border-dashed border-ink/30"/><p className="font-mono text-[0.48rem] mt-2">CĂLIMARA<br/>ARCHIVE<br/>••••••</p></div>
      <div className="archive-object absolute right-[10%] top-28 h-20 w-[25%] bg-paper-deep p-2 shadow-lg border border-ink/10" style={movement('3deg', '5px', '-8px')}><p className="label-mono text-[0.5rem]">POSTCARD</p><div className="mt-2 h-px bg-ink/20"/></div>
      <div className="archive-object absolute left-[44%] top-32 h-8 w-[22%] bg-dusty-yellow px-2 py-1 shadow-md border border-ink/15" style={movement('-3deg', '2px', '-9px')}><p className="label-mono text-[0.48rem]">ADMIT ONE · TICKET</p></div>
      <div className="archive-object absolute right-[2%] top-36 h-16 w-16 rounded-full bg-archive-fg shadow-xl border-[7px] border-archive-fg" style={movement('0deg', '7px', '-6px')}><div className="h-full w-full rounded-full border border-ink/30 bg-gradient-to-br from-cyanotype/60 via-paper to-mauve/50 flex items-center justify-center"><span className="h-3 w-3 rounded-full bg-archive-bg"/></div></div>
      <div className="archive-object absolute left-[25%] top-36 h-14 w-24 bg-paper p-2 shadow-md rotate-2" style={movement('2deg', '-3px', '-8px')}><p className="font-hand text-xs leading-tight">handwritten<br/>archive note</p></div>
      <span className="archive-object absolute left-[2%] top-20 h-16 w-5 rounded-full border-2 border-ink/50" style={movement('-9deg', '-2px', '-8px')} aria-label="Paper clip" />
      <span className="archive-object absolute right-[35%] top-5 h-5 w-9 bg-ink/70 shadow-md before:absolute before:left-1 before:-top-3 before:h-3 before:w-1 before:bg-ink/60 after:absolute after:right-1 after:-top-3 after:h-3 after:w-1 after:bg-ink/60" style={movement('2deg', '2px', '-9px')} aria-label="Binder clip" />
    </div>
  );
}
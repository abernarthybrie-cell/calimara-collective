import React from 'react';
import ScanImage from '@/components/ScanImage';

const PHOTOS = [
  { cls: 'left-[22%] top-6 w-[20%] aspect-[3/4]', rot: '-4deg', dx: '-5px', dy: '-10px' },
  { cls: 'left-[41%] top-2 w-[22%] aspect-[4/5]', rot: '2deg', dx: '2px', dy: '-12px' },
  { cls: 'right-[18%] top-8 w-[19%] aspect-[3/4]', rot: '5deg', dx: '6px', dy: '-9px' },
  { cls: 'right-[5%] top-16 w-[18%] aspect-[4/3]', rot: '-2deg', dx: '8px', dy: '-7px' }
];

const move = (rot, dx, dy) => ({ '--rot': rot, '--dx': dx, '--dy': dy });

export default function ArchiveEphemera({ images, issueNumber }) {
  return (
    <div className="absolute inset-x-3 top-5 h-44 z-20" aria-hidden="true">
      <div className="archive-object absolute left-[31%] top-0 w-[38%] h-36 bg-paper border border-ink/20 shadow-xl p-3" style={move('-1deg', '0px', '-8px')}>
        <p className="label-mono text-burgundy">CĂLIMARA · FILE {issueNumber}</p><div className="mt-3 space-y-2"><i className="block h-px bg-ink/20"/><i className="block h-px w-4/5 bg-ink/20"/><i className="block h-px w-2/3 bg-ink/20"/></div>
      </div>
      {PHOTOS.map((photo, i) => (
        <div key={i} className={`archive-object absolute ${photo.cls} shadow-xl bg-paper`} style={move(photo.rot, photo.dx, photo.dy)}>
          <ScanImage src={images[i]} alt="" label="PHOTO PLACEHOLDER" className="w-full h-full" fittingType="fill" />
        </div>
      ))}
      <div className="archive-object absolute left-[3%] top-12 w-[15%] h-28 bg-linen text-ink shadow-lg p-2 border-t border-dashed border-ink/30" style={move('-5deg', '-7px', '-8px')}><p className="label-mono text-[0.48rem]">RECEIPT</p><div className="mt-2 border-y border-dashed border-ink/25 py-1 font-mono text-[0.45rem]">ARCHIVE<br/>PAPER<br/>INK</div></div>
      <div className="archive-object absolute left-[13%] top-24 w-[17%] h-14 bg-dusty-yellow text-paper shadow-lg p-2" style={move('3deg', '-4px', '-6px')}><p className="label-mono text-[0.48rem]">ADMIT ONE</p><p className="font-mono text-[0.45rem] mt-1">TICKET · {issueNumber}</p></div>
      <div className="archive-object absolute right-[1%] top-3 w-20 h-20 rounded-full border-[9px] border-archive-muted/80 bg-archive-fg/70 shadow-xl" style={move('0deg', '8px', '-11px')}><div className="absolute inset-[22%] rounded-full bg-archive-bg border-2 border-archive-fg/50"/><span className="absolute inset-x-0 bottom-1 text-center label-mono text-[0.38rem] text-ink">CD</span></div>
      <div className="archive-object absolute right-[25%] top-24 w-24 h-16 bg-paper-deep text-ink shadow-lg p-2 border border-ink/15" style={move('4deg', '5px', '-6px')}><p className="font-hand text-sm leading-none">a note from<br/>the archive</p></div>
      <div className="archive-object absolute left-[8%] top-3 w-5 h-12 rounded-full border-2 border-ink/60" style={move('-8deg', '-2px', '-7px')}/>
      <div className="archive-object absolute right-[12%] top-20 w-7 h-5 bg-ink shadow-md before:absolute before:left-1 before:right-1 before:-top-3 before:h-4 before:border-x before:border-ink" style={move('5deg', '5px', '-7px')}/>
    </div>
  );
}
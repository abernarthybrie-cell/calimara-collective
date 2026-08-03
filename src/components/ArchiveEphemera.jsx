import React from 'react';
import ScanImage from '@/components/ScanImage';

const OBJECTS = [
  { label: 'UPLOAD PHOTO – 2:3', cls: 'left-[2%] top-10 w-[20%] aspect-[2/3]', rot: '-4deg', hoverRot: '-5.2deg', dx: '-3px', dy: '-8px' },
  { label: 'UPLOAD PHOTO – 3:2', cls: 'left-[19%] top-16 w-[25%] aspect-[3/2]', rot: '2deg', hoverRot: '3.4deg', dx: '2px', dy: '-6px' },
  { label: 'UPLOAD PHOTO – 4:5', cls: 'right-[25%] top-9 w-[20%] aspect-[4/5]', rot: '-2deg', hoverRot: '-0.7deg', dx: '3px', dy: '-9px' },
  { label: 'UPLOAD PHOTO – 3:2', cls: 'right-[2%] top-16 w-[24%] aspect-[3/2]', rot: '3deg', hoverRot: '1.6deg', dx: '4px', dy: '-7px' },
  { label: 'DECORATIVE FILE', cls: 'left-[31%] top-1 w-[38%] aspect-[4/3]', rot: '1deg', hoverRot: '-0.5deg', dx: '1px', dy: '-10px' },
  { label: 'RECEIPT PLACEHOLDER', cls: 'left-[7%] top-28 w-[14%] aspect-[1/2]', rot: '-2deg', hoverRot: '-0.8deg', dx: '-2px', dy: '-5px' },
  { label: 'POSTCARD PLACEHOLDER', cls: 'right-[9%] top-28 w-[25%] aspect-[3/2]', rot: '3deg', hoverRot: '4.2deg', dx: '4px', dy: '-8px' },
  { label: 'TICKET PLACEHOLDER', cls: 'left-[43%] top-32 w-[22%] aspect-[3/1]', rot: '-3deg', hoverRot: '-4.1deg', dx: '2px', dy: '-4px' },
  { label: 'HANDWRITTEN NOTE', cls: 'left-[24%] top-36 w-[22%] aspect-[3/2]', rot: '2deg', hoverRot: '0.7deg', dx: '-3px', dy: '-7px' },
  { label: 'TYPED DOCUMENT', cls: 'right-[31%] top-20 w-[18%] aspect-[3/4]', rot: '-1deg', hoverRot: '0.6deg', dx: '3px', dy: '-6px' }
];

export default function ArchiveEphemera({ images = [], issueNumber }) {
  return (
    <div className="absolute inset-0" aria-label={`Replaceable contents of issue ${issueNumber}`}>
      {OBJECTS.map((item, index) => (
        <div
          key={item.label}
          className={`archive-object absolute overflow-hidden border border-ink/15 bg-paper shadow-lg ${item.cls}`}
          style={{ '--rot': item.rot, '--hover-rot': item.hoverRot, '--dx': item.dx, '--dy': item.dy, '--object-z': index === 4 ? 1 : index + 2 }}
        >
          <ScanImage
            src={images[index]}
            alt={`${item.label} for issue ${issueNumber}`}
            label={item.label}
            className="h-full w-full"
            fittingType="fill"
          />
        </div>
      ))}
    </div>
  );
}
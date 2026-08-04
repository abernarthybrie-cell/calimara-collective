import React from 'react';
import { motion } from 'framer-motion';
import PageFace from '@/components/flipbook/PageFace';

const TURN_DURATION = 0.48;
const EASE = [0.4, 0, 0.2, 1];

export default function TurningPage({ turn, onDone, singlePage = false }) {
  const { dir, side, front, back } = turn;
  const origin = side === 'right' ? 'left center' : 'right center';
  const position = singlePage ? 'left-0' : side === 'right' ? 'left-1/2' : 'left-0';

  return (
    <div className={`absolute top-0 ${position} w-[88vw] md:w-[46vw] max-w-[540px] aspect-[210/297] z-30 pointer-events-none`} style={{ perspective: 2200 }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transformOrigin: origin, willChange: 'transform' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: dir === 1 ? -180 : 180 }}
        transition={{ duration: TURN_DURATION, ease: EASE }}
        onAnimationComplete={onDone}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <PageFace {...front} />
        </div>
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <PageFace {...back} />
        </div>
      </motion.div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import CurlStrip from '@/components/flipbook/CurlStrip';

const STRIPS = 7;
const TURN_DURATION = 0.9;
const CURL_DURATION = 0.82;
const EASE = [0.42, 0, 0.18, 1];

export default function TurningPage({ turn, onDone, singlePage = false }) {
  const { dir, side, front, back } = turn;
  const origin = side === 'right' ? '0% 50%' : '100% 50%';
  const position = singlePage ? 'left-0' : side === 'right' ? 'left-1/2' : 'left-0';

  return (
    <div className={`absolute top-0 ${position} w-[88vw] md:w-[46vw] max-w-[540px] aspect-[210/297] z-30 pointer-events-none`} style={{ transformStyle: 'preserve-3d' }}>
      <motion.div
        className={`absolute inset-y-[2%] ${side === 'right' ? 'left-0' : 'right-0'} w-[92%] bg-black/35 blur-xl`}
        style={{ transformOrigin: origin }}
        initial={{ opacity: 0, scaleX: .15 }} animate={{ opacity: [0, .5, .22, 0], scaleX: [.15, .8, .55, .12] }}
        transition={{ duration: TURN_DURATION, ease: EASE }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transformOrigin: origin }}
        initial={{ rotateY: 0 }} animate={{ rotateY: dir === 1 ? -180 : 180 }}
        transition={{ duration: TURN_DURATION, ease: EASE }} onAnimationComplete={onDone}
      >
        {Array.from({ length: STRIPS }, (_, index) => (
          <CurlStrip key={index} index={index} count={STRIPS} dir={dir} front={front} back={back} duration={CURL_DURATION} ease={EASE} />
        ))}
      </motion.div>
    </div>
  );
}
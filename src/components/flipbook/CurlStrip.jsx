import React from 'react';
import { motion } from 'framer-motion';
import PageFace from '@/components/flipbook/PageFace';

export default function CurlStrip({ index, count, dir, front, back, duration, ease }) {
  const width = 100 / count;
  const curl = dir === 1 ? -(5 + index * 0.9) : 5 + (count - index) * 0.9;
  const pageStyle = { width: `${count * 100}%`, left: `${-index * 100}%` };
  const shadeSide = dir === 1 ? 'right' : 'left';

  return (
    <motion.div
      className="absolute top-0 h-full overflow-hidden"
      style={{ left: `${index * width}%`, width: `${width + 0.12}%`, transformStyle: 'preserve-3d', transformOrigin: dir === 1 ? 'left center' : 'right center' }}
      initial={{ rotateY: 0 }}
      animate={{ rotateY: [0, curl, 0] }}
      transition={{ duration, ease, times: [0, 0.5, 1], delay: index * 0.012 }}
    >
      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
        <div className="absolute top-0 h-full" style={pageStyle}><PageFace {...front} /></div>
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to ${shadeSide}, transparent 30%, rgba(25,18,12,.35))` }} animate={{ opacity: [0, .72, 0] }} transition={{ duration, ease }} />
      </div>
      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <div className="absolute top-0 h-full" style={pageStyle}><PageFace {...back} /></div>
        <motion.div className="absolute inset-0 pointer-events-none bg-ink/10" animate={{ opacity: [.08, .28, .08] }} transition={{ duration, ease }} />
      </div>
    </motion.div>
  );
}
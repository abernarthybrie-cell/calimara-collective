import React from 'react';
import { Image } from '@/components/ui/image';

const LOGO = 'https://media.calimara.online/images/9e580afcc_Designfrtitlu.png';

export default function LogoMark({ className = '', size = 96, rotate = -2 }) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)`, mixBlendMode: 'multiply' }}
    >
      <Image src={LOGO} alt="Călimara mark" fittingType="fit" className="w-full h-full" loading="lazy" />
    </div>
  );
}
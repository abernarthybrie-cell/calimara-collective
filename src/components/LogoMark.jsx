import React from 'react';
import { Image } from '@/components/ui/image';

const LOGO = 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/9e580afcc_Designfrtitlu.png';

export default function LogoMark({ className = '', size = 96, rotate = -2 }) {
  return (
    <div
      className={`inline-block shadow-md ${className}`}
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}
    >
      <Image src={LOGO} alt="Călimara mark" fittingType="fill" className="w-full h-full" loading="lazy" />
    </div>
  );
}
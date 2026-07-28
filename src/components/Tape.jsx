import React from 'react';

export default function Tape({ className = '', rotate = '-rotate-3', children }) {
  return (
    <span
      aria-hidden={children ? false : true}
      className={`tape inline-block px-6 py-1 ${rotate} ${className}`}
    >
      {children}
    </span>
  );
}
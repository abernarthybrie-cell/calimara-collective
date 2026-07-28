import React from 'react';

export default function Stamp({ children, className = '', rotate = '-rotate-6' }) {
  return <span className={`stamp ${rotate} ${className}`}>{children}</span>;
}
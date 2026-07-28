import React from 'react';

export default function ArchiveLabel({ children, className = '' }) {
  return <span className={`label-mono text-ink-soft ${className}`}>{children}</span>;
}
import React, { useEffect, useState } from 'react';
import { db } from '@/api/client';
import { formatDate } from '@/lib/calimara';
import Stamp from '@/components/Stamp';

const IMP = { normal: 'text-archive-muted', important: 'text-dusty-yellow', urgent: 'text-faded-red' };
const BORDER = { normal: 'border-archive-line', important: 'border-dusty-yellow', urgent: 'border-faded-red' };

export default function Notices() {
  const [items, setItems] = useState([]);
  useEffect(() => { db.entities.TeamNotice.list('-created_date', 100).then(setItems).catch(() => {}); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— TEAM NOTICES —</p>
        <h1 className="font-heading text-5xl mt-2">Notices</h1>
        <p className="font-body text-archive-fg/70 mt-1">Posted by editors. Newest first.</p>
      </div>
      {items.length === 0 && <p className="font-body text-archive-muted">No notices yet. Post one through the CMS.</p>}
      <div className="space-y-4">
        {items.map((n) => (
          <article key={n.id} className={`border-l-2 ${BORDER[n.importance] || 'border-archive-line'} bg-archive-bg2 p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading text-2xl">{n.title}</h3>
              <Stamp className={IMP[n.importance] || 'text-archive-muted'}>{(n.importance || 'normal').toUpperCase()}</Stamp>
            </div>
            <p className="label-mono text-cyanotype mt-1">
              {formatDate(n.date)}{n.author ? ` · ${n.author}` : ''}{n.related_issue_number ? ` · ISSUE ${String(n.related_issue_number).padStart(2, '0')}` : ''}
            </p>
            <p className="font-body text-archive-fg/80 mt-3 whitespace-pre-line">{n.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
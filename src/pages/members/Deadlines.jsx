import React, { useEffect, useState } from 'react';
import { db } from '@/api/client';
import { formatDate } from '@/lib/calimara';
import Stamp from '@/components/Stamp';

const STATUS_COLOR = {
  upcoming: 'text-cyanotype',
  due_soon: 'text-dusty-yellow',
  submitted: 'text-archive-muted',
  completed: 'text-forest',
};

export default function Deadlines() {
  const [items, setItems] = useState([]);
  useEffect(() => { db.entities.Deadline.list('date', 200).then(setItems).catch(() => {}); }, []);
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— EDITORIAL PLANNING BOARD —</p>
        <h1 className="font-heading text-5xl mt-2">Deadlines</h1>
        <p className="font-body text-archive-fg/70 mt-1">What's due, and when.</p>
      </div>
      {sorted.length === 0 && <p className="font-body text-archive-muted">No deadlines recorded yet. Add them in the CMS.</p>}
      <div className="border-t border-archive-line">
        {sorted.map((d) => (
          <div key={d.id} className="grid grid-cols-12 gap-3 items-baseline border-b border-archive-line py-4">
            <div className="col-span-12 sm:col-span-3 label-mono text-cyanotype">{formatDate(d.date)}</div>
            <div className="col-span-12 sm:col-span-6">
              <p className="font-heading text-2xl">{d.title}</p>
              {d.task && <p className="font-body text-sm text-archive-fg/70 mt-1">{d.task}</p>}
            </div>
            <div className="col-span-6 sm:col-span-2 label-mono text-archive-muted">
              {d.issue_number ? `ISSUE ${String(d.issue_number).padStart(2, '0')}` : '—'}
              {d.responsible_person && <div className="text-archive-fg/50 mt-1 normal-case font-body text-sm">{d.responsible_person}</div>}
            </div>
            <div className="col-span-6 sm:col-span-1 text-right">
              <Stamp className={STATUS_COLOR[d.status] || 'text-archive-muted'}>{(d.status || 'upcoming').replace('_', ' ')}</Stamp>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
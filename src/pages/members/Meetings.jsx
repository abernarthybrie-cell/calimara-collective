import React, { useEffect, useState } from 'react';
import { db } from '@/api/client';
import { formatDate } from '@/lib/calimara';
import { Video, MapPin } from 'lucide-react';

export default function Meetings() {
  const [items, setItems] = useState([]);
  useEffect(() => { db.entities.Meeting.list('date', 200).then(setItems).catch(() => {}); }, []);
  const today = new Date();
  const upcoming = items.filter((m) => new Date(m.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = items.filter((m) => new Date(m.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— MEETING CALENDAR —</p>
        <h1 className="font-heading text-5xl mt-2">Meetings</h1>
      </div>
      <Section title="UPCOMING" items={upcoming} />
      <Section title="PAST" items={past} />
    </div>
  );
}

function Section({ title, items }) {
  if (!items.length) return null;
  return (
    <section>
      <p className="label-mono text-cyanotype mb-3">— {title} —</p>
      <div className="space-y-px bg-archive-line">
        {items.map((m) => (
          <div key={m.id} className="bg-archive-bg2 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-2xl">{m.title}</h3>
              <p className="label-mono text-cyanotype">{formatDate(m.date)}{m.time ? ` · ${m.time}` : ''}</p>
            </div>
            {m.related_issue_number && <p className="label-mono text-dusty-yellow mt-1">ISSUE {String(m.related_issue_number).padStart(2, '0')}</p>}
            {m.location && <p className="font-body text-sm text-archive-fg/70 mt-2 flex items-center gap-1"><MapPin size={13}/> {m.location}</p>}
            {m.online_link && <a href={m.online_link} target="_blank" rel="noreferrer" className="label-mono text-cyanotype hover:text-dusty-yellow mt-1 inline-flex items-center gap-1 focus-ring"><Video size={13}/> JOIN ONLINE</a>}
            {m.agenda && <p className="font-body text-archive-fg/80 mt-3 whitespace-pre-line">{m.agenda}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
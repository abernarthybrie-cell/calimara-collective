import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/api/client';
import { ADMIN_NAV } from '@/pages/admin/resources';

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      db.entities.Issue.list('-number', 100),
      db.entities.Story.list(500),
      db.entities.Person.list(200),
      db.entities.Submission.list('-created_date', 200).catch(() => []),
      db.entities.OpenCall.list('order', 50),
    ]).then(([issues, stories, people, submissions, calls]) => {
      setStats({
        issues: issues.length,
        published: issues.filter((i) => i.status === 'published').length,
        stories: stories.length,
        people: people.length,
        submissions: submissions.length,
        newSubs: submissions.filter((s) => s.status === 'new').length,
        openCalls: calls.filter((c) => c.status === 'open' || c.status === 'closing_soon').length,
      });
    }).catch(() => setStats({}));
  }, []);

  const shortcuts = ADMIN_NAV.filter((n) => n.to !== '/admin' && !n.to.startsWith('/members'));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— ADMIN PORTAL —</p>
        <h1 className="font-heading text-5xl mt-2">Manage Călimara</h1>
        <p className="font-body text-archive-fg/70 mt-2 max-w-2xl">
          Edit public magazine content, triage submissions, and keep team ops in sync.
          The Editorial Room stays for day-to-day reading and chat — this portal is where records are authored.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-archive-line border border-archive-line">
        {[
          ['Issues', stats?.issues, '/admin/issues'],
          ['Published', stats?.published, '/admin/issues'],
          ['Stories', stats?.stories, '/admin/stories'],
          ['People', stats?.people, '/admin/people'],
          ['New inbox', stats?.newSubs, '/members/submissions'],
          ['Open calls', stats?.openCalls, '/admin/open-calls'],
        ].map(([label, value, to]) => (
          <Link key={label} to={to} className="bg-archive-bg2 p-4 hover:bg-archive-bg focus-ring">
            <p className="font-heading text-3xl">{value ?? '—'}</p>
            <p className="label-mono text-archive-muted mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <section>
        <p className="label-mono text-archive-muted mb-3">JUMP TO</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="border border-archive-line bg-archive-bg2 px-4 py-3 label-mono hover:border-dusty-yellow hover:text-dusty-yellow focus-ring"
            >
              {item.label.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

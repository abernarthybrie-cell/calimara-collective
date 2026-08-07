import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '@/api/client';
import { formatDate } from '@/lib/calimara';
import { FileText, ArrowUpRight } from 'lucide-react';

export default function IssueWorkspace() {
  const { issueSlug } = useParams();
  const [issue, setIssue] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const issues = await db.entities.Issue.list('-number', 100);
        const found = issues.find((i) => i.slug === issueSlug);
        if (!found) { if (alive) setLoading(false); return; }
        setIssue(found);
        const [d, m, n] = await Promise.all([
          db.entities.Deadline.list('date', 100),
          db.entities.Meeting.list('date', 100),
          db.entities.TeamNotice.list('-created_date', 50),
        ]);
        if (!alive) return;
        setDeadlines(d.filter((x) => x.issue_number === found.number));
        setMeetings(m.filter((x) => x.related_issue_number === found.number));
        setNotices(n.filter((x) => x.related_issue_number === found.number));
      } catch {} finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [issueSlug]);

  if (loading) return <p className="font-body text-archive-muted">Opening the workspace…</p>;
  if (!issue) return <p className="font-body text-archive-muted">Workspace not found.</p>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— ISSUE {String(issue.number).padStart(2, '0')} · EDITORIAL WORKSPACE —</p>
        <h1 className="font-heading text-5xl mt-2">{issue.title}</h1>
        <p className="label-mono text-cyanotype mt-1">THEME · {issue.theme || '—'}</p>
        <p className="label-mono text-archive-muted mt-2">PRIVATE — planning the magazine. <Link to={`/archive/${issue.slug}`} className="underline hover:text-dusty-yellow">View the published issue →</Link></p>
      </div>

      <section className="border border-archive-line bg-archive-bg2 p-5">
        <p className="label-mono text-dusty-yellow">EDITORIAL DOCUMENT</p>
        {issue.editorial_instructions && <p className="font-body text-archive-fg/80 mt-2 max-w-2xl whitespace-pre-line">{issue.editorial_instructions}</p>}
        {issue.google_doc_url ? (
          <a href={issue.google_doc_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 bg-cyanotype text-paper px-4 py-2.5 label-mono hover:bg-dusty-yellow hover:text-ink focus-ring"><FileText size={14}/> OPEN GOOGLE DOC <ArrowUpRight size={13}/></a>
        ) : <p className="font-body text-archive-muted mt-3">No Google Doc linked yet. Add the URL in the Issue record.</p>}
      </section>

      <div className="grid md:grid-cols-3 gap-px bg-archive-line">
        <div className="bg-archive-bg2 p-4">
          <p className="label-mono text-cyanotype">DEADLINES · {deadlines.length}</p>
          <ul className="mt-2 space-y-1">
            {deadlines.length ? deadlines.map((d) => <li key={d.id} className="font-body text-sm text-archive-fg/80">{formatDate(d.date)} — {d.title}</li>) : <li className="font-body text-sm text-archive-muted">None.</li>}
          </ul>
        </div>
        <div className="bg-archive-bg2 p-4">
          <p className="label-mono text-cyanotype">MEETINGS · {meetings.length}</p>
          <ul className="mt-2 space-y-1">
            {meetings.length ? meetings.map((m) => <li key={m.id} className="font-body text-sm text-archive-fg/80">{formatDate(m.date)} — {m.title}</li>) : <li className="font-body text-sm text-archive-muted">None.</li>}
          </ul>
        </div>
        <div className="bg-archive-bg2 p-4">
          <p className="label-mono text-cyanotype">NOTICES · {notices.length}</p>
          <ul className="mt-2 space-y-1">
            {notices.length ? notices.map((n) => <li key={n.id} className="font-body text-sm text-archive-fg/80">{n.title}</li>) : <li className="font-body text-sm text-archive-muted">None.</li>}
          </ul>
        </div>
      </div>

      {issue.contributor_names && issue.contributor_names.length > 0 && (
        <section>
          <p className="label-mono text-dusty-yellow mb-2">CONTRIBUTORS</p>
          <div className="flex flex-wrap gap-2">{issue.contributor_names.map((c, i) => <span key={i} className="stamp text-cyanotype">{c}</span>)}</div>
        </section>
      )}
    </div>
  );
}
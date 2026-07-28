import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CalendarClock, Users, Bell, MessageSquare, FileText, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/calimara';

export default function Dashboard() {
  const { user, notion } = useOutletContext() || {};
  const [issues, setIssues] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Issue.list('-number', 50),
      base44.entities.Deadline.list('date', 100),
      base44.entities.Meeting.list('date', 100),
      base44.entities.TeamNotice.list('-created_date', 50),
    ]).then(([i, d, m, n]) => { setIssues(i); setDeadlines(d); setMeetings(m); setNotices(n); }).catch(() => {});
  }, []);

  const name = user?.full_name || (user?.email ? user.email.split('@')[0] : 'friend');
  const current = issues.find((i) => i.current_issue) || issues[0];
  const today = new Date();
  const nextDeadline = deadlines.filter((d) => new Date(d.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const nextMeeting = meetings.filter((m) => new Date(m.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const latestNotice = notices[0];

  const quick = [
    { to: '/members/deadlines', label: 'Deadlines', icon: CalendarClock },
    { to: '/members/meetings', label: 'Meeting Calendar', icon: Users },
    { to: '/members/notices', label: 'Team Notices', icon: Bell },
    { to: '/members/directory', label: 'Member Directory', icon: BookOpen },
    { to: '/members/chat', label: 'Team Chat', icon: MessageSquare },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— THE CĂLIMARA DESK —</p>
        <h1 className="font-heading text-5xl md:text-6xl mt-2">Welcome back, {name}.</h1>
        <p className="font-body text-archive-fg/70 mt-2 max-w-xl">The public archive is out front. In here is where the next issue is being made.</p>
      </div>

      {current && (
        <section className="border border-archive-line bg-archive-bg2 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="label-mono text-dusty-yellow">CURRENT ISSUE · ISSUE {String(current.number).padStart(2, '0')}</p>
            <span className="label-mono text-archive-muted">{current.status}</span>
          </div>
          <h2 className="font-heading text-4xl mt-2">{current.title}</h2>
          <p className="label-mono text-cyanotype mt-1">THEME · {current.theme || '—'}</p>
          {current.editorial_instructions && <p className="font-body text-archive-fg/80 mt-3 max-w-2xl whitespace-pre-line">{current.editorial_instructions}</p>}
          <div className="flex flex-wrap gap-3 mt-5">
            {current.google_doc_url && (
              <a href={current.google_doc_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-cyanotype text-paper px-4 py-2.5 label-mono hover:bg-dusty-yellow hover:text-ink focus-ring"><FileText size={14}/> OPEN GOOGLE DOC</a>
            )}
            {notion && (
              <a href={notion} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-archive-line px-4 py-2.5 label-mono hover:border-dusty-yellow focus-ring"><ExternalLink size={14}/> OPEN NOTION</a>
            )}
            <Link to="/members/chat" className="flex items-center gap-2 border border-archive-line px-4 py-2.5 label-mono hover:border-dusty-yellow focus-ring"><MessageSquare size={14}/> OPEN TEAM CHAT</Link>
            <Link to={`/members/issue/${current.slug}`} className="flex items-center gap-2 label-mono text-dusty-yellow hover:underline focus-ring">ISSUE WORKSPACE <ArrowRight size={14}/></Link>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-px bg-archive-line">
        <div className="bg-archive-bg2 p-5">
          <p className="label-mono text-dusty-yellow flex items-center gap-1"><CalendarClock size={13}/> NEXT DEADLINE</p>
          {nextDeadline ? (
            <>
              <p className="font-heading text-2xl mt-2">{nextDeadline.title}</p>
              <p className="label-mono text-cyanotype mt-1">{formatDate(nextDeadline.date)}</p>
              {nextDeadline.task && <p className="font-body text-sm text-archive-fg/70 mt-2">{nextDeadline.task}</p>}
            </>
          ) : <p className="font-body text-archive-muted mt-2">No deadlines on the board.</p>}
          <Link to="/members/deadlines" className="label-mono text-archive-muted hover:text-dusty-yellow mt-3 inline-block">ALL DEADLINES →</Link>
        </div>
        <div className="bg-archive-bg2 p-5">
          <p className="label-mono text-dusty-yellow flex items-center gap-1"><Users size={13}/> NEXT MEETING</p>
          {nextMeeting ? (
            <>
              <p className="font-heading text-2xl mt-2">{nextMeeting.title}</p>
              <p className="label-mono text-cyanotype mt-1">{formatDate(nextMeeting.date)}{nextMeeting.time ? ` · ${nextMeeting.time}` : ''}</p>
              {nextMeeting.location && <p className="font-body text-sm text-archive-fg/70 mt-2">{nextMeeting.location}</p>}
            </>
          ) : <p className="font-body text-archive-muted mt-2">No meetings scheduled.</p>}
          <Link to="/members/meetings" className="label-mono text-archive-muted hover:text-dusty-yellow mt-3 inline-block">ALL MEETINGS →</Link>
        </div>
        <div className="bg-archive-bg2 p-5">
          <p className="label-mono text-dusty-yellow flex items-center gap-1"><Bell size={13}/> LATEST NOTICE</p>
          {latestNotice ? (
            <>
              <p className="font-heading text-2xl mt-2">{latestNotice.title}</p>
              <p className="label-mono text-cyanotype mt-1">{formatDate(latestNotice.date)}{latestNotice.author ? ` · ${latestNotice.author}` : ''}</p>
              <p className="font-body text-sm text-archive-fg/70 mt-2 line-clamp-3">{latestNotice.content}</p>
            </>
          ) : <p className="font-body text-archive-muted mt-2">No notices posted.</p>}
          <Link to="/members/notices" className="label-mono text-archive-muted hover:text-dusty-yellow mt-3 inline-block">ALL NOTICES →</Link>
        </div>
      </div>

      <section>
        <p className="label-mono text-dusty-yellow mb-3">— QUICK ACCESS —</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-archive-line">
          {quick.map((q) => (
            <Link key={q.to} to={q.to} className="bg-archive-bg2 p-5 hover:bg-archive-bg focus-ring flex flex-col gap-2">
              <q.icon size={18} className="text-cyanotype"/> <span className="label-mono">{q.label}</span>
            </Link>
          ))}
          {notion && (
            <a href={notion} target="_blank" rel="noreferrer" className="bg-archive-bg2 p-5 hover:bg-archive-bg focus-ring flex flex-col gap-2">
              <ExternalLink size={18} className="text-cyanotype"/> <span className="label-mono">Notion Workspace</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
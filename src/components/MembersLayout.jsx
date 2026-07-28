import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, Users, Bell, MessageSquare, BookOpen, LogOut, ExternalLink, Menu, X, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAV = [
  { to: '/members', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/members/deadlines', label: 'Deadlines', icon: CalendarClock },
  { to: '/members/meetings', label: 'Meetings', icon: Users },
  { to: '/members/notices', label: 'Team Notices', icon: Bell },
  { to: '/members/directory', label: 'Directory', icon: BookOpen },
  { to: '/members/chat', label: 'Team Chat', icon: MessageSquare },
];

export default function MembersLayout() {
  const [user, setUser] = useState(null);
  const [notion, setNotion] = useState('');
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.SiteSettings.list().then((r) => setNotion(r[0]?.notion_url || '')).catch(() => {});
  }, []);
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const logout = () => base44.auth.logout('/');

  const name = user?.full_name || (user?.email ? user.email.split('@')[0] : 'member');

  return (
    <div className="min-h-screen bg-archive-bg text-archive-fg">
      <header className="fixed top-0 inset-x-0 z-40 bg-archive-bg2 border-b border-archive-line h-14 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="md:hidden focus-ring p-1 -ml-1" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div className="leading-none">
            <p className="label-mono text-dusty-yellow">THE EDITORIAL ROOM</p>
            <p className="label-mono text-archive-muted text-[0.55rem] mt-0.5">CĂLIMARA · BACKSTAGE</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="label-mono text-archive-muted hidden sm:block">SIGNED IN · {name}</span>
          <Link to="/" className="label-mono text-archive-fg hover:text-dusty-yellow flex items-center gap-1 focus-ring">
            <ArrowLeft size={12}/> PUBLIC
          </Link>
          <button onClick={logout} className="label-mono text-archive-muted hover:text-faded-red flex items-center gap-1 focus-ring">
            <LogOut size={12}/> EXIT
          </button>
        </div>
      </header>

      <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-60 border-r border-archive-line bg-archive-bg2 py-6 px-4 z-30 overflow-y-auto">
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 label-mono focus-ring transition-colors border-l-2 ${isActive ? 'bg-archive-bg text-dusty-yellow border-dusty-yellow' : 'text-archive-fg/70 hover:text-dusty-yellow border-transparent'}`}>
              <n.icon size={15}/> {n.label.toUpperCase()}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6">
          <p className="label-mono text-archive-muted mb-1">ISSUE WORKSPACES</p>
          <IssueWorkspaces />
        </div>
        <div className="mt-auto pt-6 space-y-2">
          {notion && (
            <a href={notion} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2.5 label-mono text-cyanotype hover:text-dusty-yellow focus-ring">
              <ExternalLink size={13}/> OPEN NOTION
            </a>
          )}
        </div>
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-archive-bg2 z-30 overflow-y-auto">
          <nav className="flex flex-col px-4 py-6 gap-0.5">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-3 label-mono ${isActive ? 'text-dusty-yellow' : 'text-archive-fg/70'}`}>
                <n.icon size={16}/> {n.label.toUpperCase()}
              </NavLink>
            ))}
            <p className="label-mono text-archive-muted mt-4 mb-1">ISSUE WORKSPACES</p>
            <IssueWorkspaces />
            {notion && (
              <a href={notion} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-3 label-mono text-cyanotype"><ExternalLink size={14}/> OPEN NOTION</a>
            )}
          </nav>
        </div>
      )}

      <main className="pt-14 md:pl-60 min-h-screen">
        <div className="px-4 sm:px-8 py-8 max-w-[1100px]">
          <Outlet context={{ user, notion }} />
        </div>
      </main>
    </div>
  );
}

function IssueWorkspaces() {
  const [issues, setIssues] = useState([]);
  useEffect(() => { base44.entities.Issue.list('-number', 50).then(setIssues).catch(() => {}); }, []);
  return (
    <div className="space-y-0.5">
      {issues.length === 0 && <p className="label-mono text-archive-muted">No issues yet.</p>}
      {issues.map((i) => (
        <Link key={i.id} to={`/members/issue/${i.slug}`} className="block px-3 py-1.5 label-mono text-archive-fg/60 hover:text-dusty-yellow focus-ring">
          ISSUE {String(i.number).padStart(2, '0')}{i.current_issue ? ' · CURRENT' : ''}
        </Link>
      ))}
    </div>
  );
}
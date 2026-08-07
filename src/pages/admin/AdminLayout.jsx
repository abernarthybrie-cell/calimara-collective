import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Users, Inbox, Settings, Image, ShoppingBag,
  HelpCircle, Megaphone, Clock, Library, Tags, UserCog, CalendarClock, Bell,
  LogOut, ArrowLeft, Menu, X, Layers, Feather
} from 'lucide-react';
import { db } from '@/api/client';
import { ADMIN_NAV } from '@/pages/admin/resources';

const ICONS = {
  LayoutDashboard, BookOpen, FileText, Users, Inbox, Settings, Image, ShoppingBag,
  HelpCircle, Megaphone, Clock, Library, Tags, UserCog, CalendarClock, Bell, Layers, Feather
};

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {});
  }, []);
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const name = user?.full_name || user?.email?.split('@')[0] || 'staff';
  const isAdmin = user?.role === 'admin';

  const nav = ADMIN_NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="admin-portal min-h-screen bg-archive-bg text-archive-fg">
      <header className="fixed top-0 inset-x-0 z-40 bg-archive-bg2 border-b border-archive-line h-14 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="md:hidden focus-ring p-1 -ml-1" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="leading-none">
            <p className="label-mono text-dusty-yellow">ADMIN PORTAL</p>
            <p className="label-mono text-archive-muted text-[0.55rem] mt-0.5">CĂLIMARA · CONTENT &amp; USERS</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="label-mono text-archive-muted hidden sm:block">
            {name} · {String(user?.role || '').toUpperCase()}
          </span>
          <Link to="/members" className="label-mono text-archive-fg hover:text-dusty-yellow flex items-center gap-1 focus-ring">
            <ArrowLeft size={12} /> EDITORIAL ROOM
          </Link>
          <Link to="/" className="label-mono text-archive-muted hover:text-dusty-yellow focus-ring hidden sm:inline">
            PUBLIC
          </Link>
          <button type="button" onClick={() => db.auth.logout('/')} className="label-mono text-archive-muted hover:text-faded-red flex items-center gap-1 focus-ring">
            <LogOut size={12} /> EXIT
          </button>
        </div>
      </header>

      <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-64 border-r border-archive-line bg-archive-bg2 py-5 px-3 z-30 overflow-y-auto">
        <AdminNav items={nav} />
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-archive-bg2 z-30 overflow-y-auto">
          <div className="px-3 py-5"><AdminNav items={nav} /></div>
        </div>
      )}

      <main className="pt-14 md:pl-64 min-h-screen">
        <div className="px-4 sm:px-8 py-8 max-w-[1200px]">
          <Outlet context={{ user, isAdmin }} />
        </div>
      </main>
    </div>
  );
}

function AdminNav({ items }) {
  let lastGroup = null;
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = ICONS[item.icon] || FileText;
        const showGroup = item.group && item.group !== lastGroup;
        lastGroup = item.group;
        return (
          <React.Fragment key={item.to}>
            {showGroup && (
              <p className="label-mono text-archive-muted mt-4 mb-1 px-3 first:mt-0">{item.group}</p>
            )}
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 label-mono focus-ring transition-colors border-l-2 ${
                  isActive
                    ? 'bg-archive-bg text-dusty-yellow border-dusty-yellow'
                    : 'text-archive-fg/70 hover:text-dusty-yellow border-transparent'
                }`
              }
            >
              <Icon size={14} /> {item.label.toUpperCase()}
            </NavLink>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

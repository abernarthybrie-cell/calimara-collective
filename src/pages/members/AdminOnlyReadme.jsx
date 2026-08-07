import React from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import Readme from '@/pages/members/Readme';

/** Ops README is admin-only. */
export default function AdminOnlyReadme() {
  const { user } = useOutletContext() || {};
  if (user && user.role !== 'admin') {
    return <Navigate to="/members" replace />;
  }
  // user may still be loading in layout — show nothing until we know
  if (!user) {
    return <p className="label-mono text-archive-muted">loading…</p>;
  }
  return <Readme />;
}

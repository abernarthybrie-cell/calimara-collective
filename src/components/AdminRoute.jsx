import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-archive-bg">
    <div className="w-8 h-8 border-4 border-archive-line border-t-dusty-yellow rounded-full animate-spin" />
  </div>
);

/** Admin portal — admin role only. Editors and users are sent to the Editorial Room. */
export default function AdminRoute() {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth || !authChecked) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login?returnTo=/admin" replace />;
  if (user?.role !== 'admin') return <Navigate to="/members" replace />;

  return <Outlet />;
}

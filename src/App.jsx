import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Archive from '@/pages/Archive';
import IssueDetail from '@/pages/IssueDetail';
import StoryDetail from '@/pages/StoryDetail';
import People from '@/pages/People';
import PersonDetail from '@/pages/PersonDetail';
import Timeline from '@/pages/Timeline';
import JoinUs from '@/pages/JoinUs';
import Shop from '@/pages/Shop';
import QA from '@/pages/QA';
import ReadingRoom from '@/pages/ReadingRoom';
import Shelf from '@/pages/Shelf';
import ShelfDetail from '@/pages/ShelfDetail';
import Numbers from '@/pages/Numbers';
import Submit from '@/pages/Submit';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import MembersLayout from '@/components/MembersLayout';
import Dashboard from '@/pages/members/Dashboard';
import Deadlines from '@/pages/members/Deadlines';
import Meetings from '@/pages/members/Meetings';
import Notices from '@/pages/members/Notices';
import Directory from '@/pages/members/Directory';
import Chat from '@/pages/members/Chat';
import IssueWorkspace from '@/pages/members/IssueWorkspace';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/archive/issue/:issueSlug" element={<IssueDetail />} />
        <Route path="/archive/issue/:issueSlug/story/:slug" element={<StoryDetail />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/join" element={<JoinUs />} />
        <Route path="/qa" element={<QA />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/reading-room" element={<ReadingRoom />} />
        <Route path="/shelf" element={<Shelf />} />
        <Route path="/shelf/:slug" element={<ShelfDetail />} />
        <Route path="/numbers" element={<Numbers />} />
        <Route path="/submit" element={<Submit />} />
      </Route>

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?returnTo=/members" replace />} />}>
        <Route element={<MembersLayout />}>
          <Route path="/members" element={<Dashboard />} />
          <Route path="/members/deadlines" element={<Deadlines />} />
          <Route path="/members/meetings" element={<Meetings />} />
          <Route path="/members/notices" element={<Notices />} />
          <Route path="/members/directory" element={<Directory />} />
          <Route path="/members/chat" element={<Chat />} />
          <Route path="/members/issue/:issueSlug" element={<IssueWorkspace />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
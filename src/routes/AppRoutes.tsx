import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TutorialsPage from '@/pages/TutorialsPage';
import TutorialDetailsPage from '@/pages/TutorialDetailsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Tutorial browsing/details are public — GET /api/tutorials and
          GET /api/tutorials/:id require no auth on the backend. Only
          write actions (view/like/complete) require a logged-in user,
          which is enforced by the backend itself (401 if no token) and
          reflected in the UI by simply requiring the user be logged in
          to see those buttons do anything meaningful. */}
      <Route path="/tutorials" element={<TutorialsPage />} />
      <Route path="/tutorials/:id" element={<TutorialDetailsPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

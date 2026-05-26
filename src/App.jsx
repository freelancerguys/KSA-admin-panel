import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import PaymentsPage from './pages/PaymentsPage';
import BlogsPage from './pages/BlogsPage';
import AchievementsPage from './pages/AchievementsPage';
import GalleryPage from './pages/GalleryPage';
import ActivitiesPage from './pages/ActivitiesPage';
import SettingsPage from './pages/SettingsPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import ScoresPage from './pages/ScoresPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SessionExpiredDialog from './components/SessionExpiredDialog';

export default function App() {
  return (
    <>
      <SessionExpiredDialog />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="fees" element={<PaymentSettingsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="scores" element={<ScoresPage />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

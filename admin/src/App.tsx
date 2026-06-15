import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, adminIdSignal } from './signals/store';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const adminId = adminIdSignal.value;

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated.value && adminId
          ? <Navigate to={`/${adminId}`} replace />
          : <LoginPage />
      } />

      <Route element={<ProtectedRoute />}>
        <Route path="/:adminId" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={
        isAuthenticated.value && adminId
          ? <Navigate to={`/${adminId}`} replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

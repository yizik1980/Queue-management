import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../signals/store';

export default function ProtectedRoute() {
  if (!isAuthenticated.value) return <Navigate to="/login" replace />;
  return <Outlet />;
}

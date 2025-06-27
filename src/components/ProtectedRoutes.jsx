import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { user, hasPermission, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

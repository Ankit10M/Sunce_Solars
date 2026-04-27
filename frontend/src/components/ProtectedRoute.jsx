import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HOME = {
  customer:        '/',
  sales:           '/sales',
  engineer:        '/service',
  service_manager: '/service',
  admin:           '/admin',
};

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if(loading) return null

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = ROLE_HOME[user.role] || '/';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}

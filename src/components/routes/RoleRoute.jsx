import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function RoleRoute({ allowedRole, children }) {
  const { user } = useAuth();

  if (user?.role !== allowedRole) {
    const fallbackPath =
      user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

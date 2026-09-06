import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUserRole,
} from '../features/auth/authSlice';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isLoading       = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role            = useSelector(selectUserRole);

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
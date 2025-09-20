import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '../store';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check user role
  if (allowedRoles && allowedRoles.length > 0) {
    // TODO: Add role checking when user role is available
    // For now, allow all authenticated users
  }

  return <>{children}</>;
};
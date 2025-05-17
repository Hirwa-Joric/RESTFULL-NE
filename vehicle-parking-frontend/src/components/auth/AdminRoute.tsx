import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../../utils/auth';
import LoadingSpinner from '../common/LoadingSpinner';

interface AdminRouteProps {
  redirectPath?: string;
  loading?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({
  redirectPath = '/dashboard',
  loading = false,
}) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const isAdmin = hasRole('admin');
  
  // Show loading state if needed
  if (loading) {
    return <LoadingSpinner message="Checking authorization..." />;
  }
  
  // If not authenticated, redirect to login page
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If not an admin, redirect to the specified path
  if (!isAdmin) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // If user is authenticated and is an admin, render the protected admin route
  return <Outlet />;
};

export default AdminRoute; 
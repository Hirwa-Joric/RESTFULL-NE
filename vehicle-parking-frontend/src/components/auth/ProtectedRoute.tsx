import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../../utils/auth';
import { Box, Typography } from '@mui/material';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  roles?: ('user' | 'admin')[];
  redirectPath?: string;
  loading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  redirectPath = '/login',
  loading = false,
}) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  
  // Show loading state if needed
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  // If not authenticated, redirect to login page
  if (!authenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (roles && roles.length > 0) {
    const hasRequiredRole = hasRole(roles);
    
    if (!hasRequiredRole) {
      // If user is authenticated but doesn't have the required role,
      // redirect to appropriate dashboard based on their role
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 4,
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You do not have permission to access this page.
          </Typography>
        </Box>
      );
    }
  }
  
  // If user is authenticated and has the required role (if specified), render the protected route
  return <Outlet />;
};

export default ProtectedRoute; 
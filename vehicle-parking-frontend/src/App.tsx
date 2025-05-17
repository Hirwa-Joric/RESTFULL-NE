import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from './app/store';
import { fetchCurrentUser } from './features/auth/authSlice';
import { isAuthenticated, hasRole } from './utils/auth';

// Import CSS
import './styles/dashboard.css';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Regular User Pages
import UserDashboardPage from './pages/UserDashboardPage';
import VehicleManagementPage from './pages/VehicleManagementPage';
import RequestParkingPage from './pages/RequestParkingPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminSlotManagementPage from './pages/AdminSlotManagementPage';
import AdminBookingManagementPage from './pages/AdminBookingManagementPage';

// Dashboard Components
import LiveOverview from './features/dashboard/LiveOverview';
import PreviousAnalysis from './features/dashboard/PreviousAnalysis';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    // Try to fetch current user data if token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Function to determine where to redirect the root path based on auth state
  const redirectToAppropriateLocation = () => {
    // Check if we're already in a redirect loop to prevent excessive navigation
    const params = new URLSearchParams(location.search);
    const redirectCount = parseInt(params.get('redirectCount') || '0', 10);
    
    // If we've already redirected more than once, just show login
    if (redirectCount > 1) {
      return <Navigate to="/login" replace />;
    }
    
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    
    // If authenticated, redirect to dashboard for admins, user dashboard for regular users
    if (hasRole('admin')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Increment the redirect count
    const newParams = new URLSearchParams(location.search);
    newParams.set('redirectCount', String(redirectCount + 1));
    
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Root path - redirect based on auth state */}
      <Route path="/" element={redirectToAppropriateLocation()} />
      
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* User Protected Routes */}
      <Route element={<ProtectedRoute roles={['user', 'admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/my-vehicles" element={<VehicleManagementPage />} />
          <Route path="/request-parking" element={<RequestParkingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
      </Route>
      
      {/* Admin Protected Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUserManagementPage />} />
          <Route path="/admin/slots" element={<AdminSlotManagementPage />} />
          <Route path="/admin/bookings" element={<AdminBookingManagementPage />} />
          <Route path="/admin/reports" element={<PreviousAnalysis />} />
          <Route path="/admin/notifications" element={<AdminUserManagementPage />} />
          <Route path="/admin/support" element={<AdminUserManagementPage />} />
        </Route>
      </Route>
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;

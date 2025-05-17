import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { BookOnline, CheckCircle, Timer, History } from '@mui/icons-material';
import BookingRequestsTable from '../features/admin/bookings/BookingRequestsTable';
import ActiveBookingsTable from '../features/admin/bookings/ActiveBookingsTable';
import AllBookingsTable from '../features/admin/bookings/AllBookingsTable';
import api from '../services/api';

const AdminBookingManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    pending: 0,
    active: 0,
    total: 0
  });
  
  useEffect(() => {
    fetchBookingCounts();
  }, []);
  
  const fetchBookingCounts = async () => {
    try {
      setLoading(true);
      // This would ideally be a dedicated API endpoint for dashboard stats
      // For now, we'll fetch counts separately
      
      let pendingCount = 0;
      let activeCount = 0;
      let totalCount = 0;
      
      try {
        const pendingResponse = await api.get('/bookings/admin/pending-approval');
        
        // Process pending bookings
        let pendingBookings = [];
        if (pendingResponse.data) {
          if (Array.isArray(pendingResponse.data)) {
            pendingBookings = pendingResponse.data;
          } else if (pendingResponse.data.bookings && Array.isArray(pendingResponse.data.bookings)) {
            pendingBookings = pendingResponse.data.bookings;
          } else {
            // Try to find any array property in the response
            const potentialArrayProps = Object.keys(pendingResponse.data || {})
              .filter(key => Array.isArray(pendingResponse.data[key]));
            
            if (potentialArrayProps.length > 0) {
              pendingBookings = pendingResponse.data[potentialArrayProps[0]];
            }
          }
        }
        
        pendingCount = Array.isArray(pendingBookings) ? pendingBookings.length : 0;
      } catch (err) {
        console.warn('Error fetching pending booking counts:', err);
        // Don't set the main error state here to allow partial data to display
      }
      
      try {
        const allResponse = await api.get('/bookings/admin/all');
        
        // Process all bookings
        let allBookings = [];
        if (allResponse.data) {
          if (Array.isArray(allResponse.data)) {
            allBookings = allResponse.data;
          } else if (allResponse.data.bookings && Array.isArray(allResponse.data.bookings)) {
            allBookings = allResponse.data.bookings;
          } else {
            // Try to find any array property in the response
            const potentialArrayProps = Object.keys(allResponse.data || {})
              .filter(key => Array.isArray(allResponse.data[key]));
            
            if (potentialArrayProps.length > 0) {
              allBookings = allResponse.data[potentialArrayProps[0]];
            }
          }
        }
        
        // Count active bookings
        const activeBookings = Array.isArray(allBookings) 
          ? allBookings.filter(booking => booking.status === 'active_parking')
          : [];
        
        activeCount = activeBookings.length;
        totalCount = Array.isArray(allBookings) ? allBookings.length : 0;
      } catch (err) {
        console.warn('Error fetching all booking counts:', err);
        // Don't set the main error state here to allow partial data to display
      }
      
      setCounts({
        pending: pendingCount,
        active: activeCount,
        total: totalCount
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching booking counts:', err);
      setError('Failed to load booking statistics');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <BookOnline color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">Booking Management</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3
        }}
      >
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            borderRadius: 2
          }}
        >
          <Timer fontSize="large" />
          <Typography variant="h5" fontWeight="bold" mt={1}>
            {loading ? <CircularProgress size={20} color="inherit" /> : counts.pending}
          </Typography>
          <Typography variant="body2">Pending Requests</Typography>
        </Paper>
        
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'success.light',
            color: 'success.contrastText',
            borderRadius: 2
          }}
        >
          <CheckCircle fontSize="large" />
          <Typography variant="h5" fontWeight="bold" mt={1}>
            {loading ? <CircularProgress size={20} color="inherit" /> : counts.active}
          </Typography>
          <Typography variant="body2">Active Bookings</Typography>
        </Paper>
        
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'info.light',
            color: 'info.contrastText',
            borderRadius: 2
          }}
        >
          <History fontSize="large" />
          <Typography variant="h5" fontWeight="bold" mt={1}>
            {loading ? <CircularProgress size={20} color="inherit" /> : counts.total}
          </Typography>
          <Typography variant="body2">Total Bookings</Typography>
        </Paper>
      </Box>
      
      <Paper sx={{ p: 1, mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary" 
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label="Pending Requests" 
            icon={<Timer />} 
            iconPosition="start"
          />
          <Tab 
            label="Active Bookings" 
            icon={<CheckCircle />} 
            iconPosition="start"
          />
          <Tab 
            label="All Bookings" 
            icon={<History />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && <BookingRequestsTable />}
        {tabValue === 1 && <ActiveBookingsTable />}
        {tabValue === 2 && <AllBookingsTable />}
      </Paper>
    </Box>
  );
};

export default AdminBookingManagementPage; 
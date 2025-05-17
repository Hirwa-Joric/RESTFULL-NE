import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  Alert
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import api from '../../services/api';

// Simple interface for overview data
interface OverviewData {
  totalSlots: number;
  availableSlots: number;
  totalBookings: number;
}

const initialData: OverviewData = {
  totalSlots: 0,
  availableSlots: 0,
  totalBookings: 0
};

const LiveOverview: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        
        // Fetch slots data
        const slotsResponse = await api.get('/slots');
        const slots = Array.isArray(slotsResponse.data) ? slotsResponse.data : [];
        
        // Fetch bookings data
        const bookingsResponse = await api.get('/bookings');
        const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
        
        // Count available slots
        const availableSlots = slots.filter(slot => slot.status === 'available').length;
        
        setOverviewData({
          totalSlots: slots.length,
          availableSlots: availableSlots,
          totalBookings: bookings.length
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setError('Failed to load parking data. Please try again later.');
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Parking Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Slots */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <LocalParkingIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="div">
              Total Parking Slots
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {overviewData.totalSlots}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Available Slots */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <DirectionsCarIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
            <Typography variant="h6" component="div">
              Available Slots
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {overviewData.availableSlots}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Total Bookings */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <EventAvailableIcon sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
            <Typography variant="h6" component="div">
              Total Bookings
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {overviewData.totalBookings}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
};

export default LiveOverview; 
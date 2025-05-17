import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Divider,
  Paper,
  Avatar,
  useTheme,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  People as PeopleIcon, 
  LocalParking as LocalParkingIcon, 
  BookOnline as BookOnlineIcon, 
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EventAvailable as BookingsIcon,
  DirectionsCar as VehicleIcon
} from '@mui/icons-material';
import { getStoredUser, getFullName } from '../utils/authWrapper';
import DashboardCharts from '../features/dashboard/DashboardCharts';
import ParkingMap from '../features/admin/dashboard/ParkingMap';
import ParkingActivityChart from '../features/dashboard/ParkingActivityChart';
import api from '../services/api';
import { alpha } from '@mui/material/styles';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // State for dashboard metrics
  const [pendingUserApprovals, setPendingUserApprovals] = useState(0);
  const [pendingBookingRequests, setPendingBookingRequests] = useState(0);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [occupiedSlots, setOccupiedSlots] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending user approvals
      const pendingUsersResponse = await api.get('/users/pending-approvals');
      const pendingUsersArray = pendingUsersResponse.data.users || [];
      setPendingUserApprovals(Array.isArray(pendingUsersArray) ? pendingUsersArray.length : 0);
      
      // Fetch slot statistics (in a real app, this would be a dedicated endpoint)
      const slotsResponse = await api.get('/slots');
      
      // Log the structure for debugging
      console.log("Slots API response: ", slotsResponse.data);
      
      // Check if the data is in 'slots' property or directly in the response
      const slotsArray = slotsResponse.data.slots || slotsResponse.data || [];
      
      // Make sure slotsArray is actually an array before filtering
      const available = Array.isArray(slotsArray) 
        ? slotsArray.filter((slot: any) => slot.status === 'available').length 
        : 0;
        
      const occupied = Array.isArray(slotsArray) 
        ? slotsArray.filter((slot: any) => ['occupied', 'reserved'].includes(slot.status)).length 
        : 0;
      
      setAvailableSlots(available);
      setOccupiedSlots(occupied);
      
      // Fetch pending booking requests
      const pendingBookings = await api.get('/bookings/admin/pending-approval');
      setPendingBookingRequests(Array.isArray(pendingBookings.data) ? pendingBookings.data.length : 0);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // In a real app, we would handle errors better with error state
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, mb: 4 }}>
        {/* Total Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <BookingsIcon />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.success.main,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 500,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                    +3.4%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  126
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <BookOnlineIcon />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.error.main,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 500,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <TrendingDownIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                    -5.5%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Today's Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  12
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Slots */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <LocalParkingIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available Slots
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {loading ? <LinearProgress sx={{ my: 1.5 }} /> : availableSlots}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <PeopleIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Users
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {loading ? <LinearProgress sx={{ my: 1.5 }} /> : pendingUserApprovals}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Parking Map */}
      <ParkingMap />

      {/* Parking Activity Chart */}
      <ParkingActivityChart />

      {/* Recent Booking Requests */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Booking Requests
          </Typography>
          <Button 
            variant="text" 
            endIcon={<BookingsIcon />}
            onClick={() => navigate('/admin/bookings')}
          >
            View All Bookings
          </Button>
        </Box>
        <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
          {/* This would be replaced with an actual BookingsTable component in a real app */}
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Recent booking requests would be displayed here
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage; 
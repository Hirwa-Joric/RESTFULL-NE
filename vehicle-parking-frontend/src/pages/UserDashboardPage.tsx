import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Divider,
  Paper,
  useTheme,
  CircularProgress,
  Avatar,
  Badge,
  Stack,
  Chip,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material';
import { 
  DirectionsCar as CarIcon, 
  CalendarToday as CalendarIcon, 
  Schedule as ScheduleIcon, 
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Speed as SpeedIcon,
  History as HistoryIcon,
  LocalParking as ParkingIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getStoredUser, getFullName } from '../utils/authWrapper';
import api from '../services/api';
import { alpha } from '@mui/material/styles';

interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: string;
}

interface Booking {
  id: string;
  status: string;
  requestedStartTime: string;
  requestedEndTime: string;
  vehicle?: Vehicle;
  parkingSlot?: {
    slotNumber: string;
    locationDescription: string;
  };
}

const UserDashboardPage: React.FC = () => {
  const theme = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const user = getStoredUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch vehicles
        const vehiclesResponse = await api.get('/vehicles');
        
        // Handle different API response formats for vehicles
        let vehiclesArray = [];
        if (vehiclesResponse.data) {
          if (Array.isArray(vehiclesResponse.data)) {
            vehiclesArray = vehiclesResponse.data;
          } else if (vehiclesResponse.data.vehicles && Array.isArray(vehiclesResponse.data.vehicles)) {
            vehiclesArray = vehiclesResponse.data.vehicles;
          } else {
            // Try to find any array property in the response
            const potentialArrayProps = Object.keys(vehiclesResponse.data || {})
              .filter(key => Array.isArray(vehiclesResponse.data[key]));
            
            if (potentialArrayProps.length > 0) {
              vehiclesArray = vehiclesResponse.data[potentialArrayProps[0]];
            }
          }
        }
        
        setVehicles(Array.isArray(vehiclesArray) ? vehiclesArray : []);
        
        // Fetch bookings
        const bookingsResponse = await api.get('/bookings/my-bookings');
        
        // Handle different API response formats for bookings
        let bookingsArray = [];
        if (bookingsResponse.data) {
          if (Array.isArray(bookingsResponse.data)) {
            bookingsArray = bookingsResponse.data;
          } else if (bookingsResponse.data.bookings && Array.isArray(bookingsResponse.data.bookings)) {
            bookingsArray = bookingsResponse.data.bookings;
          } else {
            // Try to find any array property in the response
            const potentialArrayProps = Object.keys(bookingsResponse.data || {})
              .filter(key => Array.isArray(bookingsResponse.data[key]));
            
            if (potentialArrayProps.length > 0) {
              bookingsArray = bookingsResponse.data[potentialArrayProps[0]];
            }
          }
        }
        
        setBookings(Array.isArray(bookingsArray) ? bookingsArray : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getVehicleTypeIcon = (type: string) => {
    // Simplified for example
    return <CarIcon />;
  };

  const getStatusChip = (status: string) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
    let icon = <PendingIcon fontSize="small" />;
    
    switch (status) {
      case 'confirmed':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'pending_approval':
        color = 'warning';
        icon = <PendingIcon fontSize="small" />;
        break;
      case 'rejected':
        color = 'error';
        icon = <ScheduleIcon fontSize="small" />;
        break;
      case 'active_parking':
        color = 'primary';
        icon = <ParkingIcon fontSize="small" />;
        break;
      case 'completed':
        color = 'info';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        icon={icon}
        label={status.replace('_', ' ')}
        size="small"
        color={color}
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Count active and pending bookings
  const activeBookingsCount = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'active_parking'
  ).length;
  
  const pendingBookingsCount = bookings.filter(b => 
    b.status === 'pending_approval'
  ).length;

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mt: 1, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card" sx={{ height: '100%' }}>
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
                  <CarIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Your Vehicles
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {vehicles.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <CheckCircleIcon />
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
                    Active
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {activeBookingsCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <PendingIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Requests
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {pendingBookingsCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card" 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
            component={RouterLink}
            to="/request-parking"
          >
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 2
                }}
              >
                <AddIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                Request New Parking
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Bookings */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Bookings
          </Typography>
          <Button 
            component={RouterLink}
            to="/my-bookings"
            variant="text" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            View All
          </Button>
        </Box>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={0}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="booking tabs">
              <Tab label="All" />
              <Tab label="Active" />
              <Tab label="Pending" />
              <Tab label="Completed" />
            </Tabs>
          </Box>
          
          {bookings.length > 0 ? (
            <Box sx={{ p: 0 }}>
              {bookings.slice(0, 5).map((booking) => (
                <Box 
                  key={booking.id}
                  sx={{ 
                    px: 3, 
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': {
                      borderBottom: 'none'
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  >
                    <ParkingIcon />
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {booking.vehicle?.make} {booking.vehicle?.model} ({booking.vehicle?.licensePlate})
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <CalendarIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5, fontSize: '0.875rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(booking.requestedStartTime)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    {getStatusChip(booking.status)}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No bookings found
              </Typography>
              <Button 
                component={RouterLink}
                to="/request-parking"
                variant="contained" 
                sx={{ mt: 2 }}
                size="small"
                startIcon={<AddIcon />}
              >
                Request Parking
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* My Vehicles */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            My Vehicles
          </Typography>
          <Button 
            component={RouterLink}
            to="/my-vehicles"
            variant="text" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            View All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {vehicles.slice(0, 3).map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
              <Card 
                className="dashboard-stat-card"
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      {getVehicleTypeIcon(vehicle.type)}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {vehicle.make} {vehicle.model}
                    </Typography>
                  </Box>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                        License:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {vehicle.licensePlate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                        Color:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {vehicle.color}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                        Type:
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                        {vehicle.type.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
                  <Button 
                    component={RouterLink}
                    to={`/request-parking?vehicleId=${vehicle.id}`}
                    size="small" 
                    variant="outlined"
                    startIcon={<ParkingIcon />}
                    fullWidth
                  >
                    Request Parking
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          
          {vehicles.length === 0 && (
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  borderRadius: 2
                }}
                elevation={0}
              >
                <Typography variant="body2" color="text.secondary" paragraph>
                  You don't have any vehicles registered yet.
                </Typography>
                <Button 
                  component={RouterLink}
                  to="/my-vehicles"
                  variant="contained" 
                  startIcon={<AddIcon />}
                >
                  Add Vehicle
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default UserDashboardPage; 
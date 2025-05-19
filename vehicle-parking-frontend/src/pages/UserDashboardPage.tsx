import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button, 
  Avatar,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  IconButton,
  Divider,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { 
  DirectionsCar as CarIcon, 
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  LocalParking as ParkingIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  AccessTime as ClockIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getStoredUser, getFullName } from '../utils/authWrapper';
import api from '../services/api';
import { alpha } from '@mui/material/styles';
import DashboardChartComponent from '../features/dashboard/DashboardChartComponent';

// Styled components
const DashboardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
  },
}));

const StyledAvatar = styled(Avatar)(({ theme, color }: { theme: any; color: string }) => ({
  backgroundColor: alpha(theme.palette[color].main, 0.1),
  color: theme.palette[color].main,
  width: 48,
  height: 48,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: 'none',
}));

const UpcomingBookingCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0px 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  marginBottom: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme: any; status: string }) => {
  let color = theme.palette.info.main;
  let bgColor = alpha(theme.palette.info.main, 0.1);
  
  if (status === 'approved' || status === 'active') {
    color = theme.palette.success.main;
    bgColor = alpha(theme.palette.success.main, 0.1);
  } else if (status === 'pending') {
    color = theme.palette.warning.main;
    bgColor = alpha(theme.palette.warning.main, 0.1);
  } else if (status === 'expired' || status === 'cancelled') {
    color = theme.palette.error.main;
    bgColor = alpha(theme.palette.error.main, 0.1);
  }
  
  return {
    backgroundColor: bgColor,
    color: color,
    fontWeight: 500,
    fontSize: '0.75rem',
    height: 24,
  };
});

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
  vehicleId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: string;
  vehicle?: Vehicle;
  slot?: {
    name: string;
    location: string;
  };
}

const UserDashboardPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [parkingUsagePercent, setParkingUsagePercent] = useState(37); // Mock parking usage percentage

  const user = getStoredUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user vehicles
        const vehiclesResponse = await api.get('/vehicles');
        setVehicles(vehiclesResponse.data.vehicles || []);

        // Fetch user bookings
        const bookingsResponse = await api.get('/bookings');
        const bookingsData = bookingsResponse.data.bookings || [];
        setBookings(bookingsData);

        // Count active and pending bookings
        const active = bookingsData.filter((booking: Booking) => 
          booking.status === 'active' || booking.status === 'approved'
        ).length;
        
        const pending = bookingsData.filter((booking: Booking) => 
          booking.status === 'pending'
        ).length;

        setActiveBookingsCount(active);
        setPendingBookingsCount(pending);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get upcoming bookings (active or approved bookings sorted by start time)
  const upcomingBookings = bookings
    .filter(booking => ['active', 'approved'].includes(booking.status))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  // Get recent bookings (all bookings sorted by creation time, newest first)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <DashboardTitle variant="h4">
        Overview
      </DashboardTitle>

      {/* Stats Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="primary">
                  <CarIcon />
                </StyledAvatar>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Your Vehicles
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {vehicles.length}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="View All" 
                    component={RouterLink}
                    to="/my-vehicles"
                    clickable
                    sx={{ 
                      bgcolor: alpha('#2E7D32', 0.1), 
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha('#2E7D32', 0.2),
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="success">
                  <CheckCircleIcon />
                </StyledAvatar>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {activeBookingsCount}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="View Details" 
                    component={RouterLink}
                    to="/my-bookings"
                    clickable
                    sx={{ 
                      bgcolor: alpha('#66BB6A', 0.1), 
                      color: 'success.main',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha('#66BB6A', 0.2),
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="warning">
                  <PendingIcon />
                </StyledAvatar>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Requests
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {pendingBookingsCount}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="View Pending" 
                    component={RouterLink}
                    to="/my-bookings"
                    clickable
                    sx={{ 
                      bgcolor: alpha('#FFA726', 0.1), 
                      color: 'warning.main',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha('#FFA726', 0.2),
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <SectionTitle variant="h5">
        <span>Parking Availability</span>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/request-parking"
          sx={{ borderRadius: 2 }}
        >
          Request Parking
        </Button>
      </SectionTitle>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Currently available parking spots and their status
      </Typography>

      {/* Parking Slots Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ backgroundColor: alpha('#4CAF50', 0.05) }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: alpha('#4CAF50', 0.1),
                  color: 'primary.main',
                  margin: '0 auto',
                  mb: 2
                }}
              >
                <ParkingIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Section A
              </Typography>
              <Chip 
                label="8 Available" 
                size="small"
                sx={{ 
                  bgcolor: alpha('#4CAF50', 0.1),
                  color: 'primary.main',
                  mt: 1
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: alpha('#5C6BC0', 0.1),
                  color: 'secondary.main',
                  margin: '0 auto',
                  mb: 2
                }}
              >
                <ParkingIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Section B
              </Typography>
              <Chip 
                label="4 Available" 
                size="small"
                sx={{ 
                  bgcolor: alpha('#5C6BC0', 0.1),
                  color: 'secondary.main',
                  mt: 1
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: alpha('#F44336', 0.1),
                  color: 'error.main',
                  margin: '0 auto',
                  mb: 2
                }}
              >
                <ParkingIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Section C
              </Typography>
              <Chip 
                label="Full" 
                size="small"
                sx={{ 
                  bgcolor: alpha('#F44336', 0.1),
                  color: 'error.main',
                  mt: 1
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: alpha('#FFA726', 0.1),
                  color: 'warning.main',
                  margin: '0 auto',
                  mb: 2
                }}
              >
                <ParkingIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Section D
              </Typography>
              <Chip 
                label="2 Available" 
                size="small"
                sx={{ 
                  bgcolor: alpha('#FFA726', 0.1),
                  color: 'warning.main',
                  mt: 1
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Upcoming and Recent Bookings Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={5}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>Upcoming Bookings</Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/my-bookings"
                >
                  View all
                </Button>
              </Box>
              
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => (
                  <UpcomingBookingCard key={booking.id} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </Typography>
                        <StatusChip 
                          label={booking.status} 
                          status={booking.status}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {booking.vehicle?.licensePlate}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <ClockIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <ParkingIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {booking.slot?.name}, {booking.slot?.location}
                        </Typography>
                      </Box>
                    </CardContent>
                  </UpcomingBookingCard>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming bookings
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/request-parking"
                    sx={{ mt: 2, borderRadius: 8 }}
                  >
                    Request Parking
                  </Button>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <StyledCard>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ px: 2, pt: 2 }}
              >
                <Tab label="Recent Bookings" />
                <Tab label="Reserved Slots" />
                <Tab label="Usage History" />
              </Tabs>
            </Box>
            
            <Box>
              {tabValue === 0 && (
                <StyledTableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Parking Slot</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentBookings.length > 0 ? (
                        recentBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1,
                                    bgcolor: alpha('#4CAF50', 0.1),
                                    color: 'primary.main',
                                  }}
                                >
                                  <CarIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {booking.vehicle?.make} {booking.vehicle?.model}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {booking.vehicle?.licensePlate}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {booking.slot?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.slot?.location}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(booking.startTime)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                to {formatDate(booking.endTime)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip 
                                label={booking.status} 
                                status={booking.status}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No bookings found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Your reserved parking slots will appear here
                  </Typography>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Your parking usage history will appear here
                  </Typography>
                </Box>
              )}
            </Box>
          </StyledCard>
        </Grid>
      </Grid>
      
      {/* Parking Usage Statistics */}
      <SectionTitle variant="h5" sx={{ mt: 4 }}>
        <span>Parking Usage Statistics</span>
      </SectionTitle>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>Monthly Usage</Typography>
              </Box>
              
              <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', width: 180, height: 180 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={180}
                    thickness={4}
                    sx={{ color: alpha('#E0E0E0', 0.4), position: 'absolute' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={parkingUsagePercent}
                    size={180}
                    thickness={4}
                    sx={{ color: 'primary.main', position: 'absolute' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" fontWeight={700}>
                      {parkingUsagePercent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Utilized
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Section A Usage</Typography>
                  <Typography variant="body2" color="text.secondary">65%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Section B Usage</Typography>
                  <Typography variant="body2" color="text.secondary">89%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Section C Usage</Typography>
                  <Typography variant="body2" color="text.secondary">100%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Section D Usage</Typography>
                  <Typography variant="body2" color="text.secondary">78%</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Peak Hours</Typography>
              <DashboardChartComponent chartType="line" />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboardPage; 
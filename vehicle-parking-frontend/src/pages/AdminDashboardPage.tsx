import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  styled,
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
  DirectionsCar as VehicleIcon,
  DonutLarge as DonutIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { getStoredUser } from '../utils/authWrapper';
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
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledAvatar = styled(Avatar)(({ theme, color }: { theme: any; color?: string }) => ({
  backgroundColor: alpha(theme.palette[color || 'primary'].main, 0.1),
  color: theme.palette[color || 'primary'].main,
  width: 48,
  height: 48,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: 'none',
}));

const TrendBadge = styled(Box)<{ trend: 'up' | 'down' }>(({ theme, trend }) => ({
  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: '0.75rem',
  backgroundColor: alpha(trend === 'up' ? theme.palette.success.main : theme.palette.error.main, 0.1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
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

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // State for dashboard metrics
  const [pendingUserApprovals, setPendingUserApprovals] = useState(0);
  const [pendingBookingRequests, setPendingBookingRequests] = useState(0);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [occupiedSlots, setOccupiedSlots] = useState(0);
  const [totalBookings, setTotalBookings] = useState(126);
  const [todaysBookings, setTodaysBookings] = useState(12);
  const [parkingUtilization, setParkingUtilization] = useState(76);
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

  // Mock recent booking requests data
  const recentRequests = [
    { id: 1, user: "John Smith", vehicle: "Toyota Camry (ABC-123)", date: "Nov 7, 2023", time: "10:00 AM - 2:00 PM", status: "pending" },
    { id: 2, user: "Sarah Johnson", vehicle: "Honda Civic (XYZ-789)", date: "Nov 8, 2023", time: "9:30 AM - 5:00 PM", status: "approved" },
    { id: 3, user: "Michael Brown", vehicle: "Tesla Model 3 (EV-2023)", date: "Nov 9, 2023", time: "8:00 AM - 6:00 PM", status: "active" },
  ];

  return (
    <Box>
      <DashboardTitle variant="h4">
        Analytics
      </DashboardTitle>

      <Grid container spacing={3}>
        {/* Total Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="primary">
                  <BookingsIcon />
                </StyledAvatar>
                <TrendBadge trend="up">
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                  +3.4%
                </TrendBadge>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {totalBookings}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="View All" 
                    component="a"
                    href="/admin/bookings"
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

        {/* Today's Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="secondary">
                  <CalendarIcon />
                </StyledAvatar>
                <TrendBadge trend="down">
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                  -5.5%
                </TrendBadge>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Today's Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {todaysBookings}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="View Today" 
                    component="a"
                    href="/admin/bookings?filter=today"
                    clickable
                    sx={{ 
                      bgcolor: alpha('#5C6BC0', 0.1), 
                      color: 'secondary.main',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha('#5C6BC0', 0.2),
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Available Slots */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="success">
                  <LocalParkingIcon />
                </StyledAvatar>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available Slots
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {loading ? <CircularProgress size={24} /> : availableSlots}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="Manage Slots" 
                    component="a"
                    href="/admin/slots"
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

        {/* Pending Users */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <StyledAvatar color="warning">
                  <PeopleIcon />
                </StyledAvatar>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Users
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {loading ? <CircularProgress size={24} /> : pendingUserApprovals}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label="Review" 
                    component="a"
                    href="/admin/users?filter=pending"
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

      {/* Parking Map Section */}
      <SectionTitle variant="h5">
        <span>Parking Overview</span>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/slots/add')}
          sx={{ borderRadius: 2 }}
        >
          Add Slot
        </Button>
      </SectionTitle>
      
      <StyledCard sx={{ mb: 4, p: 0 }}>
        <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Parking Map Visualization Will Be Displayed Here
          </Typography>
        </Box>
      </StyledCard>

      {/* Booking Requests and Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Booking Requests
              </Typography>
              <Button 
                size="small" 
                variant="text" 
                onClick={() => navigate('/admin/bookings')}
              >
                View All
              </Button>
            </Box>
            <Divider />
            <Box sx={{ p: 0 }}>
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <Box 
                    key={request.id} 
                    sx={{ 
                      p: 2, 
                      borderBottom: 1, 
                      borderColor: 'divider', 
                      '&:last-child': { borderBottom: 0 },
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha('#5C6BC0', 0.1), color: 'secondary.main', mr: 2 }}>
                      <VehicleIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {request.user}
                        </Typography>
                        <StatusChip 
                          label={request.status} 
                          status={request.status}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {request.vehicle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.date}, {request.time}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending requests
                  </Typography>
                </Box>
              )}
            </Box>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Parking Utilization
              </Typography>
            </Box>
            <Divider />
            <CardContent>
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
                    value={parkingUtilization}
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
                      {parkingUtilization}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Utilized
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: alpha('#4CAF50', 0.1), borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>
                      Available
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={600}>
                      {availableSlots}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: alpha('#F44336', 0.1), borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      Occupied
                    </Typography>
                    <Typography variant="h5" color="error.main" fontWeight={600}>
                      {occupiedSlots}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Analytics Section */}
      <SectionTitle variant="h5">
        <span>Booking Analytics</span>
      </SectionTitle>
      
      <StyledCard sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ px: 3 }}
          >
            <Tab label="Daily" />
            <Tab label="Weekly" />
            <Tab label="Monthly" />
          </Tabs>
        </Box>
        <Box sx={{ p: 3 }}>
          <DashboardChartComponent chartType="area" />
        </Box>
      </StyledCard>
    </Box>
  );
};

export default AdminDashboardPage; 
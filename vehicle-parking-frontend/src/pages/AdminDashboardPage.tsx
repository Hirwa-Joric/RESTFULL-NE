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
  useTheme,
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
const DashboardPageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0), // Padding is now handled by PageContent in MainLayout for the page itself
  backgroundColor: 'transparent', // Sits on the white ContentSheet from MainLayout
  // minHeight is handled by PageContent in MainLayout
}));

const DashboardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: theme.spacing(3),
  fontSize: '1.75rem', // Larger title
}));

// Prevent custom props from being passed to the DOM
const StatCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'cardColor' && prop !== 'textColor'
})<{ cardColor?: string; textColor?: string }>(({ theme, cardColor, textColor }) => ({
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
  border: 'none',
  padding: theme.spacing(2.5),
  backgroundColor: cardColor || '#ffffff',
  color: textColor || '#333333',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  ...(cardColor && cardColor !== '#ffffff' && {
    color: '#ffffff',
    '& .MuiTypography-root': {
      color: '#ffffff',
    },
    '& .MuiSvgIcon-root': {
      color: '#ffffff',
    }
  })
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(4), // Keep some top margin for sections
  fontSize: '1.25rem',
}));

// Prevent custom props from being passed to the DOM
const IconAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'avatarColor' && prop !== 'iconColor'
})<{ avatarColor?: string; iconColor?: string }>(({ theme, avatarColor, iconColor }) => ({
  backgroundColor: avatarColor || alpha(theme.palette.primary.main, 0.1),
  color: iconColor || theme.palette.primary.main,
  width: 48,
  height: 48,
}));

const StyledTrendBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'trend'
})<{ trend: 'up' | 'down' }>(({ theme, trend }) => {
  const successColor = '#4caf50'; // Using green for "up"
  const errorColor = '#f44336'; // Using red for "down"
  const color = trend === 'up' ? successColor : errorColor;
  return {
    color: color,
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
    fontSize: '0.75rem',
    backgroundColor: alpha(color, 0.15),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
  };
});

const StyledStatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status'
})(({ theme, status }: { theme: any; status: string }) => {
  let chipColor = '#757575';  // Default gray
  let chipBgColor = alpha(chipColor, 0.1);

  if (status === 'approved' || status === 'active') {
    chipColor = '#4caf50';  // Green
    chipBgColor = alpha(chipColor, 0.15);
  } else if (status === 'pending') {
    chipColor = '#ff9800';  // Orange
    chipBgColor = alpha(chipColor, 0.15);
  } else if (status === 'expired' || status === 'cancelled' || status === 'rejected') {
    chipColor = '#f44336';  // Red
    chipBgColor = alpha(chipColor, 0.15);
  }
  return {
    backgroundColor: chipBgColor,
    color: chipColor,
    fontWeight: 500,
    fontSize: '0.75rem',
    height: 24,
    borderRadius: '6px',
  };
});

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Add this hook to use theme
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
    { id: 4, user: "Emily Davis", vehicle: "Ford F-150 (OLD-BIG)", date: "Nov 9, 2023", time: "1:00 PM - 3:00 PM", status: "rejected" },
  ];

  return (
    <DashboardPageContainer>
      <DashboardTitle variant="h1"> 
        Dashboard Overview
      </DashboardTitle>

      <Grid container spacing={3}>
        {/* Stat Card 1: Total Bookings - Green Background */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard cardColor="#4caf50">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconAvatar avatarColor={alpha("#ffffff", 0.2)} iconColor="#ffffff">
                <BookingsIcon />
              </IconAvatar>
              <StyledTrendBadge trend="up">
                <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '1rem' }} />
                +3.4%
              </StyledTrendBadge>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {totalBookings}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total Bookings
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        {/* Stat Card 2: Today's Bookings - Blue Background */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard cardColor="#2196f3">
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconAvatar avatarColor={alpha("#ffffff", 0.2)} iconColor="#ffffff">
                <CalendarIcon />
              </IconAvatar>
              <StyledTrendBadge trend="down">
                <TrendingDownIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '1rem' }} />
                -5.5%
              </StyledTrendBadge>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {todaysBookings}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Today's Bookings
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        {/* Stat Card 3: Available Slots - White Background */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconAvatar avatarColor={alpha("#4caf50", 0.15)} iconColor="#4caf50">
                <LocalParkingIcon />
              </IconAvatar>
              {/* Optional: Add a MoreVertIcon if actions are needed */}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {loading ? <CircularProgress size={28} color="inherit"/> : availableSlots}
              </Typography>
              <Typography variant="body2" color="#757575">
                Available Slots
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        {/* Stat Card 4: Pending Users - White Background */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconAvatar avatarColor={alpha("#ff9800", 0.15)} iconColor="#ff9800">
                <PeopleIcon />
              </IconAvatar>
               {/* Optional: Add a MoreVertIcon if actions are needed */}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {loading ? <CircularProgress size={28} color="inherit"/> : pendingUserApprovals}
              </Typography>
              <Typography variant="body2" color="#757575">
                Pending Users
              </Typography>
            </Box>
          </StatCard>
        </Grid>
      </Grid>

      {/* Middle Row: Main Chart and Utilization Donut */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Main Chart Card */}
        <Grid item xs={12} md={7} lg={8}>
          <StatCard sx={{ p: 0, overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}> {/* Added subtle hover effect */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, pb: 1 }}>
              <Typography variant="h6" fontWeight={600} color="#212529">
                Parking Activity Trends
              </Typography>
              {/* Optional: Add view controls or date range pickers here */}
            </Box>
            <Divider sx={{ borderColor: '#eeeeee'}} />
            <Box sx={{ p: 2.5, pt: 2 }}>
              <DashboardChartComponent chartType="area" />
            </Box>
          </StatCard>
        </Grid>

        {/* Parking Utilization Donut Chart Card */}
        <Grid item xs={12} md={5} lg={4}>
          <StatCard sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}> {/* Added subtle hover effect */}
            <Typography variant="h6" fontWeight={600} color="#212529" sx={{ mb: 2 }}>
              Current Slot Occupancy
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 180 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={170}
                thickness={4}
                sx={{ color: '#e0e0e0', position: 'absolute' }}
              />
              <CircularProgress
                variant="determinate"
                value={parkingUtilization}
                size={170}
                thickness={4}
                sx={{ color: '#4caf50', position: 'absolute' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" fontWeight={700} color="#212529">
                  {parkingUtilization}%
                </Typography>
                <Typography variant="body2" color="#757575">
                  Utilized
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2} sx={{ mt: 2.5 }}>
              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: alpha('#4caf50', 0.1), borderRadius: '8px', textAlign: 'center' }}>
                  <Typography variant="body2" color="#757575" gutterBottom>
                    Available
                  </Typography>
                  <Typography variant="h5" color="#4caf50" fontWeight={600}>
                    {loading ? <CircularProgress size={20}/> : availableSlots}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: alpha('#f44336', 0.1), borderRadius: '8px', textAlign: 'center' }}>
                  <Typography variant="body2" color="#757575" gutterBottom>
                    Occupied
                  </Typography>
                  <Typography variant="h5" color="#f44336" fontWeight={600}>
                     {loading ? <CircularProgress size={20}/> : occupiedSlots}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </StatCard>
        </Grid>
      </Grid>
      
      {/* Bottom Row: Recent Booking Requests */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <StatCard sx={{ p: 0, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}> {/* Added subtle hover effect */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, pb: 1 }}>
              <Typography variant="h6" fontWeight={600} color="#212529">
                Recent Bookings
              </Typography>
              <Button 
                size="small" 
                variant="text" 
                onClick={() => navigate('/admin/bookings')}
                sx={{ color: '#4caf50', '&:hover': { backgroundColor: alpha('#4caf50', 0.05) } }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ borderColor: '#eeeeee' }} />
            <Box>
              {loading ? (
                 <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /></Box>
              ) : recentRequests.length > 0 ? (
                recentRequests.map((request, index) => (
                  <Box 
                    key={request.id} 
                    sx={{ 
                      p: 2, 
                      borderBottom: index === recentRequests.length - 1 ? 0 : 1, 
                      borderColor: '#eeeeee', 
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: alpha('#f5f5f5', 0.3) // Replace theme.palette.action.hover with a direct hex value
                      }
                    }}
                  >
                    <IconAvatar 
                        avatarColor={alpha(request.status === 'approved' || request.status === 'active' ? '#4caf50' : request.status === 'pending' ? '#ff9800' : '#f44336', 0.15)} 
                        iconColor={request.status === 'approved' || request.status === 'active' ? '#4caf50' : request.status === 'pending' ? '#ff9800' : '#f44336'}
                        sx={{ mr: 2 }}
                    >
                      <VehicleIcon />
                    </IconAvatar>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="#212529">
                        {request.user}
                      </Typography>
                      <Typography variant="body2" color="#757575" sx={{ display: 'block' }}>
                        {request.vehicle}
                      </Typography>
                      <Typography variant="caption" color="#757575">
                        {request.date}, {request.time}
                      </Typography>
                    </Box>
                    <StyledStatusChip 
                      label={request.status.charAt(0).toUpperCase() + request.status.slice(1)} 
                      status={request.status}
                      theme={theme}
                    />
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="#757575">
                    No recent booking requests.
                  </Typography>
                </Box>
              )}
            </Box>
          </StatCard>
        </Grid>
      </Grid>

      {/* Remove old "Parking Map Section" and "Analytics Section with Tabs" */}
      {/* The chart is now integrated into the "Parking Activity Trends" card */}

    </DashboardPageContainer> // Changed from Box to DashboardPageContainer
  );
};

export default AdminDashboardPage; 
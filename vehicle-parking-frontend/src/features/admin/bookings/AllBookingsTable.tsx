import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Button
} from '@mui/material';
import { 
  CheckCircle,
  Cancel,
  Schedule,
  Done,
  Clear,
  LocalParking,
  Person,
  Search,
  FilterList,
  DirectionsCar
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../../../services/api';

interface Booking {
  id: string;
  vehicleId: string;
  userId: string;
  slotId?: string;
  requestedStartTime: string;
  requestedEndTime: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  status: string;
  notes?: string;
  adminRemarks?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  vehicle?: {
    licensePlate: string;
    make: string;
    model: string;
    color: string;
    type: string;
  };
  slot?: {
    slotNumber: string;
    locationDescription: string;
    type: string;
    isEVChargingAvailable: boolean;
  };
  createdAt: string;
}

const AllBookingsTable: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, searchQuery, startDate, endDate]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/bookings/admin/all');
      
      // Handle different API response formats
      let bookingsArray = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          bookingsArray = response.data;
        } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
          bookingsArray = response.data.bookings;
        } else {
          // Try to find any array property in the response
          const potentialArrayProps = Object.keys(response.data || {})
            .filter(key => Array.isArray(response.data[key]));
          
          if (potentialArrayProps.length > 0) {
            // Use the first array property found
            bookingsArray = response.data[potentialArrayProps[0]];
          }
        }
      }
      
      // Sort bookings by created date (newest first)
      const sortedBookings = Array.isArray(bookingsArray) 
        ? [...bookingsArray].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      
      setBookings(sortedBookings);
      setFilteredBookings(sortedBookings); // Initially, show all bookings
      setError(null);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      setError('Failed to load bookings history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search filter (check user, vehicle plate, slot number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(booking => 
        // Check user name
        (booking.user && 
          (`${booking.user.firstName} ${booking.user.lastName}`).toLowerCase().includes(query)) ||
        // Check email
        (booking.user && booking.user.email.toLowerCase().includes(query)) ||
        // Check vehicle license plate
        (booking.vehicle && booking.vehicle.licensePlate.toLowerCase().includes(query)) ||
        // Check slot number
        (booking.slot && booking.slot.slotNumber.toLowerCase().includes(query))
      );
    }
    
    // Apply date range filter
    if (startDate) {
      const start = startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(booking => 
        new Date(booking.requestedStartTime).getTime() >= start
      );
    }
    
    if (endDate) {
      const end = endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(booking => 
        new Date(booking.requestedStartTime).getTime() <= end
      );
    }
    
    setFilteredBookings(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Chip color="warning" icon={<Schedule />} label="Pending" size="small" />;
      case 'confirmed':
        return <Chip color="info" icon={<Done />} label="Confirmed" size="small" />;
      case 'active_parking':
        return <Chip color="success" icon={<CheckCircle />} label="Active" size="small" />;
      case 'completed':
        return <Chip color="default" icon={<Done />} label="Completed" size="small" />;
      case 'rejected':
        return <Chip color="error" icon={<Cancel />} label="Rejected" size="small" />;
      case 'cancelled_by_user':
        return <Chip color="default" icon={<Clear />} label="Cancelled by User" size="small" />;
      case 'cancelled_by_admin':
        return <Chip color="default" icon={<Clear />} label="Cancelled by Admin" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">All Bookings</Typography>
        
        <IconButton 
          color="primary" 
          onClick={() => setShowFilters(!showFilters)}
          sx={{ 
            bgcolor: showFilters ? 'primary.main' : 'transparent', 
            color: showFilters ? 'white' : 'primary.main',
            '&:hover': {
              bgcolor: showFilters ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          <FilterList />
        </IconButton>
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="outlined"
                size="small"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="active_parking">Active Parking</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled_by_user">Cancelled by User</MenuItem>
                <MenuItem value="cancelled_by_admin">Cancelled by Admin</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  sx={{ mr: 1 }}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {loading && bookings.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredBookings.length === 0 ? (
        <Alert severity="info">No bookings found matching your criteria.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booking Time</TableCell>
                  <TableCell>Check-in/out Times</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell width="10%">
                        <Typography variant="body2" fontWeight="bold">
                          {booking.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.user ? (
                          <Box display="flex" alignItems="center">
                            <Person fontSize="small" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {booking.user.firstName} {booking.user.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.user.email}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          'Unknown User'
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.vehicle ? (
                          <Box display="flex" alignItems="center">
                            <DirectionsCar fontSize="small" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {booking.vehicle.licensePlate}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.vehicle.make} {booking.vehicle.model}, {booking.vehicle.color}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.slot ? (
                          <Box display="flex" alignItems="center">
                            <LocalParking fontSize="small" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Slot {booking.slot.slotNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.slot.locationDescription}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          'Not Assigned'
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(booking.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          From: {formatDateTime(booking.requestedStartTime)}
                        </Typography>
                        <Typography variant="body2">
                          To: {formatDateTime(booking.requestedEndTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.actualCheckInTime ? (
                          <Typography variant="body2">
                            <b>In:</b> {formatDateTime(booking.actualCheckInTime)}
                          </Typography>
                        ) : null}
                        
                        {booking.actualCheckOutTime ? (
                          <Typography variant="body2">
                            <b>Out:</b> {formatDateTime(booking.actualCheckOutTime)}
                          </Typography>
                        ) : null}
                        
                        {!booking.actualCheckInTime && !booking.actualCheckOutTime ? (
                          <Typography variant="body2" color="text.secondary">
                            Not checked in/out yet
                          </Typography>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AllBookingsTable; 
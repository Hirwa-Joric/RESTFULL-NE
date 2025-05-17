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
  Button,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  CheckCircle,
  ExitToApp,
  DriveEta,
  AccessTime,
  LocalParking
} from '@mui/icons-material';
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
}

const ActiveBookingsTable: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCheckInDialog, setOpenCheckInDialog] = useState(false);
  const [openCheckOutDialog, setOpenCheckOutDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const fetchActiveBookings = async () => {
    try {
      setLoading(true);
      
      // First fetch confirmed bookings
      const confirmedResponse = await api.get('/bookings/admin/all', {
        params: {
          status: 'confirmed'
        }
      });
      
      // Then fetch active_parking bookings
      const activeResponse = await api.get('/bookings/admin/all', {
        params: {
          status: 'active_parking'
        }
      });
      
      // Process confirmed bookings
      let confirmedBookings = [];
      if (confirmedResponse.data) {
        if (Array.isArray(confirmedResponse.data)) {
          confirmedBookings = confirmedResponse.data;
        } else if (confirmedResponse.data.bookings && Array.isArray(confirmedResponse.data.bookings)) {
          confirmedBookings = confirmedResponse.data.bookings;
        } else {
          // Try to find any array property in the response
          const potentialArrayProps = Object.keys(confirmedResponse.data || {})
            .filter(key => Array.isArray(confirmedResponse.data[key]));
          
          if (potentialArrayProps.length > 0) {
            confirmedBookings = confirmedResponse.data[potentialArrayProps[0]];
          }
        }
      }
      
      // Process active bookings
      let activeBookings = [];
      if (activeResponse.data) {
        if (Array.isArray(activeResponse.data)) {
          activeBookings = activeResponse.data;
        } else if (activeResponse.data.bookings && Array.isArray(activeResponse.data.bookings)) {
          activeBookings = activeResponse.data.bookings;
        } else {
          // Try to find any array property in the response
          const potentialArrayProps = Object.keys(activeResponse.data || {})
            .filter(key => Array.isArray(activeResponse.data[key]));
          
          if (potentialArrayProps.length > 0) {
            activeBookings = activeResponse.data[potentialArrayProps[0]];
          }
        }
      }
      
      // Log what we found for debugging
      console.log(`Found ${confirmedBookings.length} confirmed bookings and ${activeBookings.length} active bookings`);
      
      // Combine both sets of bookings
      const combinedBookings = [
        ...Array.isArray(confirmedBookings) ? confirmedBookings : [],
        ...Array.isArray(activeBookings) ? activeBookings : []
      ];
      
      setBookings(combinedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching active bookings:', err);
      setError('Failed to load active bookings. Please try again.');
      setBookings([]); // Clear any partial data to avoid UI confusion
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      await api.post(`/bookings/admin/${selectedBooking.id}/check-in`);
      setSuccess(`Vehicle ${selectedBooking.vehicle?.licensePlate} checked in successfully`);
      setOpenCheckInDialog(false);
      fetchActiveBookings(); // Refresh the list
    } catch (err) {
      console.error('Error checking in booking:', err);
      setError('Failed to check in vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      await api.post(`/bookings/admin/${selectedBooking.id}/check-out`);
      setSuccess(`Vehicle ${selectedBooking.vehicle?.licensePlate} checked out successfully`);
      setOpenCheckOutDialog(false);
      fetchActiveBookings(); // Refresh the list
    } catch (err) {
      console.error('Error checking out booking:', err);
      setError('Failed to check out vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCheckInDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setOpenCheckInDialog(true);
  };

  const handleCloseCheckInDialog = () => {
    setOpenCheckInDialog(false);
    setSelectedBooking(null);
  };

  const handleOpenCheckOutDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setOpenCheckOutDialog(true);
  };

  const handleCloseCheckOutDialog = () => {
    setOpenCheckOutDialog(false);
    setSelectedBooking(null);
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
    if (status === 'active_parking') {
      return <Chip color="success" icon={<CheckCircle />} label="Active" size="small" />;
    }
    return <Chip color="info" icon={<AccessTime />} label="Confirmed" size="small" />;
  };

  if (loading && bookings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={3}>Active Bookings</Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {bookings.length === 0 ? (
        <Alert severity="info">No active bookings found.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booking Time</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {booking.vehicle ? (
                          <Box display="flex" alignItems="center">
                            <DriveEta fontSize="small" sx={{ mr: 1 }} />
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
                          'Unknown Vehicle'
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.user ? (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {booking.user.firstName} {booking.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {booking.user.email}
                            </Typography>
                          </>
                        ) : (
                          'Unknown User'
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
                                {booking.slot.isEVChargingAvailable && ' (EV Charging)'}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          'No Slot Assigned'
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
                        {booking.actualCheckInTime 
                          ? formatDateTime(booking.actualCheckInTime) 
                          : 'Not checked in yet'
                        }
                      </TableCell>
                      <TableCell>
                        {booking.status === 'confirmed' ? (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleOpenCheckInDialog(booking)}
                          >
                            Check In
                          </Button>
                        ) : booking.status === 'active_parking' ? (
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={<ExitToApp />}
                            onClick={() => handleOpenCheckOutDialog(booking)}
                          >
                            Check Out
                          </Button>
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
            count={bookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {/* Check In Dialog */}
      <Dialog open={openCheckInDialog} onClose={handleCloseCheckInDialog}>
        <DialogTitle>Check In Vehicle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to check in vehicle with license plate 
            <strong> {selectedBooking?.vehicle?.licensePlate}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckInDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCheckIn} 
            color="success" 
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={24} color="inherit" /> : <CheckCircle />}
          >
            {actionLoading ? 'Processing...' : 'Confirm Check In'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Check Out Dialog */}
      <Dialog open={openCheckOutDialog} onClose={handleCloseCheckOutDialog}>
        <DialogTitle>Check Out Vehicle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to check out vehicle with license plate 
            <strong> {selectedBooking?.vehicle?.licensePlate}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckOutDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCheckOut} 
            color="warning" 
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={24} color="inherit" /> : <ExitToApp />}
          >
            {actionLoading ? 'Processing...' : 'Confirm Check Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveBookingsTable; 
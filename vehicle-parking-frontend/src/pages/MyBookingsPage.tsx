import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import { 
  BookOnline, 
  DirectionsCar, 
  CalendarToday, 
  CheckCircle, 
  Cancel,
  LocalParking,
  Info,
  CreditCard,
  LocalAtm,
  Payment
} from '@mui/icons-material';
import api from '../services/api';
import type { SelectChangeEvent } from '@mui/material/Select';

interface ParkingSlot {
  slotNumber: string;
  locationDescription: string;
}

interface Vehicle {
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
  requestedEndTime: string | null;
  actualCheckInTime: string | null;
  actualCheckOutTime: string | null;
  amount: number | null;
  paymentStatus: string | null;
  notes?: string;
  adminRemarks?: string;
  vehicle?: Vehicle;
  parkingSlot?: ParkingSlot;
}

interface PaymentCalculation {
  bookingId: string;
  checkInTime: string;
  currentTime: string;
  duration: {
    hours: number;
    exactHours: string;
    minutes: number;
  };
  hourlyRate: number;
  amount: number;
  currency: string;
}

const statusColors: Record<string, string> = {
  'pending_approval': 'warning',
  'confirmed': 'info',
  'active_parking': 'success',
  'completed': 'default',
  'rejected': 'error',
  'cancelled_by_user': 'default',
  'cancelled_by_admin': 'default',
  'payment_pending': 'warning',
  'paid': 'success'
};

const statusLabels: Record<string, string> = {
  'pending_approval': 'Pending Approval',
  'confirmed': 'Confirmed',
  'active_parking': 'Active Parking',
  'completed': 'Completed',
  'rejected': 'Rejected',
  'cancelled_by_user': 'Cancelled by You',
  'cancelled_by_admin': 'Cancelled by Admin',
  'payment_pending': 'Payment Pending',
  'paid': 'Paid'
};

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentCalculation, setPaymentCalculation] = useState<PaymentCalculation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bookings/my-bookings');
        
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
              bookingsArray = response.data[potentialArrayProps[0]];
            }
          }
        }
        
        if (Array.isArray(bookingsArray)) {
          setBookings(bookingsArray);
        } else {
          console.error('Unexpected bookings format:', response.data);
          setBookings([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [refreshTrigger]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.put(`/bookings/${bookingId}/cancel-by-user`);
      
      // Update the booking status in the UI
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled_by_user' } 
            : booking
        )
      );
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again later.');
    }
  };

  const handlePayment = async (booking: Booking) => {
    setSelectedBooking(booking);
    
    try {
      const response = await api.get(`/bookings/${booking.id}/calculate`);
      setPaymentCalculation(response.data);
      setPaymentDialogOpen(true);
    } catch (err) {
      console.error('Error calculating payment:', err);
      setError('Failed to calculate payment. Please try again.');
    }
  };

  const handlePaymentMethodChange = (event: SelectChangeEvent) => {
    setPaymentMethod(event.target.value);
  };

  const processPayment = async () => {
    if (!selectedBooking) return;
    
    setPaymentLoading(true);
    try {
      await api.post(`/bookings/${selectedBooking.id}/pay`, {
        paymentMethod: paymentMethod
      });
      
      setPaymentDialogOpen(false);
      setPaymentSuccess(true);
      // Refresh bookings list to show updated status
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getStatusChip = (status: string) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
    let icon = <Info />;
    
    switch (status) {
      case 'confirmed':
        color = 'success';
        icon = <CheckCircle />;
        break;
      case 'pending_approval':
        color = 'warning';
        icon = <Info />;
        break;
      case 'rejected':
        color = 'error';
        icon = <Cancel />;
        break;
      case 'active_parking':
        color = 'primary';
        icon = <LocalParking />;
        break;
      case 'completed':
        color = 'info';
        icon = <CheckCircle />;
        break;
      case 'cancelled_by_user':
      case 'cancelled_by_admin':
        color = 'default';
        icon = <Cancel />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        icon={icon}
        label={status.replace(/_/g, ' ')}
        color={color}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard />;
      case 'cash':
        return <LocalAtm />;
      default:
        return <Payment />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <BookOnline color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">My Bookings</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Bookings Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have any parking bookings yet. Create a new booking request to get started.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/request-parking"
          >
            Request Parking Slot
          </Button>
        </Paper>
      ) : (
        <>
          {/* Active Bookings */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Active & Upcoming Bookings
          </Typography>
          
          <Grid container spacing={3}>
            {bookings
              .filter(booking => ['confirmed', 'active_parking', 'pending_approval'].includes(booking.status))
              .map((booking) => (
                <Grid item xs={12} md={6} key={booking.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderLeft: booking.status === 'confirmed' ? '4px solid #4caf50' : 
                               booking.status === 'active_parking' ? '4px solid #2196f3' : 
                               '4px solid #ff9800'
                    }}
                  >
                    <CardContent>
                      {/* Booking Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">
                          {booking.vehicle?.licensePlate || 'Unknown Vehicle'}
                        </Typography>
                        {getStatusChip(booking.status)}
                      </Box>
                      
                      {/* Vehicle Details */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DirectionsCar sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {booking.vehicle?.make} {booking.vehicle?.model} ({booking.vehicle?.color})
                        </Typography>
                      </Box>
                      
                      {/* Parking Slot */}
                      {booking.parkingSlot && (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'primary.light', 
                          borderRadius: 1, 
                          color: 'primary.contrastText',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <LocalParking sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Slot {booking.parkingSlot.slotNumber}
                            </Typography>
                            <Typography variant="body2">
                              {booking.parkingSlot.locationDescription}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      
                      {/* Booking Times */}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Start Time
                          </Typography>
                          <Typography variant="body2">
                            {formatDateTime(booking.requestedStartTime)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            End Time
                          </Typography>
                          <Typography variant="body2">
                            {formatDateTime(booking.requestedEndTime)}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {/* Admin Remarks (if any) */}
                      {booking.adminRemarks && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Admin Remarks:
                          </Typography>
                          <Typography variant="body2">
                            {booking.adminRemarks}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        disabled={booking.status !== 'confirmed'} 
                        onClick={() => handleCancelBooking(booking.id)}
                        color="error"
                      >
                        Cancel Booking
                      </Button>
                      {booking.status === 'active_parking' && (
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handlePayment(booking)}
                        >
                          Pay & Exit
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              
            {bookings.filter(booking => 
              ['confirmed', 'active_parking', 'pending_approval'].includes(booking.status)
            ).length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  You don't have any active or upcoming bookings.
                </Alert>
              </Grid>
            )}
          </Grid>
          
          {/* Past Bookings */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Past Bookings
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Parking Slot</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings
                  .filter(booking => 
                    ['completed', 'cancelled_by_user', 'cancelled_by_admin', 'rejected'].includes(booking.status)
                  )
                  .map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DirectionsCar sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {booking.vehicle?.licensePlate}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell>{formatDateTime(booking.requestedStartTime)}</TableCell>
                      <TableCell>{formatDateTime(booking.requestedEndTime)}</TableCell>
                      <TableCell>
                        {booking.parkingSlot ? (
                          <Typography variant="body2">
                            {booking.parkingSlot.slotNumber} - {booking.parkingSlot.locationDescription}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                {bookings.filter(booking => 
                  ['completed', 'cancelled_by_user', 'cancelled_by_admin', 'rejected'].includes(booking.status)
                ).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No past bookings found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {paymentCalculation && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You are about to complete your parking session
                  </Alert>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Check-In Time</Typography>
                  <Typography variant="body1">
                    {formatDateTime(paymentCalculation.checkInTime)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Current Time</Typography>
                  <Typography variant="body1">
                    {formatDateTime(paymentCalculation.currentTime)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">
                    {paymentCalculation.duration.hours} hours 
                    ({paymentCalculation.duration.minutes} minutes)
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Rate</Typography>
                  <Typography variant="body1">
                    ${paymentCalculation.hourlyRate.toFixed(2)}/hour
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Total: ${paymentCalculation.amount.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="payment-method-label">Payment Method</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      id="payment-method"
                      value={paymentMethod}
                      label="Payment Method"
                      onChange={handlePaymentMethodChange}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="credit_card">Credit Card</MenuItem>
                      <MenuItem value="debit_card">Debit Card</MenuItem>
                      <MenuItem value="mobile_payment">Mobile Payment</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={processPayment} 
            color="primary" 
            variant="contained"
            disabled={paymentLoading}
            startIcon={paymentLoading ? <CircularProgress size={20} /> : getPaymentMethodIcon(paymentMethod)}
          >
            {paymentLoading ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={paymentSuccess}
        autoHideDuration={6000}
        onClose={() => setPaymentSuccess(false)}
        message="Payment processed successfully!"
      />
    </Box>
  );
};

export default MyBookingsPage; 
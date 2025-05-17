import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../../../services/api';

interface BookingRequest {
  id: string;
  userId: string;
  vehicleId: string;
  requestedStartTime: string;
  requestedEndTime: string;
  status: string;
  notes?: string;
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
}

const BookingRequestsTable = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bookings/admin/pending-approval');
        
        // Handle different response formats
        let requests: BookingRequest[] = [];
        if (Array.isArray(response.data)) {
          requests = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Try to extract data from response object
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            requests = possibleArrays[0] as BookingRequest[];
          }
        }
        
        setBookingRequests(requests);
        setError(null);
      } catch (err) {
        console.error('Error fetching booking requests:', err);
        setError('Failed to load booking requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      // Get the booking request to access vehicle type
      const bookingRequest = bookingRequests.find(request => request.id === id);
      if (!bookingRequest || !bookingRequest.vehicle) {
        setError('Booking request not found or missing vehicle information.');
        return;
      }

      // Get the vehicle type
      const vehicleType = bookingRequest.vehicle.type;
      
      // Fetch all slots
      const slotsResponse = await api.get('/slots');
      
      // Filter available slots that match the vehicle type
      const availableSlots = Array.isArray(slotsResponse.data.slots) 
        ? slotsResponse.data.slots.filter((slot: any) => 
            slot.status === 'available' && 
            (slot.type === vehicleType || 
             // Car can park in any slot, motorcycle can park in motorcycle slot
             (vehicleType === 'car' && ['car', 'electric_car'].includes(slot.type)) ||
             (vehicleType === 'motorcycle' && slot.type === 'motorcycle'))
          )
        : [];
      
      if (availableSlots.length === 0) {
        setError(`No available slots for ${vehicleType}. Please create or free up a slot.`);
        return;
      }
      
      // Just pick the first available slot
      const slotId = availableSlots[0].id;
      
      await api.put(`/bookings/admin/${id}/approve`, {
        slotId,
        adminRemarks: 'Approved by admin'
      });
      
      // Update the local state to reflect the change
      setBookingRequests(prev => 
        prev.filter(request => request.id !== id)
      );
      
    } catch (err) {
      console.error('Error approving booking:', err);
      setError('Failed to approve booking. Please try again.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/bookings/admin/${id}/reject`, {
        adminRemarks: 'Rejected by admin'
      });
      
      // Update the local state to reflect the change
      setBookingRequests(prev => 
        prev.filter(request => request.id !== id)
      );
      
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setError('Failed to reject booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Pending Booking Requests
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {bookingRequests.length === 0 ? (
        <Typography variant="body1" sx={{ p: 3, textAlign: 'center' }}>
          No pending booking requests found.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.user 
                      ? `${request.user.firstName} ${request.user.lastName}`
                      : 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    {request.vehicle 
                      ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {request.vehicle.make} {request.vehicle.model} ({request.vehicle.licensePlate})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {request.vehicle.type}
                          </Typography>
                        </Box>
                      )
                      : 'Unknown Vehicle'}
                  </TableCell>
                  <TableCell>
                    {new Date(request.requestedStartTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.requestedEndTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleApprove(request.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default BookingRequestsTable; 
import React from 'react';
import { Box, Typography } from '@mui/material';
import BookingRequestsTable from '../features/admin/bookings/BookingRequestsTable';

const AdminBookingRequestsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Booking Requests Management
      </Typography>
      <BookingRequestsTable />
    </Box>
  );
};

export default AdminBookingRequestsPage; 
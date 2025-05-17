import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalParking } from '@mui/icons-material';
import SlotManagement from '../features/admin/slots/SlotManagement';

const AdminSlotManagementPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <LocalParking color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">Parking Slot Management</Typography>
      </Box>
      
      <SlotManagement />
    </Box>
  );
};

export default AdminSlotManagementPage; 
import React from 'react';
import { Box, Typography } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import VehicleManagement from '../features/vehicles/VehicleManagement';

const VehicleManagementPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <DirectionsCar color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">My Vehicles</Typography>
      </Box>
      
      <VehicleManagement />
    </Box>
  );
};

export default VehicleManagementPage; 
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const DashboardCharts: React.FC = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Parking Usage Statistics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a simplified version of the parking management system. In a more complex version, 
          this area would display charts showing parking usage patterns, peak hours, and other statistics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DashboardCharts; 